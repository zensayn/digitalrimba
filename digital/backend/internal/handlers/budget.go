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
	ListCategoryBudgets(context.Context, string) ([]CategoryBudget, error)
	UpsertCategoryBudget(context.Context, string, string, float64) (CategoryBudget, error)
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
	r.Get("/api/budget/category-budgets", h.ListCategoryBudgets)
	r.Put("/api/budget/category-budgets", h.UpsertCategoryBudget)
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
	PaidAmount      float64   `json:"paid_amount"`
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
	PaidAmount      float64
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
	PaidAmount      *float64
	DueDate         *string
}

type CategoryBudget struct {
	Category      string  `json:"category"`
	PlannedAmount float64 `json:"planned_amount"`
}

type BudgetSummary struct {
	TotalBudgeted float64                 `json:"total_budgeted"`
	TotalActual   float64                 `json:"total_actual"`
	TotalPaid     float64                 `json:"total_paid"`
	Overspend     bool                    `json:"overspend"`
	Categories    []BudgetCategorySummary `json:"categories"`
}

type BudgetCategorySummary struct {
	Name      string  `json:"name"`
	Budgeted  float64 `json:"budgeted"`
	Estimated float64 `json:"estimated"`
	Planned   float64 `json:"planned"`
	Actual    float64 `json:"actual"`
	Paid      float64 `json:"paid"`
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
	PaidAmount      *float64 `json:"paid_amount"`
	Paid            *bool    `json:"paid"`          // legacy: translated to paid_amount
	PaymentStatus   *string  `json:"payment_status"` // legacy: translated to paid_amount
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
	PaidAmount      *float64 `json:"paid_amount"`
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

func (h *BudgetHandler) ListCategoryBudgets(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}

	budgets, err := h.store.ListCategoryBudgets(r.Context(), weddingID)
	if err != nil {
		writeBudgetError(w, err)
		return
	}
	if budgets == nil {
		budgets = []CategoryBudget{}
	}

	writeJSON(w, http.StatusOK, budgets)
}

type upsertCategoryBudgetRequest struct {
	WeddingID     string   `json:"wedding_id"`
	Category      string   `json:"category"`
	PlannedAmount *float64 `json:"planned_amount"`
}

