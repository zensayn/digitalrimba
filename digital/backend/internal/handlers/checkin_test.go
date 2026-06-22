package handlers

import (
	"bufio"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func TestCheckinHandlers(t *testing.T) {
	now := time.Date(2026, 5, 15, 10, 0, 0, 0, time.UTC)
	eventDate := time.Date(2026, 5, 15, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name string
		run  func(*testing.T, *CheckinHandler, *memoryCheckinStore)
	}{
		{
			name: "correct PIN returns token with correct expiry",
			run: func(t *testing.T, h *CheckinHandler, _ *memoryCheckinStore) {
				req := httptest.NewRequest(http.MethodPost, "/api/checkin/auth", strings.NewReader(`{"eventCode":"EVT","pin":"123456"}`))
				rec := httptest.NewRecorder()

				checkinRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusOK)
				var response struct {
					Token     string    `json:"token"`
					ExpiresAt time.Time `json:"expires_at"`
				}
				decodeBody(t, rec, &response)

				wantExpiry := time.Date(2026, 5, 16, 0, 0, 0, 0, time.UTC)
				if !response.ExpiresAt.Equal(wantExpiry) {
					t.Fatalf("expires_at = %s; want %s", response.ExpiresAt, wantExpiry)
				}

				claims := decodeCheckinClaims(t, response.Token)
				if claims.Exp != wantExpiry.Unix() {
					t.Fatalf("token exp = %d; want %d", claims.Exp, wantExpiry.Unix())
				}
			},
		},
		{
			name: "wrong PIN 3 times locks for 10 minutes and returns 423",
			run: func(t *testing.T, h *CheckinHandler, _ *memoryCheckinStore) {
				for attempt := 1; attempt <= 3; attempt++ {
					req := httptest.NewRequest(http.MethodPost, "/api/checkin/auth", strings.NewReader(`{"eventCode":"EVT","pin":"wrong"}`))
					rec := httptest.NewRecorder()

					checkinRouter(h).ServeHTTP(rec, req)

					if attempt < 3 {
						assertStatus(t, rec.Code, http.StatusUnauthorized)
						continue
					}
					assertStatus(t, rec.Code, http.StatusLocked)
				}

				if got := h.lockedTil["EVT"]; !got.Equal(now.Add(10 * time.Minute)) {
					t.Fatalf("locked until = %s; want %s", got, now.Add(10*time.Minute))
				}
			},
		},
		{
			name: "scan of unknown qr_token returns 404",
			run: func(t *testing.T, h *CheckinHandler, _ *memoryCheckinStore) {
				token := mustToken(t, h)
				req := httptest.NewRequest(http.MethodPost, "/api/checkin/scan", strings.NewReader(`{"qr_token":"missing","souvenir_given":true}`))
				req.Header.Set("Authorization", "Bearer "+token)
				rec := httptest.NewRecorder()

				checkinRouter(h).ServeHTTP(rec, req)

				assertStatus(t, rec.Code, http.StatusNotFound)
			},
		},
		{
			name: "duplicate scan returns 200 with already_arrived true",
			run: func(t *testing.T, h *CheckinHandler, store *memoryCheckinStore) {
				token := mustToken(t, h)
				scanGuest(t, h, token, "qr-1")
				rec := scanGuest(t, h, token, "qr-1")

				assertStatus(t, rec.Code, http.StatusOK)
				var response struct {
					AlreadyArrived bool `json:"already_arrived"`
				}
				decodeBody(t, rec, &response)
				if !response.AlreadyArrived {
					t.Fatal("already_arrived = false; want true")
				}
				if store.scanRows != 1 {
					t.Fatalf("scan rows = %d; want 1", store.scanRows)
				}
			},
		},
		{
			name: "CreateEvent returns eventCode and 6-digit PIN",
			run: func(t *testing.T, h *CheckinHandler, _ *memoryCheckinStore) {
				req := httptest.NewRequest(http.MethodPost, "/api/checkin/events", strings.NewReader(`{}`))
				req.Header.Set("Content-Type", "application/json")
				req = req.WithContext(WithUserID(req.Context(), "user-1"))
				rec := httptest.NewRecorder()
				checkinEventsRouter(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusCreated)
				var resp struct {
					EventCode string `json:"eventCode"`
					PIN       string `json:"pin"`
				}
				decodeBody(t, rec, &resp)
				if len(resp.EventCode) != 6 {
					t.Fatalf("expected 6-char event code, got %q", resp.EventCode)
				}
				if len(resp.PIN) != 6 {
					t.Fatalf("expected 6-digit PIN, got %q", resp.PIN)
				}
				for _, c := range resp.PIN {
					if c < '0' || c > '9' {
						t.Fatalf("PIN must be all digits, got %q", resp.PIN)
					}
				}
			},
		},
		{
			name: "GetEvent returns config without PIN",
			run: func(t *testing.T, h *CheckinHandler, store *memoryCheckinStore) {
				store.events["wed-1"] = CheckinEvent{EventCode: "ABC123", WeddingID: "wed-1", PINHash: "hash"}
				req := httptest.NewRequest(http.MethodGet, "/api/checkin/events", nil)
				req = req.WithContext(WithUserID(req.Context(), "user-1"))
				rec := httptest.NewRecorder()
				checkinEventsRouter(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusOK)
				var resp map[string]interface{}
				decodeBody(t, rec, &resp)
				if resp["eventCode"] != "ABC123" {
					t.Fatalf("expected ABC123, got %v", resp["eventCode"])
				}
				if _, ok := resp["pin"]; ok {
					t.Error("GET must not return pin")
				}
			},
		},
		{
			name: "GetGuestQRPdf returns PDF content-type",
			run: func(t *testing.T, h *CheckinHandler, store *memoryCheckinStore) {
				store.events["wed-1"] = CheckinEvent{EventCode: "ABC123", WeddingID: "wed-1"}
				req := httptest.NewRequest(http.MethodGet, "/api/checkin/events/qr/pdf", nil)
				req = req.WithContext(WithUserID(req.Context(), "user-1"))
				rec := httptest.NewRecorder()
				checkinEventsRouter(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusOK)
				if ct := rec.Header().Get("Content-Type"); ct != "application/pdf" {
					t.Fatalf("want application/pdf, got %q", ct)
				}
				if rec.Body.Len() < 100 {
					t.Error("PDF body suspiciously small")
				}
			},
		},
		{
			name: "EmailGuestQRCodes returns 202 with queued count",
			run: func(t *testing.T, h *CheckinHandler, store *memoryCheckinStore) {
				store.events["wed-1"] = CheckinEvent{EventCode: "ABC123", WeddingID: "wed-1"}
				req := httptest.NewRequest(http.MethodPost, "/api/checkin/events/qr/email", nil)
				req = req.WithContext(WithUserID(req.Context(), "user-1"))
				rec := httptest.NewRecorder()
				checkinEventsRouter(h).ServeHTTP(rec, req)
				assertStatus(t, rec.Code, http.StatusAccepted)
				var resp struct {
					Queued int `json:"queued"`
				}
				decodeBody(t, rec, &resp)
				if resp.Queued != 2 {
					t.Fatalf("expected 2 queued, got %d", resp.Queued)
				}
			},
		},
		{
			name: "SSE emits within 200ms of scan",
			run: func(t *testing.T, h *CheckinHandler, _ *memoryCheckinStore) {
				token := mustToken(t, h)
				server := httptest.NewServer(checkinRouter(h))
				defer server.Close()

				req, err := http.NewRequest(http.MethodGet, server.URL+"/api/checkin/stream", nil)
				if err != nil {
					t.Fatalf("new stream request: %v", err)
				}
				req.Header.Set("Authorization", "Bearer "+token)

				resp, err := server.Client().Do(req)
				if err != nil {
					t.Fatalf("stream request: %v", err)
				}
				defer resp.Body.Close()

				ready := make(chan struct{})
				received := make(chan CheckinCounts, 2)
				go func() {
					scanner := bufio.NewScanner(resp.Body)
					close(ready)
					for scanner.Scan() {
						line := scanner.Text()
						if !strings.HasPrefix(line, "data: ") {
							continue
						}
						var counts CheckinCounts
						if err := json.Unmarshal([]byte(strings.TrimPrefix(line, "data: ")), &counts); err == nil {
							received <- counts
						}
					}
				}()

				<-ready
				scanReq, err := http.NewRequest(http.MethodPost, server.URL+"/api/checkin/scan", strings.NewReader(`{"qr_token":"qr-1","souvenir_given":true}`))
				if err != nil {
					t.Fatalf("new scan request: %v", err)
				}
				scanReq.Header.Set("Authorization", "Bearer "+token)
				scanResp, err := server.Client().Do(scanReq)
				if err != nil {
					t.Fatalf("scan request: %v", err)
				}
				_ = scanResp.Body.Close()

				deadline := time.After(200 * time.Millisecond)
				for {
					select {
					case counts := <-received:
						if counts.Arrived == 1 && counts.Total == 2 {
							return
						}
					case <-deadline:
						t.Fatal("SSE did not emit arrived count within 200ms")
					}
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := newMemoryCheckinStore(t, eventDate)
			resolver := &memoryWeddingResolver{weddingID: "wed-1"}
			handler := NewCheckinHandler(store, []byte("test-secret"), resolver)
			handler.now = func() time.Time { return now }

			tt.run(t, handler, store)
		})
	}
}

// TestCheckin_BroadcastDropsWhenBufferFull verifies that the channel buffer is
// large enough to absorb a burst of 10 rapid scans without dropping any event.
// With buffer=4 this test fails: 6 events hit the `default` branch and are
// silently dropped. Fix: increase the buffer in subscribe() to ≥10 (50 is used
// to give headroom for slow-network clients where Flush() takes 1–10ms).
func TestCheckin_BroadcastDropsWhenBufferFull(t *testing.T) {
	store := newMemoryCheckinStore(t, time.Now())
	h := NewCheckinHandler(store, []byte("key"), &memoryWeddingResolver{weddingID: "wed-1"})
	ch := h.subscribe("wed-1")

	const total = 10
	for i := 0; i < total; i++ {
		h.broadcast("wed-1", CheckinCounts{Arrived: i + 1, Total: total})
	}
	h.unsubscribe("wed-1", ch) // closes ch so range terminates

	var received int
	for range ch {
		received++
	}
	if received != total {
		t.Fatalf("received %d/%d broadcasts — increase channel buffer in subscribe() to at least %d", received, total, total)
	}
}

func TestCheckin_10RapidScansAllEmit(t *testing.T) {
	now := time.Date(2026, 5, 15, 10, 0, 0, 0, time.UTC)
	eventDate := time.Date(2026, 5, 15, 0, 0, 0, 0, time.UTC)
	store := newMemoryCheckinStore(t, eventDate)
	handler := NewCheckinHandler(store, []byte("test-secret"), &memoryWeddingResolver{weddingID: "wed-1"})
	handler.now = func() time.Time { return now }

	server := httptest.NewServer(checkinRouter(handler))
	defer server.Close()

	token := mustToken(t, handler)

	streamReq, _ := http.NewRequest(http.MethodGet, server.URL+"/api/checkin/stream", nil)
	streamReq.Header.Set("Authorization", "Bearer "+token)
	streamResp, err := server.Client().Do(streamReq)
	if err != nil {
		t.Fatalf("open stream: %v", err)
	}
	defer streamResp.Body.Close()

	received := make(chan CheckinCounts, 20)
	ready := make(chan struct{})
	go func() {
		scanner := bufio.NewScanner(streamResp.Body)
		close(ready)
		for scanner.Scan() {
			line := scanner.Text()
			if !strings.HasPrefix(line, "data: ") {
				continue
			}
			var counts CheckinCounts
			if err := json.Unmarshal([]byte(strings.TrimPrefix(line, "data: ")), &counts); err == nil {
				received <- counts
			}
		}
	}()
	<-ready

	// drain the initial-state event emitted on subscribe
	select {
	case <-received:
	case <-time.After(100 * time.Millisecond):
	}

	// fire 10 scans in parallel — all hit qr-1 so all broadcast counts
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			req, _ := http.NewRequest(http.MethodPost, server.URL+"/api/checkin/scan",
				strings.NewReader(`{"qr_token":"qr-1","souvenir_given":false}`))
			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("Content-Type", "application/json")
			if resp, err := server.Client().Do(req); err == nil {
				resp.Body.Close()
			}
		}()
	}
	wg.Wait()

	// all 10 broadcasts must reach the SSE subscriber
	deadline := time.After(500 * time.Millisecond)
	got := 0
	for got < 10 {
		select {
		case <-received:
			got++
		case <-deadline:
			t.Fatalf("SSE received %d/10 events — channel buffer too small (dropped %d)", got, 10-got)
		}
	}
}

