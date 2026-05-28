package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var (
	ErrBudgetItemNotFound    = errors.New("budget item not found")
	ErrBudgetWeddingNotFound = errors.New("budget wedding not found")
)

type BudgetDB interface {
	QueryRow(context.Context, string, ...any) pgx.Row
	Query(context.Context, string, ...any) (pgx.Rows, error)
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}

type BudgetWeddingResolver interface {
	BudgetWeddingIDForUser(context.Context, string) (string, error)
}

type BudgetStore interface {
	CreateBudgetItem(context.Context, CreateBudgetItemParams) (BudgetItem, error)
	UpdateBudgetItem(context.Context, UpdateBudgetItemParams) (BudgetItem, error)
	DeleteBudgetItem(context.Context, string, string) error
	GetBudgetItem(context.Context, string, string) (BudgetItem, error)
	ListBudgetItems(context.Context, string) ([]BudgetItem, error)
	GetBudgetSummary(context.Context, string) (BudgetSummary, error)
}

type PostgresBudgetStore struct {
	db BudgetDB
}

func NewPostgresBudgetStore(db BudgetDB) *PostgresBudgetStore {
	return &PostgresBudgetStore{db: db}
}

type BudgetHandler struct {
	store           BudgetStore
	weddingResolver BudgetWeddingResolver
}

func NewBudgetHandler(store BudgetStore) *BudgetHandler {
	handler := &BudgetHandler{store: store}
	if resolver, ok := store.(BudgetWeddingResolver); ok {
		handler.weddingResolver = resolver
	}
	return handler
}

func RegisterBudgetRoutes(r chi.Router, db BudgetDB) {
	NewBudgetHandler(NewPostgresBudgetStore(db)).RegisterRoutes(r)
}

func (h *BudgetHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/budget/items", h.List)
	r.Post("/api/budget/items", h.Create)
	r.Get("/api/budget/items/{id}", h.Get)
	r.Patch("/api/budget/items/{id}", h.Update)
	r.Put("/api/budget/items/{id}", h.Update)
	r.Delete("/api/budget/items/{id}", h.Delete)
	r.Get("/api/budget/summary", h.Summary)
}

type BudgetItem struct {
	ID              string    `json:"id"`
	WeddingID       string    `json:"wedding_id,omitempty"`
	Category        string    `json:"category"`
	ItemName        string    `json:"item_name"`
	Name            string    `json:"name,omitempty"`
	Vendor          *string   `json:"vendor,omitempty"`
	EstimatedAmount float64   `json:"estimated_amount"`
	Budgeted        float64   `json:"budgeted"`
	ActualAmount    float64   `json:"actual_amount"`
	Actual          float64   `json:"actual"`
	Paid            bool      `json:"paid"`
	PaymentStatus   string    `json:"payment_status"`
	DueDate         *string   `json:"due_date,omitempty"`
	CreatedAt       time.Time `json:"created_at,omitempty"`
	UpdatedAt       time.Time `json:"updated_at,omitempty"`
}

type CreateBudgetItemParams struct {
	WeddingID       string
	Category        string
	ItemName        string
	Vendor          *string
	EstimatedAmount float64
	ActualAmount    float64
	Paid            bool
	PaymentStatus   string
	DueDate         *string
}

type UpdateBudgetItemParams struct {
	ID              string
	WeddingID       string
	Category        *string
	ItemName        *string
	Vendor          *string
	EstimatedAmount *float64
	ActualAmount    *float64
	Paid            *bool
	PaymentStatus   *string
	DueDate         *string
}

type BudgetSummary struct {
	TotalBudgeted float64                 `json:"total_budgeted"`
	TotalActual   float64                 `json:"total_actual"`
	Overspend     bool                    `json:"overspend"`
	Categories    []BudgetCategorySummary `json:"categories"`
}

type BudgetCategorySummary struct {
	Name      string  `json:"name"`
	Budgeted  float64 `json:"budgeted"`
	Actual    float64 `json:"actual"`
	Overspend bool    `json:"overspend"`
}

