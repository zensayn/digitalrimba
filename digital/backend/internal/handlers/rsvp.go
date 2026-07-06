package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"

	"github.com/go-chi/chi/v5"
)

var rsvpTokenRe = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// isValidRsvpToken rejects malformed tokens before they ever reach the
// store's `::uuid` cast, which would otherwise surface as a 500.
func isValidRsvpToken(token string) bool {
	return rsvpTokenRe.MatchString(token)
}

// RsvpGuest is the public-facing view a guest sees when opening their RSVP link.
type RsvpGuest struct {
	Name          string
	WeddingID     string
	EventDate     string
	VenueName     string
	VenueAddress  string
	Status        string
	AttendeeCount int
	Message       string
}

// Wish is one entry in the public guestbook feed.
type Wish struct {
	Name        string `json:"name"`
	Message     string `json:"message"`
	RespondedAt string `json:"responded_at"`
}

// RsvpEntry is one row in the dashboard RSVP tracker.
type RsvpEntry struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Group       string `json:"group"`
	Status      string `json:"status"`
	Attendees   int    `json:"attendees"`
	Message     string `json:"message"`
	RespondedAt string `json:"responded_at"`
}

type RsvpStore interface {
	GuestRsvpByToken(context.Context, string) (RsvpGuest, error)
	SubmitRsvp(ctx context.Context, token, status string, attendeeCount int, message string) error
	ListWishes(context.Context, string) ([]Wish, error)
	ListRsvps(context.Context, string) ([]RsvpEntry, error)
}

type RsvpWeddingResolver interface {
	RsvpWeddingIDForUser(context.Context, string) (string, error)
}

type RsvpHandler struct {
	store           RsvpStore
	weddingResolver RsvpWeddingResolver
}

func NewRsvpHandler(store RsvpStore) *RsvpHandler {
	handler := &RsvpHandler{store: store}
	if resolver, ok := store.(RsvpWeddingResolver); ok {
		handler.weddingResolver = resolver
	}
	return handler
}

// publicRsvpResponse is the payload returned to a guest on GET and after POST.
type publicRsvpResponse struct {
	Name          string `json:"name"`
	EventDate     string `json:"event_date"`
	VenueName     string `json:"venue_name"`
	VenueAddress  string `json:"venue_address"`
	Status        string `json:"status"`
	AttendeeCount int    `json:"attendee_count"`
	Message       string `json:"message"`
	Wishes        []Wish `json:"wishes"`
}

// GetGuest — public. GET /api/rsvp/guest/{token}
func (h *RsvpHandler) GetGuest(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(chi.URLParam(r, "token"))
	if !isValidRsvpToken(token) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	guest, err := h.store.GuestRsvpByToken(r.Context(), token)
	if err != nil {
		writeRsvpError(w, err)
		return
	}
	h.writeGuestPayload(w, r.Context(), guest)
}

// Submit — public. POST /api/rsvp/guest/{token}
func (h *RsvpHandler) Submit(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(chi.URLParam(r, "token"))
	if !isValidRsvpToken(token) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 4<<10) // 4KB — public, unauthenticated endpoint
	var req struct {
		Attending     bool   `json:"attending"`
		AttendeeCount int    `json:"attendee_count"`
		Message       string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.AttendeeCount < 0 || req.AttendeeCount > 20 {
		http.Error(w, "attendee_count must be between 0 and 20", http.StatusBadRequest)
		return
	}
	if len(req.Message) > 500 {
		http.Error(w, "message too long", http.StatusBadRequest)
		return
	}

	status := "declined"
	if req.Attending {
		status = "confirmed"
	} else {
		req.AttendeeCount = 0
	}

	if err := h.store.SubmitRsvp(r.Context(), token, status, req.AttendeeCount, strings.TrimSpace(req.Message)); err != nil {
		writeRsvpError(w, err)
		return
	}

	guest, err := h.store.GuestRsvpByToken(r.Context(), token)
	if err != nil {
		writeRsvpError(w, err)
		return
	}
	h.writeGuestPayload(w, r.Context(), guest)
}

func (h *RsvpHandler) writeGuestPayload(w http.ResponseWriter, ctx context.Context, guest RsvpGuest) {
	wishes, err := h.store.ListWishes(ctx, guest.WeddingID)
	if err != nil {
		writeRsvpError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, publicRsvpResponse{
		Name:          guest.Name,
		EventDate:     guest.EventDate,
		VenueName:     guest.VenueName,
		VenueAddress:  guest.VenueAddress,
		Status:        guest.Status,
		AttendeeCount: guest.AttendeeCount,
		Message:       guest.Message,
		Wishes:        wishes,
	})
}

// List — authed. GET /api/rsvp (dashboard tracker)
func (h *RsvpHandler) List(w http.ResponseWriter, r *http.Request) {
	weddingID, err := h.resolveWeddingID(r.Context())
	if err != nil {
		writeRsvpError(w, err)
		return
	}

	entries, err := h.store.ListRsvps(r.Context(), weddingID)
	if err != nil {
		writeRsvpError(w, err)
		return
	}
	if entries == nil {
		entries = []RsvpEntry{}
	}
	writeJSON(w, http.StatusOK, entries)
}

func (h *RsvpHandler) resolveWeddingID(ctx context.Context) (string, error) {
	if auth, ok := GuestAuthFromContext(ctx); ok {
		return auth.WeddingID, nil
	}
	userID, ok := UserIDFromContext(ctx)
	if !ok || h.weddingResolver == nil {
		return "", ErrForbidden
	}
	weddingID, err := h.weddingResolver.RsvpWeddingIDForUser(ctx, userID)
	if errors.Is(err, ErrGuestWeddingNotFound) {
		return "", ErrForbidden
	}
	return weddingID, err
}

func writeRsvpError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrGuestNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, ErrForbidden):
		http.Error(w, "forbidden", http.StatusForbidden)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
