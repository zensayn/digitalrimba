package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

var ErrWeddingSlugTaken = errors.New("wedding slug already exists")

type WeddingProfile struct {
	ID           string `json:"id"`
	OwnerID      string `json:"owner_id,omitempty"`
	Slug         string `json:"slug"`
	CoupleName   string `json:"couple_name"`
	EventDate    string `json:"event_date"`
	VenueName    string `json:"venue_name"`
	VenueAddress string `json:"venue_address"`
	Tier         string `json:"tier"`
	Status       string `json:"status"`
}

type WeddingProfileResponse struct {
	Wedding *WeddingProfile `json:"wedding"`
}

type SaveWeddingProfileParams struct {
	OwnerID      string
	Slug         string
	CoupleName   string
	EventDate    string
	VenueName    string
	VenueAddress string
}

type WeddingProfileStore interface {
	GetWeddingProfile(context.Context, string) (*WeddingProfile, error)
	SaveWeddingProfile(context.Context, SaveWeddingProfileParams) (WeddingProfile, error)
}

type WeddingProfileDB interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}

type PostgresWeddingProfileStore struct {
	db WeddingProfileDB
}

func NewPostgresWeddingProfileStore(db WeddingProfileDB) *PostgresWeddingProfileStore {
	return &PostgresWeddingProfileStore{db: db}
}

type WeddingProfileHandler struct {
	store        WeddingProfileStore
	randomSuffix func() (string, error)
}

func NewWeddingProfileHandler(store WeddingProfileStore) *WeddingProfileHandler {
	return &WeddingProfileHandler{
		store:        store,
		randomSuffix: randomHexSuffix,
	}
}

func (h *WeddingProfileHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/weddings/profile", h.Get)
	r.Put("/api/weddings/profile", h.Save)
}

func (h *WeddingProfileHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	wedding, err := h.store.GetWeddingProfile(r.Context(), userID)
	if err != nil {
		writeWeddingProfileError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, WeddingProfileResponse{Wedding: wedding})
}

func (h *WeddingProfileHandler) Save(w http.ResponseWriter, r *http.Request) {
	userID, ok := UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		CoupleName   string `json:"couple_name"`
		EventDate    string `json:"event_date"`
		VenueName    string `json:"venue_name"`
		VenueAddress string `json:"venue_address"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	params, err := saveWeddingProfileParams(userID, req.CoupleName, req.EventDate, req.VenueName, req.VenueAddress)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	wedding, err := h.store.SaveWeddingProfile(r.Context(), params)
	if errors.Is(err, ErrWeddingSlugTaken) {
		suffix, suffixErr := h.randomSuffix()
		if suffixErr != nil {
			http.Error(w, "cannot create slug", http.StatusInternalServerError)
			return
		}
		params.Slug = params.Slug + "-" + suffix
		wedding, err = h.store.SaveWeddingProfile(r.Context(), params)
	}
	if err != nil {
		writeWeddingProfileError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, WeddingProfileResponse{Wedding: &wedding})
}

func (s *PostgresWeddingProfileStore) GetWeddingProfile(ctx context.Context, userID string) (*WeddingProfile, error) {
	wedding, err := scanWeddingProfile(s.db.QueryRow(ctx, getWeddingProfileSQL, userID))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &wedding, nil
}

func (s *PostgresWeddingProfileStore) SaveWeddingProfile(ctx context.Context, params SaveWeddingProfileParams) (WeddingProfile, error) {
	wedding, err := scanWeddingProfile(s.db.QueryRow(
		ctx,
		saveWeddingProfileSQL,
		params.OwnerID,
		params.Slug,
		params.CoupleName,
		params.EventDate,
		params.VenueName,
		params.VenueAddress,
	))
	if isUniqueViolation(err) {
		return WeddingProfile{}, ErrWeddingSlugTaken
	}
	return wedding, err
}

func saveWeddingProfileParams(ownerID, coupleName, eventDate, venueName, venueAddress string) (SaveWeddingProfileParams, error) {
	coupleName = strings.TrimSpace(coupleName)
	eventDate = strings.TrimSpace(eventDate)
	if coupleName == "" {
		return SaveWeddingProfileParams{}, errors.New("couple_name required")
	}
	if eventDate != "" {
		if _, err := time.Parse("2006-01-02", eventDate); err != nil {
			return SaveWeddingProfileParams{}, errors.New("event_date must use YYYY-MM-DD")
		}
	}
	return SaveWeddingProfileParams{
		OwnerID:      ownerID,
		Slug:         slugFromWeddingName(coupleName),
		CoupleName:   coupleName,
		EventDate:    eventDate,
		VenueName:    strings.TrimSpace(venueName),
		VenueAddress: strings.TrimSpace(venueAddress),
	}, nil
}

func scanWeddingProfile(row rowScanner) (WeddingProfile, error) {
	var wedding WeddingProfile
	err := row.Scan(
		&wedding.ID,
		&wedding.OwnerID,
		&wedding.Slug,
		&wedding.CoupleName,
		&wedding.EventDate,
		&wedding.VenueName,
		&wedding.VenueAddress,
		&wedding.Tier,
		&wedding.Status,
	)
	if err != nil {
		return WeddingProfile{}, err
	}
	return wedding, nil
}

func slugFromWeddingName(name string) string {
	return slugFromCoupleNames(name)
}

func writeWeddingProfileError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrWeddingSlugTaken):
		http.Error(w, "slug taken", http.StatusConflict)
	default:
		http.Error(w, "internal server error", http.StatusInternalServerError)
	}
}

const weddingProfileSelectColumns = `
id::text,
owner_user_id,
slug,
couple_name,
COALESCE(event_date::text, ''),
COALESCE(venue_name, ''),
COALESCE(venue_address, ''),
tier,
status
`

const getWeddingProfileSQL = `
SELECT ` + weddingProfileSelectColumns + `
FROM weddings
WHERE owner_user_id = $1
ORDER BY created_at ASC
LIMIT 1
`

const saveWeddingProfileSQL = `
INSERT INTO weddings (
	owner_user_id,
	slug,
	couple_name,
	event_date,
	venue_name,
	venue_address,
	created_at,
	updated_at
) VALUES (
	$1,
	$2,
	$3,
	NULLIF($4, '')::date,
	NULLIF($5, ''),
	NULLIF($6, ''),
	now(),
	now()
)
ON CONFLICT (owner_user_id) DO UPDATE
SET
	couple_name = EXCLUDED.couple_name,
	event_date = EXCLUDED.event_date,
	venue_name = EXCLUDED.venue_name,
	venue_address = EXCLUDED.venue_address,
	updated_at = now()
RETURNING ` + weddingProfileSelectColumns + `
`
