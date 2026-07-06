-- +goose Up
-- Kiosk check-in fields: actual headcount at the door, proxy ("wakil")
-- arrivals, physical envelope tag codes, and a free-text operator label
-- (checked_in_by stays a users(id) FK and is unusable under shared-PIN auth).
ALTER TABLE public.checkin
    ADD COLUMN IF NOT EXISTS actual_pax integer CHECK (actual_pax IS NULL OR actual_pax > 0),
    ADD COLUMN IF NOT EXISTS proxy_name text,
    ADD COLUMN IF NOT EXISTS gift_tag_code text,
    ADD COLUMN IF NOT EXISTS checked_in_by_label text;

-- +goose Down
ALTER TABLE public.checkin
    DROP COLUMN IF EXISTS actual_pax,
    DROP COLUMN IF EXISTS proxy_name,
    DROP COLUMN IF EXISTS gift_tag_code,
    DROP COLUMN IF EXISTS checked_in_by_label;
