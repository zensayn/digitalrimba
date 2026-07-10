-- Curated background-music catalog for the invitation studio. Files live in
-- the rimba-invitations R2 bucket under music/catalog/ (uploaded via
-- invitation/scripts/upload-music.sh); rows come from
-- digital/db/seed/seed_music_tracks.sql. Category is free text — the seed
-- file is the source of truth.
-- +goose Up
CREATE TABLE public.music_tracks (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title            text NOT NULL,
    artist           text NOT NULL DEFAULT '',
    category         text NOT NULL,
    src              text NOT NULL,
    duration_seconds integer,
    sort             integer NOT NULL DEFAULT 0,
    active           boolean NOT NULL DEFAULT true,
    created_at       timestamptz NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE public.music_tracks;
