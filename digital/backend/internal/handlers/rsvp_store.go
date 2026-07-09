package handlers

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type RsvpDB interface {
	QueryRow(context.Context, string, ...any) pgx.Row
	Query(context.Context, string, ...any) (pgx.Rows, error)
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}

type PostgresRsvpStore struct {
	db RsvpDB
}

func NewPostgresRsvpStore(db RsvpDB) *PostgresRsvpStore {
	return &PostgresRsvpStore{db: db}
}

// GuestRsvpByToken resolves a guest from its qr_token, returning the wedding
// event info and the guest's current RSVP (if any) for prefilling the form.
func (s *PostgresRsvpStore) GuestRsvpByToken(ctx context.Context, token string) (RsvpGuest, error) {
	var g RsvpGuest
	err := s.db.QueryRow(ctx, guestRsvpByTokenSQL, token).Scan(
		&g.Name, &g.WeddingID, &g.EventDate, &g.VenueName, &g.VenueAddress,
		&g.Status, &g.AttendeeCount, &g.Message,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return RsvpGuest{}, ErrGuestNotFound
	}
	return g, err
}

// SubmitRsvp upserts the guest's RSVP keyed by qr_token and returns the
// resulting guest view in the same round trip (the caller would otherwise
// need a second GuestRsvpByToken query to rebuild the response). The rsvp
// table is the single source of truth (guest_id is UNIQUE). Returns
// ErrGuestNotFound for an unknown token.
func (s *PostgresRsvpStore) SubmitRsvp(ctx context.Context, token, status string, attendeeCount int, message string) (RsvpGuest, error) {
	var g RsvpGuest
	err := s.db.QueryRow(ctx, submitRsvpSQL, token, status, attendeeCount, message).Scan(
		&g.Name, &g.WeddingID, &g.EventDate, &g.VenueName, &g.VenueAddress,
		&g.Status, &g.AttendeeCount, &g.Message,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return RsvpGuest{}, ErrGuestNotFound
	}
	return g, err
}

func (s *PostgresRsvpStore) ListWishes(ctx context.Context, weddingID string) ([]Wish, error) {
	rows, err := s.db.Query(ctx, listWishesSQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	wishes := []Wish{}
	for rows.Next() {
		var wish Wish
		if err := rows.Scan(&wish.Name, &wish.Message, &wish.RespondedAt); err != nil {
			return nil, err
		}
		wishes = append(wishes, wish)
	}
	return wishes, rows.Err()
}

func (s *PostgresRsvpStore) ListRsvps(ctx context.Context, weddingID string) ([]RsvpEntry, error) {
	rows, err := s.db.Query(ctx, listRsvpsSQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := []RsvpEntry{}
	for rows.Next() {
		var e RsvpEntry
		if err := rows.Scan(&e.ID, &e.Name, &e.Group, &e.Status, &e.Attendees, &e.Message, &e.RespondedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

// RsvpWeddingIDForUser reuses the guest store's resolution flow (same package).
func (s *PostgresRsvpStore) RsvpWeddingIDForUser(ctx context.Context, userID string) (string, error) {
	return resolveWeddingIDForUser(ctx, s.db, userID)
}

const guestRsvpByTokenSQL = `
SELECT g.name,
       g.wedding_id::text,
       COALESCE(TO_CHAR(w.event_date, 'YYYY-MM-DD'), ''),
       COALESCE(w.venue_name, ''),
       COALESCE(w.venue_address, ''),
       COALESCE(r.status, 'pending'),
       COALESCE(r.attendee_count, 0),
       COALESCE(r.message, '')
FROM guests g
JOIN weddings w ON w.id = g.wedding_id
LEFT JOIN rsvp r ON r.guest_id = g.id
WHERE g.qr_token = $1::uuid
`

const submitRsvpSQL = `
WITH g AS (
    SELECT id, wedding_id FROM guests WHERE qr_token = $1::uuid
), upsert AS (
    INSERT INTO rsvp (guest_id, wedding_id, status, attendee_count, message, responded_at)
    SELECT g.id, g.wedding_id, $2, $3, NULLIF($4, ''), now()
    FROM g
    ON CONFLICT (guest_id) DO UPDATE
    SET status = EXCLUDED.status,
        attendee_count = EXCLUDED.attendee_count,
        message = EXCLUDED.message,
        responded_at = now(),
        updated_at = now()
    RETURNING guest_id, status, attendee_count, message
)
SELECT gu.name,
       gu.wedding_id::text,
       COALESCE(TO_CHAR(w.event_date, 'YYYY-MM-DD'), ''),
       COALESCE(w.venue_name, ''),
       COALESCE(w.venue_address, ''),
       upsert.status,
       upsert.attendee_count,
       COALESCE(upsert.message, '')
FROM upsert
JOIN guests gu ON gu.id = upsert.guest_id
JOIN weddings w ON w.id = gu.wedding_id
`

const listWishesSQL = `
SELECT g.name,
       COALESCE(r.message, ''),
       COALESCE(TO_CHAR(r.responded_at, 'YYYY-MM-DD'), '')
FROM rsvp r
JOIN guests g ON g.id = r.guest_id
WHERE r.wedding_id = $1::uuid
  AND r.status = 'confirmed'
  AND COALESCE(r.message, '') <> ''
ORDER BY r.responded_at DESC NULLS LAST
LIMIT 50
`

const listRsvpsSQL = `
SELECT g.id::text,
       g.name,
       COALESCE(g.guest_group, ''),
       COALESCE(r.status, 'pending'),
       COALESCE(r.attendee_count, 0),
       COALESCE(r.message, ''),
       COALESCE(TO_CHAR(r.responded_at, 'YYYY-MM-DD'), '')
FROM guests g
LEFT JOIN rsvp r ON r.guest_id = g.id
WHERE g.wedding_id = $1::uuid
ORDER BY g.created_at ASC, g.id ASC
`
