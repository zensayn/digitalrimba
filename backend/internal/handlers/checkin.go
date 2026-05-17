package handlers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrCheckinEventNotFound = errors.New("checkin event not found")
	ErrCheckinGuestNotFound = errors.New("checkin guest not found")
	ErrCheckinUnauthorized  = errors.New("checkin unauthorized")
)

type CheckinEvent struct {
	EventCode   string
	WeddingID   string
	PINHash     string
	WeddingDate time.Time
}

type CheckinGuest struct {
	ID            string     `json:"id"`
	WeddingID     string     `json:"wedding_id"`
	Name          string     `json:"name"`
	Tag           string     `json:"tag"`
	QRToken       string     `json:"qr_token"`
	ArrivedAt     *time.Time `json:"arrived_at,omitempty"`
	SouvenirGiven bool       `json:"souvenir_given"`
}

type CheckinCounts struct {
	Arrived int `json:"arrived"`
	Total   int `json:"total"`
}

type CheckinStore interface {
	GetCheckinEventByCode(context.Context, string) (CheckinEvent, error)
	MarkGuestArrived(context.Context, string, bool, time.Time) (CheckinGuest, bool, CheckinCounts, error)
	GetCheckinCounts(context.Context, string) (CheckinCounts, error)
	SearchGuestsByName(ctx context.Context, weddingID, query string) ([]CheckinGuest, error)
	UpdateGuestSouvenir(ctx context.Context, guestID, weddingID string, collected bool) (CheckinGuest, error)
}

type CheckinHandler struct {
	store      CheckinStore
	sessionKey []byte
	now        func() time.Time

	mu        sync.Mutex
	failures  map[string]int
	lockedTil map[string]time.Time
	streams   map[string]map[chan CheckinCounts]struct{}
}

func NewCheckinHandler(store CheckinStore, sessionKey []byte) *CheckinHandler {
	return &CheckinHandler{
		store:      store,
		sessionKey: sessionKey,
		now:        time.Now,
		failures:   make(map[string]int),
		lockedTil:  make(map[string]time.Time),
		streams:    make(map[string]map[chan CheckinCounts]struct{}),
	}
}

func (h *CheckinHandler) RegisterRoutes(r chi.Router) {
	r.Post("/api/checkin/auth", h.Auth)
	r.Post("/api/checkin/scan", h.Scan)
	r.Get("/api/checkin/stream", h.Stream)
	r.Get("/api/checkin/guests", h.Search)
	r.Patch("/api/checkin/guests/{id}/souvenir", h.Souvenir)
}

func (h *CheckinHandler) Auth(w http.ResponseWriter, r *http.Request) {
	var req struct {
		EventCode string `json:"eventCode"`
		PIN       string `json:"pin"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	req.EventCode = strings.TrimSpace(req.EventCode)

	if h.isLocked(req.EventCode) {
		http.Error(w, "locked", http.StatusLocked)
		return
	}

	event, err := h.store.GetCheckinEventByCode(r.Context(), req.EventCode)
	if err != nil {
		writeCheckinError(w, err)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(event.PINHash), []byte(req.PIN)) != nil {
		if h.recordFailure(req.EventCode) {
			http.Error(w, "locked", http.StatusLocked)
			return
		}
		http.Error(w, "invalid pin", http.StatusUnauthorized)
		return
	}
	h.clearFailures(req.EventCode)

	expiresAt := midnightAfter(event.WeddingDate)
	token, err := h.signSession(checkinClaims{
		EventCode: event.EventCode,
		WeddingID: event.WeddingID,
		Exp:       expiresAt.Unix(),
	})
	if err != nil {
		http.Error(w, "cannot sign token", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, struct {
		Token     string    `json:"token"`
		ExpiresAt time.Time `json:"expires_at"`
	}{
		Token:     token,
		ExpiresAt: expiresAt,
	})
}

func (h *CheckinHandler) Scan(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		QRToken       string `json:"qr_token"`
		SouvenirGiven bool   `json:"souvenir_given"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	guest, already, counts, err := h.store.MarkGuestArrived(r.Context(), req.QRToken, req.SouvenirGiven, h.now().UTC())
	if err != nil {
		writeCheckinError(w, err)
		return
	}
	if guest.WeddingID != claims.WeddingID {
		http.Error(w, "wrong wedding", http.StatusForbidden)
		return
	}

	h.broadcast(claims.WeddingID, counts)
	writeJSON(w, http.StatusOK, struct {
		Guest          CheckinGuest `json:"guest"`
		AlreadyArrived bool         `json:"already_arrived"`
	}{
		Guest:          guest,
		AlreadyArrived: already,
	})
}

func (h *CheckinHandler) Stream(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "stream unsupported", http.StatusInternalServerError)
		return
	}

	updates := h.subscribe(claims.WeddingID)
	defer h.unsubscribe(claims.WeddingID, updates)

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	if counts, err := h.store.GetCheckinCounts(r.Context(), claims.WeddingID); err == nil {
		writeSSE(w, counts)
		flusher.Flush()
	}

	for {
		select {
		case <-r.Context().Done():
			return
		case counts := <-updates:
			writeSSE(w, counts)
			flusher.Flush()
		}
	}
}

