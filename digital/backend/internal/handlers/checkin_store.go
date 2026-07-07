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

// checkinGuestColumns is the shared SELECT shape for guest+checkin rows.
// Scan with scanCheckinGuest, keep column order in sync.
const checkinGuestColumns = `
	g.id::text, g.wedding_id::text, g.qr_token::text, g.name, COALESCE(g.guest_group, ''), g.party_size,
	c.checked_in_at, COALESCE(c.souvenir_claimed, false), c.actual_pax,
	COALESCE(c.proxy_name, ''), COALESCE(c.gift_tag_code, ''), COALESCE(c.checked_in_by_label, '')`

func scanCheckinGuest(row pgx.Row) (CheckinGuest, error) {
	var g CheckinGuest
	var arrivedAt *time.Time
	err := row.Scan(
		&g.ID, &g.WeddingID, &g.QRToken, &g.Name, &g.Tag, &g.PartySize,
		&arrivedAt, &g.SouvenirGiven, &g.ActualPax,
		&g.ProxyName, &g.GiftTagCode, &g.CheckedInByLabel,
	)
	g.ArrivedAt = arrivedAt
	return g, err
}

func (s *PostgresCheckinStore) MarkGuestArrived(ctx context.Context, qrToken string, details ScanDetails, now time.Time) (CheckinGuest, bool, CheckinCounts, error) {
	g, err := scanCheckinGuest(s.db.QueryRow(ctx, `
		SELECT `+checkinGuestColumns+`
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.qr_token = $1::uuid
	`, qrToken))
	if errors.Is(err, pgx.ErrNoRows) {
		return CheckinGuest{}, false, CheckinCounts{}, ErrCheckinGuestNotFound
	}
	if err != nil {
		return CheckinGuest{}, false, CheckinCounts{}, err
	}

	if g.ArrivedAt != nil {
		counts, err := s.GetCheckinCounts(ctx, g.WeddingID)
		return g, true, counts, err
	}

	var arrivedAt *time.Time
	err = s.db.QueryRow(ctx, `
		INSERT INTO checkin (guest_id, wedding_id, checked_in_at, souvenir_claimed,
		                     actual_pax, proxy_name, gift_tag_code, checked_in_by_label,
		                     created_at, updated_at)
		VALUES ($1::uuid, $2::uuid, $3, $4, $5, NULLIF($6, ''), NULLIF($7, ''), NULLIF($8, ''), $3, $3)
		ON CONFLICT (guest_id) DO NOTHING
		RETURNING checked_in_at
	`, g.ID, g.WeddingID, now, details.SouvenirGiven,
		details.ActualPax, details.ProxyName, details.GiftTagCode, details.CheckedInByLabel,
	).Scan(&arrivedAt)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return CheckinGuest{}, false, CheckinCounts{}, err
	}
	if arrivedAt != nil {
		g.ArrivedAt = arrivedAt
		g.SouvenirGiven = details.SouvenirGiven
		g.ActualPax = details.ActualPax
		g.ProxyName = details.ProxyName
		g.GiftTagCode = details.GiftTagCode
		g.CheckedInByLabel = details.CheckedInByLabel

		counts, err := s.GetCheckinCounts(ctx, g.WeddingID)
		return g, false, counts, err
	}

	// ON CONFLICT DO NOTHING hit a race: another request checked this guest in
	// between our initial read and this insert. Re-fetch so we report the real
	// already-arrived state instead of a bare, timestamp-less "success".
	var raceArrivedAt time.Time
	if err := s.db.QueryRow(ctx, `SELECT checked_in_at FROM checkin WHERE guest_id = $1::uuid`, g.ID).Scan(&raceArrivedAt); err != nil {
		return CheckinGuest{}, false, CheckinCounts{}, err
	}
	g.ArrivedAt = &raceArrivedAt

	counts, err := s.GetCheckinCounts(ctx, g.WeddingID)
	return g, true, counts, err
}

