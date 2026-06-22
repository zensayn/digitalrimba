package handlers

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestDashboardOverview(t *testing.T) {
	t.Run("returns overview for authenticated user's wedding", func(t *testing.T) {
		store := &memoryDashboardStore{
			byUser: map[string]DashboardOverview{
				"user-1": {
					Wedding: &DashboardWedding{
						ID:         "wed-1",
						CoupleName: "Alya & Bima",
						EventDate:  "2026-08-24",
						Status:     "draft",
					},
					Guests: DashboardGuestSummary{
						Invited:   3,
						Confirmed: 1,
						Declined:  1,
						Pending:   1,
						History: []DashboardGuestHistoryPoint{
							{Date: "May 10", Confirmed: 1, Declined: 0, Pending: 2},
						},
					},
					Budget: DashboardBudgetSummary{
						Total:       1000,
						Spent:       700,
						Paid:        500,
						Remaining:   300,
						Utilization: 70,
						NextPayment: &DashboardNextPayment{
							Label:   "Venue Deposit",
							Amount:  200,
							DueDate: "2026-05-21",
							DueIn:   4,
						},
					},
					Checklist: DashboardChecklistSummary{
						Total:     2,
						Completed: 1,
						Progress:  50,
						Tasks: []DashboardTask{
							{ID: "task-1", Label: "Book venue", Category: "Checklist", AssignedTo: "You", Urgent: true},
						},
					},
					Alerts: DashboardAlerts{
						UrgentTasks:        1,
						OverdueTasks:       0,
						OverdueBudgetItems: 0,
						PendingRSVPs:       1,
					},
					NextMilestone: &DashboardMilestone{Label: "Book venue", DueDate: "2026-05-21", Kind: "checklist"},
				},
			},
		}

		req := requestWithUser(http.MethodGet, "/api/dashboard", "", "user-1")
		rec := httptest.NewRecorder()

		dashboardRouter(NewDashboardHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got DashboardOverview
		decodeBody(t, rec, &got)
		if got.Wedding == nil || got.Wedding.CoupleName != "Alya & Bima" {
			t.Fatalf("wedding = %+v; want Alya & Bima", got.Wedding)
		}
		if got.Guests.Invited != 3 || got.Guests.Pending != 1 {
			t.Fatalf("guests = %+v; want invited 3 pending 1", got.Guests)
		}
		if got.Budget.Utilization != 70 || got.Budget.NextPayment == nil {
			t.Fatalf("budget = %+v; want utilization 70 with next payment", got.Budget)
		}
		if got.Checklist.Progress != 50 || len(got.Checklist.Tasks) != 1 {
			t.Fatalf("checklist = %+v; want progress 50 with one task", got.Checklist)
		}
	})

	t.Run("returns empty overview when user has no wedding", func(t *testing.T) {
		store := &memoryDashboardStore{byUser: map[string]DashboardOverview{
			"user-1": {},
		}}
		req := requestWithUser(http.MethodGet, "/api/dashboard", "", "user-1")
		rec := httptest.NewRecorder()

		dashboardRouter(NewDashboardHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got DashboardOverview
		decodeBody(t, rec, &got)
		if got.Wedding != nil {
			t.Fatalf("wedding = %+v; want nil", got.Wedding)
		}
		if got.Guests.History == nil {
			t.Fatal("guest history = nil; want empty array")
		}
		if got.Checklist.Tasks == nil {
			t.Fatal("checklist tasks = nil; want empty array")
		}
	})

	t.Run("requires authenticated user", func(t *testing.T) {
		store := &memoryDashboardStore{}
		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", strings.NewReader(""))
		rec := httptest.NewRecorder()

		dashboardRouter(NewDashboardHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusForbidden)
	})
}

func dashboardRouter(h *DashboardHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

type memoryDashboardStore struct {
	byUser map[string]DashboardOverview
	err    error
}

func (s *memoryDashboardStore) GetDashboardOverview(_ context.Context, userID string) (DashboardOverview, error) {
	if s.err != nil {
		return DashboardOverview{}, s.err
	}
	overview, ok := s.byUser[userID]
	if !ok {
		return DashboardOverview{}, errors.New("unexpected user: " + userID)
	}
	return normalizeDashboardOverview(overview), nil
}