type createBudgetItemRequest struct {
	WeddingID       string   `json:"wedding_id"`
	Category        string   `json:"category"`
	ItemName        string   `json:"item_name"`
	Name            string   `json:"name"`
	Vendor          *string  `json:"vendor"`
	EstimatedAmount *float64 `json:"estimated_amount"`
	Budgeted        *float64 `json:"budgeted"`
	ActualAmount    *float64 `json:"actual_amount"`
	Actual          *float64 `json:"actual"`
	Paid            *bool    `json:"paid"`
	PaymentStatus   *string  `json:"payment_status"`
	DueDate         *string  `json:"due_date"`
}

type updateBudgetItemRequest struct {
	WeddingID       string   `json:"wedding_id"`
	Category        *string  `json:"category"`
	ItemName        *string  `json:"item_name"`
	Name            *string  `json:"name"`
	Vendor          *string  `json:"vendor"`
	EstimatedAmount *float64 `json:"estimated_amount"`
	Budgeted        *float64 `json:"budgeted"`
	ActualAmount    *float64 `json:"actual_amount"`
	Actual          *float64 `json:"actual"`
	Paid            *bool    `json:"paid"`
	PaymentStatus   *string  `json:"payment_status"`
	DueDate         *string  `json:"due_date"`
}

func (h *BudgetHandler) Create(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}

	var req createBudgetItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if !h.allowsRequestedWedding(w, weddingID, req.WeddingID) {
		return
	}

	params, err := createBudgetParams(weddingID, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.store.CreateBudgetItem(r.Context(), params)
	if err != nil {
		writeBudgetError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, item)
}

func (h *BudgetHandler) Update(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}

	var req updateBudgetItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if !h.allowsRequestedWedding(w, weddingID, req.WeddingID) {
		return
	}

	params, err := updateBudgetParams(chi.URLParam(r, "id"), weddingID, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.store.UpdateBudgetItem(r.Context(), params)
	if err != nil {
		writeBudgetError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *BudgetHandler) Delete(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}

	if err := h.store.DeleteBudgetItem(r.Context(), chi.URLParam(r, "id"), weddingID); err != nil {
		writeBudgetError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *BudgetHandler) Get(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}

	item, err := h.store.GetBudgetItem(r.Context(), chi.URLParam(r, "id"), weddingID)
	if err != nil {
		writeBudgetError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *BudgetHandler) List(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}
	if !h.allowsRequestedWedding(w, weddingID, r.URL.Query().Get("wedding_id")) {
		return
	}

	items, err := h.store.ListBudgetItems(r.Context(), weddingID)
	if err != nil {
		writeBudgetError(w, err)
		return
	}
	if items == nil {
		items = []BudgetItem{}
	}

	writeJSON(w, http.StatusOK, items)
}

func (h *BudgetHandler) Summary(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}
	if !h.allowsRequestedWedding(w, weddingID, r.URL.Query().Get("wedding_id")) {
		return
	}

	summary, err := h.store.GetBudgetSummary(r.Context(), weddingID)
	if err != nil {
		writeBudgetError(w, err)
		return
	}
	if summary.Categories == nil {
		summary.Categories = []BudgetCategorySummary{}
	}

	writeJSON(w, http.StatusOK, summary)
}

func (h *BudgetHandler) requireBudgetWeddingID(w http.ResponseWriter, r *http.Request) (string, bool) {
	weddingID, err := h.resolveBudgetWeddingID(r.Context())
	if err != nil {
		writeBudgetError(w, err)
		return "", false
	}
	return weddingID, true
}

func (h *BudgetHandler) resolveBudgetWeddingID(ctx context.Context) (string, error) {
	if auth, ok := GuestAuthFromContext(ctx); ok {
		return auth.WeddingID, nil
	}

	userID, ok := UserIDFromContext(ctx)
	if !ok || h.weddingResolver == nil {
		return "", ErrForbidden
	}

	weddingID, err := h.weddingResolver.BudgetWeddingIDForUser(ctx, userID)
	if errors.Is(err, ErrBudgetWeddingNotFound) {
		return "", ErrForbidden
	}
	return weddingID, err
}

