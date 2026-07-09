package handlers

import (
	"bytes"
	"context"
	"crypto/hmac"
	cryptorand "crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/phpdave11/gofpdf"
	qrcode "github.com/skip2/go-qrcode"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrCheckinEventNotFound = errors.New("checkin event not found")
	ErrCheckinGuestNotFound = errors.New("checkin guest not found")
	ErrCheckinUnauthorized  = errors.New("checkin unauthorized")
)

const eventCodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

func generateEventCode() string {
	b := make([]byte, 6)
	for i := range b {
		b[i] = eventCodeChars[rand.Intn(len(eventCodeChars))]
	}
	return string(b)
}

func generatePIN() (string, error) {
	n, err := cryptorand.Int(cryptorand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// CheckinWeddingResolver maps an authenticated user ID to their wedding ID.
type CheckinWeddingResolver interface {
	WeddingIDForUser(ctx context.Context, userID string) (string, error)
}

// PgCheckinWeddingResolver looks up the wedding for a given user ID.
type PgCheckinWeddingResolver struct {
	DB CheckinDB
}

func (r *PgCheckinWeddingResolver) WeddingIDForUser(ctx context.Context, userID string) (string, error) {
	var id string
	err := r.DB.QueryRow(ctx,
		`SELECT id FROM weddings WHERE owner_user_id = $1 LIMIT 1`,
		userID,
	).Scan(&id)
	return id, err
}

type CheckinEvent struct {
	EventCode   string
	WeddingID   string
	PINHash     string
	WeddingDate time.Time
}

type CheckinGuest struct {
	ID               string     `json:"id"`
	WeddingID        string     `json:"wedding_id"`
	Name             string     `json:"name"`
	Tag              string     `json:"tag"`
	QRToken          string     `json:"qr_token"`
	ArrivedAt        *time.Time `json:"arrived_at,omitempty"`
	SouvenirGiven    bool       `json:"souvenir_given"`
	PartySize        int        `json:"party_size"`
	ActualPax        *int       `json:"actual_pax,omitempty"`
	ProxyName        string     `json:"proxy_name,omitempty"`
	GiftTagCode      string     `json:"gift_tag_code,omitempty"`
	CheckedInByLabel string     `json:"checked_in_by_label,omitempty"`
}

// ScanDetails carries the optional kiosk fields recorded at check-in time.
type ScanDetails struct {
	SouvenirGiven    bool
	ActualPax        *int
	ProxyName        string
	GiftTagCode      string
	CheckedInByLabel string
}

type CheckinCounts struct {
	Arrived    int `json:"arrived"`
	Total      int `json:"total"`
	ArrivedPax int `json:"arrived_pax"`
	TotalPax   int `json:"total_pax"`
}

type CheckinStore interface {
	GetCheckinEventByCode(context.Context, string) (CheckinEvent, error)
	MarkGuestArrived(ctx context.Context, weddingID, qrToken string, details ScanDetails, now time.Time) (CheckinGuest, bool, CheckinCounts, error)
	GetCheckinCounts(context.Context, string) (CheckinCounts, error)
	SearchGuestsByName(ctx context.Context, weddingID, query string) ([]CheckinGuest, error)
	LookupGuestByQRToken(ctx context.Context, weddingID, qrToken string) (CheckinGuest, error)
	GetFullRoster(ctx context.Context, weddingID string) ([]CheckinGuest, error)
	CreateWalkInGuest(ctx context.Context, weddingID, name string, partySize int, details ScanDetails, now time.Time) (CheckinGuest, error)
	MaxGiftTag(ctx context.Context, weddingID string) (int, error)
	UpdateGuestSouvenir(ctx context.Context, guestID, weddingID string, collected bool) (CheckinGuest, error)
	GetCheckinEventByWeddingID(ctx context.Context, weddingID string) (CheckinEvent, error)
	CreateCheckinEvent(ctx context.Context, weddingID, eventCode, pinHash string) (CheckinEvent, error)
	UpdateEventPINHash(ctx context.Context, weddingID, pinHash string) error
	GetGuestsForQR(ctx context.Context, weddingID string) ([]GuestQRData, error)
	GetGuestsWithEmail(ctx context.Context, weddingID string) ([]GuestEmailData, error)
	GetCheckinStats(ctx context.Context, weddingID string) (CheckinStats, error)
	GetOperatorStats(ctx context.Context, weddingID string) ([]OperatorStat, error)
}

// EmailSender sends a QR code email to one guest.
type EmailSender interface {
	SendGuestQR(ctx context.Context, toEmail, guestName string, qrPNG []byte) error
}

type noopEmailSender struct{}

func (noopEmailSender) SendGuestQR(_ context.Context, _, _ string, _ []byte) error { return nil }

type CheckinHandler struct {
	store       CheckinStore
	sessionKey  []byte
	now         func() time.Time
	resolver    CheckinWeddingResolver
	emailSender EmailSender

	mu        sync.Mutex
	failures  map[string]int
	lockedTil map[string]time.Time
	streams   map[string]map[chan CheckinCounts]struct{}
}

func NewCheckinHandler(store CheckinStore, sessionKey []byte, resolver CheckinWeddingResolver) *CheckinHandler {
	return &CheckinHandler{
		store:       store,
		sessionKey:  sessionKey,
		now:         time.Now,
		resolver:    resolver,
		emailSender: noopEmailSender{},
		failures:    make(map[string]int),
		lockedTil:   make(map[string]time.Time),
		streams:     make(map[string]map[chan CheckinCounts]struct{}),
	}
}

func (h *CheckinHandler) SetEmailSender(s EmailSender) { h.emailSender = s }

// CreateEvent handles POST /api/checkin/events.
// Resolves the caller's wedding, creates or updates the event, returns plain PIN once.
func (h *CheckinHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthenticated", http.StatusUnauthorized)
		return
	}
	weddingID, err := h.resolver.WeddingIDForUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "no wedding found", http.StatusNotFound)
		} else {
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	pin, err := generatePIN()
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	pinHash, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	existing, err := h.store.GetCheckinEventByWeddingID(r.Context(), weddingID)
	var eventCode string
	if err == nil {
		// Already exists — rotate PIN only
		if err := h.store.UpdateEventPINHash(r.Context(), weddingID, string(pinHash)); err != nil {
			http.Error(w, "update error", http.StatusInternalServerError)
			return
		}
		eventCode = existing.EventCode
	} else if errors.Is(err, pgx.ErrNoRows) {
		// First-time setup
		created, err := h.store.CreateCheckinEvent(r.Context(), weddingID, generateEventCode(), string(pinHash))
		if err != nil {
			http.Error(w, "create error", http.StatusInternalServerError)
			return
		}
		eventCode = created.EventCode
	} else {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"eventCode": eventCode,
		"pin":       pin,
	})
}

