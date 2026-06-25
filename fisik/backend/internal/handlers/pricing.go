package handlers

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

var ErrPricingNotFound = errors.New("pricing not found")

// ─── Types ────────────────────────────────────────────────────────────────────

type PriceTier struct {
	Code      string `json:"code"`
	Label     string `json:"label"`
	MinQty    int    `json:"min_qty"`
	MaxQty    *int   `json:"max_qty"` // null = open-ended (e.g. 500+)
	SortOrder int    `json:"sort_order"`
}

type ProductPricing struct {
	RimbaCode      string          `json:"rimba_code"`
	InvittoCode    string          `json:"invitto_code"`
	Name           string          `json:"name"`
	CollectionCode string          `json:"collection_code"`
	ProductSlug    *string         `json:"product_slug"` // null when no catalog match
	Status         string          `json:"status"`       // 'available' | 'pending'
	Prices         map[string]*int `json:"prices"`       // tier_code → amount (null = unpriced)
}

// PricingCatalog is the full active-version price book.
type PricingCatalog struct {
	Currency string           `json:"currency"`
	Tiers    []PriceTier      `json:"tiers"`
	Products []ProductPricing `json:"products"`
}

// ─── Store ────────────────────────────────────────────────────────────────────

type PricingStore interface {
	GetPricing(context.Context) (PricingCatalog, error)
	GetProductPricing(context.Context, string) (ProductPricing, error)
}

type PostgresPricingStore struct {
	db CatalogDB
}

func NewPostgresPricingStore(db CatalogDB) *PostgresPricingStore {
	return &PostgresPricingStore{db: db}
}

// ─── Handler ──────────────────────────────────────────────────────────────────

type PricingHandler struct {
	store PricingStore
}

func NewPricingHandler(store PricingStore) *PricingHandler {
	return &PricingHandler{store: store}
}

func (h *PricingHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/catalog/pricing", h.GetPricing)
	r.Get("/api/catalog/products/{slug}/pricing", h.GetProductPricing)
}

func (h *PricingHandler) GetPricing(w http.ResponseWriter, r *http.Request) {
	pricing, err := h.store.GetPricing(r.Context())
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, pricing)
}

func (h *PricingHandler) GetProductPricing(w http.ResponseWriter, r *http.Request) {
	pricing, err := h.store.GetProductPricing(r.Context(), chi.URLParam(r, "slug"))
	switch {
	case errors.Is(err, ErrPricingNotFound):
		http.Error(w, "not found", http.StatusNotFound)
		return
	case err != nil:
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, pricing)
}

// ─── Queries ──────────────────────────────────────────────────────────────────

func (s *PostgresPricingStore) GetPricing(ctx context.Context) (PricingCatalog, error) {
	tiers, err := s.listTiers(ctx)
	if err != nil {
		return PricingCatalog{}, err
	}

	currency := "IDR"
	if err := s.db.QueryRow(ctx, activeVersionCurrencySQL).Scan(&currency); err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return PricingCatalog{}, err
	}

	rows, err := s.db.Query(ctx, listPricingSQL)
	if err != nil {
		return PricingCatalog{}, err
	}
	defer rows.Close()

	products := []ProductPricing{}
	index := map[string]int{} // rimba_code → position in products
	for rows.Next() {
		var (
			p        ProductPricing
			tierCode *string
			amount   *int
		)
		if err := rows.Scan(&p.RimbaCode, &p.InvittoCode, &p.Name, &p.CollectionCode,
			&p.ProductSlug, &p.Status, &tierCode, &amount); err != nil {
			return PricingCatalog{}, err
		}
		i, ok := index[p.RimbaCode]
		if !ok {
			p.Prices = map[string]*int{}
			products = append(products, p)
			i = len(products) - 1
			index[p.RimbaCode] = i
		}
		if tierCode != nil {
			products[i].Prices[*tierCode] = amount
		}
	}
	if err := rows.Err(); err != nil {
		return PricingCatalog{}, err
	}

	return PricingCatalog{Currency: currency, Tiers: tiers, Products: products}, nil
}

func (s *PostgresPricingStore) GetProductPricing(ctx context.Context, slug string) (ProductPricing, error) {
	rows, err := s.db.Query(ctx, getProductPricingSQL, slug)
	if err != nil {
		return ProductPricing{}, err
	}
	defer rows.Close()

	var (
		p     ProductPricing
		found bool
	)
	p.Prices = map[string]*int{}
	for rows.Next() {
		var tierCode *string
		var amount *int
		if err := rows.Scan(&p.RimbaCode, &p.InvittoCode, &p.Name, &p.CollectionCode,
			&p.ProductSlug, &p.Status, &tierCode, &amount); err != nil {
			return ProductPricing{}, err
		}
		found = true
		if tierCode != nil {
			p.Prices[*tierCode] = amount
		}
	}
	if err := rows.Err(); err != nil {
		return ProductPricing{}, err
	}
	if !found {
		return ProductPricing{}, ErrPricingNotFound
	}
	return p, nil
}

func (s *PostgresPricingStore) listTiers(ctx context.Context) ([]PriceTier, error) {
	rows, err := s.db.Query(ctx, listTiersSQL)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tiers := []PriceTier{}
	for rows.Next() {
		var t PriceTier
		if err := rows.Scan(&t.Code, &t.Label, &t.MinQty, &t.MaxQty, &t.SortOrder); err != nil {
			return nil, err
		}
		tiers = append(tiers, t)
	}
	return tiers, rows.Err()
}

const listTiersSQL = `
SELECT code, label, min_qty, max_qty, sort_order
FROM catalog_price_tiers
ORDER BY sort_order, code
`

const activeVersionCurrencySQL = `
SELECT currency FROM catalog_price_versions WHERE effective_to IS NULL
`

const pricingColumns = `
    pp.rimba_code, pp.invitto_code, pp.name, pp.collection_code,
    cp.slug, pp.status, tp.tier_code, tp.amount_idr
`

const listPricingSQL = `
SELECT ` + pricingColumns + `
FROM catalog_priced_products pp
JOIN catalog_price_versions v ON v.id = pp.price_version_id AND v.effective_to IS NULL
LEFT JOIN catalog_products cp ON cp.id = pp.product_id
LEFT JOIN catalog_product_tier_prices tp ON tp.priced_product_id = pp.id
ORDER BY pp.collection_code, pp.rimba_code, tp.tier_code
`

const getProductPricingSQL = `
SELECT ` + pricingColumns + `
FROM catalog_priced_products pp
JOIN catalog_price_versions v ON v.id = pp.price_version_id AND v.effective_to IS NULL
JOIN catalog_products cp ON cp.id = pp.product_id
LEFT JOIN catalog_product_tier_prices tp ON tp.priced_product_id = pp.id
WHERE cp.slug = $1
ORDER BY tp.tier_code
`
