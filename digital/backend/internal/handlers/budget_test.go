package handlers

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sort"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

func TestBudgetItems(t *testing.T) {
	tests := []struct {
		name   string
		run    func(*testing.T, *BudgetHandler, *memoryBudgetStore)
		verify func(*testing.T, *memoryBudgetStore)
	}{
		{
			name: "create returns 201 with id",
			run: func(t *testing.T, h *BudgetHandler, _ *memoryBudgetStore) {
				req := requestWithGuestAuth(http.MethodPost, "/api/budget/items", `{"category":"Venue","item_name":"Hall","budgeted":1000}`, "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
				var got BudgetItem
				decodeBody(t, rec, &got)
				if got.ID == "" {
					t.Fatal("id = empty; want generated id")
				}
			},
		},
		{
			name: "update persists actual spend",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				created := store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 0)
				req := requestWithGuestAuth(http.MethodPatch, "/api/budget/items/"+created.ID, `{"actual":1250}`, "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
			},
			verify: func(t *testing.T, store *memoryBudgetStore) {
				got := store.byID["budget-1"]
				if got.ActualAmount != 1250 {
					t.Fatalf("actual_amount = %.2f; want 1250", got.ActualAmount)
				}
			},
		},
		{
			name: "summary totals match sum of all items",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 900)
				store.mustCreateBudgetItem(t, "wed-1", "Catering", "Dinner", 2000, 2100)
				store.mustCreateBudgetItem(t, "wed-1", "Catering", "Snacks", 500, 400)
				req := requestWithGuestAuth(http.MethodGet, "/api/budget/summary", "", "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got BudgetSummary
				decodeBody(t, rec, &got)
				if got.TotalBudgeted != 3500 {
					t.Fatalf("total_budgeted = %.2f; want 3500", got.TotalBudgeted)
				}
				if got.TotalActual != 3400 {
					t.Fatalf("total_actual = %.2f; want 3400", got.TotalActual)
				}
			},
		},
		{
			name: "summary overspend is true when any category actual exceeds budgeted",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 900)
				store.mustCreateBudgetItem(t, "wed-1", "Flowers", "Bouquet", 100, 125)
				req := requestWithGuestAuth(http.MethodGet, "/api/budget/summary", "", "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got BudgetSummary
				decodeBody(t, rec, &got)
				if !got.Overspend {
					t.Fatal("overspend = false; want true when any category actual > budgeted")
				}
			},
		},
		{
			name: "couple cannot read another couple's item",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				created := store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 900)
				req := requestWithGuestAuth(http.MethodGet, "/api/budget/items/"+created.ID, "", "couple", "wed-2")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusForbidden)
			},
		},
		{
			name: "create persists vendor",
			run: func(t *testing.T, h *BudgetHandler, _ *memoryBudgetStore) {
				req := requestWithGuestAuth(
					http.MethodPost,
					"/api/budget/items",
					`{"category":"Catering","item_name":"Dinner","budgeted":5000,"vendor":"Dapur Nusantara"}`,
					"couple", "wed-1",
				)
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
				var got BudgetItem
				decodeBody(t, rec, &got)
				if got.Vendor == nil || *got.Vendor != "Dapur Nusantara" {
					t.Fatalf("vendor = %v; want \"Dapur Nusantara\"", got.Vendor)
				}
			},
		},
		{
			name: "update persists vendor",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				created := store.mustCreateBudgetItem(t, "wed-1", "Catering", "Dinner", 5000, 0)
				req := requestWithGuestAuth(http.MethodPatch, "/api/budget/items/"+created.ID,
					`{"vendor":"Dapur Nusantara"}`, "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
			},
			verify: func(t *testing.T, store *memoryBudgetStore) {
				got := store.byID["budget-1"]
				if got.Vendor == nil || *got.Vendor != "Dapur Nusantara" {
					t.Fatalf("vendor = %v; want \"Dapur Nusantara\"", got.Vendor)
				}
			},
		},
		{
			name: "create with partial paid_amount derives partial status",
			run: func(t *testing.T, h *BudgetHandler, _ *memoryBudgetStore) {
				req := requestWithGuestAuth(http.MethodPost, "/api/budget/items",
					`{"category":"Venue","item_name":"Hall","budgeted":1000,"actual":1000,"paid_amount":400}`, "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
				var got BudgetItem
				decodeBody(t, rec, &got)
				if got.PaidAmount != 400 {
					t.Fatalf("paid_amount = %.2f; want 400", got.PaidAmount)
				}
				if got.PaymentStatus != "partial" {
					t.Fatalf("payment_status = %q; want partial", got.PaymentStatus)
				}
				if got.Paid {
					t.Fatal("paid = true; want false for a partial payment")
				}
			},
		},
		{
			name: "paying full actual derives paid status",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				created := store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 1000)
				req := requestWithGuestAuth(http.MethodPatch, "/api/budget/items/"+created.ID,
					`{"paid_amount":1000}`, "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got BudgetItem
				decodeBody(t, rec, &got)
				if got.PaymentStatus != "paid" || !got.Paid {
					t.Fatalf("status = %q paid = %v; want paid/true", got.PaymentStatus, got.Paid)
				}
			},
		},
		{
			name: "legacy paid=true translates to full paid_amount",
			run: func(t *testing.T, h *BudgetHandler, _ *memoryBudgetStore) {
				req := requestWithGuestAuth(http.MethodPost, "/api/budget/items",
					`{"category":"Venue","item_name":"Hall","budgeted":1000,"actual":800,"paid":true}`, "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
				var got BudgetItem
				decodeBody(t, rec, &got)
				if got.PaidAmount != 800 || got.PaymentStatus != "paid" {
					t.Fatalf("paid_amount = %.2f status = %q; want 800/paid", got.PaidAmount, got.PaymentStatus)
				}
			},
		},
		{
			name: "summary reports total_paid and per-item paid",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				created := store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 1000)
				_, _ = store.UpdateBudgetItem(context.Background(), UpdateBudgetItemParams{
					ID: created.ID, WeddingID: "wed-1", PaidAmount: f64(600),
				})
				req := requestWithGuestAuth(http.MethodGet, "/api/budget/summary", "", "couple", "wed-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got BudgetSummary
				decodeBody(t, rec, &got)
				if got.TotalPaid != 600 {
					t.Fatalf("total_paid = %.2f; want 600", got.TotalPaid)
				}
			},
		},
		{
			name: "category budget upsert overrides budgeted in summary",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 200) // estimate 1000
				req := requestWithGuestAuth(http.MethodPut, "/api/budget/category-budgets",
					`{"category":"Venue","planned_amount":5000}`, "couple", "wed-1")
				rec := httptest.NewRecorder()
				budgetRouter(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusOK)

				sreq := requestWithGuestAuth(http.MethodGet, "/api/budget/summary", "", "couple", "wed-1")
				srec := httptest.NewRecorder()
				budgetRouter(h).ServeHTTP(srec, sreq)
				assertStatus(t, srec.Code, http.StatusOK)

				var got BudgetSummary
				decodeBody(t, srec, &got)
				if got.TotalBudgeted != 5000 {
					t.Fatalf("total_budgeted = %.2f; want 5000 (planned overrides estimate)", got.TotalBudgeted)
				}
			},
		},
		{
			name: "missing JWT weddingId derives wedding from user id",
			run: func(t *testing.T, h *BudgetHandler, store *memoryBudgetStore) {
				store.weddingByUser["user-1"] = "wed-1"
				store.mustCreateBudgetItem(t, "wed-1", "Venue", "Hall", 1000, 900)
				req := requestWithUser(http.MethodGet, "/api/budget/items", "", "user-1")
				rec := httptest.NewRecorder()

				budgetRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got []BudgetItem
				decodeBody(t, rec, &got)
				if len(got) != 1 {
					t.Fatalf("items = %d; want 1", len(got))
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := newMemoryBudgetStore()
			h := NewBudgetHandler(store)

			tt.run(t, h, store)
			if tt.verify != nil {
				tt.verify(t, store)
			}
		})
	}
}

