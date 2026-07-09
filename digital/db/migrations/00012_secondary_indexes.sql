-- +goose NO TRANSACTION
-- CONCURRENTLY so index builds never block writes on live tables; it can't
-- run inside a transaction, hence NO TRANSACTION (each statement commits on
-- its own, and IF NOT EXISTS makes a partially-applied re-run safe).
-- +goose Up
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_wedding_id ON public.guests (wedding_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkin_wedding_id ON public.checkin (wedding_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rsvp_wedding_id ON public.rsvp (wedding_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_items_wedding_id ON public.budget_items (wedding_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checklist_items_wedding_id ON public.checklist_items (wedding_id);
-- covering: guestWeddingIDForUserSQL selects only wedding_id -> index-only scan
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wedding_members_user_id ON public.wedding_members (user_id) INCLUDE (wedding_id);

-- exact duplicate of unique constraint checkin_events_event_code_key
DROP INDEX CONCURRENTLY IF EXISTS public.idx_checkin_events_event_code;

-- +goose Down
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkin_events_event_code ON public.checkin_events (event_code);
DROP INDEX CONCURRENTLY IF EXISTS public.idx_wedding_members_user_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_checklist_items_wedding_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_budget_items_wedding_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_rsvp_wedding_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_checkin_wedding_id;
DROP INDEX CONCURRENTLY IF EXISTS public.idx_guests_wedding_id;
DROP EXTENSION IF EXISTS pg_trgm;
