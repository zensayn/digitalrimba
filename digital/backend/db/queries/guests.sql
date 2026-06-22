-- name: InsertGuests :many
INSERT INTO guests (
    wedding_id,
    name,
    phone,
    guest_group,
    qr_token,
    created_at,
    updated_at
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
    wedding_id uuid,
    name text,
    phone text,
    tag text,
    qr_token text
)
RETURNING id::text, wedding_id::text, name, COALESCE(phone, ''), COALESCE(guest_group, ''), qr_token::text;

-- name: FindDuplicateGuestPhone :one
SELECT phone
FROM guests
WHERE wedding_id = $1
  AND phone = ANY($2::text[])
LIMIT 1;
