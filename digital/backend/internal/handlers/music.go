package handlers

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

type MusicTrack struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Artist          string `json:"artist"`
	Category        string `json:"category"`
	Src             string `json:"src"`
	DurationSeconds *int   `json:"duration_seconds,omitempty"`
}

type MusicTracksResponse struct {
	Tracks []MusicTrack `json:"tracks"`
}

type MusicTrackStore interface {
	ListMusicTracks(context.Context) ([]MusicTrack, error)
}

type MusicDB interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

type PostgresMusicTrackStore struct {
	db MusicDB
}

func NewPostgresMusicTrackStore(db MusicDB) *PostgresMusicTrackStore {
	return &PostgresMusicTrackStore{db: db}
}

type MusicHandler struct {
	store MusicTrackStore
}

func NewMusicHandler(store MusicTrackStore) *MusicHandler {
	return &MusicHandler{store: store}
}

func (h *MusicHandler) RegisterRoutes(r chi.Router) {
	r.Get("/api/music-tracks", h.List)
}

func (h *MusicHandler) List(w http.ResponseWriter, r *http.Request) {
	if _, ok := UserIDFromContext(r.Context()); !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	tracks, err := h.store.ListMusicTracks(r.Context())
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	if tracks == nil {
		tracks = []MusicTrack{}
	}

	writeJSON(w, http.StatusOK, MusicTracksResponse{Tracks: tracks})
}

func (s *PostgresMusicTrackStore) ListMusicTracks(ctx context.Context) ([]MusicTrack, error) {
	rows, err := s.db.Query(ctx, listMusicTracksSQL)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tracks []MusicTrack
	for rows.Next() {
		var t MusicTrack
		if err := rows.Scan(&t.ID, &t.Title, &t.Artist, &t.Category, &t.Src, &t.DurationSeconds); err != nil {
			return nil, err
		}
		tracks = append(tracks, t)
	}
	return tracks, rows.Err()
}

const listMusicTracksSQL = `
SELECT id::text, title, artist, category, src, duration_seconds
FROM music_tracks
WHERE active
ORDER BY category, sort, title
`