func (h *BudgetHandler) allowsRequestedWedding(w http.ResponseWriter, actualWeddingID string, requestedWeddingID string) bool {
	requestedWeddingID = strings.TrimSpace(requestedWeddingID)
	if requestedWeddingID == "" || requestedWeddingID == actualWeddingID {
		return true
	}
	http.Error(w, "forbidden", http.StatusForbidden)
	return false
}

func createBudgetParams(weddingID string, req createBudgetItemRequest) (CreateBudgetItemParams, error) {
	category := strings.TrimSpace(req.Category)
	itemName := firstNonEmpty(req.ItemName, req.Name)
	if category == "" {
		return CreateBudgetItemParams{}, errors.New("category required")
	}
	if itemName == "" {
		return CreateBudgetItemParams{}, errors.New("item_name required")
	}

	estimatedAmount := floatValue(req.EstimatedAmount, req.Budgeted, 0)
	actualAmount := floatValue(req.ActualAmount, req.Actual, 0)
	if estimatedAmount < 0 || actualAmount < 0 {
		return CreateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}

	paid := false
	if req.Paid != nil {
		paid = *req.Paid
	}

	ps := "unpaid"
	if req.PaymentStatus != nil && (*req.PaymentStatus == "unpaid" || *req.PaymentStatus == "partial" || *req.PaymentStatus == "paid") {
		ps = *req.PaymentStatus
	} else if paid {
		ps = "paid"
	}

	return CreateBudgetItemParams{
		WeddingID:       weddingID,
		Category:        category,
		ItemName:        itemName,
		Vendor:          optionalTrimmedString(req.Vendor),
		EstimatedAmount: estimatedAmount,
		ActualAmount:    actualAmount,
		Paid:            paid,
		PaymentStatus:   ps,
		DueDate:         optionalTrimmedString(req.DueDate),
	}, nil
}

func updateBudgetParams(id string, weddingID string, req updateBudgetItemRequest) (UpdateBudgetItemParams, error) {
	if strings.TrimSpace(id) == "" {
		return UpdateBudgetItemParams{}, errors.New("id required")
	}

	category := optionalTrimmedString(req.Category)
	itemName := optionalFirstNonEmpty(req.ItemName, req.Name)
	if category != nil && *category == "" {
		return UpdateBudgetItemParams{}, errors.New("category required")
	}
	if itemName != nil && *itemName == "" {
		return UpdateBudgetItemParams{}, errors.New("item_name required")
	}

	estimatedAmount := optionalFloat(req.EstimatedAmount, req.Budgeted)
	actualAmount := optionalFloat(req.ActualAmount, req.Actual)
	if estimatedAmount != nil && *estimatedAmount < 0 {
		return UpdateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}
	if actualAmount != nil && *actualAmount < 0 {
		return UpdateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}

	return UpdateBudgetItemParams{
		ID:              id,
		WeddingID:       weddingID,
		Category:        category,
		ItemName:        itemName,
		Vendor:          optionalTrimmedString(req.Vendor),
		EstimatedAmount: estimatedAmount,
		ActualAmount:    actualAmount,
		Paid:            req.Paid,
		PaymentStatus:   req.PaymentStatus,
		DueDate:         optionalTrimmedString(req.DueDate),
	}, nil
}

func floatValue(primary *float64, alias *float64, fallback float64) float64 {
	if primary != nil {
		return *primary
	}
	if alias != nil {
		return *alias
	}
	return fallback
}

func optionalFloat(primary *float64, alias *float64) *float64 {
	if primary != nil {
		return primary
	}
	return alias
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			return trimmed
		}
	}
	return ""
}

func optionalFirstNonEmpty(values ...*string) *string {
	for _, value := range values {
		if value == nil {
			continue
		}
		if trimmed := strings.TrimSpace(*value); trimmed != "" {
			return &trimmed
		}
	}
	return nil
}

func optionalTrimmedString(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	return &trimmed
}

func normalizeBudgetItem(item BudgetItem) BudgetItem {
	if item.Name == "" {
		item.Name = item.ItemName
	}
	if item.ItemName == "" {
		item.ItemName = item.Name
	}
	item.Budgeted = item.EstimatedAmount
	item.Actual = item.ActualAmount
	return item
}

func writeBudgetError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrBudgetItemNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, ErrForbidden):
		http.Error(w, "forbidden", http.StatusForbidden)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}

