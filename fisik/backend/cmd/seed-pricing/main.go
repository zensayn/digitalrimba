// Command seed-pricing loads Rimba product pricing from a JSON manifest
// (generated from harga-katalog-rimba.xlsx) into Postgres as an effective-dated
// price version.
//
// It is idempotent AND versioned: it hashes the manifest and compares against
// the active version's content_hash. If unchanged, it is a no-op. If changed
// (or no active version exists), it closes the previous version and appends a
// new one with the full set of product/tier prices — so old prices are retained
// for audit and historical orders.
//
// Usage (from the backend/ directory):
//
//	go run ./cmd/seed-pricing
//	go run ./cmd/seed-pricing -seed ../db/seed/pricing-seed.json
package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"

	"rimba-api/internal/db"
)

type seedFile struct {
	Currency string        `json:"currency"`
	Source   string        `json:"source"`
	Tiers    []seedTier    `json:"tiers"`
	Products []seedProduct `json:"products"`
}

type seedTier struct {
	Code      string `json:"code"`
	Label     string `json:"label"`
	MinQty    int    `json:"min_qty"`
	MaxQty    *int   `json:"max_qty"`
	SortOrder int    `json:"sort_order"`
}

type seedProduct struct {
	RimbaCode      string         `json:"rimba_code"`
	InvittoCode    string         `json:"invitto_code"`
	Name           string         `json:"name"`
	CollectionCode string         `json:"collection_code"`
	Status         string         `json:"status"`
	Prices         map[string]int `json:"prices"`
}

func main() {
	seedPath := flag.String("seed", defaultSeedPath(), "path to pricing-seed.json")
	flag.Parse()

	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, reading from environment")
	}

	raw, err := os.ReadFile(*seedPath)
	if err != nil {
		log.Fatalf("read seed: %v", err)
	}
	var seed seedFile
	if err := json.Unmarshal(raw, &seed); err != nil {
		log.Fatalf("parse %s: %v", *seedPath, err)
	}
	hash := sha256.Sum256(raw)
	contentHash := hex.EncodeToString(hash[:])

	ctx := context.Background()
	pool, err := db.New(ctx)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	changed, priced, pending, err := apply(ctx, pool, seed, contentHash)
	if err != nil {
		log.Fatalf("seed: %v", err)
	}
	if !changed {
		log.Printf("pricing up to date: %d products unchanged", len(seed.Products))
		return
	}
	log.Printf("pricing seeded: new version, %d products (%d priced, %d pending)",
		len(seed.Products), priced, pending)
}

func defaultSeedPath() string {
	if p := os.Getenv("PRICING_SEED_PATH"); p != "" {
		return p
	}
	return "../db/seed/pricing-seed.json"
}

func apply(ctx context.Context, pool *db.Pool, seed seedFile, contentHash string) (changed bool, priced, pending int, err error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return false, 0, 0, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Tiers are reference data — keep them synced on every run regardless of
	// whether the price version itself changes.
	for _, t := range seed.Tiers {
		if _, err = tx.Exec(ctx, upsertTierSQL, t.Code, t.Label, t.MinQty, t.MaxQty, t.SortOrder); err != nil {
			return false, 0, 0, fmt.Errorf("tier %q: %w", t.Code, err)
		}
	}

	// Skip if the active version already matches this manifest.
	var activeHash string
	switch err = tx.QueryRow(ctx, activeVersionHashSQL).Scan(&activeHash); {
	case err == nil && activeHash == contentHash:
		if err = tx.Commit(ctx); err != nil {
			return false, 0, 0, err
		}
		return false, 0, 0, nil
	case err != nil && err != pgx.ErrNoRows:
		return false, 0, 0, fmt.Errorf("active version: %w", err)
	}

	// Close the previous active version and open a new one.
	if _, err = tx.Exec(ctx, closeActiveVersionSQL); err != nil {
		return false, 0, 0, fmt.Errorf("close active version: %w", err)
	}
	currency := seed.Currency
	if currency == "" {
		currency = "IDR"
	}
	var versionID string
	if err = tx.QueryRow(ctx, insertVersionSQL, currency, seed.Source, contentHash).Scan(&versionID); err != nil {
		return false, 0, 0, fmt.Errorf("insert version: %w", err)
	}

	for _, p := range seed.Products {
		status := p.Status
		if status == "" {
			status = "available"
		}
		var pricedID string
		if err = tx.QueryRow(ctx, insertPricedProductSQL,
			versionID, p.RimbaCode, p.InvittoCode, p.Name, p.CollectionCode, status,
		).Scan(&pricedID); err != nil {
			return false, 0, 0, fmt.Errorf("product %q: %w", p.RimbaCode, err)
		}
		if status == "pending" {
			pending++
		} else {
			priced++
		}

		// One tier row per defined tier; amount is NULL when the manifest has no
		// price for that tier (pending / [cek katalog] rows).
		for _, t := range seed.Tiers {
			var amount *int
			if v, ok := p.Prices[t.Code]; ok {
				amount = &v
			}
			if _, err = tx.Exec(ctx, insertTierPriceSQL, pricedID, t.Code, amount); err != nil {
				return false, 0, 0, fmt.Errorf("price %q/%s: %w", p.RimbaCode, t.Code, err)
			}
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return false, 0, 0, err
	}
	return true, priced, pending, nil
}

const upsertTierSQL = `
INSERT INTO catalog_price_tiers (code, label, min_qty, max_qty, sort_order)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (code) DO UPDATE
SET label = EXCLUDED.label,
    min_qty = EXCLUDED.min_qty,
    max_qty = EXCLUDED.max_qty,
    sort_order = EXCLUDED.sort_order
`

const activeVersionHashSQL = `
SELECT content_hash FROM catalog_price_versions WHERE effective_to IS NULL
`

const closeActiveVersionSQL = `
UPDATE catalog_price_versions SET effective_to = now() WHERE effective_to IS NULL
`

const insertVersionSQL = `
INSERT INTO catalog_price_versions (currency, source, content_hash)
VALUES ($1, $2, $3)
RETURNING id
`

// product_id is resolved by the normalized rimba_code against the catalog; it
// stays NULL for priced products that have no catalog entry yet.
const insertPricedProductSQL = `
INSERT INTO catalog_priced_products
    (price_version_id, rimba_code, invitto_code, name, collection_code, product_id, status)
VALUES
    ($1, $2, $3, $4, $5, (SELECT id FROM catalog_products WHERE code = $2 LIMIT 1), $6)
RETURNING id
`

const insertTierPriceSQL = `
INSERT INTO catalog_product_tier_prices (priced_product_id, tier_code, amount_idr)
VALUES ($1, $2, $3)
`