func (s *PostgresCheckinStore) GetCheckinCounts(ctx context.Context, weddingID string) (CheckinCounts, error) {
	var counts CheckinCounts
	err := s.db.QueryRow(ctx, `
		SELECT
		    COUNT(*)                                          AS total,
		    COUNT(c.id)                                       AS arrived,
		    COALESCE(SUM(g.party_size), 0)                    AS total_pax,
		    COALESCE(SUM(CASE WHEN c.id IS NOT NULL
		        THEN COALESCE(c.actual_pax, g.party_size) END), 0) AS arrived_pax
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.wedding_id = $1::uuid
	`, weddingID).Scan(&counts.Total, &counts.Arrived, &counts.TotalPax, &counts.ArrivedPax)
	return counts, err
}

func (s *PostgresCheckinStore) SearchGuestsByName(ctx context.Context, weddingID, query string) ([]CheckinGuest, error) {
	rows, err := s.db.Query(ctx, `
		SELECT `+checkinGuestColumns+`
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		CROSS JOIN LATERAL (
			SELECT CASE WHEN length($2) >= 3
				THEN GREATEST(word_similarity($2, g.name), word_similarity($2, COALESCE(g.guest_group, '')))
				ELSE 0.0 END AS score
		) sim
		WHERE g.wedding_id = $1::uuid
		  AND (g.name ILIKE '%' || $2 || '%'
		       OR g.guest_group ILIKE '%' || $2 || '%'
		       OR sim.score > 0.3)
		ORDER BY (g.name ILIKE '%' || $2 || '%') DESC, sim.score DESC, g.name
		LIMIT 20
	`, weddingID, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectCheckinGuests(rows)
}

// GetFullRoster returns every guest for the wedding — the operator device
// caches this locally for offline scanning and fuzzy search.
func (s *PostgresCheckinStore) GetFullRoster(ctx context.Context, weddingID string) ([]CheckinGuest, error) {
	rows, err := s.db.Query(ctx, `
		SELECT `+checkinGuestColumns+`
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.wedding_id = $1::uuid
		ORDER BY g.name
	`, weddingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectCheckinGuests(rows)
}

func collectCheckinGuests(rows pgx.Rows) ([]CheckinGuest, error) {
	var guests []CheckinGuest
	for rows.Next() {
		g, err := scanCheckinGuest(rows)
		if err != nil {
			return nil, err
		}
		guests = append(guests, g)
	}
	return guests, rows.Err()
}

// CreateWalkInGuest inserts a guest and their checkin row atomically in a
// single data-modifying CTE (no explicit transaction needed).
func (s *PostgresCheckinStore) CreateWalkInGuest(ctx context.Context, weddingID, name string, partySize int, details ScanDetails, now time.Time) (CheckinGuest, error) {
	var g CheckinGuest
	var arrivedAt *time.Time
	err := s.db.QueryRow(ctx, `
		WITH new_guest AS (
		    INSERT INTO guests (wedding_id, name, guest_group, party_size)
		    VALUES ($1::uuid, $2, 'Walk-in', $3)
		    RETURNING id, wedding_id, qr_token, name, guest_group, party_size
		), new_checkin AS (
		    INSERT INTO checkin (guest_id, wedding_id, checked_in_at, souvenir_claimed,
		                         actual_pax, proxy_name, gift_tag_code, checked_in_by_label,
		                         created_at, updated_at)
		    SELECT id, wedding_id, $4, $5, NULL, NULL, NULLIF($6, ''), NULLIF($7, ''), $4, $4
		    FROM new_guest
		    RETURNING checked_in_at, souvenir_claimed, gift_tag_code, checked_in_by_label
		)
		SELECT ng.id::text, ng.wedding_id::text, ng.qr_token::text, ng.name, COALESCE(ng.guest_group, ''), ng.party_size,
		       nc.checked_in_at, nc.souvenir_claimed,
		       COALESCE(nc.gift_tag_code, ''), COALESCE(nc.checked_in_by_label, '')
		FROM new_guest ng CROSS JOIN new_checkin nc
	`, weddingID, name, partySize, now, details.SouvenirGiven, details.GiftTagCode, details.CheckedInByLabel).Scan(
		&g.ID, &g.WeddingID, &g.QRToken, &g.Name, &g.Tag, &g.PartySize,
		&arrivedAt, &g.SouvenirGiven, &g.GiftTagCode, &g.CheckedInByLabel,
	)
	if err != nil {
		return CheckinGuest{}, err
	}
	g.ArrivedAt = arrivedAt
	return g, nil
}

// MaxGiftTag returns the highest numeric envelope tag already assigned,
// used to seed the client-side sequential counter at operator login.
func (s *PostgresCheckinStore) MaxGiftTag(ctx context.Context, weddingID string) (int, error) {
	var max int
	err := s.db.QueryRow(ctx, `
		SELECT COALESCE(MAX(gift_tag_code::int), 0)
		FROM checkin
		WHERE wedding_id = $1::uuid AND gift_tag_code ~ '^[0-9]+$'
	`, weddingID).Scan(&max)
	return max, err
}

// LookupGuestByQRToken returns the guest with the given qr_token without
// marking arrival — used by the frontend for a preview-before-check-in flow.
func (s *PostgresCheckinStore) LookupGuestByQRToken(ctx context.Context, weddingID, qrToken string) (CheckinGuest, error) {
	g, err := scanCheckinGuest(s.db.QueryRow(ctx, `
		SELECT `+checkinGuestColumns+`
		FROM guests g
		LEFT JOIN checkin c ON c.guest_id = g.id
		WHERE g.wedding_id = $1::uuid
		  AND g.qr_token::text = $2
	`, weddingID, qrToken))
	if err != nil {
		return CheckinGuest{}, err
	}
	return g, nil
}

// GuestQRData holds fields needed to generate a guest's QR code PDF.
type GuestQRData struct {
	Name       string
	QRToken    string
	GuestGroup string
}

// GuestEmailData holds fields needed to email a guest their QR code.
type GuestEmailData struct {
	Name    string
	Email   string
	QRToken string
}

// CheckinStats holds live counts for the organizer dashboard.
type CheckinStats struct {
	Total      int
	Arrived    int
	Souvenirs  int
	TotalPax   int
	ArrivedPax int
	WalkIns    int
}

// OperatorStat aggregates check-ins per operator label for the dashboard.
type OperatorStat struct {
	Label      string    `json:"label"`
	Scans      int       `json:"scans"`
	Pax        int       `json:"pax"`
	LastScanAt time.Time `json:"lastScanAt"`
}

func (s *PostgresCheckinStore) GetCheckinEventByWeddingID(ctx context.Context, weddingID string) (CheckinEvent, error) {
	var e CheckinEvent
	err := s.db.QueryRow(ctx,
		`SELECT event_code, wedding_id::text, pin_hash
		 FROM checkin_events WHERE wedding_id = $1`,
		weddingID,
	).Scan(&e.EventCode, &e.WeddingID, &e.PINHash)
	return e, err // pgx.ErrNoRows when not found
}

func (s *PostgresCheckinStore) CreateCheckinEvent(ctx context.Context, weddingID, eventCode, pinHash string) (CheckinEvent, error) {
	var e CheckinEvent
	err := s.db.QueryRow(ctx,
		`INSERT INTO checkin_events (wedding_id, event_code, pin_hash)
		 VALUES ($1, $2, $3)
		 RETURNING event_code, wedding_id::text, pin_hash`,
		weddingID, eventCode, pinHash,
	).Scan(&e.EventCode, &e.WeddingID, &e.PINHash)
	return e, err
}

func (s *PostgresCheckinStore) UpdateEventPINHash(ctx context.Context, weddingID, pinHash string) error {
	var dummy string
	return s.db.QueryRow(ctx,
		`UPDATE checkin_events SET pin_hash = $1, updated_at = now()
		 WHERE wedding_id = $2 RETURNING event_code`,
		pinHash, weddingID,
	).Scan(&dummy)
}

func (s *PostgresCheckinStore) GetGuestsForQR(ctx context.Context, weddingID string) ([]GuestQRData, error) {
	rows, err := s.db.Query(ctx,
		`SELECT name, qr_token::text, COALESCE(guest_group, '')
		 FROM guests WHERE wedding_id = $1 ORDER BY name`,
		weddingID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []GuestQRData
	for rows.Next() {
		var g GuestQRData
		if err := rows.Scan(&g.Name, &g.QRToken, &g.GuestGroup); err != nil {
			return nil, err
		}
		result = append(result, g)
	}
	return result, rows.Err()
}

func (s *PostgresCheckinStore) GetGuestsWithEmail(ctx context.Context, weddingID string) ([]GuestEmailData, error) {
	rows, err := s.db.Query(ctx,
		`SELECT name, COALESCE(email, ''), qr_token::text
		 FROM guests WHERE wedding_id = $1 AND email IS NOT NULL AND email != '' ORDER BY name`,
		weddingID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []GuestEmailData
	for rows.Next() {
		var g GuestEmailData
		if err := rows.Scan(&g.Name, &g.Email, &g.QRToken); err != nil {
			return nil, err
		}
		result = append(result, g)
	}
	return result, rows.Err()
}

func (s *PostgresCheckinStore) GetCheckinStats(ctx context.Context, weddingID string) (CheckinStats, error) {
	var stats CheckinStats
	err := s.db.QueryRow(ctx,
		`SELECT
			(SELECT COUNT(*) FROM guests  WHERE wedding_id = $1),
			(SELECT COUNT(*) FROM checkin WHERE wedding_id = $1),
			(SELECT COUNT(*) FROM checkin WHERE wedding_id = $1 AND souvenir_claimed = true),
			(SELECT COALESCE(SUM(party_size), 0) FROM guests WHERE wedding_id = $1),
			(SELECT COALESCE(SUM(COALESCE(c.actual_pax, g.party_size)), 0)
			   FROM checkin c JOIN guests g ON g.id = c.guest_id WHERE c.wedding_id = $1),
			(SELECT COUNT(*) FROM guests WHERE wedding_id = $1 AND guest_group = 'Walk-in')`,
		weddingID,
	).Scan(&stats.Total, &stats.Arrived, &stats.Souvenirs, &stats.TotalPax, &stats.ArrivedPax, &stats.WalkIns)
	return stats, err
}

func (s *PostgresCheckinStore) GetOperatorStats(ctx context.Context, weddingID string) ([]OperatorStat, error) {
	rows, err := s.db.Query(ctx,
		`SELECT COALESCE(NULLIF(c.checked_in_by_label, ''), 'Unnamed operator'),
		        COUNT(*),
		        COALESCE(SUM(COALESCE(c.actual_pax, g.party_size)), 0),
		        MAX(c.checked_in_at)
		 FROM checkin c JOIN guests g ON g.id = c.guest_id
		 WHERE c.wedding_id = $1
		 GROUP BY 1
		 ORDER BY 2 DESC, 1`,
		weddingID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []OperatorStat
	for rows.Next() {
		var o OperatorStat
		if err := rows.Scan(&o.Label, &o.Scans, &o.Pax, &o.LastScanAt); err != nil {
			return nil, err
		}
		result = append(result, o)
	}
	return result, rows.Err()
}

func (s *PostgresCheckinStore) UpdateGuestSouvenir(ctx context.Context, guestID, weddingID string, collected bool) (CheckinGuest, error) {
	g, err := scanCheckinGuest(s.db.QueryRow(ctx, `
		WITH updated AS (
		    UPDATE checkin c
		    SET souvenir_claimed = $3, updated_at = now()
		    FROM guests g
		    WHERE c.guest_id = g.id
		      AND c.guest_id = $1::uuid
		      AND g.wedding_id = $2::uuid
		    RETURNING c.guest_id, c.checked_in_at, c.souvenir_claimed,
		              c.actual_pax, c.proxy_name, c.gift_tag_code, c.checked_in_by_label
		)
		SELECT g.id::text, g.wedding_id::text, g.qr_token::text, g.name, COALESCE(g.guest_group, ''), g.party_size,
		       c.checked_in_at, COALESCE(c.souvenir_claimed, false), c.actual_pax,
		       COALESCE(c.proxy_name, ''), COALESCE(c.gift_tag_code, ''), COALESCE(c.checked_in_by_label, '')
		FROM guests g
		JOIN updated c ON c.guest_id = g.id
	`, guestID, weddingID, collected))
	if errors.Is(err, pgx.ErrNoRows) {
		return CheckinGuest{}, ErrCheckinGuestNotFound
	}
	if err != nil {
		return CheckinGuest{}, err
	}
	return g, nil
}