func (s *PostgresBudgetStore) CreateBudgetItem(ctx context.Context, params CreateBudgetItemParams) (BudgetItem, error) {
	return scanBudgetItem(s.db.QueryRow(ctx,
		createBudgetItemSQL,
		params.WeddingID,       // $1
		params.Category,        // $2
		params.ItemName,        // $3
		params.Vendor,          // $4
		params.EstimatedAmount, // $5
		params.ActualAmount,    // $6
		params.Paid,            // $7
		params.PaymentStatus,   // $8
		params.DueDate,         // $9
	))
}

func (s *PostgresBudgetStore) UpdateBudgetItem(ctx context.Context, params UpdateBudgetItemParams) (BudgetItem, error) {
	if err := s.requireBudgetItemWedding(ctx, params.ID, params.WeddingID); err != nil {
		return BudgetItem{}, err
	}

	return scanBudgetItem(s.db.QueryRow(ctx,
		updateBudgetItemSQL,
		params.ID,              // $1
		params.WeddingID,       // $2
		params.Category,        // $3
		params.ItemName,        // $4
		params.Vendor,          // $5
		params.EstimatedAmount, // $6
		params.ActualAmount,    // $7
		params.Paid,            // $8
		params.PaymentStatus,   // $9
		params.DueDate,         // $10
	))
}

func (s *PostgresBudgetStore) DeleteBudgetItem(ctx context.Context, id string, weddingID string) error {
	if err := s.requireBudgetItemWedding(ctx, id, weddingID); err != nil {
		return err
	}

	tag, err := s.db.Exec(ctx, deleteBudgetItemSQL, id, weddingID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrBudgetItemNotFound
	}
	return nil
}

func (s *PostgresBudgetStore) GetBudgetItem(ctx context.Context, id string, weddingID string) (BudgetItem, error) {
	item, err := scanBudgetItem(s.db.QueryRow(ctx, getBudgetItemSQL, id))
	if err != nil {
		return BudgetItem{}, err
	}
	if item.WeddingID != weddingID {
		return BudgetItem{}, ErrForbidden
	}
	return item, nil
}

