package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"maps"
	"net/http"
	"net/http/httptest"
	"net/url"
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
			name: "create returns 201 with a random draft slug",
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
				if got.Slug != "draft-abcd1234" {
					t.Fatalf("slug = %q; want the injected draft slug", got.Slug)
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
			name: "public GET by slug returns 200 for published with no auth required",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				store.mustPublish(t, created.ID)
				req := httptest.NewRequest(http.MethodGet, "/api/invitations/alya-bima", nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				if cc := rec.Header().Get("Cache-Control"); !strings.Contains(cc, "max-age=60") {
					t.Fatalf("Cache-Control = %q; want max-age=60", cc)
				}
			},
		},
		{
			name: "public GET by named slug returns 404 when unpublished",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := httptest.NewRequest(http.MethodGet, "/api/invitations/alya-bima", nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusNotFound)
				if cc := rec.Header().Get("Cache-Control"); cc != "no-store" {
					t.Fatalf("Cache-Control = %q; want no-store", cc)
				}
			},
		},
		{
			name: "public GET by draft slug serves the unpublished draft uncached",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				store.mustCreate(t, "owner-1", "Alya & Bima", "draft-a1b2c3d4e5f6", `{"theme":"leaf"}`)
				req := httptest.NewRequest(http.MethodGet, "/api/invitations/draft-a1b2c3d4e5f6", nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				if cc := rec.Header().Get("Cache-Control"); cc != "no-store" {
					t.Fatalf("Cache-Control = %q; want no-store for drafts", cc)
				}
			},
		},
		{
			name: "slug-check reports available, taken, invalid, reserved",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{}`)

				cases := []struct {
					slug      string
					available bool
					reason    string
				}{
					{"citra-dimas", true, ""},
					{"alya-bima", false, "taken"},
					{"Bad Slug!", false, "invalid"},
					{"draft-12345678", false, "invalid"},
					{"warm-narrative", false, "reserved"},
					{"slug-check", false, "reserved"},
				}
				for _, c := range cases {
					req := requestWithUser(http.MethodGet, "/api/invitations/slug-check?slug="+url.QueryEscape(c.slug), ``, "owner-1")
					rec := httptest.NewRecorder()

					router(h).ServeHTTP(rec, req)

					assertStatus(t, rec.Code, http.StatusOK)
					var got struct {
						Available bool   `json:"available"`
						Reason    string `json:"reason"`
					}
					decodeBody(t, rec, &got)
					if got.Available != c.available || got.Reason != c.reason {
						t.Fatalf("slug-check(%q) = available=%v reason=%q; want available=%v reason=%q", c.slug, got.Available, got.Reason, c.available, c.reason)
					}
				}
			},
		},
		{
			name: "slug-check without auth returns 401",
			run: func(t *testing.T, h *InvitationHandler, _ *memoryInvitationStore) {
				req := httptest.NewRequest(http.MethodGet, "/api/invitations/slug-check?slug=alya-bima", nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusUnauthorized)
			},
		},
		{
			name: "patch can rename the slug before publish",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "draft-11111111", `{}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"slug":"alya-bima"}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got Invitation
				decodeBody(t, rec, &got)
				if got.Slug != "alya-bima" {
					t.Fatalf("slug = %q; want alya-bima", got.Slug)
				}
			},
		},
		{
			name: "patch rejects invalid and reserved slugs with 400",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "draft-11111111", `{}`)
				for _, slug := range []string{"Bad Slug!", "api", "draft-99999999"} {
					req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"slug":"`+slug+`"}`, "owner-1")
					rec := httptest.NewRecorder()

					router(h).ServeHTTP(rec, req)

					assertStatus(t, rec.Code, http.StatusBadRequest)
				}
			},
		},
		{
			name: "patch slug taken by another invitation returns 409",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				store.mustCreate(t, "owner-2", "Citra & Dimas", "citra-dimas", `{}`)
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "draft-11111111", `{}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"slug":"citra-dimas"}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusConflict)
			},
		},
		{
			name: "publish with slug succeeds, later rename returns 409 slug locked",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "draft-11111111", `{}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"slug":"alya-bima","published":true}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)

				// Same slug again is a no-op and allowed.
				req = requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"slug":"alya-bima"}`, "owner-1")
				rec = httptest.NewRecorder()
				router(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusOK)

				// A different slug after publish is locked.
				req = requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"slug":"alya-dan-bima"}`, "owner-1")
				rec = httptest.NewRecorder()
				router(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusConflict)
			},
		},
		{
			name: "patch updates couple_names",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "draft-11111111", `{}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"couple_names":"Alya & Bimasena"}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got Invitation
				decodeBody(t, rec, &got)
				if got.CoupleNames != "Alya & Bimasena" {
					t.Fatalf("couple_names = %q; want updated", got.CoupleNames)
				}
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
			name: "list returns only the requester's invitations",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				store.mustCreate(t, "owner-1", "Citra & Dimas", "citra-dimas", `{"theme":"timber"}`)
				store.mustCreate(t, "owner-2", "Eka & Fajar", "eka-fajar", `{"theme":"leaf"}`)
				req := requestWithUser(http.MethodGet, "/api/invitations", ``, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got []Invitation
				decodeBody(t, rec, &got)
				if len(got) != 2 {
					t.Fatalf("len = %d; want 2", len(got))
				}
				for _, inv := range got {
					if inv.OwnerID != "owner-1" {
						t.Fatalf("owner_id = %q; want owner-1", inv.OwnerID)
					}
				}
			},
		},
		{
			name: "list without auth returns 401",
			run: func(t *testing.T, h *InvitationHandler, _ *memoryInvitationStore) {
				req := httptest.NewRequest(http.MethodGet, "/api/invitations", nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusUnauthorized)
			},
		},
		{
			name: "get by id returns 200 for the owner",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := requestWithUser(http.MethodGet, "/api/invitations/by-id/"+created.ID, ``, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var got Invitation
				decodeBody(t, rec, &got)
				if got.ID != created.ID {
					t.Fatalf("id = %q; want %q", got.ID, created.ID)
				}
				assertJSONEqual(t, got.Content, `{"theme":"leaf"}`)
			},
		},
		{
			name: "get by id returns 403 for a different authenticated user",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := requestWithUser(http.MethodGet, "/api/invitations/by-id/"+created.ID, ``, "owner-2")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusForbidden)
			},
		},
		{
			name: "get by id returns 404 for a nonexistent id",
			run: func(t *testing.T, h *InvitationHandler, _ *memoryInvitationStore) {
				req := requestWithUser(http.MethodGet, "/api/invitations/by-id/missing", ``, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusNotFound)
			},
		},
		{
			name: "get by id without auth returns 401",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf"}`)
				req := httptest.NewRequest(http.MethodGet, "/api/invitations/by-id/"+created.ID, nil)
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusUnauthorized)
			},
		},
		{
			name: "partial content patch merges instead of clobbering",
			run: func(t *testing.T, h *InvitationHandler, store *memoryInvitationStore) {
				created := store.mustCreate(t, "owner-1", "Alya & Bima", "alya-bima", `{"theme":"leaf","venue":"Glass House","story":"Roots"}`)
				req := requestWithUser(http.MethodPatch, "/api/invitations/"+created.ID, `{"content":{"story":"New roots"}}`, "owner-1")
				rec := httptest.NewRecorder()

				router(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
			},
			verify: func(t *testing.T, store *memoryInvitationStore) {
				got := store.bySlug["alya-bima"]
				assertJSONEqual(t, got.Content, `{"theme":"leaf","venue":"Glass House","story":"New roots"}`)
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
			h.newDraftSlug = func() (string, error) { return "draft-abcd1234", nil }

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

	if params.Slug != nil && *params.Slug != invitation.Slug {
		if _, taken := s.bySlug[*params.Slug]; taken {
			return Invitation{}, ErrSlugTaken
		}
		delete(s.bySlug, invitation.Slug)
		invitation.Slug = *params.Slug
	}
	if params.CoupleNames != nil {
		invitation.CoupleNames = *params.CoupleNames
	}
	if params.Content != nil {
		invitation.Content = mergeJSON(invitation.Content, *params.Content)
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

func (s *memoryInvitationStore) SlugExists(_ context.Context, slug string) (bool, error) {
	_, ok := s.bySlug[slug]
	return ok, nil
}

func (s *memoryInvitationStore) GetInvitation(_ context.Context, id string) (Invitation, error) {
	invitation, ok := s.byID[id]
	if !ok {
		return Invitation{}, ErrInvitationNotFound
	}
	return invitation, nil
}

func (s *memoryInvitationStore) ListInvitations(_ context.Context, ownerID string) ([]Invitation, error) {
	invitations := []Invitation{}
	for _, invitation := range s.byID {
		if invitation.OwnerID == ownerID {
			invitations = append(invitations, invitation)
		}
	}
	return invitations, nil
}

func (s *memoryInvitationStore) GetInvitationBySlug(_ context.Context, slug string) (Invitation, error) {
	invitation, ok := s.bySlug[slug]
	if !ok || (invitation.PublishedAt == nil && !strings.HasPrefix(slug, "draft-")) {
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

func (s *memoryInvitationStore) mustPublish(t *testing.T, id string) {
	t.Helper()
	invitation, ok := s.byID[id]
	if !ok {
		t.Fatalf("publish seed: no invitation %s", id)
	}
	now := time.Now().UTC()
	invitation.PublishedAt = &now
	s.byID[id] = invitation
	s.bySlug[invitation.Slug] = invitation
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

// mergeJSON mirrors the shallow top-level jsonb merge in updateInvitationSQL.
func mergeJSON(existing, incoming json.RawMessage) json.RawMessage {
	merged := map[string]any{}
	if len(existing) > 0 {
		_ = json.Unmarshal(existing, &merged)
	}
	var patch map[string]any
	if err := json.Unmarshal(incoming, &patch); err != nil {
		return cloneJSON(incoming)
	}
	maps.Copy(merged, patch)
	out, _ := json.Marshal(merged)
	return out
}
