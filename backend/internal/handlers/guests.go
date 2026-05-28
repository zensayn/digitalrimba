package handlers

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/csv"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

const maxGuestImportRows = 500

type guestAuthContextKey struct{}

var (
	ErrGuestNotFound        = errors.New("guest not found")
	ErrGuestWeddingNotFound = errors.New("guest wedding not found")
)

type GuestAuth struct {
	Role      string
	WeddingID string
}

type Guest struct {
	ID          string `json:"id"`
	WeddingID   string `json:"wedding_id"`
	Name        string `json:"name"`
	Phone       string `json:"phone"`
	Tag         string `json:"tag"`
	QRToken     string `json:"qr_token"`
	Email       string `json:"email"`
	Notes       string `json:"notes"`
	PartySize   int    `json:"party_size"`
	Method      string `json:"method"`
	RespondedAt string `json:"responded_at"`
	RsvpStatus  string `json:"rsvp_status"`
}

type GuestInput struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Tag   string `json:"tag"`
}

type InsertGuestParams struct {
	WeddingID string
	Name      string
	Phone     string
	Tag       string
	QRToken   string
}

type GuestStore interface {
	ListGuests(context.Context, string) ([]Guest, error)
	UpdateGuestTag(context.Context, string, string, string) (Guest, error)
	DeleteGuests(context.Context, string, []string) error
	InsertGuests(context.Context, []InsertGuestParams) ([]Guest, error)
}

type GuestWeddingResolver interface {
	GuestWeddingIDForUser(context.Context, string) (string, error)
}

type DuplicateGuestPhoneError struct {
	Phone string
}

func (e DuplicateGuestPhoneError) Error() string {
	return "duplicate guest phone: " + e.Phone
}

type GuestHandler struct {
	store           GuestStore
	weddingResolver GuestWeddingResolver
	newToken        func() (string, error)
}

func NewGuestHandler(store GuestStore) *GuestHandler {
	handler := &GuestHandler{
		store:    store,
		newToken: newUUID,
	}
	if resolver, ok := store.(GuestWeddingResolver); ok {
		handler.weddingResolver = resolver
	}
	return handler
}

func (h *GuestHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/guests", h.List)
	r.Delete("/api/guests", h.Delete)
	r.Patch("/api/guests/{id}", h.UpdateTag)
	r.Post("/api/guests/bulk", h.Bulk)
	r.Post("/api/guests/import", h.ImportCSV)
}

func WithGuestAuth(ctx context.Context, auth GuestAuth) context.Context {
	return context.WithValue(ctx, guestAuthContextKey{}, auth)
}

func GuestAuthFromContext(ctx context.Context) (GuestAuth, bool) {
	auth, ok := ctx.Value(guestAuthContextKey{}).(GuestAuth)
	return auth, ok && auth.Role == "couple" && auth.WeddingID != ""
}

func (h *GuestHandler) List(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireGuestWeddingID(w, r)
	if !ok {
		return
	}

	guests, err := h.store.ListGuests(r.Context(), weddingID)
	if err != nil {
		writeGuestError(w, err)
		return
	}
	if guests == nil {
		guests = []Guest{}
	}

	writeJSON(w, http.StatusOK, guests)
}

