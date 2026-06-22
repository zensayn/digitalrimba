# Budget Planner UI — Design Spec
_Date: 2026-05-16_

## Overview

Replace the mock-data `BudgetPage` component with a fully wired Budget Planner UI connected to the Go backend. Couples can track spending across 7 fixed categories, add budget items via a modal, and see live overspend highlighting. Includes backend route registration, a DB migration for the `vendor` column, and a covering index on `budget_items(wedding_id)`.

---

## Architecture

### Data Flow

```
BudgetPage mounts
  → useQuery(['budget','summary'], fetchBudgetSummary)
  → GET /api/budget/summary  (Authorization: Bearer <jwt>)
  → Go handler: resolve weddingId from JWT → SELECT from budget_items
  → returns { total_budgeted, total_actual, overspend, categories[] }

Client merges API categories against 7 fixed categories
  → missing categories render as budgeted: 0, actual: 0, overspend: false

Add Item modal submits
  → useMutation(createBudgetItem)
  → POST /api/budget/items { category, item_name, vendor?, estimated_amount, actual_amount: 0, paid: false }
  → on success: queryClient.invalidateQueries(['budget','summary'])
  → page refetches, all cards update
```

### Fixed Categories (client-side, 7 total)

```ts
const CATEGORIES = [
  'Venue',
  'Catering',
  'Attire',
  'Decoration & Florist',
  'Photo & Video',
  'Entertainment & MC',
  'Others',
]
```

The API returns categories dynamically; the client merges them against this list so all 7 always render (empty categories show 0/0).

---

## Backend Changes

### 1. DB Migration — `vendor` column

```sql
ALTER TABLE budget_items ADD COLUMN vendor text;
```

Nullable, no default, no impact on existing rows.

### 2. Go struct update — `budget.go`

Add `Vendor *string` to `BudgetItem`, `CreateBudgetItemParams`, `UpdateBudgetItemParams`, `createBudgetItemRequest`, and `updateBudgetItemRequest`. Update `scanBudgetItem`, `createBudgetItemSQL`, `updateBudgetItemSQL`, and `budgetItemSelectColumns` to include the column.

### 3. Route registration — `cmd/api/main.go`

Inside the existing protected (JWT) group, add:

```go
internalhandlers.RegisterBudgetRoutes(r, pool)
```

Place it alongside `guestHandler.RegisterRoutes(r)`.

### 4. DB Index

After connecting, measure `GET /api/budget/summary` response time. If >300 ms, apply:

```sql
CREATE INDEX IF NOT EXISTS budget_items_wedding_id_idx ON budget_items(wedding_id);
```

---

## Frontend Changes

### `lib/api/budget.ts` (new file)

Follows the `lib/api/guests.ts` pattern. Each function:
1. Calls `authClient.getToken()` to obtain a short-lived JWT.
2. Sends `Authorization: Bearer <token>` header.
3. Throws on non-ok response.

Functions:
- `fetchBudgetSummary(): Promise<BudgetSummary>`
- `createBudgetItem(params: CreateBudgetItemInput): Promise<BudgetItem>`

Types exported:
```ts
type BudgetCategorySummary = {
  name: string
  budgeted: number
  actual: number
  overspend: boolean
}

type BudgetSummary = {
  total_budgeted: number
  total_actual: number
  overspend: boolean
  categories: BudgetCategorySummary[]
}

type CreateBudgetItemInput = {
  category: string
  item_name: string
  vendor?: string
  estimated_amount: number
  actual_amount: number
  paid: boolean
}
```

### `components/dashboard/BudgetPage.tsx` (rewrite)

**Remove:** `MOCK_CATEGORIES` constant, local `BudgetCategory`/`BudgetItem` types.

**Add:**
- `useQuery(['budget', 'summary'], fetchBudgetSummary)` — drives all display.
- Merge helper: takes API `categories[]` and merges against the 7 fixed names, filling zeros for absent categories.
- `AddItemModal` component (inline in the same file) — modal using the existing `Modal` component.
- `useMutation(createBudgetItem)` with `onSuccess: () => queryClient.invalidateQueries(['budget', 'summary'])`.

**Overspend logic:**
- Individual category card: red border (`border-[#ef4444]/30`) + red progress bar when `category.overspend === true`.
- Total "Remaining" card: red text + `DangerTriangle` icon when `summary.overspend === true` (already implemented in mock, just needs real data).

**Loading state:** Skeleton shimmer (use existing `Skeleton` UI component) while query is loading. Error state: simple inline message.

**Modal triggering:** The modal accepts an optional `defaultCategory?: string` prop. Clicking "Add Item" from within an expanded category row passes that category as the default — the Category dropdown opens pre-selected. The top-level "Add Item" / "Add Category" button passes no default, so the dropdown opens on `Venue` (first in list). This is a UX affordance only; the user can still change the category.

### AddItemModal Fields

| Field | Input type | Maps to |
|---|---|---|
| Category | `<select>` — 7 fixed options | `category` |
| Item Name | text input, required | `item_name` |
| Vendor / Notes | text input, optional | `vendor` |
| Budgeted Amount | number input, label "Budgeted Amount" (UI label only — JSON key is `estimated_amount`) | `estimated_amount` |
| Actual Amount | number input, optional, defaults to `0` | `actual_amount` |
| Payment Status | 3-state segmented control | `paid` (boolean) |

**Payment Status segmented control:**
- `Belum Bayar` (unpaid) → `paid: false`
- `DP` (partial) → `paid: false`
- `Lunas` (paid) → `paid: true`

Default selection: `Belum Bayar`. The DP/Lunas distinction is UI-only; the backend receives a boolean. Migrate to `payment_status text` column in a follow-up.

---

## What Is Not Changing

- The existing accordion expand/collapse behavior in BudgetPage stays intact.
- The overview summary cards (Total Budget, Total Spent, Remaining) keep their current visual design — only their data source changes from mock to API.
- No changes to routing — the page remains at `app/(dashboard)/dashboard/budget/page.tsx`.
- `BudgetMetrics.tsx` is untouched (separate widget, not part of this task).

---

## Out of Scope (Deferred)

- `payment_status text` column migration (three-state fully in DB)
- Edit / delete existing budget items from the UI
- Vendor list view
- Pagination of budget items within a category
