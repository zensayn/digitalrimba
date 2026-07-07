-- +goose Up
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_guests_wedding_id ON public.guests (wedding_id);
CREATE INDEX idx_checkin_wedding_id ON public.checkin (wedding_id);
CREATE INDEX idx_rsvp_wedding_id ON public.rsvp (wedding_id);
CREATE INDEX idx_budget_items_wedding_id ON public.budget_items (wedding_id);
CREATE INDEX idx_checklist_items_wedding_id ON public.checklist_items (wedding_id);
-- covering: guestWeddingIDForUserSQL selects only wedding_id -> index-only scan
CREATE INDEX idx_wedding_members_user_id ON public.wedding_members (user_id) INCLUDE (wedding_id);

-- exact duplicate of unique constraint checkin_events_event_code_key
DROP INDEX public.idx_checkin_events_event_code;

-- +goose Down
CREATE INDEX idx_checkin_events_event_code ON public.checkin_events (event_code);
DROP INDEX public.idx_wedding_members_user_id;
DROP INDEX public.idx_checklist_items_wedding_id;
DROP INDEX public.idx_budget_items_wedding_id;
DROP INDEX public.idx_rsvp_wedding_id;
DROP INDEX public.idx_checkin_wedding_id;
DROP INDEX public.idx_guests_wedding_id;
DROP EXTENSION IF EXISTS pg_trgm;
