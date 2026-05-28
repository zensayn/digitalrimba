-- +goose Up
CREATE TABLE public.invitations (
    id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id     text         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    couple_names text         NOT NULL,
    slug         text         NOT NULL UNIQUE,
    content      jsonb        NOT NULL DEFAULT '{}',
    published_at timestamptz,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS public.invitations;
