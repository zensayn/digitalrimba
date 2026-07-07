-- +goose Up
-- Track how much of an item has actually been paid (enables "partial").
ALTER TABLE public.budget_items
  ADD COLUMN paid_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0);

-- Backfill: anything previously marked paid carries its full actual amount.
UPDATE public.budget_items
  SET paid_amount = actual_amount
  WHERE paid = true OR payment_status = 'paid';

-- payment_status and paid become derived from paid_amount vs actual_amount so the
-- two can never drift. (Generated columns must be dropped + re-added.)
ALTER TABLE public.budget_items DROP COLUMN payment_status;
ALTER TABLE public.budget_items
  ADD COLUMN payment_status text NOT NULL GENERATED ALWAYS AS (
    CASE
      WHEN paid_amount <= 0 THEN 'unpaid'
      WHEN actual_amount > 0 AND paid_amount >= actual_amount THEN 'paid'
      ELSE 'partial'
    END
  ) STORED;

ALTER TABLE public.budget_items DROP COLUMN paid;
ALTER TABLE public.budget_items
  ADD COLUMN paid boolean NOT NULL GENERATED ALWAYS AS (
    actual_amount > 0 AND paid_amount >= actual_amount
  ) STORED;

-- Top-down planned budget per category (independent of item estimates).
CREATE TABLE public.budget_category_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category text NOT NULL,
  planned_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (planned_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, category)
);

-- +goose Down
DROP TABLE IF EXISTS public.budget_category_budgets;

ALTER TABLE public.budget_items DROP COLUMN paid;
ALTER TABLE public.budget_items ADD COLUMN paid boolean NOT NULL DEFAULT false;
UPDATE public.budget_items SET paid = (actual_amount > 0 AND paid_amount >= actual_amount);

ALTER TABLE public.budget_items DROP COLUMN payment_status;
ALTER TABLE public.budget_items ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid';
UPDATE public.budget_items SET payment_status = CASE
    WHEN paid_amount <= 0 THEN 'unpaid'
    WHEN actual_amount > 0 AND paid_amount >= actual_amount THEN 'paid'
    ELSE 'partial'
  END;

ALTER TABLE public.budget_items DROP COLUMN paid_amount;
