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

func budgetRouter(h *BudgetHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

type memoryBudgetStore struct {
	nextID        int
	byID          map[string]BudgetItem
	weddingByUser map[string]string
}

func newMemoryBudgetStore() *memoryBudgetStore {
	return &memoryBudgetStore{
		nextID:        1,
		byID:          make(map[string]BudgetItem),
		weddingByUser: make(map[string]string),
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
		Paid:            params.Paid,
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
	if params.Paid != nil {
		item.Paid = *params.Paid
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
	for _, item := range s.byID {
		if item.WeddingID != weddingID {
			continue
		}
		category := byCategory[item.Category]
		if category == nil {
			category = &BudgetCategorySummary{Name: item.Category}
			byCategory[item.Category] = category
		}
		category.Budgeted += item.EstimatedAmount
		category.Actual += item.ActualAmount
	}

	summary := BudgetSummary{Categories: []BudgetCategorySummary{}}
	for _, category := range byCategory {
		category.Overspend = category.Actual > category.Budgeted
		summary.TotalBudgeted += category.Budgeted
		summary.TotalActual += category.Actual
		summary.Overspend = summary.Overspend || category.Overspend
		summary.Categories = append(summary.Categories, *category)
	}
	sort.Slice(summary.Categories, func(i int, j int) bool {
		return summary.Categories[i].Name < summary.Categories[j].Name
	})
	return summary, nil
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
