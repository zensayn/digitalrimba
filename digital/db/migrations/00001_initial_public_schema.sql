-- +goose Up
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.users (
    id text PRIMARY KEY,
    email text NOT NULL UNIQUE,
    first_name text,
    last_name text,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.weddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    slug text NOT NULL UNIQUE,
    couple_name text NOT NULL,
    event_date date,
    venue_name text,
    venue_address text,
    tier text NOT NULL DEFAULT 'leaf',
    status text NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invitation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL UNIQUE REFERENCES public.weddings(id) ON DELETE CASCADE,
    title text NOT NULL,
    template_key text NOT NULL,
    public_url text,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.guests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    invitation_id uuid REFERENCES public.invitation(id) ON DELETE SET NULL,
    name text NOT NULL,
    email text,
    phone text,
    guest_group text,
    party_size integer NOT NULL DEFAULT 1 CHECK (party_size > 0),
    qr_token uuid NOT NULL DEFAULT gen_random_uuid(),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT guests_qr_token_key UNIQUE (qr_token)
);

CREATE TABLE public.rsvp (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid NOT NULL UNIQUE REFERENCES public.guests(id) ON DELETE CASCADE,
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending',
    attendee_count integer NOT NULL DEFAULT 0 CHECK (attendee_count >= 0),
    message text,
    responded_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.checkin (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    checked_in_at timestamptz NOT NULL DEFAULT now(),
    checked_in_by text REFERENCES public.users(id) ON DELETE SET NULL,
    souvenir_claimed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT checkin_guest_id_key UNIQUE (guest_id)
);

CREATE TABLE public.budget_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    category text NOT NULL,
    item_name text NOT NULL,
    estimated_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_amount >= 0),
    actual_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (actual_amount >= 0),
    paid boolean NOT NULL DEFAULT false,
    due_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.checklist_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    due_date date,
    completed_at timestamptz,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.operators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'operator',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT operators_wedding_user_key UNIQUE (wedding_id, user_id)
);

CREATE TABLE public.tier_features (
    tier text NOT NULL,
    feature_key text NOT NULL,
    feature_name text NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    limit_value integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tier, feature_key)
);

-- +goose Down
DROP TABLE IF EXISTS public.tier_features;
DROP TABLE IF EXISTS public.operators;
DROP TABLE IF EXISTS public.checklist_items;
DROP TABLE IF EXISTS public.budget_items;
DROP TABLE IF EXISTS public.checkin;
DROP TABLE IF EXISTS public.rsvp;
DROP TABLE IF EXISTS public.guests;
DROP TABLE IF EXISTS public.invitation;
DROP TABLE IF EXISTS public.weddings;
DROP TABLE IF EXISTS public.users;
DROP EXTENSION IF EXISTS pgcrypto;
