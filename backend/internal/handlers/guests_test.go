package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestGuestImports(t *testing.T) {
	tests := []struct {
		name   string
		run    func(*testing.T, *GuestHandler, *memoryGuestStore)
		verify func(*testing.T, *memoryGuestStore, *httptest.ResponseRecorder)
	}{
		{
			name: "bulk insert of 200 guests returns 201 with count",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				body, err := json.Marshal(makeGuestInputs(200, "0812"))
				if err != nil {
					t.Fatalf("marshal body: %v", err)
				}
				req := requestWithGuestAuth(http.MethodPost, "/api/guests/bulk", string(body), "couple", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
				var response struct {
					Count int `json:"count"`
				}
				decodeBody(t, rec, &response)
				if response.Count != 200 {
					t.Fatalf("count = %d; want 200", response.Count)
				}
			},
			verify: func(t *testing.T, store *memoryGuestStore, _ *httptest.ResponseRecorder) {
				if got := len(store.byWedding["wed-1"]); got != 200 {
					t.Fatalf("inserted guests = %d; want 200", got)
				}
			},
		},
		{
			name: "duplicate phone within same weddingId returns 409 with phone",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				body := `[{"name":"A","phone":"081234","tag":"vip"},{"name":"B","phone":"081234","tag":"vip"}]`
				req := requestWithGuestAuth(http.MethodPost, "/api/guests/bulk", body, "couple", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusConflict)
				if !strings.Contains(rec.Body.String(), "081234") {
					t.Fatalf("response body = %q; want duplicate phone identified", rec.Body.String())
				}
			},
		},
		{
			name: "CSV unknown columns are ignored",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				req := csvImportRequest(t, "name,phone,tag,unknown\nAlya,081111,vip,ignored\n", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
			},
			verify: func(t *testing.T, store *memoryGuestStore, _ *httptest.ResponseRecorder) {
				guest := store.byWedding["wed-1"][0]
				if guest.Name != "Alya" || guest.Phone != "081111" || guest.Tag != "vip" {
					t.Fatalf("guest = %+v; want known columns imported", guest)
				}
			},
		},
		{
			name: "CSV UTF-8 BOM header strips silently",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				req := csvImportRequest(t, "\uFEFFname,phone,tag\nBima,082222,family\n", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
			},
			verify: func(t *testing.T, store *memoryGuestStore, _ *httptest.ResponseRecorder) {
				guest := store.byWedding["wed-1"][0]
				if guest.Name != "Bima" || guest.Phone != "082222" || guest.Tag != "family" {
					t.Fatalf("guest = %+v; want BOM-stripped header import", guest)
				}
			},
		},
		{
			name: "all inserted qr_tokens are unique",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				body, err := json.Marshal(makeGuestInputs(200, "0822"))
				if err != nil {
					t.Fatalf("marshal body: %v", err)
				}
				req := requestWithGuestAuth(http.MethodPost, "/api/guests/bulk", string(body), "couple", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusCreated)
			},
			verify: func(t *testing.T, store *memoryGuestStore, _ *httptest.ResponseRecorder) {
				seen := make(map[string]struct{}, 200)
				for _, guest := range store.byWedding["wed-1"] {
					if guest.QRToken == "" {
						t.Fatal("empty qr_token")
					}
					if _, exists := seen[guest.QRToken]; exists {
						t.Fatalf("duplicate qr_token = %s", guest.QRToken)
					}
					seen[guest.QRToken] = struct{}{}
				}
			},
		},
		{
			name: "non couple auth returns 403",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				req := requestWithGuestAuth(http.MethodPost, "/api/guests/bulk", `[{"name":"A","phone":"083333","tag":"vip"}]`, "admin", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusForbidden)
			},
		},
		{
			name: "bulk import rejects more than 500 rows",
			run: func(t *testing.T, h *GuestHandler, _ *memoryGuestStore) {
				body, err := json.Marshal(makeGuestInputs(501, "0844"))
				if err != nil {
					t.Fatalf("marshal body: %v", err)
				}
				req := requestWithGuestAuth(http.MethodPost, "/api/guests/bulk", string(body), "couple", "wed-1")
				rec := httptest.NewRecorder()

				guestRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusBadRequest)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := newMemoryGuestStore()
			handler := NewGuestHandler(store)
			nextToken := 0
			handler.newToken = func() (string, error) {
				nextToken++
				return fmt.Sprintf("00000000-0000-4000-8000-%012d", nextToken), nil
			}

			tt.run(t, handler, store)
			if tt.verify != nil {
				tt.verify(t, store, nil)
			}
		})
	}
}

