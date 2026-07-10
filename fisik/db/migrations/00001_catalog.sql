-- +goose Up
-- Rimba Fisik product catalog — the only domain this backend serves.
-- Collections are keyed by a uuid id (code kept as a UNIQUE business key);
-- products reference the collection via the id FK; images reference the product
-- via the id FK. This is the squashed, final-state schema.

CREATE TABLE public.catalog_collections (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text        NOT NULL UNIQUE,       -- 'rfh' | 'rs' | 'rsh'
    name        text        NOT NULL,              -- display label
    sort_order  int         NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.catalog_products (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id   uuid        NOT NULL REFERENCES public.catalog_collections(id) ON DELETE CASCADE,
    code            text        NOT NULL,           -- 'rfh-01.1'
    slug            text        NOT NULL UNIQUE,    -- 'whisper' (used in the URL)
    name            text        NOT NULL,           -- 'Whisper'
    folder          text        NOT NULL,           -- R2 folder, e.g. 'katalog-rimba/rfh/rfh-01.1-whisper'
    cover_key       text        NOT NULL,           -- relative R2 key of the cover image
    popular         boolean     NOT NULL DEFAULT false,  -- curated seller (top OR best)
    top_seller      boolean     NOT NULL DEFAULT false,  -- the single hero per collection
    sort_order      int         NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX catalog_products_collection_id_idx ON public.catalog_products(collection_id);
-- Enforce "the single hero per collection".
CREATE UNIQUE INDEX catalog_products_top_seller_idx
    ON public.catalog_products(collection_id) WHERE top_seller;

CREATE TABLE public.catalog_product_images (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  uuid        NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
    object_key  text        NOT NULL,               -- relative R2 key
    position    int         NOT NULL CHECK (position >= 1), -- 1-based, from the -NN suffix
    alt         text        NOT NULL DEFAULT '',
    UNIQUE (product_id, position)
);

-- +goose Down
DROP TABLE IF EXISTS public.catalog_product_images;
DROP TABLE IF EXISTS public.catalog_products;
DROP TABLE IF EXISTS public.catalog_collections;