func (h *BudgetHandler) UpsertCategoryBudget(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireBudgetWeddingID(w, r)
	if !ok {
		return
	}

	var req upsertCategoryBudgetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if !h.allowsRequestedWedding(w, weddingID, req.WeddingID) {
		return
	}

	category := strings.TrimSpace(req.Category)
	if category == "" {
		http.Error(w, "category required", http.StatusBadRequest)
		return
	}
	planned := 0.0
	if req.PlannedAmount != nil {
		planned = *req.PlannedAmount
	}
	if planned < 0 {
		http.Error(w, "planned_amount must be non-negative", http.StatusBadRequest)
		return
	}

	budget, err := h.store.UpsertCategoryBudget(r.Context(), weddingID, category, planned)
	if err != nil {
		writeBudgetError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, budget)
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

	// paid_amount is canonical; translate legacy paid / payment_status when absent.
	paidAmount := 0.0
	switch {
	case req.PaidAmount != nil:
		paidAmount = *req.PaidAmount
	case (req.PaymentStatus != nil && *req.PaymentStatus == "paid") || (req.Paid != nil && *req.Paid):
		paidAmount = actualAmount
	}
	if paidAmount < 0 {
		return CreateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}

	return CreateBudgetItemParams{
		WeddingID:       weddingID,
		Category:        category,
		ItemName:        itemName,
		Vendor:          optionalTrimmedString(req.Vendor),
		EstimatedAmount: estimatedAmount,
		ActualAmount:    actualAmount,
		PaidAmount:      paidAmount,
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
	if req.PaidAmount != nil && *req.PaidAmount < 0 {
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
		PaidAmount:      req.PaidAmount,
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
	// Derive status from paid_amount vs actual. Idempotent with the DB generated
	// columns; keeps the in-memory test store identical to Postgres.
	item.PaymentStatus = derivePaymentStatus(item.ActualAmount, item.PaidAmount)
	item.Paid = item.PaymentStatus == "paid"
	return item
}

func derivePaymentStatus(actual, paid float64) string {
	switch {
	case paid <= 0:
		return "unpaid"
	case actual > 0 && paid >= actual:
		return "paid"
	default:
		return "partial"
	}
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
		params.PaidAmount,      // $7
		params.DueDate,         // $8
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
		params.PaidAmount,      // $8
		params.DueDate,         // $9
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
		&summary.TotalPaid,
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

func (s *PostgresBudgetStore) ListCategoryBudgets(ctx context.Context, weddingID string) ([]CategoryBudget, error) {
	rows, err := s.db.Query(ctx, listCategoryBudgetsSQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	budgets := []CategoryBudget{}
	for rows.Next() {
		var b CategoryBudget
		if err := rows.Scan(&b.Category, &b.PlannedAmount); err != nil {
			return nil, err
		}
		budgets = append(budgets, b)
	}
	return budgets, rows.Err()
}

func (s *PostgresBudgetStore) UpsertCategoryBudget(ctx context.Context, weddingID, category string, planned float64) (CategoryBudget, error) {
	var b CategoryBudget
	err := s.db.QueryRow(ctx, upsertCategoryBudgetSQL, weddingID, category, planned).Scan(&b.Category, &b.PlannedAmount)
	if err != nil {
		return CategoryBudget{}, err
	}
	return b, nil
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
		&item.PaidAmount,
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
paid_amount::float8,
paid,
payment_status,
due_date::text,
created_at,
updated_at
`

// paid and payment_status are generated columns (derived from paid_amount /
// actual_amount), so they are never written here.
const createBudgetItemSQL = `
INSERT INTO budget_items (
    wedding_id,
    category,
    item_name,
    vendor,
    estimated_amount,
    actual_amount,
    paid_amount,
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
    $7::numeric,
    $8::date,
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
    paid_amount      = COALESCE($8::numeric, paid_amount),
    due_date         = COALESCE($9::date,    due_date),
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

// A category's "budgeted" is its top-down planned amount when set, otherwise the
// bottom-up sum of item estimates. FULL OUTER JOIN so a planned-but-empty category
// (or an itemised category with no plan) still appears.
const budgetSummarySQL = `
WITH item_totals AS (
    SELECT
        category AS name,
        COALESCE(SUM(estimated_amount), 0)::float8 AS estimated,
        COALESCE(SUM(actual_amount), 0)::float8 AS actual,
        COALESCE(SUM(paid_amount), 0)::float8 AS paid
    FROM budget_items
    WHERE wedding_id = $1::uuid
    GROUP BY category
),
planned AS (
    SELECT category AS name, planned_amount::float8 AS planned
    FROM budget_category_budgets
    WHERE wedding_id = $1::uuid
),
merged AS (
    SELECT
        COALESCE(i.name, p.name) AS name,
        COALESCE(i.estimated, 0) AS estimated,
        COALESCE(i.actual, 0) AS actual,
        COALESCE(i.paid, 0) AS paid,
        COALESCE(p.planned, 0) AS planned
    FROM item_totals i
    FULL OUTER JOIN planned p ON i.name = p.name
),
final AS (
    SELECT
        name, estimated, actual, paid, planned,
        CASE WHEN planned > 0 THEN planned ELSE estimated END AS budgeted
    FROM merged
)
SELECT
    COALESCE(SUM(budgeted), 0)::float8 AS total_budgeted,
    COALESCE(SUM(actual), 0)::float8 AS total_actual,
    COALESCE(SUM(paid), 0)::float8 AS total_paid,
    COALESCE(BOOL_OR(actual > budgeted), false) AS overspend,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'name', name,
                'budgeted', budgeted,
                'estimated', estimated,
                'planned', planned,
                'actual', actual,
                'paid', paid,
                'overspend', actual > budgeted
            )
            ORDER BY name
        ) FILTER (WHERE name IS NOT NULL),
        '[]'::jsonb
    ) AS categories
FROM final
`

const listCategoryBudgetsSQL = `
SELECT category, planned_amount::float8
FROM budget_category_budgets
WHERE wedding_id = $1::uuid
ORDER BY category
`

const upsertCategoryBudgetSQL = `
INSERT INTO budget_category_budgets (wedding_id, category, planned_amount, created_at, updated_at)
VALUES ($1::uuid, $2, $3::numeric, now(), now())
ON CONFLICT (wedding_id, category)
DO UPDATE SET planned_amount = EXCLUDED.planned_amount, updated_at = now()
RETURNING category, planned_amount::float8
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