func TestGuestManagementRoutes(t *testing.T) {
	store := newMemoryGuestStore()
	handler := NewGuestHandler(store)
	store.weddingByUser["user-1"] = "wed-1"
	store.mustCreateGuest("wed-1", "guest-1", "Alya", "0812", "family")
	store.mustCreateGuest("wed-1", "guest-2", "Bima", "0813", "vip")
	store.mustCreateGuest("wed-2", "guest-3", "Citra", "0814", "friend")

	t.Run("list returns guests for authenticated wedding", func(t *testing.T) {
		req := requestWithGuestAuth(http.MethodGet, "/api/guests", "", "couple", "wed-1")
		rec := httptest.NewRecorder()

		guestRouter(handler).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got []Guest
		decodeBody(t, rec, &got)
		if len(got) != 2 {
			t.Fatalf("guest count = %d; want 2", len(got))
		}
		if got[0].ID != "guest-1" || got[1].ID != "guest-2" {
			t.Fatalf("guests = %+v; want only wed-1 guests in insertion order", got)
		}
	})

	t.Run("list derives wedding from authenticated user", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/guests", nil)
		req = req.WithContext(WithUserID(req.Context(), "user-1"))
		rec := httptest.NewRecorder()

		guestRouter(handler).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got []Guest
		decodeBody(t, rec, &got)
		if len(got) != 2 {
			t.Fatalf("guest count = %d; want 2", len(got))
		}
	})

	t.Run("patch updates tag inside authenticated wedding", func(t *testing.T) {
		req := requestWithGuestAuth(http.MethodPatch, "/api/guests/guest-1", `{"tag":"vendor"}`, "couple", "wed-1")
		rec := httptest.NewRecorder()

		guestRouter(handler).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got Guest
		decodeBody(t, rec, &got)
		if got.Tag != "vendor" {
			t.Fatalf("tag = %q; want vendor", got.Tag)
		}
	})

	t.Run("delete removes selected guests inside authenticated wedding", func(t *testing.T) {
		req := requestWithGuestAuth(http.MethodDelete, "/api/guests", `{"ids":["guest-2","guest-3"]}`, "couple", "wed-1")
		rec := httptest.NewRecorder()

		guestRouter(handler).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusNoContent)
		if len(store.byWedding["wed-1"]) != 1 {
			t.Fatalf("wed-1 guest count = %d; want 1", len(store.byWedding["wed-1"]))
		}
		if len(store.byWedding["wed-2"]) != 1 {
			t.Fatalf("wed-2 guest count = %d; want 1", len(store.byWedding["wed-2"]))
		}
	})
}

func guestRouter(h *GuestHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

func requestWithGuestAuth(method, target, body, role, weddingID string) *http.Request {
	req := httptest.NewRequest(method, target, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	return req.WithContext(WithGuestAuth(req.Context(), GuestAuth{Role: role, WeddingID: weddingID}))
}

func csvImportRequest(t *testing.T, csvBody string, weddingID string) *http.Request {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", "guests.csv")
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	if _, err := part.Write([]byte(csvBody)); err != nil {
		t.Fatalf("write csv: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/guests/import", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	return req.WithContext(WithGuestAuth(req.Context(), GuestAuth{Role: "couple", WeddingID: weddingID}))
}

func makeGuestInputs(count int, phonePrefix string) []GuestInput {
	rows := make([]GuestInput, count)
	for index := range rows {
		rows[index] = GuestInput{
			Name:  fmt.Sprintf("Guest %03d", index+1),
			Phone: fmt.Sprintf("%s%04d", phonePrefix, index+1),
			Tag:   "guest",
		}
	}
	return rows
}

type memoryGuestStore struct {
	nextID        int
	byWedding     map[string][]Guest
	weddingByUser map[string]string
}

func newMemoryGuestStore() *memoryGuestStore {
	return &memoryGuestStore{
		nextID:        1,
		byWedding:     make(map[string][]Guest),
		weddingByUser: make(map[string]string),
	}
}

func (s *memoryGuestStore) ListGuests(_ context.Context, weddingID string) ([]Guest, error) {
	guests := s.byWedding[weddingID]
	return append([]Guest(nil), guests...), nil
}

func (s *memoryGuestStore) UpdateGuestTag(_ context.Context, id string, weddingID string, tag string) (Guest, error) {
	for index, guest := range s.byWedding[weddingID] {
		if guest.ID != id {
			continue
		}
		s.byWedding[weddingID][index].Tag = tag
		return s.byWedding[weddingID][index], nil
	}
	return Guest{}, ErrGuestNotFound
}

func (s *memoryGuestStore) DeleteGuests(_ context.Context, weddingID string, ids []string) error {
	selected := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		selected[id] = struct{}{}
	}

	kept := s.byWedding[weddingID][:0]
	for _, guest := range s.byWedding[weddingID] {
		if _, ok := selected[guest.ID]; ok {
			continue
		}
		kept = append(kept, guest)
	}
	s.byWedding[weddingID] = kept
	return nil
}

func (s *memoryGuestStore) GuestWeddingIDForUser(_ context.Context, userID string) (string, error) {
	weddingID, ok := s.weddingByUser[userID]
	if !ok {
		return "", ErrGuestWeddingNotFound
	}
	return weddingID, nil
}

func (s *memoryGuestStore) InsertGuests(_ context.Context, rows []InsertGuestParams) ([]Guest, error) {
	for _, row := range rows {
		for _, guest := range s.byWedding[row.WeddingID] {
			if row.Phone != "" && guest.Phone == row.Phone {
				return nil, DuplicateGuestPhoneError{Phone: row.Phone}
			}
		}
	}

	guests := make([]Guest, 0, len(rows))
	for _, row := range rows {
		guest := Guest{
			ID:        fmt.Sprintf("guest-%d", s.nextID),
			WeddingID: row.WeddingID,
			Name:      row.Name,
			Phone:     row.Phone,
			Tag:       row.Tag,
			QRToken:   row.QRToken,
		}
		s.nextID++
		s.byWedding[row.WeddingID] = append(s.byWedding[row.WeddingID], guest)
		guests = append(guests, guest)
	}
	return guests, nil
}

func (s *memoryGuestStore) mustCreateGuest(weddingID, id, name, phone, tag string) Guest {
	guest := Guest{
		ID:        id,
		WeddingID: weddingID,
		Name:      name,
		Phone:     phone,
		Tag:       tag,
		QRToken:   id + "-qr",
	}
	s.byWedding[weddingID] = append(s.byWedding[weddingID], guest)
	return guest
}