func f64(v float64) *float64 { return &v }

func budgetRouter(h *BudgetHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

type memoryBudgetStore struct {
	nextID        int
	byID          map[string]BudgetItem
	weddingByUser map[string]string
	plannedByCat  map[string]map[string]float64 // weddingID -> category -> planned
}

func newMemoryBudgetStore() *memoryBudgetStore {
	return &memoryBudgetStore{
		nextID:        1,
		byID:          make(map[string]BudgetItem),
		weddingByUser: make(map[string]string),
		plannedByCat:  make(map[string]map[string]float64),
	}
}

func (s *memoryBudgetStore) CreateBudgetItem(_ context.Context, params CreateBudgetItemParams) (BudgetItem, error) {
	now := time.Now().UTC()
	item := normalizeBudgetItem(BudgetItem{
		ID:              fmt.Sprintf("budget-%d", s.nextID),
		WeddingID:       params.WeddingID,
		Category:        params.Category,
		ItemName:        params.ItemName,
		Vendor:          params.Vendor,
		EstimatedAmount: params.EstimatedAmount,
		ActualAmount:    params.ActualAmount,
		PaidAmount:      params.PaidAmount,
		DueDate:         params.DueDate,
		CreatedAt:       now,
		UpdatedAt:       now,
	})
	s.nextID++
	s.byID[item.ID] = item
	return item, nil
}

func (s *memoryBudgetStore) UpdateBudgetItem(_ context.Context, params UpdateBudgetItemParams) (BudgetItem, error) {
	item, ok := s.byID[params.ID]
	if !ok {
		return BudgetItem{}, ErrBudgetItemNotFound
	}
	if item.WeddingID != params.WeddingID {
		return BudgetItem{}, ErrForbidden
	}
	if params.Category != nil {
		item.Category = *params.Category
	}
	if params.ItemName != nil {
		item.ItemName = *params.ItemName
	}
	if params.Vendor != nil {
		item.Vendor = params.Vendor
	}
	if params.EstimatedAmount != nil {
		item.EstimatedAmount = *params.EstimatedAmount
	}
	if params.ActualAmount != nil {
		item.ActualAmount = *params.ActualAmount
	}
	if params.PaidAmount != nil {
		item.PaidAmount = *params.PaidAmount
	}
	if params.DueDate != nil {
		item.DueDate = params.DueDate
	}
	item.UpdatedAt = time.Now().UTC()
	item = normalizeBudgetItem(item)
	s.byID[item.ID] = item
	return item, nil
}

func (s *memoryBudgetStore) DeleteBudgetItem(_ context.Context, id string, weddingID string) error {
	item, ok := s.byID[id]
	if !ok {
		return ErrBudgetItemNotFound
	}
	if item.WeddingID != weddingID {
		return ErrForbidden
	}
	delete(s.byID, id)
	return nil
}

func (s *memoryBudgetStore) GetBudgetItem(_ context.Context, id string, weddingID string) (BudgetItem, error) {
	item, ok := s.byID[id]
	if !ok {
		return BudgetItem{}, ErrBudgetItemNotFound
	}
	if item.WeddingID != weddingID {
		return BudgetItem{}, ErrForbidden
	}
	return item, nil
}

func (s *memoryBudgetStore) ListBudgetItems(_ context.Context, weddingID string) ([]BudgetItem, error) {
	items := []BudgetItem{}
	for _, item := range s.byID {
		if item.WeddingID == weddingID {
			items = append(items, item)
		}
	}
	sort.Slice(items, func(i int, j int) bool {
		return items[i].ID < items[j].ID
	})
	return items, nil
}

func (s *memoryBudgetStore) GetBudgetSummary(_ context.Context, weddingID string) (BudgetSummary, error) {
	byCategory := make(map[string]*BudgetCategorySummary)
	get := func(name string) *BudgetCategorySummary {
		c := byCategory[name]
		if c == nil {
			c = &BudgetCategorySummary{Name: name}
			byCategory[name] = c
		}
		return c
	}

	for _, item := range s.byID {
		if item.WeddingID != weddingID {
			continue
		}
		category := get(item.Category)
		category.Estimated += item.EstimatedAmount
		category.Actual += item.ActualAmount
		category.Paid += item.PaidAmount
	}
	for name, planned := range s.plannedByCat[weddingID] {
		get(name).Planned = planned
	}

	summary := BudgetSummary{Categories: []BudgetCategorySummary{}}
	for _, category := range byCategory {
		// Top-down planned budget wins; fall back to bottom-up estimates.
		if category.Planned > 0 {
			category.Budgeted = category.Planned
		} else {
			category.Budgeted = category.Estimated
		}
		category.Overspend = category.Actual > category.Budgeted
		summary.TotalBudgeted += category.Budgeted
		summary.TotalActual += category.Actual
		summary.TotalPaid += category.Paid
		summary.Overspend = summary.Overspend || category.Overspend
		summary.Categories = append(summary.Categories, *category)
	}
	sort.Slice(summary.Categories, func(i int, j int) bool {
		return summary.Categories[i].Name < summary.Categories[j].Name
	})
	return summary, nil
}

func (s *memoryBudgetStore) ListCategoryBudgets(_ context.Context, weddingID string) ([]CategoryBudget, error) {
	budgets := []CategoryBudget{}
	for cat, planned := range s.plannedByCat[weddingID] {
		budgets = append(budgets, CategoryBudget{Category: cat, PlannedAmount: planned})
	}
	sort.Slice(budgets, func(i int, j int) bool { return budgets[i].Category < budgets[j].Category })
	return budgets, nil
}

func (s *memoryBudgetStore) UpsertCategoryBudget(_ context.Context, weddingID, category string, planned float64) (CategoryBudget, error) {
	if s.plannedByCat[weddingID] == nil {
		s.plannedByCat[weddingID] = make(map[string]float64)
	}
	s.plannedByCat[weddingID][category] = planned
	return CategoryBudget{Category: category, PlannedAmount: planned}, nil
}

func (s *memoryBudgetStore) BudgetWeddingIDForUser(_ context.Context, userID string) (string, error) {
	weddingID, ok := s.weddingByUser[userID]
	if !ok {
		return "", ErrBudgetWeddingNotFound
	}
	return weddingID, nil
}

func (s *memoryBudgetStore) mustCreateBudgetItem(t *testing.T, weddingID, category, itemName string, estimatedAmount, actualAmount float64) BudgetItem {
	t.Helper()
	item, err := s.CreateBudgetItem(context.Background(), CreateBudgetItemParams{
		WeddingID:       weddingID,
		Category:        category,
		ItemName:        itemName,
		EstimatedAmount: estimatedAmount,
		ActualAmount:    actualAmount,
	})
	if err != nil {
		t.Fatalf("seed budget item: %v", err)
	}
	return item
}