func (h *GuestHandler) UpdateTag(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireGuestWeddingID(w, r)
	if !ok {
		return
	}

	var req struct {
		Tag string `json:"tag"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	tag := strings.TrimSpace(req.Tag)
	if tag == "" {
		http.Error(w, "tag required", http.StatusBadRequest)
		return
	}

	guest, err := h.store.UpdateGuestTag(r.Context(), chi.URLParam(r, "id"), weddingID, tag)
	if err != nil {
		writeGuestError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, guest)
}

func (h *GuestHandler) Delete(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireGuestWeddingID(w, r)
	if !ok {
		return
	}

	var req struct {
		IDs []string `json:"ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	ids := uniqueGuestIDs(req.IDs)
	if len(ids) == 0 {
		http.Error(w, "ids required", http.StatusBadRequest)
		return
	}

	if err := h.store.DeleteGuests(r.Context(), weddingID, ids); err != nil {
		writeGuestError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *GuestHandler) Bulk(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireGuestWeddingID(w, r)
	if !ok {
		return
	}

	var rows []GuestInput
	if err := json.NewDecoder(r.Body).Decode(&rows); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	h.insertRows(w, r, weddingID, rows)
}

func (h *GuestHandler) ImportCSV(w http.ResponseWriter, r *http.Request) {
	weddingID, ok := h.requireGuestWeddingID(w, r)
	if !ok {
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "missing csv file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	rows, err := parseGuestCSV(file)
	if err != nil {
		http.Error(w, "invalid csv", http.StatusBadRequest)
		return
	}

	h.insertRows(w, r, weddingID, rows)
}

func (h *GuestHandler) requireGuestWeddingID(w http.ResponseWriter, r *http.Request) (string, bool) {
	weddingID, err := h.resolveGuestWeddingID(r.Context())
	if err != nil {
		writeGuestError(w, err)
		return "", false
	}
	return weddingID, true
}

func (h *GuestHandler) resolveGuestWeddingID(ctx context.Context) (string, error) {
	if auth, ok := GuestAuthFromContext(ctx); ok {
		return auth.WeddingID, nil
	}

	userID, ok := UserIDFromContext(ctx)
	if !ok || h.weddingResolver == nil {
		return "", ErrForbidden
	}

	weddingID, err := h.weddingResolver.GuestWeddingIDForUser(ctx, userID)
	if errors.Is(err, ErrGuestWeddingNotFound) {
		return "", ErrForbidden
	}
	return weddingID, err
}

func (h *GuestHandler) insertRows(w http.ResponseWriter, r *http.Request, weddingID string, rows []GuestInput) {
	if len(rows) > maxGuestImportRows {
		http.Error(w, "too many rows", http.StatusBadRequest)
		return
	}

	params, err := h.prepareGuestRows(weddingID, rows)
	if err != nil {
		var duplicate DuplicateGuestPhoneError
		if errors.As(err, &duplicate) {
			writeDuplicatePhone(w, duplicate.Phone)
			return
		}
		http.Error(w, "cannot prepare guests", http.StatusInternalServerError)
		return
	}

	guests, err := h.store.InsertGuests(r.Context(), params)
	if err != nil {
		var duplicate DuplicateGuestPhoneError
		if errors.As(err, &duplicate) {
			writeDuplicatePhone(w, duplicate.Phone)
			return
		}
		http.Error(w, "cannot insert guests", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, struct {
		Count  int     `json:"count"`
		Guests []Guest `json:"guests"`
	}{
		Count:  len(guests),
		Guests: guests,
	})
}

func (h *GuestHandler) prepareGuestRows(weddingID string, rows []GuestInput) ([]InsertGuestParams, error) {
	seenPhones := make(map[string]struct{}, len(rows))
	params := make([]InsertGuestParams, 0, len(rows))

	for _, row := range rows {
		name := strings.TrimSpace(row.Name)
		phone := strings.TrimSpace(row.Phone)
		tag := strings.TrimSpace(row.Tag)

		if phone != "" {
			if _, exists := seenPhones[phone]; exists {
				return nil, DuplicateGuestPhoneError{Phone: phone}
			}
			seenPhones[phone] = struct{}{}
		}

		token, err := h.newToken()
		if err != nil {
			return nil, err
		}

		params = append(params, InsertGuestParams{
			WeddingID: weddingID,
			Name:      name,
			Phone:     phone,
			Tag:       tag,
			QRToken:   token,
		})
	}

	return params, nil
}

func parseGuestCSV(src io.Reader) ([]GuestInput, error) {
	body, err := io.ReadAll(src)
	if err != nil {
		return nil, err
	}
	body = bytes.TrimPrefix(body, []byte{0xEF, 0xBB, 0xBF})

	reader := csv.NewReader(bytes.NewReader(body))
	reader.FieldsPerRecord = -1

	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, nil
	}

	columns := make(map[string]int, len(records[0]))
	for index, header := range records[0] {
		columns[strings.ToLower(strings.TrimSpace(strings.TrimPrefix(header, "\uFEFF")))] = index
	}

	rows := make([]GuestInput, 0, len(records)-1)
	for _, record := range records[1:] {
		rows = append(rows, GuestInput{
			Name:  csvField(record, columns, "name"),
			Phone: csvField(record, columns, "phone"),
			Tag:   csvField(record, columns, "tag"),
		})
	}

	return rows, nil
}

func csvField(record []string, columns map[string]int, name string) string {
	index, ok := columns[name]
	if !ok || index >= len(record) {
		return ""
	}
	return strings.TrimSpace(record[index])
}

func uniqueGuestIDs(input []string) []string {
	seen := make(map[string]struct{}, len(input))
	ids := make([]string, 0, len(input))
	for _, rawID := range input {
		id := strings.TrimSpace(rawID)
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
	}
	return ids
}

func newUUID() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}

	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	return fmt.Sprintf("%s-%s-%s-%s-%s",
		hex.EncodeToString(b[0:4]),
		hex.EncodeToString(b[4:6]),
		hex.EncodeToString(b[6:8]),
		hex.EncodeToString(b[8:10]),
		hex.EncodeToString(b[10:16]),
	), nil
}

func writeDuplicatePhone(w http.ResponseWriter, phone string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusConflict)
	_ = json.NewEncoder(w).Encode(struct {
		Error          string `json:"error"`
		DuplicatePhone string `json:"duplicate_phone"`
	}{
		Error:          "duplicate phone",
		DuplicatePhone: phone,
	})
}

func writeGuestError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrGuestNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, ErrForbidden):
		http.Error(w, "forbidden", http.StatusForbidden)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}