// GetEvent handles GET /api/checkin/events.
// Returns event config and live stats. Does NOT return the PIN.
func (h *CheckinHandler) GetEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthenticated", http.StatusUnauthorized)
		return
	}
	weddingID, err := h.resolver.WeddingIDForUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "no wedding found", http.StatusNotFound)
		} else {
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	event, err := h.store.GetCheckinEventByWeddingID(r.Context(), weddingID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "not configured", http.StatusNotFound)
			return
		}
		http.Error(w, "store error", http.StatusInternalServerError)
		return
	}

	stats, err := h.store.GetCheckinStats(r.Context(), weddingID)
	if err != nil {
		http.Error(w, "stats error", http.StatusInternalServerError)
		return
	}

	operators, err := h.store.GetOperatorStats(r.Context(), weddingID)
	if err != nil {
		http.Error(w, "stats error", http.StatusInternalServerError)
		return
	}
	if operators == nil {
		operators = []OperatorStat{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"eventCode":     event.EventCode,
		"operatorUrl":   "/checkin/" + event.EventCode,
		"totalGuests":   stats.Total,
		"arrivedGuests": stats.Arrived,
		"souvenirCount": stats.Souvenirs,
		"totalPax":      stats.TotalPax,
		"arrivedPax":    stats.ArrivedPax,
		"walkIns":       stats.WalkIns,
		"operators":     operators,
	})
}

