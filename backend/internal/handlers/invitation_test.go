package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

func TestInvitationCRUD(t *testing.T) {
	now := time.Date(2026, 5, 14, 12, 30, 0, 0, time.UTC)

	tests := []struct {
		name   string
		run    func(*testing.T, *InvitationHandler, *memoryInvitationStore)
		verify func(*testing.T, *memoryInvitationStore)
	}{
		{
			name: "create returns 201 with id and slug",
			run: func(t *testing.T, h *InvitationHandler, _ *memoryInvitationStore) {
				req := requestWithUser(http.MethodPost, "/api/invitations", `{"couple_names":"Alya & Bima","content":{"theme":"leaf"}}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
				var got Invitation
				decodeBody(t, rec, &got)
				if got.ID == "" {
					t.Fatalf("id = empty; want generated id")
				}
				if got.Slug != "alya-bima" {
					t.Fatalf("slug = %q; want %q", got.Slug, "alya-bima")
				}
			},
		},
		{
			name: "update persists content jsonb correctly",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"content":{"theme":"timber","sections":["hero","rsvp"]}}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
			},
			verify: func(t *testing.T, store *memoryInvitationStore) {
				got := store.bySlug["alya-bima"]
				assertJSONEqual(t, got.Content, `{"theme":"timber","sections":["hero","rsvp"]}`)
			},
		},
		{
			name: "public GET by slug returns 200 with no auth required",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := httptest.NewRequest(http.MethodGet, "/api/invitations/alya-bima", nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
			},
		},
		{
			name: "DELETE by non-owner returns 403",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := requestWithUser(http.MethodDelete, "/api/invitations/"+created.ID, ``, "owner-2")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusForbidden)
			},
		},
		{
			name: "publish toggle sets published_at to now",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"published":true}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
			},
			verify: func(t *testing.T, store *memoryInvitationStore) {
				got := store.bySlug["alya-bima"]
				if got.PublishedAt == nil {
					t.Fatal("published_at = nil; want timestamp")
				}
				if !got.PublishedAt.Equal(now) {
					t.Fatalf("published_at = %s; want %s", got.PublishedAt, now)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := newMemoryInvitationStore()
			h := NewInvitationHandler(store)
			h.now = func() time.Time { return now }
			h.randomSuffix = func() (string, error) { return "abcd", nil }

			tt.run(t, h, store)
			if tt.verify != nil {
				tt.verify(t, store)
			}
		})
	}
}

func router(h *InvitationHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

func requestWithUser(method, target, body, userID string) *http.Request {
	req := httptest.NewRequest(method, target, strings.NewReader(body))
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	return req.WithContext(WithUserID(req.Context(), userID))
}

func decodeBody(t *testing.T, rec *httptest.ResponseRecorder, dst any) {
	t.Helper()
	if err := json.NewDecoder(rec.Body).Decode(dst); err != nil {
		t.Fatalf("decode response: %v", err)
	}
}

func assertStatus(t *testing.T, got, want int) {
	t.Helper()
	if got != want {
		t.Fatalf("status = %d; want %d", got, want)
	}
}

func assertJSONEqual(t *testing.T, got json.RawMessage, want string) {
	t.Helper()
	var gotValue any
	if err := json.Unmarshal(got, &gotValue); err != nil {
		t.Fatalf("unmarshal got json: %v", err)
	}
	var wantValue any
	if err := json.Unmarshal([]byte(want), &wantValue); err != nil {
		t.Fatalf("unmarshal want json: %v", err)
	}
	gotJSON, _ := json.Marshal(gotValue)
	wantJSON, _ := json.Marshal(wantValue)
	if !bytes.Equal(gotJSON, wantJSON) {
		t.Fatalf("content json = %s; want %s", gotJSON, wantJSON)
	}
}

type memoryInvitationStore struct {
	nextID int
	byID   map[string]Invitation
	bySlug map[string]Invitation
}

func newMemoryInvitationStore() *memoryInvitationStore {
	return &memoryInvitationStore{
		nextID: 1,
		byID:   make(map[string]Invitation),
		bySlug: make(map[string]Invitation),
	}
}

func (s *memoryInvitationStore) CreateInvitation(_ context.Context, params CreateInvitationParams) (Invitation, error) {
	if _, ok := s.bySlug[params.Slug]; ok {
		return Invitation{}, ErrSlugTaken
	}

	now := time.Now().UTC()
	invitation := Invitation{
		ID:          s.nextIDString(),
		OwnerID:     params.OwnerID,
		CoupleNames: params.CoupleNames,
		Slug:        params.Slug,
		Content:     cloneJSON(params.Content),
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	s.byID[invitation.ID] = invitation
	s.bySlug[invitation.Slug] = invitation
	return invitation, nil
}

func (s *memoryInvitationStore) UpdateInvitation(_ context.Context, params UpdateInvitationParams) (Invitation, error) {
	invitation, ok := s.byID[params.ID]
	if !ok {
		return Invitation{}, ErrInvitationNotFound
	}
	if invitation.OwnerID != params.OwnerID {
		return Invitation{}, ErrForbidden
	}

	if params.Content != nil {
		invitation.Content = cloneJSON(*params.Content)
	}
	if params.Published != nil {
		if *params.Published {
			invitation.PublishedAt = params.PublishedAt
		} else {
			invitation.PublishedAt = nil
		}
	}
	invitation.UpdatedAt = time.Now().UTC()

	s.byID[invitation.ID] = invitation
	s.bySlug[invitation.Slug] = invitation
	return invitation, nil
}

func (s *memoryInvitationStore) GetInvitationBySlug(_ context.Context, slug string) (Invitation, error) {
	invitation, ok := s.bySlug[slug]
	if !ok {
		return Invitation{}, ErrInvitationNotFound
	}
	return invitation, nil
}

func (s *memoryInvitationStore) DeleteInvitation(_ context.Context, id string, ownerID string) error {
	invitation, ok := s.byID[id]
	if !ok {
		return ErrInvitationNotFound
	}
	if invitation.OwnerID != ownerID {
		return ErrForbidden
	}
	delete(s.byID, id)
	delete(s.bySlug, invitation.Slug)
	return nil
}

func (s *memoryInvitationStore) mustCreate(t *testing.T, ownerID, coupleNames, slug, content string) Invitation {
	t.Helper()
	invitation, err := s.CreateInvitation(context.Background(), CreateInvitationParams{
		OwnerID:     ownerID,
		CoupleNames: coupleNames,
		Slug:        slug,
		Content:     json.RawMessage(content),
	})
	if err != nil && errors.Is(err, ErrSlugTaken) {
		invitation, err = s.CreateInvitation(context.Background(), CreateInvitationParams{
			OwnerID:     ownerID,
			CoupleNames: coupleNames,
			Slug:        slug + "-abcd",
			Content:     json.RawMessage(content),
		})
	}
	if err != nil {
		t.Fatalf("seed invitation: %v", err)
	}
	return invitation
}

func (s *memoryInvitationStore) nextIDString() string {
	id := s.nextID
	s.nextID++
	return "inv-" + string(rune('0'+id))
}

func cloneJSON(src json.RawMessage) json.RawMessage {
	dst := make([]byte, len(src))
	copy(dst, src)
	return dst
}
