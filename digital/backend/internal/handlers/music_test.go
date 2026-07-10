package handlers

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestMusicTrackRoutes(t *testing.T) {
	t.Run("unauthenticated request is rejected", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/music-tracks", nil)
		rec := httptest.NewRecorder()

		musicRouter(&stubMusicStore{}).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusUnauthorized)
	})

	t.Run("lists active tracks", func(t *testing.T) {
		store := &stubMusicStore{tracks: []MusicTrack{
			{ID: "t1", Title: "Canon in D", Artist: "Pachelbel", Category: "romantic", Src: "https://assets-invitations.rimba.io/music/catalog/canon-abc123.mp3"},
		}}
		req := requestWithUser(http.MethodGet, "/api/music-tracks", "", "user-1")
		rec := httptest.NewRecorder()

		musicRouter(store).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		var got MusicTracksResponse
		decodeBody(t, rec, &got)
		if len(got.Tracks) != 1 || got.Tracks[0].Title != "Canon in D" {
			t.Fatalf("tracks = %+v; want the one seeded track", got.Tracks)
		}
	})

	t.Run("empty catalog returns empty array not null", func(t *testing.T) {
		req := requestWithUser(http.MethodGet, "/api/music-tracks", "", "user-1")
		rec := httptest.NewRecorder()

		musicRouter(&stubMusicStore{}).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusOK)
		if body := rec.Body.String(); body != "{\"tracks\":[]}\n" && body != "{\"tracks\":[]}" {
			t.Fatalf("body = %q; want empty tracks array", body)
		}
	})

	t.Run("store error returns 500", func(t *testing.T) {
		req := requestWithUser(http.MethodGet, "/api/music-tracks", "", "user-1")
		rec := httptest.NewRecorder()

		musicRouter(&stubMusicStore{err: errors.New("boom")}).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusInternalServerError)
	})
}

func musicRouter(store MusicTrackStore) http.Handler {
	r := chi.NewRouter()
	NewMusicHandler(store).RegisterRoutes(r)
	return r
}

type stubMusicStore struct {
	tracks []MusicTrack
	err    error
}

func (s *stubMusicStore) ListMusicTracks(context.Context) ([]MusicTrack, error) {
	return s.tracks, s.err
}