func checkinRouter(h *CheckinHandler) http.Handler {
	r := chi.NewRouter()
	h.RegisterRoutes(r)
	return r
}

func mustToken(t *testing.T, h *CheckinHandler) string {
	t.Helper()
	token, err := h.signSession(checkinClaims{
		EventCode: "EVT",
		WeddingID: "wed-1",
		Exp:       h.now().Add(time.Hour).Unix(),
	})
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return token
}

func scanGuest(t *testing.T, h *CheckinHandler, token, qr string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/checkin/scan", strings.NewReader(`{"qr_token":"`+qr+`","souvenir_given":true}`))
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	checkinRouter(h).ServeHTTP(rec, req)
	return rec
}

func decodeCheckinClaims(t *testing.T, token string) checkinClaims {
	t.Helper()
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		t.Fatalf("token parts = %d; want 3", len(parts))
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		t.Fatalf("decode token payload: %v", err)
	}
	var claims checkinClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		t.Fatalf("unmarshal token payload: %v", err)
	}
	return claims
}

type memoryCheckinStore struct {
	mu       sync.Mutex
	event    CheckinEvent
	guests   map[string]CheckinGuest
	scanRows int
	events   map[string]CheckinEvent // keyed by weddingID
}

func newMemoryCheckinStore(t *testing.T, eventDate time.Time) *memoryCheckinStore {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("hash pin: %v", err)
	}
	return &memoryCheckinStore{
		event: CheckinEvent{
			EventCode:   "EVT",
			WeddingID:   "wed-1",
			PINHash:     string(hash),
			WeddingDate: eventDate,
		},
		guests: map[string]CheckinGuest{
			"qr-1": {ID: "guest-1", WeddingID: "wed-1", Name: "Alya Mahendra", Tag: "VIP", QRToken: "qr-1"},
			"qr-2": {ID: "guest-2", WeddingID: "wed-1", Name: "Bima Santoso", Tag: "Family", QRToken: "qr-2"},
		},
		events: make(map[string]CheckinEvent),
	}
}