func (h *CheckinHandler) Search(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, http.StatusOK, []CheckinGuest{})
		return
	}

	guests, err := h.store.SearchGuestsByName(r.Context(), claims.WeddingID, q)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, guests)
}

func (h *CheckinHandler) Souvenir(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	guestID := chi.URLParam(r, "id")

	var req struct {
		Collected bool `json:"collected"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	guest, err := h.store.UpdateGuestSouvenir(r.Context(), guestID, claims.WeddingID, req.Collected)
	if err != nil {
		writeCheckinError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, guest)
}

func (h *CheckinHandler) authorize(r *http.Request) (checkinClaims, bool) {
	raw, ok := checkinBearerToken(r.Header.Get("Authorization"))
	if !ok {
		return checkinClaims{}, false
	}
	claims, err := h.verifySession(raw)
	if err != nil || h.now().Unix() >= claims.Exp {
		return checkinClaims{}, false
	}
	return claims, true
}

func checkinBearerToken(header string) (string, bool) {
	authType, token, ok := strings.Cut(header, " ")
	if !ok || !strings.EqualFold(authType, "Bearer") || strings.TrimSpace(token) == "" {
		return "", false
	}
	return token, true
}

func (h *CheckinHandler) isLocked(eventCode string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.now().Before(h.lockedTil[eventCode])
}

func (h *CheckinHandler) recordFailure(eventCode string) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.failures[eventCode]++
	if h.failures[eventCode] >= 3 {
		h.lockedTil[eventCode] = h.now().Add(10 * time.Minute)
		return true
	}
	return false
}

func (h *CheckinHandler) clearFailures(eventCode string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.failures, eventCode)
	delete(h.lockedTil, eventCode)
}

func (h *CheckinHandler) subscribe(weddingID string) chan CheckinCounts {
	ch := make(chan CheckinCounts, 50)
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.streams[weddingID] == nil {
		h.streams[weddingID] = make(map[chan CheckinCounts]struct{})
	}
	h.streams[weddingID][ch] = struct{}{}
	return ch
}

func (h *CheckinHandler) unsubscribe(weddingID string, ch chan CheckinCounts) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.streams[weddingID], ch)
	close(ch)
}

func (h *CheckinHandler) broadcast(weddingID string, counts CheckinCounts) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.streams[weddingID] {
		select {
		case ch <- counts:
		default:
		}
	}
}

type checkinClaims struct {
	EventCode string `json:"event_code"`
	WeddingID string `json:"wedding_id"`
	Exp       int64  `json:"exp"`
}

func (h *CheckinHandler) signSession(claims checkinClaims) (string, error) {
	header, err := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	if err != nil {
		return "", err
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	unsigned := base64.RawURLEncoding.EncodeToString(header) + "." + base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, h.sessionKey)
	mac.Write([]byte(unsigned))
	return unsigned + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil)), nil
}

func (h *CheckinHandler) verifySession(token string) (checkinClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return checkinClaims{}, ErrCheckinUnauthorized
	}

	unsigned := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, h.sessionKey)
	mac.Write([]byte(unsigned))
	expected := mac.Sum(nil)
	got, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(got, expected) {
		return checkinClaims{}, ErrCheckinUnauthorized
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return checkinClaims{}, err
	}
	var claims checkinClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return checkinClaims{}, err
	}
	return claims, nil
}

func midnightAfter(date time.Time) time.Time {
	year, month, day := date.Date()
	return time.Date(year, month, day+1, 0, 0, 0, 0, date.Location())
}

func writeCheckinError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrCheckinEventNotFound), errors.Is(err, ErrCheckinGuestNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, ErrCheckinUnauthorized):
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}

func writeSSE(w ioWriter, counts CheckinCounts) {
	payload, _ := json.Marshal(counts)
	_, _ = fmt.Fprintf(w, "data: %s\n\n", payload)
}

type ioWriter interface {
	Write([]byte) (int, error)
}
