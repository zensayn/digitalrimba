package handlers

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type GuestDB interface {
	Query(context.Context, string, ...any) (pgx.Rows, error)
	QueryRow(context.Context, string, ...any) pgx.Row
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}

type PostgresGuestStore struct {
	db GuestDB
}

func NewPostgresGuestStore(db GuestDB) *PostgresGuestStore {
	return &PostgresGuestStore{db: db}
}

func (s *PostgresGuestStore) InsertGuests(ctx context.Context, rows []InsertGuestParams) ([]Guest, error) {
	phones := make([]string, 0, len(rows))
	weddingID := ""
	for _, r := range rows {
		if weddingID == "" {
			weddingID = r.WeddingID
		}
		if r.Phone != "" {
			phones = append(phones, r.Phone)
		}
	}

	if len(phones) > 0 {
		var dup string
		err := s.db.QueryRow(ctx, findDuplicateGuestPhoneSQL, weddingID, phones).Scan(&dup)
		if err == nil {
			return nil, DuplicateGuestPhoneError{Phone: dup}
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return nil, err
		}
	}

	type guestRow struct {
		WeddingID string `json:"wedding_id"`
		Name      string `json:"name"`
		Phone     string `json:"phone"`
		Tag       string `json:"tag"`
		QRToken   string `json:"qr_token"`
	}
	jsonRows := make([]guestRow, len(rows))
	for i, r := range rows {
		jsonRows[i] = guestRow{
			WeddingID: r.WeddingID,
			Name:      r.Name,
			Phone:     r.Phone,
			Tag:       r.Tag,
			QRToken:   r.QRToken,
		}
	}

	data, err := json.Marshal(jsonRows)
	if err != nil {
		return nil, err
	}

	pgxRows, err := s.db.Query(ctx, insertGuestsSQL, data)
	if err != nil {
		return nil, err
	}
	defer pgxRows.Close()

	guests := make([]Guest, 0, len(rows))
	for pgxRows.Next() {
		var g Guest
		if err := pgxRows.Scan(&g.ID, &g.WeddingID, &g.Name, &g.Phone, &g.Tag, &g.QRToken); err != nil {
			return nil, err
		}
		guests = append(guests, g)
	}
	return guests, pgxRows.Err()
}

func (s *PostgresGuestStore) ListGuests(ctx context.Context, weddingID string) ([]Guest, error) {
	rows, err := s.db.Query(ctx, listGuestsSQL, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	guests := []Guest{}
	for rows.Next() {
		guest, err := scanStoredGuest(rows)
		if err != nil {
			return nil, err
		}
		guests = append(guests, guest)
	}
	return guests, rows.Err()
}

func (s *PostgresGuestStore) UpdateGuestTag(ctx context.Context, id string, weddingID string, tag string) (Guest, error) {
	return scanStoredGuest(s.db.QueryRow(ctx, updateGuestTagSQL, id, weddingID, tag))
}

func (s *PostgresGuestStore) DeleteGuests(ctx context.Context, weddingID string, ids []string) error {
	_, err := s.db.Exec(ctx, deleteGuestsSQL, weddingID, ids)
	return err
}

func (s *PostgresGuestStore) GuestWeddingIDForUser(ctx context.Context, userID string) (string, error) {
	return resolveWeddingIDForUser(ctx, s.db, userID)
}

type weddingIDQuerier interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}

// resolveWeddingIDForUser maps a user to their wedding via wedding_members,
// falling back to the owner column while that migration hasn't run. Shared by
// the guest and RSVP stores so the fallback logic lives in one place.
func resolveWeddingIDForUser(ctx context.Context, db weddingIDQuerier, userID string) (string, error) {
	var weddingID string
	err := db.QueryRow(ctx, guestWeddingIDForUserSQL, userID).Scan(&weddingID)
	if err == nil {
		return weddingID, nil
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrGuestWeddingNotFound
	}
	if !isUndefinedColumnOrTable(err) {
		return "", err
	}

	fallbackErr := db.QueryRow(ctx, guestWeddingIDForOwnerSQL, userID).Scan(&weddingID)
	if errors.Is(fallbackErr, pgx.ErrNoRows) {
		return "", ErrGuestWeddingNotFound
	}
	if fallbackErr != nil {
		return "", fallbackErr
	}
	return weddingID, nil
}

func scanStoredGuest(row rowScanner) (Guest, error) {
	var guest Guest
	err := row.Scan(&guest.ID, &guest.WeddingID, &guest.Name, &guest.Phone, &guest.Tag, &guest.QRToken, &guest.Email, &guest.Notes, &guest.PartySize, &guest.Method, &guest.RespondedAt, &guest.RsvpStatus)
	if errors.Is(err, pgx.ErrNoRows) {
		return Guest{}, ErrGuestNotFound
	}
	return guest, err
}

// ponytail: '' literal for method — no table stores it, frontend treats it as optional
const guestSelectColumns = `g.id::text, g.wedding_id::text, g.name, COALESCE(g.phone, ''), COALESCE(g.guest_group, ''), g.qr_token::text, COALESCE(g.email, ''), COALESCE(g.notes, ''), COALESCE(g.party_size, 1), ''::text, COALESCE(TO_CHAR(r.responded_at, 'YYYY-MM-DD'), ''), COALESCE(r.status, 'pending')`

const listGuestsSQL = `
SELECT ` + guestSelectColumns + `
FROM guests g
LEFT JOIN rsvp r ON r.guest_id = g.id
WHERE g.wedding_id = $1::uuid
ORDER BY g.created_at ASC, g.id ASC
`

const updateGuestTagSQL = `
WITH g AS (
    UPDATE guests
    SET guest_group = $3,
        updated_at = now()
    WHERE id::text = $1
      AND wedding_id = $2::uuid
    RETURNING *
)
SELECT ` + guestSelectColumns + `
FROM g
LEFT JOIN rsvp r ON r.guest_id = g.id
`

const deleteGuestsSQL = `
DELETE FROM guests
WHERE wedding_id = $1::uuid
  AND id::text = ANY($2::text[])
`

const insertGuestsSQL = `
INSERT INTO guests (
    wedding_id, name, phone, guest_group, qr_token, created_at, updated_at
)
SELECT
    guest_row.wedding_id,
    guest_row.name,
    guest_row.phone,
    guest_row.tag,
    guest_row.qr_token::uuid,
    now(),
    now()
FROM jsonb_to_recordset($1::jsonb) AS guest_row(
    wedding_id uuid, name text, phone text, tag text, qr_token text
)
RETURNING id::text, wedding_id::text, name, COALESCE(phone, ''), COALESCE(guest_group, ''), qr_token::text
`

const findDuplicateGuestPhoneSQL = `
SELECT phone
FROM guests
WHERE wedding_id = $1
  AND phone = ANY($2::text[])
LIMIT 1
`

const guestWeddingIDForUserSQL = `
SELECT wedding_id
FROM wedding_members
WHERE user_id = $1
LIMIT 1
`

const guestWeddingIDForOwnerSQL = `
SELECT id::text
FROM weddings
WHERE owner_user_id = $1
ORDER BY created_at ASC
LIMIT 1
`