// GuestList handles GET /api/checkin/events/guests.
// Dashboard-authenticated full roster so the couple can see who has arrived.
func (h *CheckinHandler) GuestList(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthenticated", http.StatusUnauthorized)
		return
	}
	weddingID, err := h.resolver.WeddingIDForUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "no wedding found", http.StatusNotFound)
		} else {
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}
	guests, err := h.store.GetFullRoster(r.Context(), weddingID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	if guests == nil {
		guests = []CheckinGuest{}
	}
	writeJSON(w, http.StatusOK, guests)
}

// GetGuestQRPdf handles GET /api/checkin/events/qr/pdf.
// Streams a PDF with one page per guest: name, group label, and QR code.
// The QR code encodes the guest's raw qr_token UUID.
func (h *CheckinHandler) GetGuestQRPdf(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthenticated", http.StatusUnauthorized)
		return
	}
	weddingID, err := h.resolver.WeddingIDForUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "no wedding found", http.StatusNotFound)
		} else {
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	guests, err := h.store.GetGuestsForQR(r.Context(), weddingID)
	if err != nil {
		http.Error(w, "store error", http.StatusInternalServerError)
		return
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)

	for _, guest := range guests {
		pdf.AddPage()

		pdf.SetFont("Helvetica", "B", 20)
		pdf.CellFormat(0, 12, guest.Name, "", 1, "C", false, 0, "")

		if guest.GuestGroup != "" {
			pdf.SetFont("Helvetica", "", 12)
			pdf.SetTextColor(100, 100, 100)
			pdf.CellFormat(0, 8, guest.GuestGroup, "", 1, "C", false, 0, "")
			pdf.SetTextColor(0, 0, 0)
		}
		pdf.Ln(8)

		pngBytes, err := qrcode.Encode(guest.QRToken, qrcode.High, 256)
		if err != nil {
			http.Error(w, "qr error", http.StatusInternalServerError)
			return
		}
		imgOpts := gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}
		pdf.RegisterImageOptionsReader(guest.QRToken, imgOpts, bytes.NewReader(pngBytes))
		// A4 width=210mm, margins 20mm each → 170mm content. 80mm QR centred: x=65
		pdf.ImageOptions(guest.QRToken, 65, pdf.GetY(), 80, 80, false, imgOpts, 0, "")
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `attachment; filename="guest-qr-codes.pdf"`)
	_ = pdf.Output(w)
}

// EmailGuestQRCodes handles POST /api/checkin/events/qr/email.
// Sends each guest (with email) their personal QR code PNG.
func (h *CheckinHandler) EmailGuestQRCodes(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthenticated", http.StatusUnauthorized)
		return
	}
	weddingID, err := h.resolver.WeddingIDForUser(r.Context(), userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "no wedding found", http.StatusNotFound)
		} else {
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	guests, err := h.store.GetGuestsWithEmail(r.Context(), weddingID)
	if err != nil {
		http.Error(w, "store error", http.StatusInternalServerError)
		return
	}

	queued := 0
	for _, g := range guests {
		png, err := qrcode.Encode(g.QRToken, qrcode.High, 256)
		if err != nil {
			continue
		}
		if err := h.emailSender.SendGuestQR(r.Context(), g.Email, g.Name, png); err != nil {
			continue
		}
		queued++
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]int{"queued": queued})
}

func (h *CheckinHandler) RegisterRoutes(r chi.Router) {
	r.Post("/api/checkin/auth", h.Auth)
	r.Post("/api/checkin/scan", h.Scan)
	r.Get("/api/checkin/stream", h.Stream)
	r.Get("/api/checkin/guests", h.Search)
	r.Get("/api/checkin/roster", h.Roster)
	r.Post("/api/checkin/walkin", h.WalkIn)
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

	// Seed for sequential envelope tag codes; the client increments locally.
	// A store error must not silently restart numbering at 1 — envelope tags
	// identify physical gifts, so fail the login instead.
	// ponytail: seed+client-increment can still collide across two kiosks
	// logged in simultaneously; move to server-side reservation if that happens.
	maxTag, err := h.store.MaxGiftTag(r.Context(), event.WeddingID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, struct {
		Token       string    `json:"token"`
		ExpiresAt   time.Time `json:"expires_at"`
		NextGiftTag int       `json:"next_gift_tag"`
	}{
		Token:       token,
		ExpiresAt:   expiresAt,
		NextGiftTag: maxTag + 1,
	})
}

