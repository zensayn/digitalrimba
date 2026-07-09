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
	ErrSlugLocked         = errors.New("slug locked after publish")
)

// validSlugRe matches subdomain-safe slugs: lowercase alphanumerics and
// inner hyphens, 1-63 chars. Drafts use the generated "draft-" prefix,
// which users cannot claim.
var validSlugRe = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`)

// reservedSlugs are subdomains and API path segments a user slug must never
// shadow (theme demo domains, infra hosts, and the static segments under
// /api/invitations/).
var reservedSlugs = map[string]bool{
	"www": true, "api": true, "app": true, "admin": true, "mail": true,
	"staging": true, "assets-themes": true, "assets-invitations": true,
	"warm-narrative": true, "sacred-luxe": true, "sinema-kisah": true,
	"by-id": true, "slug-check": true, "rimba": true, "dashboard": true,
	"invitation": true, "invitations": true,
}

// isJSONObject reports whether raw is a JSON object — content rides through
// a top-level `jsonb ||` merge, so arrays/scalars/null must never be stored.
func isJSONObject(raw json.RawMessage) bool {
	trimmed := strings.TrimSpace(string(raw))
	return strings.HasPrefix(trimmed, "{") && json.Valid(raw)
}

// slugProblem returns "" for a claimable slug, else "invalid" or "reserved".
func slugProblem(slug string) string {
	if !validSlugRe.MatchString(slug) || strings.HasPrefix(slug, "draft-") {
		return "invalid"
	}
	if reservedSlugs[slug] {
		return "reserved"
	}
	return ""
}

// randomDraftSlug generates an unguessable placeholder slug for unpublished
// invitations. 16 random bytes (32 hex chars) — draft slugs double as secret
// bearer preview links, so they need real entropy.
func randomDraftSlug() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return "draft-" + hex.EncodeToString(b[:]), nil
}

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
	Slug        *string
	CoupleNames *string
}

type InvitationStore interface {
	CreateInvitation(context.Context, CreateInvitationParams) (Invitation, error)
	UpdateInvitation(context.Context, UpdateInvitationParams) (Invitation, error)
	GetInvitationBySlug(context.Context, string) (Invitation, error)
	// GetInvitation fetches by id with no owner filter; the handler checks
	// ownership so it can return 403 (wrong owner) vs 404 (missing) distinctly.
	GetInvitation(context.Context, string) (Invitation, error)
	ListInvitations(context.Context, string) ([]Invitation, error)
	SlugExists(context.Context, string) (bool, error)
	DeleteInvitation(context.Context, string, string) error
}

type InvitationDB interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
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
	newDraftSlug func() (string, error)
}

func NewInvitationHandler(store InvitationStore) *InvitationHandler {
	return &InvitationHandler{
		store:        store,
		now:          time.Now,
		newDraftSlug: randomDraftSlug,
	}
}

func (h *InvitationHandler) RegisterRoutes(r chi.Router) {
	r.Post("/api/invitations", h.Create)
	r.Get("/api/invitations", h.List)
	// Static segment: chi matches this before the {slug} wildcard below, and
	// "slug-check" is in reservedSlugs so no user can ever claim it.
	r.Get("/api/invitations/slug-check", h.SlugCheck)
	r.Patch("/api/invitations/{id}", h.Update)
	r.Get("/api/invitations/{slug}", h.GetBySlug)
	// GET {id} can't live at /api/invitations/{id} — that shape is taken by the
	// public GetBySlug route above.
	r.Get("/api/invitations/by-id/{id}", h.Get)
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
	if !isJSONObject(req.Content) {
		http.Error(w, "content must be a JSON object", http.StatusBadRequest)
		return
	}

	// Drafts get an unguessable placeholder slug; the user picks the real
	// domain name at publish time via PATCH.
	slug, err := h.newDraftSlug()
	if err != nil {
		http.Error(w, "cannot create slug", http.StatusInternalServerError)
		return
	}

	params := CreateInvitationParams{
		OwnerID:     ownerID,
		CoupleNames: req.CoupleNames,
		Slug:        slug,
		Content:     req.Content,
	}

	invitation, err := h.store.CreateInvitation(r.Context(), params)
	if errors.Is(err, ErrSlugTaken) {
		slug, slugErr := h.newDraftSlug()
		if slugErr != nil {
			http.Error(w, "cannot create slug", http.StatusInternalServerError)
			return
		}
		params.Slug = slug
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
		Content     *json.RawMessage `json:"content"`
		Published   *bool            `json:"published"`
		Slug        *string          `json:"slug"`
		CoupleNames *string          `json:"couple_names"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.CoupleNames != nil {
		*req.CoupleNames = strings.TrimSpace(*req.CoupleNames)
		if *req.CoupleNames == "" {
			http.Error(w, "couple_names required", http.StatusBadRequest)
			return
		}
	}

	if req.Content != nil && !isJSONObject(*req.Content) {
		http.Error(w, "content must be a JSON object", http.StatusBadRequest)
		return
	}

	// Publishing requires a real domain name: either this request picks one,
	// or the invitation must already have a non-draft slug. Otherwise
	// PATCH {"published":true} would put a draft-… placeholder live.
	if req.Published != nil && *req.Published && req.Slug == nil {
		existing, err := h.store.GetInvitation(r.Context(), chi.URLParam(r, "id"))
		if err != nil {
			writeInvitationError(w, err)
			return
		}
		if existing.OwnerID != ownerID {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		if strings.HasPrefix(existing.Slug, "draft-") {
			http.Error(w, "slug required to publish", http.StatusBadRequest)
			return
		}
	}

	if req.Slug != nil {
		*req.Slug = strings.ToLower(strings.TrimSpace(*req.Slug))
		if problem := slugProblem(*req.Slug); problem != "" {
			http.Error(w, "slug "+problem, http.StatusBadRequest)
			return
		}
		// Friendly 409 for the common case. The UPDATE itself re-checks the
		// lock atomically, so a concurrent publish can't slip a rename through.
		existing, err := h.store.GetInvitation(r.Context(), chi.URLParam(r, "id"))
		if err != nil {
			writeInvitationError(w, err)
			return
		}
		if existing.OwnerID != ownerID {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		if existing.PublishedAt != nil && existing.Slug != *req.Slug {
			writeInvitationError(w, ErrSlugLocked)
			return
		}
	}

	params := UpdateInvitationParams{
		ID:          chi.URLParam(r, "id"),
		OwnerID:     ownerID,
		Content:     req.Content,
		Published:   req.Published,
		Slug:        req.Slug,
		CoupleNames: req.CoupleNames,
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

func (h *InvitationHandler) List(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	invitations, err := h.store.ListInvitations(r.Context(), ownerID)
	if err != nil {
		writeInvitationError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, invitations)
}

func (h *InvitationHandler) Get(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	invitation, err := h.store.GetInvitation(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeInvitationError(w, err)
		return
	}
	if invitation.OwnerID != ownerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	writeJSON(w, http.StatusOK, invitation)
}

func (h *InvitationHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	invitation, err := h.store.GetInvitationBySlug(r.Context(), chi.URLParam(r, "slug"))
	if err != nil {
		// no-store so a just-published slug isn't stuck behind a cached 404
		// at the edge.
		w.Header().Set("Cache-Control", "no-store")
		writeInvitationError(w, err)
		return
	}

	if invitation.PublishedAt == nil {
		// Unpublished draft served via its unguessable draft-… slug (a secret
		// preview link) — still being edited, so never cache it.
		w.Header().Set("Cache-Control", "no-store")
	} else {
		// Published invitations are effectively static; let Cloudflare's edge
		// cache absorb the router + theme fetches.
		w.Header().Set("Cache-Control", "public, max-age=60, s-maxage=60")
	}
	writeJSON(w, http.StatusOK, invitation)
}

func (h *InvitationHandler) SlugCheck(w http.ResponseWriter, r *http.Request) {
	if _, ok := UserIDFromContext(r.Context()); !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	slug := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("slug")))
	resp := struct {
		Slug      string `json:"slug"`
		Available bool   `json:"available"`
		Reason    string `json:"reason"`
	}{Slug: slug}

	if resp.Reason = slugProblem(slug); resp.Reason == "" {
		exists, err := h.store.SlugExists(r.Context(), slug)
		if err != nil {
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		if exists {
			resp.Reason = "taken"
		} else {
			resp.Available = true
		}
	}

	writeJSON(w, http.StatusOK, resp)
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
	invitation, err := scanInvitation(s.db.QueryRow(ctx, updateInvitationSQL, params.ID, params.OwnerID, params.Content, params.Published, params.PublishedAt, params.Slug, params.CoupleNames))
	if errors.Is(err, ErrInvitationNotFound) {
		return Invitation{}, ErrForbidden
	}
	if isUniqueViolation(err) {
		return Invitation{}, ErrSlugTaken
	}
	return invitation, err
}

func (s *PostgresInvitationStore) GetInvitationBySlug(ctx context.Context, slug string) (Invitation, error) {
	return scanInvitation(s.db.QueryRow(ctx, getInvitationBySlugSQL, slug))
}

func (s *PostgresInvitationStore) GetInvitation(ctx context.Context, id string) (Invitation, error) {
	return scanInvitation(s.db.QueryRow(ctx, getInvitationByIDSQL, id))
}

func (s *PostgresInvitationStore) SlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := s.db.QueryRow(ctx, slugExistsSQL, slug).Scan(&exists)
	return exists, err
}

func (s *PostgresInvitationStore) ListInvitations(ctx context.Context, ownerID string) ([]Invitation, error) {
	rows, err := s.db.Query(ctx, listInvitationsSQL, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	invitations := []Invitation{}
	for rows.Next() {
		invitation, err := scanInvitation(rows)
		if err != nil {
			return nil, err
		}
		invitations = append(invitations, invitation)
	}
	return invitations, rows.Err()
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
	case errors.Is(err, ErrSlugLocked):
		http.Error(w, "slug locked", http.StatusConflict)
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

// content holds the rich InvitationConfig. The || below is a shallow,
// top-level jsonb merge: an incoming top-level key replaces that key's whole
// value, so senders MUST always send complete top-level values (a PATCH of
// {"events":{"akad":{...}}} alone would silently wipe events.resepsi).
// Accepted technical debt — the escape hatch, if partial nested updates are
// ever needed, is a recursive merge in Go before this UPDATE.
const updateInvitationSQL = `
UPDATE invitations
SET
    content = CASE WHEN $3::jsonb IS NOT NULL
        THEN COALESCE(content, '{}'::jsonb) || $3::jsonb
        ELSE content
    END,
    published_at = CASE
        WHEN $4::boolean IS TRUE THEN COALESCE(published_at, $5::timestamptz)
        WHEN $4::boolean IS FALSE THEN NULL
        ELSE published_at
    END,
    -- Slug is locked once published: only apply $6 while still unpublished
    -- (old row values) or when it isn't actually a rename. Enforced here,
    -- atomically, because the handler's pre-check is racy on its own.
    slug = CASE
        WHEN $6::text IS NOT NULL AND (published_at IS NULL OR slug = $6::text) THEN $6::text
        ELSE slug
    END,
    couple_names = COALESCE($7, couple_names),
    updated_at = now()
WHERE id = $1
  AND owner_id = $2
RETURNING id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
`

// Unpublished invitations are reachable only through their unguessable
// draft-… slug (secret preview link); a named slug that's been unpublished
// goes dark.
const getInvitationBySlugSQL = `
SELECT id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
FROM invitations
WHERE slug = $1
  AND (published_at IS NOT NULL OR slug LIKE 'draft-%')
`

const slugExistsSQL = `
SELECT EXISTS (SELECT 1 FROM invitations WHERE slug = $1)
`

const getInvitationByIDSQL = `
SELECT id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
FROM invitations
WHERE id = $1
`

const listInvitationsSQL = `
SELECT id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
FROM invitations
WHERE owner_id = $1
ORDER BY created_at DESC
`

const deleteInvitationSQL = `
DELETE FROM invitations
WHERE id = $1
  AND owner_id = $2
`
