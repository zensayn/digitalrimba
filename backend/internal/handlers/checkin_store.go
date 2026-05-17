package handlers

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

type CheckinDB interface {
	QueryRow(context.Context, string, ...any) pgx.Row
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

type PostgresCheckinStore struct {
	db CheckinDB
}

func NewPostgresCheckinStore(db CheckinDB) *PostgresCheckinStore {
	return &PostgresCheckinStore{db: db}
}

func (s *PostgresCheckinStore) GetCheckinEventByCode(ctx context.Context, code string) (CheckinEvent, error) {
	var e CheckinEvent
	err := s.db.QueryRow(ctx, `
		SELECT ce.event_code, ce.wedding_id::text, ce.pin_hash, COALESCE(w.event_date, now()::date)
		FROM checkin_events ce
		JOIN weddings w ON w.id = ce.wedding_id
		WHERE ce.event_code = $1
	`, code).Scan(&e.EventCode, &e.WeddingID, &e.PINHash, &e.WeddingDate)
	if errors.Is(err, pgx.ErrNoRows) {
		return CheckinEvent{}, ErrCheckinEventNotFound
	}
	return e, err
}

func (s *PostgresCheckinStore) MarkGuestArrived(ctx context.Context, qrToken string, souvenirGiven bool, now time.Time) (CheckinGuest, bool, CheckinCounts, error) {
	var g CheckinGuest
	var arrivedAt *time.Time
	err := s.db.QueryRow(ctx, `
		SELECT g.id::text, g.wedding_id::text, g.qr_token::text, g.name, COALESCE(g.guest_group, ''),
		       c.checked_in_at, COALESCE(c.souvenir_claimed, false)
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.qr_token = $1::uuid
	`, qrToken).Scan(&g.ID, &g.WeddingID, &g.QRToken, &g.Name, &g.Tag, &arrivedAt, &g.SouvenirGiven)
	if errors.Is(err, pgx.ErrNoRows) {
		return CheckinGuest{}, false, CheckinCounts{}, ErrCheckinGuestNotFound
	}
	if err != nil {
		return CheckinGuest{}, false, CheckinCounts{}, err
	}

	if arrivedAt != nil {
		g.ArrivedAt = arrivedAt
		counts, err := s.GetCheckinCounts(ctx, g.WeddingID)
		return g, true, counts, err
	}

	err = s.db.QueryRow(ctx, `
		INSERT INTO checkin (guest_id, wedding_id, checked_in_at, souvenir_claimed, created_at, updated_at)
		VALUES ($1::uuid, $2::uuid, $3, $4, $3, $3)
		ON CONFLICT (guest_id) DO NOTHING
		RETURNING checked_in_at
	`, g.ID, g.WeddingID, now, souvenirGiven).Scan(&arrivedAt)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return CheckinGuest{}, false, CheckinCounts{}, err
	}
	if arrivedAt != nil {
		g.ArrivedAt = arrivedAt
		g.SouvenirGiven = souvenirGiven
	}

	counts, err := s.GetCheckinCounts(ctx, g.WeddingID)
	return g, false, counts, err
}

func (s *PostgresCheckinStore) GetCheckinCounts(ctx context.Context, weddingID string) (CheckinCounts, error) {
	var counts CheckinCounts
	err := s.db.QueryRow(ctx, `
		SELECT
		    COUNT(*)                                          AS total,
		    COUNT(c.id)                                       AS arrived
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.wedding_id = $1::uuid
	`, weddingID).Scan(&counts.Total, &counts.Arrived)
	return counts, err
}

func (s *PostgresCheckinStore) SearchGuestsByName(ctx context.Context, weddingID, query string) ([]CheckinGuest, error) {
	rows, err := s.db.Query(ctx, `
		SELECT g.id::text, g.wedding_id::text, g.qr_token::text, g.name, COALESCE(g.guest_group, ''),
		       c.checked_in_at, COALESCE(c.souvenir_claimed, false)
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.wedding_id = $1::uuid
		  AND g.name ILIKE '%' || $2 || '%'
		ORDER BY g.name
		LIMIT 20
	`, weddingID, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var guests []CheckinGuest
	for rows.Next() {
		var g CheckinGuest
		var arrivedAt *time.Time
		if err := rows.Scan(&g.ID, &g.WeddingID, &g.QRToken, &g.Name, &g.Tag, &arrivedAt, &g.SouvenirGiven); err != nil {
			return nil, err
		}
		g.ArrivedAt = arrivedAt
		guests = append(guests, g)
	}
	return guests, rows.Err()
}

func (s *PostgresCheckinStore) UpdateGuestSouvenir(ctx context.Context, guestID, weddingID string, collected bool) (CheckinGuest, error) {
	var g CheckinGuest
	var arrivedAt *time.Time
	err := s.db.QueryRow(ctx, `
		WITH updated AS (
		    UPDATE checkin c
		    SET souvenir_claimed = $3, updated_at = now()
		    FROM guests g
		    WHERE c.guest_id = g.id
		      AND c.guest_id = $1::uuid
		      AND g.wedding_id = $2::uuid
		    RETURNING c.guest_id, c.checked_in_at, c.souvenir_claimed
		)
		SELECT g.id::text, g.wedding_id::text, g.qr_token::text, g.name, COALESCE(g.guest_group, ''),
		       u.checked_in_at, u.souvenir_claimed
		FROM guests g
		JOIN updated u ON u.guest_id = g.id
	`, guestID, weddingID, collected).Scan(&g.ID, &g.WeddingID, &g.QRToken, &g.Name, &g.Tag, &arrivedAt, &g.SouvenirGiven)
	if errors.Is(err, pgx.ErrNoRows) {
		return CheckinGuest{}, ErrCheckinGuestNotFound
	}
	if err != nil {
		return CheckinGuest{}, err
	}
	g.ArrivedAt = arrivedAt
	return g, nil
}