func (h *CheckinHandler) Scan(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		QRToken          string `json:"qr_token"`
		SouvenirGiven    bool   `json:"souvenir_given"`
		ActualPax        *int   `json:"actual_pax"`
		ProxyName        string `json:"proxy_name"`
		GiftTagCode      string `json:"gift_tag_code"`
		CheckedInByLabel string `json:"checked_in_by_label"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.ActualPax != nil && (*req.ActualPax < 1 || *req.ActualPax > 99) {
		http.Error(w, "actual_pax must be between 1 and 99", http.StatusBadRequest)
		return
	}
	proxyName := strings.TrimSpace(req.ProxyName)
	giftTagCode := strings.TrimSpace(req.GiftTagCode)
	checkedInByLabel := strings.TrimSpace(req.CheckedInByLabel)
	if len(proxyName) > 200 || len(giftTagCode) > 100 || len(checkedInByLabel) > 200 {
		http.Error(w, "field too long", http.StatusBadRequest)
		return
	}

	details := ScanDetails{
		SouvenirGiven:    req.SouvenirGiven,
		ActualPax:        req.ActualPax,
		ProxyName:        proxyName,
		GiftTagCode:      giftTagCode,
		CheckedInByLabel: checkedInByLabel,
	}
	guest, already, counts, err := h.store.MarkGuestArrived(r.Context(), claims.WeddingID, req.QRToken, details, h.now().UTC())
	if err != nil {
		writeCheckinError(w, err)
		return
	}
	// Belt and braces — the store already scopes the write by wedding_id.
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

	// QR token lookup: preview guest without marking arrival (for pre-check-in flow).
	if qr := strings.TrimSpace(r.URL.Query().Get("qr")); qr != "" {
		g, err := h.store.LookupGuestByQRToken(r.Context(), claims.WeddingID, qr)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				writeJSON(w, http.StatusOK, []CheckinGuest{})
				return
			}
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, []CheckinGuest{g})
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

// Roster handles GET /api/checkin/roster — the full guest list for the
// operator's offline cache.
func (h *CheckinHandler) Roster(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	guests, err := h.store.GetFullRoster(r.Context(), claims.WeddingID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	if guests == nil {
		guests = []CheckinGuest{}
	}
	writeJSON(w, http.StatusOK, guests)
}

// WalkIn handles POST /api/checkin/walkin — creates a guest and checks
// them in immediately (door walk-ins with no invitation).
func (h *CheckinHandler) WalkIn(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.authorize(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name             string `json:"name"`
		PartySize        int    `json:"party_size"`
		SouvenirGiven    bool   `json:"souvenir_given"`
		GiftTagCode      string `json:"gift_tag_code"`
		CheckedInByLabel string `json:"checked_in_by_label"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		http.Error(w, "name required", http.StatusBadRequest)
		return
	}
	if len(req.Name) > 200 {
		http.Error(w, "name too long", http.StatusBadRequest)
		return
	}
	if req.PartySize < 1 {
		req.PartySize = 1
	}
	if req.PartySize > 99 {
		http.Error(w, "party_size must be between 1 and 99", http.StatusBadRequest)
		return
	}

	// Same field limits as Scan.
	giftTagCode := strings.TrimSpace(req.GiftTagCode)
	checkedInByLabel := strings.TrimSpace(req.CheckedInByLabel)
	if len(giftTagCode) > 100 || len(checkedInByLabel) > 200 {
		http.Error(w, "field too long", http.StatusBadRequest)
		return
	}

	details := ScanDetails{
		SouvenirGiven:    req.SouvenirGiven,
		GiftTagCode:      giftTagCode,
		CheckedInByLabel: checkedInByLabel,
	}
	guest, err := h.store.CreateWalkInGuest(r.Context(), claims.WeddingID, req.Name, req.PartySize, details, h.now().UTC())
	if err != nil {
		writeCheckinError(w, err)
		return
	}

	if counts, err := h.store.GetCheckinCounts(r.Context(), claims.WeddingID); err == nil {
		h.broadcast(claims.WeddingID, counts)
	}
	writeJSON(w, http.StatusCreated, struct {
		Guest CheckinGuest `json:"guest"`
	}{Guest: guest})
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