func (s *PostgresBudgetStore) ListBudgetItems(ctx context.Context, weddingID string) ([]BudgetItem, error) {
	rows, err := s.db.Query(ctx, listBudgetItemsSQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []BudgetItem{}
	for rows.Next() {
		item, err := scanBudgetItem(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *PostgresBudgetStore) GetBudgetSummary(ctx context.Context, weddingID string) (BudgetSummary, error) {
	var summary BudgetSummary
	var categoriesJSON []byte
	err := s.db.QueryRow(ctx, budgetSummarySQL, weddingID).Scan(
		&summary.TotalBudgeted,
		&summary.TotalActual,
		&summary.Overspend,
		&categoriesJSON,
	)
	if err != nil {
		return BudgetSummary{}, err
	}
	if len(categoriesJSON) > 0 {
		if err := json.Unmarshal(categoriesJSON, &summary.Categories); err != nil {
			return BudgetSummary{}, err
		}
	}
	if summary.Categories == nil {
		summary.Categories = []BudgetCategorySummary{}
	}
	return summary, nil
}

func (s *PostgresBudgetStore) BudgetWeddingIDForUser(ctx context.Context, userID string) (string, error) {
	var weddingID string
	err := s.db.QueryRow(ctx, budgetWeddingIDForUserSQL, userID).Scan(&weddingID)
	if err == nil {
		return weddingID, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrBudgetWeddingNotFound
	}
	if !isUndefinedColumnOrTable(err) {
		return "", err
	}

	fallbackErr := s.db.QueryRow(ctx, budgetWeddingIDForOwnerSQL, userID).Scan(&weddingID)
	if errors.Is(fallbackErr, pgx.ErrNoRows) {
		return "", ErrBudgetWeddingNotFound
	}
	if fallbackErr != nil {
		return "", fallbackErr
	}
	return weddingID, nil
}

func isUndefinedColumnOrTable(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && (pgErr.Code == "42703" || pgErr.Code == "42P01")
}

func (s *PostgresBudgetStore) requireBudgetItemWedding(ctx context.Context, id string, weddingID string) error {
	var actualWeddingID string
	err := s.db.QueryRow(ctx, budgetItemWeddingIDSQL, id).Scan(&actualWeddingID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrBudgetItemNotFound
	}
	if err != nil {
		return err
	}
	if actualWeddingID != weddingID {
		return ErrForbidden
	}
	return nil
}

func scanBudgetItem(row rowScanner) (BudgetItem, error) {
	var item BudgetItem
	err := row.Scan(
		&item.ID,
		&item.WeddingID,
		&item.Category,
		&item.ItemName,
		&item.Vendor,
		&item.EstimatedAmount,
		&item.ActualAmount,
		&item.Paid,
		&item.PaymentStatus,
		&item.DueDate,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BudgetItem{}, ErrBudgetItemNotFound
	}
	if err != nil {
		return BudgetItem{}, err
	}
	return normalizeBudgetItem(item), nil
}

const budgetItemSelectColumns = `
id::text,
wedding_id::text,
category,
item_name,
vendor,
estimated_amount::float8,
actual_amount::float8,
paid,
COALESCE(payment_status, 'unpaid'),
due_date::text,
created_at,
updated_at
`

const createBudgetItemSQL = `
INSERT INTO budget_items (
    wedding_id,
    category,
    item_name,
    vendor,
    estimated_amount,
    actual_amount,
    paid,
    payment_status,
    due_date,
    created_at,
    updated_at
) VALUES (
    $1::uuid,
    $2,
    $3,
    $4,
    $5::numeric,
    $6::numeric,
    $7,
    $8,
    $9::date,
    now(),
    now()
)
RETURNING ` + budgetItemSelectColumns

const updateBudgetItemSQL = `
UPDATE budget_items
SET
    category         = COALESCE($3,          category),
    item_name        = COALESCE($4,          item_name),
    vendor           = COALESCE($5,          vendor),
    estimated_amount = COALESCE($6::numeric, estimated_amount),
    actual_amount    = COALESCE($7::numeric, actual_amount),
    paid             = COALESCE($8,          paid),
    payment_status   = COALESCE($9,          payment_status),
    due_date         = COALESCE($10::date,   due_date),
    updated_at       = now()
WHERE id = $1::uuid
  AND wedding_id = $2::uuid
RETURNING ` + budgetItemSelectColumns

const deleteBudgetItemSQL = `
DELETE FROM budget_items
WHERE id = $1::uuid
  AND wedding_id = $2::uuid
`

const getBudgetItemSQL = `
SELECT ` + budgetItemSelectColumns + `
FROM budget_items
WHERE id = $1::uuid
`

const listBudgetItemsSQL = `
SELECT ` + budgetItemSelectColumns + `
FROM budget_items
WHERE wedding_id = $1::uuid
ORDER BY created_at, id
`

const budgetSummarySQL = `
WITH category_totals AS (
    SELECT
        category AS name,
        COALESCE(SUM(estimated_amount), 0)::float8 AS budgeted,
        COALESCE(SUM(actual_amount), 0)::float8 AS actual
    FROM budget_items
    WHERE wedding_id = $1::uuid
    GROUP BY category
)
SELECT
    COALESCE(SUM(budgeted), 0)::float8 AS total_budgeted,
    COALESCE(SUM(actual), 0)::float8 AS total_actual,
    COALESCE(BOOL_OR(actual > budgeted), false) AS overspend,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'name', name,
                'budgeted', budgeted,
                'actual', actual,
                'overspend', actual > budgeted
            )
            ORDER BY name
        ) FILTER (WHERE name IS NOT NULL),
        '[]'::jsonb
    ) AS categories
FROM category_totals
`

const budgetWeddingIDForUserSQL = `
SELECT wedding_id
FROM weddings
WHERE user_id = $1
LIMIT 1
`

const budgetWeddingIDForOwnerSQL = `
SELECT id::text
FROM weddings
WHERE owner_user_id = $1
LIMIT 1
`

const budgetItemWeddingIDSQL = `
SELECT wedding_id::text
FROM budget_items
WHERE id = $1::uuid
`
