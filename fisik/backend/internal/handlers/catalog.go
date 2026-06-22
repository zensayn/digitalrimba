package handlers

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

var ErrCatalogProductNotFound = errors.New("catalog product not found")

// ─── Types ────────────────────────────────────────────────────────────────────

type CatalogCollection struct {
	Code         string `json:"code"`
	Name         string `json:"name"`
	SortOrder    int    `json:"sort_order"`
	ProductCount int    `json:"product_count"`
}

type CatalogProduct struct {
	ID             string `json:"id"`
	Slug           string `json:"slug"`
	Name           string `json:"name"`
	Code           string `json:"code"`
	CollectionCode string `json:"collection_code"`
	CollectionName string `json:"collection_name"`
	CoverKey       string `json:"cover_key"`
	Popular        bool   `json:"popular"`
	TopSeller      bool   `json:"top_seller"`
	SortOrder      int    `json:"sort_order"`
}

type CatalogImage struct {
	Key      string `json:"key"`
	Position int    `json:"position"`
	Alt      string `json:"alt"`
}

type CatalogProductDetail struct {
	CatalogProduct
	Images []CatalogImage `json:"images"`
}

// ─── Store ────────────────────────────────────────────────────────────────────

type CatalogStore interface {
	ListCollections(context.Context) ([]CatalogCollection, error)
	ListProducts(context.Context, string) ([]CatalogProduct, error)
	GetProductBySlug(context.Context, string) (CatalogProductDetail, error)
}

type CatalogDB interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
	QueryRow(context.Context, string, ...any) pgx.Row
}

type PostgresCatalogStore struct {
	db CatalogDB
}

func NewPostgresCatalogStore(db CatalogDB) *PostgresCatalogStore {
	return &PostgresCatalogStore{db: db}
}

// ─── Handler ──────────────────────────────────────────────────────────────────

type CatalogHandler struct {
	store CatalogStore
}

func NewCatalogHandler(store CatalogStore) *CatalogHandler {
	return &CatalogHandler{store: store}
}

func (h *CatalogHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/catalog/collections", h.ListCollections)
	r.Get("/api/catalog/products", h.ListProducts)
	r.Get("/api/catalog/products/{slug}", h.GetProductBySlug)
}

func (h *CatalogHandler) ListCollections(w http.ResponseWriter, r *http.Request) {
	collections, err := h.store.ListCollections(r.Context())
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, collections)
}

func (h *CatalogHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	products, err := h.store.ListProducts(r.Context(), r.URL.Query().Get("collection"))
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, products)
}

func (h *CatalogHandler) GetProductBySlug(w http.ResponseWriter, r *http.Request) {
	product, err := h.store.GetProductBySlug(r.Context(), chi.URLParam(r, "slug"))
	switch {
	case errors.Is(err, ErrCatalogProductNotFound):
		http.Error(w, "not found", http.StatusNotFound)
		return
	case err != nil:
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, product)
}

// ─── Queries ──────────────────────────────────────────────────────────────────

func (s *PostgresCatalogStore) ListCollections(ctx context.Context) ([]CatalogCollection, error) {
	rows, err := s.db.Query(ctx, listCollectionsSQL)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	collections := []CatalogCollection{}
	for rows.Next() {
		var c CatalogCollection
		if err := rows.Scan(&c.Code, &c.Name, &c.SortOrder, &c.ProductCount); err != nil {
			return nil, err
		}
		collections = append(collections, c)
	}
	return collections, rows.Err()
}

func (s *PostgresCatalogStore) ListProducts(ctx context.Context, collection string) ([]CatalogProduct, error) {
	rows, err := s.db.Query(ctx, listProductsSQL, collection)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []CatalogProduct{}
	for rows.Next() {
		p, err := scanCatalogProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (s *PostgresCatalogStore) GetProductBySlug(ctx context.Context, slug string) (CatalogProductDetail, error) {
	product, err := scanCatalogProduct(s.db.QueryRow(ctx, getProductBySlugSQL, slug))
	if errors.Is(err, pgx.ErrNoRows) {
		return CatalogProductDetail{}, ErrCatalogProductNotFound
	}
	if err != nil {
		return CatalogProductDetail{}, err
	}

	rows, err := s.db.Query(ctx, listProductImagesSQL, product.ID)
	if err != nil {
		return CatalogProductDetail{}, err
	}
	defer rows.Close()

	images := []CatalogImage{}
	for rows.Next() {
		var img CatalogImage
		if err := rows.Scan(&img.Key, &img.Position, &img.Alt); err != nil {
			return CatalogProductDetail{}, err
		}
		images = append(images, img)
	}
	if err := rows.Err(); err != nil {
		return CatalogProductDetail{}, err
	}

	return CatalogProductDetail{CatalogProduct: product, Images: images}, nil
}

func scanCatalogProduct(row rowScanner) (CatalogProduct, error) {
	var p CatalogProduct
	err := row.Scan(
		&p.ID,
		&p.Slug,
		&p.Name,
		&p.Code,
		&p.CollectionCode,
		&p.CollectionName,
		&p.CoverKey,
		&p.Popular,
		&p.TopSeller,
		&p.SortOrder,
	)
	return p, err
}

const listCollectionsSQL = `
SELECT c.code, c.name, c.sort_order, COUNT(p.id) AS product_count
FROM catalog_collections c
LEFT JOIN catalog_products p ON p.collection_id = c.id
GROUP BY c.id, c.code, c.name, c.sort_order
ORDER BY c.sort_order, c.code
`

const catalogProductColumns = `
    p.id, p.slug, p.name, p.code, c.code AS collection_code, c.name AS collection_name,
    p.cover_key, p.popular, p.top_seller, p.sort_order
`

const listProductsSQL = `
SELECT ` + catalogProductColumns + `
FROM catalog_products p
JOIN catalog_collections c ON c.id = p.collection_id
WHERE $1 = '' OR c.code = $1
ORDER BY p.sort_order, p.code
`

const getProductBySlugSQL = `
SELECT ` + catalogProductColumns + `
FROM catalog_products p
JOIN catalog_collections c ON c.id = p.collection_id
WHERE p.slug = $1
`

const listProductImagesSQL = `
SELECT object_key, position, alt
FROM catalog_product_images
WHERE product_id = $1
ORDER BY position
`