func (s *memoryCheckinStore) GetCheckinEventByCode(_ context.Context, code string) (CheckinEvent, error) {
	if code != s.event.EventCode {
		return CheckinEvent{}, ErrCheckinEventNotFound
	}
	return s.event, nil
}

func (s *memoryCheckinStore) MarkGuestArrived(_ context.Context, qr string, souvenir bool, now time.Time) (CheckinGuest, bool, CheckinCounts, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	guest, ok := s.guests[qr]
	if !ok {
		return CheckinGuest{}, false, CheckinCounts{}, ErrCheckinGuestNotFound
	}
	if guest.ArrivedAt != nil {
		return guest, true, s.countsLocked(), nil
	}

	guest.ArrivedAt = &now
	guest.SouvenirGiven = souvenir
	s.guests[qr] = guest
	s.scanRows++
	return guest, false, s.countsLocked(), nil
}

func (s *memoryCheckinStore) GetCheckinCounts(_ context.Context, weddingID string) (CheckinCounts, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.countsLocked(), nil
}

func (s *memoryCheckinStore) SearchGuestsByName(_ context.Context, weddingID, query string) ([]CheckinGuest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	q := strings.ToLower(query)
	var results []CheckinGuest
	for _, g := range s.guests {
		if g.WeddingID == weddingID && strings.Contains(strings.ToLower(g.Name), q) {
			results = append(results, g)
		}
	}
	return results, nil
}

