package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var (
	ErrInvitationNotFound = errors.New("invitation not found")
	ErrForbidden          = errors.New("forbidden")
	ErrSlugTaken          = errors.New("invitation slug already exists")
)

type userIDContextKey struct{}

type Invitation struct {
	ID          string          `json:"id"`
	OwnerID     string          `json:"owner_id,omitempty"`
	CoupleNames string          `json:"couple_names"`
	Slug        string          `json:"slug"`
	Content     json.RawMessage `json:"content"`
	PublishedAt *time.Time      `json:"published_at,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type CreateInvitationParams struct {
	OwnerID     string
	CoupleNames string
	Slug        string
	Content     json.RawMessage
}

type UpdateInvitationParams struct {
	ID          string
	OwnerID     string
	Content     *json.RawMessage
	Published   *bool
	PublishedAt *time.Time
}

type InvitationStore interface {
	CreateInvitation(context.Context, CreateInvitationParams) (Invitation, error)
	UpdateInvitation(context.Context, UpdateInvitationParams) (Invitation, error)
	GetInvitationBySlug(context.Context, string) (Invitation, error)
	DeleteInvitation(context.Context, string, string) error
}

type InvitationDB interface {
	QueryRow(context.Context, string, ...any) pgx.Row
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}

type PostgresInvitationStore struct {
	db InvitationDB
}

func NewPostgresInvitationStore(db InvitationDB) *PostgresInvitationStore {
	return &PostgresInvitationStore{db: db}
}

type InvitationHandler struct {
	store        InvitationStore
	now          func() time.Time
	randomSuffix func() (string, error)
}

func NewInvitationHandler(store InvitationStore) *InvitationHandler {
	return &InvitationHandler{
		store:        store,
		now:          time.Now,
		randomSuffix: randomHexSuffix,
	}
}

func (h *InvitationHandler) RegisterRoutes(r chi.Router) {
	r.Post("/api/invitations", h.Create)
	r.Patch("/api/invitations/{id}", h.Update)
	r.Get("/api/invitations/{slug}", h.GetBySlug)
	r.Delete("/api/invitations/{id}", h.Delete)
}

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDContextKey{}, userID)
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDContextKey{}).(string)
	return userID, ok && userID != ""
}

func (h *InvitationHandler) Create(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		CoupleNames string          `json:"couple_names"`
		Content     json.RawMessage `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	req.CoupleNames = strings.TrimSpace(req.CoupleNames)
	if req.CoupleNames == "" {
		http.Error(w, "couple_names required", http.StatusBadRequest)
		return
	}
	if len(req.Content) == 0 {
		req.Content = json.RawMessage(`{}`)
	}

	params := CreateInvitationParams{
		OwnerID:     ownerID,
		CoupleNames: req.CoupleNames,
		Slug:        slugFromCoupleNames(req.CoupleNames),
		Content:     req.Content,
	}

	invitation, err := h.store.CreateInvitation(r.Context(), params)
	if errors.Is(err, ErrSlugTaken) {
		suffix, suffixErr := h.randomSuffix()
		if suffixErr != nil {
			http.Error(w, "cannot create slug", http.StatusInternalServerError)
			return
		}
		params.Slug = params.Slug + "-" + suffix
		invitation, err = h.store.CreateInvitation(r.Context(), params)
	}
	if err != nil {
		writeInvitationError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, invitation)
}

func (h *InvitationHandler) Update(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Content   *json.RawMessage `json:"content"`
		Published *bool            `json:"published"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	params := UpdateInvitationParams{
		ID:        chi.URLParam(r, "id"),
		OwnerID:   ownerID,
		Content:   req.Content,
		Published: req.Published,
	}
	if req.Published != nil && *req.Published {
		now := h.now().UTC()
		params.PublishedAt = &now
	}

	invitation, err := h.store.UpdateInvitation(r.Context(), params)
	if err != nil {
		writeInvitationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, invitation)
}

func (h *InvitationHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	invitation, err := h.store.GetInvitationBySlug(r.Context(), chi.URLParam(r, "slug"))
	if err != nil {
		writeInvitationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, invitation)
}

func (h *InvitationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.store.DeleteInvitation(r.Context(), chi.URLParam(r, "id"), ownerID); err != nil {
		writeInvitationError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *PostgresInvitationStore) CreateInvitation(ctx context.Context, params CreateInvitationParams) (Invitation, error) {
	invitation, err := scanInvitation(s.db.QueryRow(ctx, createInvitationSQL, params.OwnerID, params.CoupleNames, params.Slug, params.Content))
	if isUniqueViolation(err) {
		return Invitation{}, ErrSlugTaken
	}
	return invitation, err
}

func (s *PostgresInvitationStore) UpdateInvitation(ctx context.Context, params UpdateInvitationParams) (Invitation, error) {
	invitation, err := scanInvitation(s.db.QueryRow(ctx, updateInvitationSQL, params.ID, params.OwnerID, params.Content, params.Published, params.PublishedAt))
	if errors.Is(err, ErrInvitationNotFound) {
		return Invitation{}, ErrForbidden
	}
	return invitation, err
}

func (s *PostgresInvitationStore) GetInvitationBySlug(ctx context.Context, slug string) (Invitation, error) {
	return scanInvitation(s.db.QueryRow(ctx, getInvitationBySlugSQL, slug))
}

func (s *PostgresInvitationStore) DeleteInvitation(ctx context.Context, id string, ownerID string) error {
	tag, err := s.db.Exec(ctx, deleteInvitationSQL, id, ownerID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrForbidden
	}
	return nil
}

type rowScanner interface {
	Scan(...any) error
}

func scanInvitation(row rowScanner) (Invitation, error) {
	var invitation Invitation
	err := row.Scan(
		&invitation.ID,
		&invitation.OwnerID,
		&invitation.CoupleNames,
		&invitation.Slug,
		&invitation.Content,
		&invitation.PublishedAt,
		&invitation.CreatedAt,
		&invitation.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Invitation{}, ErrInvitationNotFound
	}
	return invitation, err
}

func slugFromCoupleNames(coupleNames string) string {
	slug := strings.ToLower(coupleNames)
	slug = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		return "invitation"
	}
	return slug
}

func randomHexSuffix() (string, error) {
	var b [2]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(b[:]), nil
}

func writeInvitationError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrInvitationNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, ErrForbidden):
		http.Error(w, "forbidden", http.StatusForbidden)
	case errors.Is(err, ErrSlugTaken):
		http.Error(w, "slug taken", http.StatusConflict)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

const createInvitationSQL = `
INSERT INTO invitations (
    owner_id,
    couple_names,
    slug,
    content,
    created_at,
    updated_at
) VALUES (
    $1,
    $2,
    $3,
    COALESCE($4::jsonb, '{}'::jsonb),
    now(),
    now()
)
RETURNING id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
`

const updateInvitationSQL = `
UPDATE invitations
SET
    content = COALESCE($3::jsonb, content),
    published_at = CASE
        WHEN $4::boolean IS TRUE THEN COALESCE(published_at, $5::timestamptz)
        WHEN $4::boolean IS FALSE THEN NULL
        ELSE published_at
    END,
    updated_at = now()
WHERE id = $1
  AND owner_id = $2
RETURNING id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
`

const getInvitationBySlugSQL = `
SELECT id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
FROM invitations
WHERE slug = $1
`

const deleteInvitationSQL = `
DELETE FROM invitations
WHERE id = $1
  AND owner_id = $2
`
