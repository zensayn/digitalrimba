-- +goose Up
-- Rimba Fisik product pricing — quantity-tiered, effective-dated price versions.
-- Sourced from harga-katalog-rimba.xlsx via the seed-pricing command. Prices are
-- the final Rimba selling prices in whole IDR. Pricing is keyed by its own
-- normalized rimba_code (e.g. 'rs-01.1') with a NULLABLE soft FK to
-- catalog_products, since the price list covers more products than the catalog.

-- Reference: the four quantity bands (static, version-independent).
CREATE TABLE public.catalog_price_tiers (
    code        text    PRIMARY KEY,          -- 't1' | 't2' | 't3' | 't4'
    label       text    NOT NULL,             -- '50-99 pcs'
    min_qty     int     NOT NULL CHECK (min_qty > 0),      -- 50
    max_qty     int     CHECK (max_qty IS NULL OR max_qty >= min_qty), -- 99 (NULL = open-ended, e.g. '500+')
    sort_order  int     NOT NULL DEFAULT 0
);

-- Versioning anchor: one row per published price set. effective_to IS NULL = active.
CREATE TABLE public.catalog_price_versions (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    currency        text        NOT NULL DEFAULT 'IDR',
    source          text        NOT NULL DEFAULT '',   -- 'harga-katalog-rimba.xlsx'
    content_hash    text        NOT NULL,              -- sha256 of manifest → idempotent seeding
    note            text        NOT NULL DEFAULT '',
    effective_from  timestamptz NOT NULL DEFAULT now(),
    effective_to    timestamptz,                       -- NULL = current/active
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (effective_to IS NULL OR effective_to > effective_from)
);
-- At most one active (open) version at a time.
CREATE UNIQUE INDEX catalog_price_versions_active_idx
    ON public.catalog_price_versions ((effective_to IS NULL)) WHERE effective_to IS NULL;

-- Product-level pricing rows, scoped to a version.
CREATE TABLE public.catalog_priced_products (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    price_version_id uuid        NOT NULL REFERENCES public.catalog_price_versions(id) ON DELETE CASCADE,
    rimba_code       text        NOT NULL,              -- normalized 'rs-01.1'
    invitto_code     text        NOT NULL DEFAULT '',   -- supplier SKU 'E 01.1'
    name             text        NOT NULL,              -- 'Savannah'
    collection_code  text        NOT NULL,              -- 'rs' | 'rsh' | 'rfh'
    product_id       uuid        REFERENCES public.catalog_products(id) ON DELETE SET NULL, -- soft link, nullable
    status           text        NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'pending')),
    created_at       timestamptz NOT NULL DEFAULT now(),
    UNIQUE (price_version_id, rimba_code)
);
CREATE INDEX catalog_priced_products_version_idx    ON public.catalog_priced_products(price_version_id);
CREATE INDEX catalog_priced_products_rimba_code_idx ON public.catalog_priced_products(rimba_code);
CREATE INDEX catalog_priced_products_product_id_idx ON public.catalog_priced_products(product_id);

-- Per-tier amounts. NULL amount = pending ([cek katalog]).
CREATE TABLE public.catalog_product_tier_prices (
    id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    priced_product_id uuid    NOT NULL REFERENCES public.catalog_priced_products(id) ON DELETE CASCADE,
    tier_code         text    NOT NULL REFERENCES public.catalog_price_tiers(code),
    amount_idr        integer CHECK (amount_idr IS NULL OR amount_idr >= 0),
    UNIQUE (priced_product_id, tier_code)
);

-- +goose Down
DROP TABLE IF EXISTS public.catalog_product_tier_prices;
DROP TABLE IF EXISTS public.catalog_priced_products;
DROP TABLE IF EXISTS public.catalog_price_versions;
DROP TABLE IF EXISTS public.catalog_price_tiers;