func (s *memoryCheckinStore) LookupGuestByQRToken(_ context.Context, weddingID, qrToken string) (CheckinGuest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	g, ok := s.guests[qrToken]
	if !ok || g.WeddingID != weddingID {
		return CheckinGuest{}, pgx.ErrNoRows
	}
	return g, nil
}

func (s *memoryCheckinStore) UpdateGuestSouvenir(_ context.Context, guestID, weddingID string, collected bool) (CheckinGuest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for qr, g := range s.guests {
		if g.ID == guestID && g.WeddingID == weddingID {
			if g.ArrivedAt == nil {
				return CheckinGuest{}, ErrCheckinGuestNotFound
			}
			g.SouvenirGiven = collected
			s.guests[qr] = g
			return g, nil
		}
	}
	return CheckinGuest{}, ErrCheckinGuestNotFound
}

func (s *memoryCheckinStore) countsLocked() CheckinCounts {
	counts := CheckinCounts{Total: len(s.guests)}
	for _, guest := range s.guests {
		if guest.ArrivedAt != nil {
			counts.Arrived++
		}
	}
	return counts
}

func (s *memoryCheckinStore) GetCheckinEventByWeddingID(_ context.Context, weddingID string) (CheckinEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.events[weddingID]
	if !ok {
		return CheckinEvent{}, pgx.ErrNoRows
	}
	return e, nil
}

