package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestWeddingProfileRoutes(t *testing.T) {
	t.Run("unauthenticated request is rejected", func(t *testing.T) {
		store := newMemoryWeddingProfileStore()
		req := httptest.NewRequest(http.MethodGet, "/api/weddings/profile", nil)
		rec := httptest.NewRecorder()

		weddingProfileRouter(NewWeddingProfileHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusUnauthorized)
	})

	t.Run("get returns null wedding when authenticated user has no profile", func(t *testing.T) {
		store := newMemoryWeddingProfileStore()
		req := requestWithUser(http.MethodGet, "/api/weddings/profile", "", "user-1")
		rec := httptest.NewRecorder()

		weddingProfileRouter(NewWeddingProfileHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got WeddingProfileResponse
		decodeBody(t, rec, &got)
		if got.Wedding != nil {
			t.Fatalf("wedding = %+v; want nil", got.Wedding)
		}
	})

	t.Run("put creates a draft wedding profile for authenticated user", func(t *testing.T) {
		store := newMemoryWeddingProfileStore()
		req := requestWithUser(http.MethodPut, "/api/weddings/profile", `{
			"host_name":" Sari ",
			"couple_name":" Alya & Bima ",
			"story":" We met at a kopi stand in Bandung. ",
			"vibe":"intimate",
			"event_date":"2026-08-24",
			"guest_estimate":"50-150",
			"venue_name":"Rimba Glass House",
			"venue_address":"Jakarta"
		}`, "user-1")
		rec := httptest.NewRecorder()

		weddingProfileRouter(NewWeddingProfileHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got WeddingProfileResponse
		decodeBody(t, rec, &got)
		if got.Wedding == nil {
			t.Fatal("wedding = nil; want created profile")
		}
		if got.Wedding.CoupleName != "Alya & Bima" {
			t.Fatalf("couple_name = %q; want Alya & Bima", got.Wedding.CoupleName)
		}
		if got.Wedding.HostName != "Sari" {
			t.Fatalf("host_name = %q; want Sari (trimmed)", got.Wedding.HostName)
		}
		if got.Wedding.Story != "We met at a kopi stand in Bandung." {
			t.Fatalf("story = %q; want trimmed story", got.Wedding.Story)
		}
		if got.Wedding.Vibe != "intimate" {
			t.Fatalf("vibe = %q; want intimate", got.Wedding.Vibe)
		}
		if got.Wedding.GuestEstimate != "50-150" {
			t.Fatalf("guest_estimate = %q; want 50-150", got.Wedding.GuestEstimate)
		}
		if got.Wedding.Slug != "alya-bima" {
			t.Fatalf("slug = %q; want alya-bima", got.Wedding.Slug)
		}
		if got.Wedding.Status != "draft" {
			t.Fatalf("status = %q; want draft", got.Wedding.Status)
		}
	})

	t.Run("put updates existing profile without changing slug", func(t *testing.T) {
		store := newMemoryWeddingProfileStore()
		store.byUser["user-1"] = WeddingProfile{
			ID:         "wed-1",
			OwnerID:    "user-1",
			Slug:       "alya-bima",
			CoupleName: "Alya & Bima",
			EventDate:  "2026-08-24",
			Status:     "draft",
			Tier:       "leaf",
		}
		req := requestWithUser(http.MethodPut, "/api/weddings/profile", `{
			"couple_name":"Alya & Citra",
			"event_date":"2026-09-01"
		}`, "user-1")
		rec := httptest.NewRecorder()

		weddingProfileRouter(NewWeddingProfileHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got WeddingProfileResponse
		decodeBody(t, rec, &got)
		if got.Wedding == nil {
			t.Fatal("wedding = nil; want updated profile")
		}
		if got.Wedding.Slug != "alya-bima" {
			t.Fatalf("slug = %q; want existing slug", got.Wedding.Slug)
		}
		if got.Wedding.CoupleName != "Alya & Citra" {
			t.Fatalf("couple_name = %q; want Alya & Citra", got.Wedding.CoupleName)
		}
	})

	t.Run("put rejects blank couple name", func(t *testing.T) {
		store := newMemoryWeddingProfileStore()
		req := requestWithUser(http.MethodPut, "/api/weddings/profile", `{"couple_name":" "}`, "user-1")
		rec := httptest.NewRecorder()

		weddingProfileRouter(NewWeddingProfileHandler(store)).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusBadRequest)
	})
}

func weddingProfileRouter(h *WeddingProfileHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

type memoryWeddingProfileStore struct {
	byUser map[string]WeddingProfile
}

func newMemoryWeddingProfileStore() *memoryWeddingProfileStore {
	return &memoryWeddingProfileStore{byUser: make(map[string]WeddingProfile)}
}

func (s *memoryWeddingProfileStore) GetWeddingProfile(_ context.Context, userID string) (*WeddingProfile, error) {
	wedding, ok := s.byUser[userID]
	if !ok {
		return nil, nil
	}
	return &wedding, nil
}

func (s *memoryWeddingProfileStore) SaveWeddingProfile(_ context.Context, params SaveWeddingProfileParams) (WeddingProfile, error) {
	wedding, ok := s.byUser[params.OwnerID]
	if !ok {
		wedding = WeddingProfile{
			ID:      "wed-1",
			OwnerID: params.OwnerID,
			Slug:    slugFromWeddingName(params.CoupleName),
			Status:  "draft",
			Tier:    "leaf",
		}
	}
	wedding.HostName = params.HostName
	wedding.CoupleName = params.CoupleName
	wedding.Story = params.Story
	wedding.Vibe = params.Vibe
	wedding.EventDate = params.EventDate
	wedding.GuestEstimate = params.GuestEstimate
	wedding.VenueName = params.VenueName
	wedding.VenueAddress = params.VenueAddress
	s.byUser[params.OwnerID] = wedding
	return wedding, nil
}
