-- +goose Up
ALTER TABLE public.budget_items
  ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- +goose Down
ALTER TABLE public.budget_items DROP COLUMN payment_status;