func (s *memoryCheckinStore) CreateCheckinEvent(_ context.Context, weddingID, eventCode, pinHash string) (CheckinEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e := CheckinEvent{EventCode: eventCode, WeddingID: weddingID, PINHash: pinHash}
	s.events[weddingID] = e
	return e, nil
}

func (s *memoryCheckinStore) UpdateEventPINHash(_ context.Context, weddingID, pinHash string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.events[weddingID]
	if !ok {
		return pgx.ErrNoRows
	}
	e.PINHash = pinHash
	s.events[weddingID] = e
	return nil
}

func (s *memoryCheckinStore) GetGuestsForQR(_ context.Context, weddingID string) ([]GuestQRData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var out []GuestQRData
	for _, g := range s.guests {
		if g.WeddingID == weddingID {
			out = append(out, GuestQRData{Name: g.Name, QRToken: g.QRToken, GuestGroup: g.Tag})
		}
	}
	return out, nil
}

func (s *memoryCheckinStore) GetGuestsWithEmail(_ context.Context, weddingID string) ([]GuestEmailData, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var out []GuestEmailData
	for _, g := range s.guests {
		if g.WeddingID == weddingID {
			out = append(out, GuestEmailData{Name: g.Name, Email: fmt.Sprintf("%s@example.com", g.ID), QRToken: g.QRToken})
		}
	}
	return out, nil
}

func (s *memoryCheckinStore) GetCheckinStats(_ context.Context, weddingID string) (CheckinStats, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var stats CheckinStats
	for _, g := range s.guests {
		if g.WeddingID == weddingID {
			stats.Total++
			if g.ArrivedAt != nil {
				stats.Arrived++
			}
			if g.SouvenirGiven {
				stats.Souvenirs++
			}
		}
	}
	return stats, nil
}

type memoryWeddingResolver struct{ weddingID string }

func (r *memoryWeddingResolver) WeddingIDForUser(_ context.Context, _ string) (string, error) {
	return r.weddingID, nil
}

func checkinEventsRouter(h *CheckinHandler) http.Handler {
	r := chi.NewRouter()
	r.Post("/api/checkin/events", h.CreateEvent)
	r.Get("/api/checkin/events", h.GetEvent)
	r.Get("/api/checkin/events/qr/pdf", h.GetGuestQRPdf)
	r.Post("/api/checkin/events/qr/email", h.EmailGuestQRCodes)
	return r
}
