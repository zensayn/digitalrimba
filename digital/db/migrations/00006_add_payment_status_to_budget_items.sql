-- +goose Up
ALTER TABLE public.budget_items ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid';

-- +goose Down
ALTER TABLE public.budget_items DROP COLUMN payment_status;
