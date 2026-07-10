-- +goose Up
-- Personalised onboarding fields. Captured one-question-per-screen in the
-- wedding profile flow so the invitation feels like the couple's story, not a
-- form: who is planning (host_name), how they met (story), the day's feeling
-- (vibe — drives the cover theme), and rough headcount (guest_estimate).
ALTER TABLE public.weddings
    ADD COLUMN IF NOT EXISTS host_name text,
    ADD COLUMN IF NOT EXISTS story text,
    ADD COLUMN IF NOT EXISTS vibe text,
    ADD COLUMN IF NOT EXISTS guest_estimate text;

-- +goose Down
ALTER TABLE public.weddings
    DROP COLUMN IF EXISTS host_name,
    DROP COLUMN IF EXISTS story,
    DROP COLUMN IF EXISTS vibe,
    DROP COLUMN IF EXISTS guest_estimate;
