-- +goose Up
ALTER TABLE public.budget_items ADD COLUMN vendor text;

-- +goose Down
ALTER TABLE public.budget_items DROP COLUMN vendor;
