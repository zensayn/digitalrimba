// Command seed-catalog loads the Rimba product catalog from a JSON manifest
// (generated from the R2 bucket) into Postgres. It is idempotent: re-running
// upserts collections, products and images, and prunes images whose position
// no longer exists in the manifest.
//
// Usage (from the backend/ directory):
//
//	go run ./cmd/seed-catalog
//	go run ./cmd/seed-catalog -seed ../db/seed/catalog-seed.json
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"rimba-api/internal/db"
)

type seedFile struct {
	Collections []seedColl    `json:"collections"`
	Products    []seedProduct `json:"products"`
}

type seedColl struct {
	Code      string `json:"code"`
	Name      string `json:"name"`
	SortOrder int    `json:"sort_order"`
}

type seedProduct struct {
	CollectionCode string `json:"collection_code"`
	Code           string `json:"code"`
	Slug           string `json:"slug"`
	Name           string `json:"name"`
	Folder         string `json:"folder"`
	ImagePrefix    string `json:"image_prefix"`
	ImageCount     int    `json:"image_count"`
	SortOrder      int    `json:"sort_order"`
	Popular        bool   `json:"popular"`
	TopSeller      bool   `json:"top_seller"`
}

func main() {
	seedPath := flag.String("seed", defaultSeedPath(), "path to catalog-seed.json")
	flag.Parse()

	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, reading from environment")
	}

	seed, err := readSeed(*seedPath)
	if err != nil {
		log.Fatalf("read seed: %v", err)
	}

	ctx := context.Background()
	pool, err := db.New(ctx)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	colls, prods, imgs, err := apply(ctx, pool, seed)
	if err != nil {
		log.Fatalf("seed: %v", err)
	}

	log.Printf("catalog seeded: %d collections, %d products, %d images", colls, prods, imgs)
}

func defaultSeedPath() string {
	if p := os.Getenv("CATALOG_SEED_PATH"); p != "" {
		return p
	}
	return "../db/seed/catalog-seed.json"
}

func readSeed(path string) (seedFile, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return seedFile{}, err
	}
	var seed seedFile
	if err := json.Unmarshal(raw, &seed); err != nil {
		return seedFile{}, fmt.Errorf("parse %s: %w", path, err)
	}
	return seed, nil
}

func apply(ctx context.Context, pool *db.Pool, seed seedFile) (collections, products, images int, err error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, 0, 0, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	for _, c := range seed.Collections {
		if _, err = tx.Exec(ctx, upsertCollectionSQL, c.Code, c.Name, c.SortOrder); err != nil {
			return 0, 0, 0, fmt.Errorf("collection %q: %w", c.Code, err)
		}
		collections++
	}

	for _, p := range seed.Products {
		if p.ImageCount < 1 {
			return 0, 0, 0, fmt.Errorf("product %q has no images", p.Slug)
		}
		coverKey := fmt.Sprintf("%s/%s-%02d.webp", p.Folder, p.ImagePrefix, 1)

		var productID string
		if err = tx.QueryRow(ctx, upsertProductSQL,
			p.CollectionCode, p.Code, p.Slug, p.Name, p.Folder, coverKey, p.Popular, p.SortOrder, p.TopSeller,
		).Scan(&productID); err != nil {
			return 0, 0, 0, fmt.Errorf("product %q: %w", p.Slug, err)
		}
		products++

		for i := 1; i <= p.ImageCount; i++ {
			objectKey := fmt.Sprintf("%s/%s-%02d.webp", p.Folder, p.ImagePrefix, i)
			alt := fmt.Sprintf("%s wedding invitation preview %d", p.Name, i)
			if _, err = tx.Exec(ctx, upsertImageSQL, productID, objectKey, i, alt); err != nil {
				return 0, 0, 0, fmt.Errorf("image %q #%d: %w", p.Slug, i, err)
			}
			images++
		}

		// Prune stale images (positions beyond the current count).
		if _, err = tx.Exec(ctx, pruneImagesSQL, productID, p.ImageCount); err != nil {
			return 0, 0, 0, fmt.Errorf("prune %q: %w", p.Slug, err)
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return 0, 0, 0, err
	}
	return collections, products, images, nil
}

const upsertCollectionSQL = `
INSERT INTO catalog_collections (code, name, sort_order)
VALUES ($1, $2, $3)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order
`

const upsertProductSQL = `
INSERT INTO catalog_products (collection_id, code, slug, name, folder, cover_key, popular, sort_order, top_seller, updated_at)
VALUES ((SELECT id FROM catalog_collections WHERE code = $1), $2, $3, $4, $5, $6, $7, $8, $9, now())
ON CONFLICT (slug) DO UPDATE
SET collection_id = EXCLUDED.collection_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    folder = EXCLUDED.folder,
    cover_key = EXCLUDED.cover_key,
    popular = EXCLUDED.popular,
    sort_order = EXCLUDED.sort_order,
    top_seller = EXCLUDED.top_seller,
    updated_at = now()
RETURNING id
`

const upsertImageSQL = `
INSERT INTO catalog_product_images (product_id, object_key, position, alt)
VALUES ($1, $2, $3, $4)
ON CONFLICT (product_id, position) DO UPDATE
SET object_key = EXCLUDED.object_key,
    alt = EXCLUDED.alt
`

const pruneImagesSQL = `
DELETE FROM catalog_product_images
WHERE product_id = $1 AND position > $2
`
