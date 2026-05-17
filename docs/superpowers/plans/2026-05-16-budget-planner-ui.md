# Budget Planner UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock-data BudgetPage with a fully wired Budget Planner UI connected to the Go backend — 7 fixed category cards, live totals from `GET /api/budget/summary`, and an Add Item modal posting to `POST /api/budget/items`.

**Architecture:** DB migration adds a nullable `vendor` column to `budget_items`. The Go handler is updated to include `vendor` in all structs, SQL, and the scanner, then registered in the protected route group. The frontend adds `lib/api/budget.ts` (JWT-authed fetch functions) and rewrites `BudgetPage.tsx` with `useQuery` + `useMutation` from `@tanstack/react-query`.

**Tech Stack:** Go 1.21+ (chi router, pgx/v5), PostgreSQL, Next.js 14 (App Router), React, TypeScript, @tanstack/react-query v5, better-auth (jwtClient plugin), Tailwind CSS, solar-icons.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `db/migrations/00003_budget_items_vendor.sql` | Create | Goose migration: add `vendor text` column |
| `backend/internal/handlers/budget.go` | Modify | Add Vendor to structs, SQL constants, scanner, store calls |
| `backend/internal/handlers/budget_test.go` | Modify | Add vendor to memoryBudgetStore + new test case |
| `backend/cmd/api/main.go` | Modify | Register budget routes in protected group |
| `frontend/lib/api/budget.ts` | Create | JWT-authed fetchBudgetSummary and createBudgetItem |
| `frontend/components/dashboard/BudgetPage.tsx` | Rewrite | useQuery summary, 7 fixed categories, AddItemModal |

---

## Task 1: DB Migration — add vendor column

**Files:**
- Create: `db/migrations/00003_budget_items_vendor.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- +goose Up
ALTER TABLE budget_items ADD COLUMN vendor text;

-- +goose Down
ALTER TABLE budget_items DROP COLUMN vendor;
```

- [ ] **Step 2: Apply the migration**

From the repo root (where your migration tool is configured):

```bash
cd /Users/pangkywaradjodi/rimba
goose -dir db/migrations postgres "$DATABASE_URL" up
```

Expected output:
```
OK   00003_budget_items_vendor.sql
```

If you don't have goose installed locally, run it via Docker or apply the SQL directly:
```bash
psql "$DATABASE_URL" -c "ALTER TABLE budget_items ADD COLUMN vendor text;"
```

- [ ] **Step 3: Verify the column exists**

```bash
psql "$DATABASE_URL" -c "\d budget_items"
```

Expected: column `vendor` of type `text` appears in the output with `Nullable`.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/00003_budget_items_vendor.sql
git commit -m "db: add vendor column to budget_items"
```

---

## Task 2: Update Go budget handler — vendor field

**Files:**
- Modify: `backend/internal/handlers/budget.go`

Add `Vendor` to all the right places in one pass. All changes are in `budget.go`.

- [ ] **Step 1: Add Vendor to BudgetItem struct**

Find the `BudgetItem` struct and add `Vendor`:

```go
type BudgetItem struct {
	ID              string    `json:"id"`
	WeddingID       string    `json:"wedding_id,omitempty"`
	Category        string    `json:"category"`
	ItemName        string    `json:"item_name"`
	Name            string    `json:"name,omitempty"`
	Vendor          *string   `json:"vendor,omitempty"`
	EstimatedAmount float64   `json:"estimated_amount"`
	Budgeted        float64   `json:"budgeted"`
	ActualAmount    float64   `json:"actual_amount"`
	Actual          float64   `json:"actual"`
	Paid            bool      `json:"paid"`
	DueDate         *string   `json:"due_date,omitempty"`
	CreatedAt       time.Time `json:"created_at,omitempty"`
	UpdatedAt       time.Time `json:"updated_at,omitempty"`
}
```

- [ ] **Step 2: Add Vendor to CreateBudgetItemParams**

```go
type CreateBudgetItemParams struct {
	WeddingID       string
	Category        string
	ItemName        string
	Vendor          *string
	EstimatedAmount float64
	ActualAmount    float64
	Paid            bool
	DueDate         *string
}
```

- [ ] **Step 3: Add Vendor to UpdateBudgetItemParams**

```go
type UpdateBudgetItemParams struct {
	ID              string
	WeddingID       string
	Category        *string
	ItemName        *string
	Vendor          *string
	EstimatedAmount *float64
	ActualAmount    *float64
	Paid            *bool
	DueDate         *string
}
```

- [ ] **Step 4: Add Vendor to request decoder structs**

```go
type createBudgetItemRequest struct {
	WeddingID       string   `json:"wedding_id"`
	Category        string   `json:"category"`
	ItemName        string   `json:"item_name"`
	Name            string   `json:"name"`
	Vendor          *string  `json:"vendor"`
	EstimatedAmount *float64 `json:"estimated_amount"`
	Budgeted        *float64 `json:"budgeted"`
	ActualAmount    *float64 `json:"actual_amount"`
	Actual          *float64 `json:"actual"`
	Paid            *bool    `json:"paid"`
	DueDate         *string  `json:"due_date"`
}

type updateBudgetItemRequest struct {
	WeddingID       string   `json:"wedding_id"`
	Category        *string  `json:"category"`
	ItemName        *string  `json:"item_name"`
	Name            *string  `json:"name"`
	Vendor          *string  `json:"vendor"`
	EstimatedAmount *float64 `json:"estimated_amount"`
	Budgeted        *float64 `json:"budgeted"`
	ActualAmount    *float64 `json:"actual_amount"`
	Actual          *float64 `json:"actual"`
	Paid            *bool    `json:"paid"`
	DueDate         *string  `json:"due_date"`
}
```

- [ ] **Step 5: Update budgetItemSelectColumns — add vendor after item_name**

```go
const budgetItemSelectColumns = `
id::text,
wedding_id::text,
category,
item_name,
vendor,
estimated_amount::float8,
actual_amount::float8,
paid,
due_date::text,
created_at,
updated_at
`
```

- [ ] **Step 6: Update createBudgetItemSQL — add vendor as $8**

```go
const createBudgetItemSQL = `
INSERT INTO budget_items (
    wedding_id,
    category,
    item_name,
    vendor,
    estimated_amount,
    actual_amount,
    paid,
    due_date,
    created_at,
    updated_at
) VALUES (
    $1::uuid,
    $2,
    $3,
    $4,
    $5::numeric,
    $6::numeric,
    $7,
    $8::date,
    now(),
    now()
)
RETURNING ` + budgetItemSelectColumns
```

- [ ] **Step 7: Update updateBudgetItemSQL — add vendor = COALESCE($9, vendor)**

```go
const updateBudgetItemSQL = `
UPDATE budget_items
SET
    category = COALESCE($3, category),
    item_name = COALESCE($4, item_name),
    vendor = COALESCE($5, vendor),
    estimated_amount = COALESCE($6::numeric, estimated_amount),
    actual_amount = COALESCE($7::numeric, actual_amount),
    paid = COALESCE($8, paid),
    due_date = COALESCE($9::date, due_date),
    updated_at = now()
WHERE id = $1::uuid
  AND wedding_id = $2::uuid
RETURNING ` + budgetItemSelectColumns
```

- [ ] **Step 8: Update scanBudgetItem — add &item.Vendor at position 5**

```go
func scanBudgetItem(row rowScanner) (BudgetItem, error) {
	var item BudgetItem
	err := row.Scan(
		&item.ID,
		&item.WeddingID,
		&item.Category,
		&item.ItemName,
		&item.Vendor,
		&item.EstimatedAmount,
		&item.ActualAmount,
		&item.Paid,
		&item.DueDate,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return BudgetItem{}, ErrBudgetItemNotFound
	}
	if err != nil {
		return BudgetItem{}, err
	}
	return normalizeBudgetItem(item), nil
}
```

- [ ] **Step 9: Update CreateBudgetItem store method — pass params.Vendor as $4**

```go
func (s *PostgresBudgetStore) CreateBudgetItem(ctx context.Context, params CreateBudgetItemParams) (BudgetItem, error) {
	return scanBudgetItem(s.db.QueryRow(ctx,
		createBudgetItemSQL,
		params.WeddingID,        // $1
		params.Category,         // $2
		params.ItemName,         // $3
		params.Vendor,           // $4
		params.EstimatedAmount,  // $5
		params.ActualAmount,     // $6
		params.Paid,             // $7
		params.DueDate,          // $8
	))
}
```

- [ ] **Step 10: Update UpdateBudgetItem store method — pass params.Vendor as $5**

```go
func (s *PostgresBudgetStore) UpdateBudgetItem(ctx context.Context, params UpdateBudgetItemParams) (BudgetItem, error) {
	if err := s.requireBudgetItemWedding(ctx, params.ID, params.WeddingID); err != nil {
		return BudgetItem{}, err
	}

	return scanBudgetItem(s.db.QueryRow(ctx,
		updateBudgetItemSQL,
		params.ID,               // $1
		params.WeddingID,        // $2
		params.Category,         // $3
		params.ItemName,         // $4
		params.Vendor,           // $5
		params.EstimatedAmount,  // $6
		params.ActualAmount,     // $7
		params.Paid,             // $8
		params.DueDate,          // $9
	))
}
```

- [ ] **Step 11: Update createBudgetParams — propagate Vendor**

```go
func createBudgetParams(weddingID string, req createBudgetItemRequest) (CreateBudgetItemParams, error) {
	category := strings.TrimSpace(req.Category)
	itemName := firstNonEmpty(req.ItemName, req.Name)
	if category == "" {
		return CreateBudgetItemParams{}, errors.New("category required")
	}
	if itemName == "" {
		return CreateBudgetItemParams{}, errors.New("item_name required")
	}

	estimatedAmount := floatValue(req.EstimatedAmount, req.Budgeted, 0)
	actualAmount := floatValue(req.ActualAmount, req.Actual, 0)
	if estimatedAmount < 0 || actualAmount < 0 {
		return CreateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}

	paid := false
	if req.Paid != nil {
		paid = *req.Paid
	}

	return CreateBudgetItemParams{
		WeddingID:       weddingID,
		Category:        category,
		ItemName:        itemName,
		Vendor:          optionalTrimmedString(req.Vendor),
		EstimatedAmount: estimatedAmount,
		ActualAmount:    actualAmount,
		Paid:            paid,
		DueDate:         optionalTrimmedString(req.DueDate),
	}, nil
}
```

- [ ] **Step 12: Update updateBudgetParams — propagate Vendor**

```go
func updateBudgetParams(id string, weddingID string, req updateBudgetItemRequest) (UpdateBudgetItemParams, error) {
	if strings.TrimSpace(id) == "" {
		return UpdateBudgetItemParams{}, errors.New("id required")
	}

	category := optionalTrimmedString(req.Category)
	itemName := optionalFirstNonEmpty(req.ItemName, req.Name)
	if category != nil && *category == "" {
		return UpdateBudgetItemParams{}, errors.New("category required")
	}
	if itemName != nil && *itemName == "" {
		return UpdateBudgetItemParams{}, errors.New("item_name required")
	}

	estimatedAmount := optionalFloat(req.EstimatedAmount, req.Budgeted)
	actualAmount := optionalFloat(req.ActualAmount, req.Actual)
	if estimatedAmount != nil && *estimatedAmount < 0 {
		return UpdateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}
	if actualAmount != nil && *actualAmount < 0 {
		return UpdateBudgetItemParams{}, errors.New("amounts must be non-negative")
	}

	return UpdateBudgetItemParams{
		ID:              id,
		WeddingID:       weddingID,
		Category:        category,
		ItemName:        itemName,
		Vendor:          optionalTrimmedString(req.Vendor),
		EstimatedAmount: estimatedAmount,
		ActualAmount:    actualAmount,
		Paid:            req.Paid,
		DueDate:         optionalTrimmedString(req.DueDate),
	}, nil
}
```

- [ ] **Step 13: Compile the backend to catch any missed spots**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./...
```

Expected: no output (clean build). Fix any compile errors before continuing.

- [ ] **Step 14: Commit**

```bash
git add backend/internal/handlers/budget.go
git commit -m "feat: add vendor field to budget_items handler"
```

---

## Task 3: Update tests — vendor in memoryBudgetStore

**Files:**
- Modify: `backend/internal/handlers/budget_test.go`

- [ ] **Step 1: Add Vendor to memoryBudgetStore.CreateBudgetItem**

Find the `CreateBudgetItem` method in `memoryBudgetStore` and add `Vendor`:

```go
func (s *memoryBudgetStore) CreateBudgetItem(_ context.Context, params CreateBudgetItemParams) (BudgetItem, error) {
	now := time.Now().UTC()
	item := normalizeBudgetItem(BudgetItem{
		ID:              fmt.Sprintf("budget-%d", s.nextID),
		WeddingID:       params.WeddingID,
		Category:        params.Category,
		ItemName:        params.ItemName,
		Vendor:          params.Vendor,
		EstimatedAmount: params.EstimatedAmount,
		ActualAmount:    params.ActualAmount,
		Paid:            params.Paid,
		DueDate:         params.DueDate,
		CreatedAt:       now,
		UpdatedAt:       now,
	})
	s.nextID++
	s.byID[item.ID] = item
	return item, nil
}
```

- [ ] **Step 2: Add Vendor handling to memoryBudgetStore.UpdateBudgetItem**

Find the `UpdateBudgetItem` method and add vendor after the DueDate block:

```go
func (s *memoryBudgetStore) UpdateBudgetItem(_ context.Context, params UpdateBudgetItemParams) (BudgetItem, error) {
	item, ok := s.byID[params.ID]
	if !ok {
		return BudgetItem{}, ErrBudgetItemNotFound
	}
	if item.WeddingID != params.WeddingID {
		return BudgetItem{}, ErrForbidden
	}
	if params.Category != nil {
		item.Category = *params.Category
	}
	if params.ItemName != nil {
		item.ItemName = *params.ItemName
	}
	if params.Vendor != nil {
		item.Vendor = params.Vendor
	}
	if params.EstimatedAmount != nil {
		item.EstimatedAmount = *params.EstimatedAmount
	}
	if params.ActualAmount != nil {
		item.ActualAmount = *params.ActualAmount
	}
	if params.Paid != nil {
		item.Paid = *params.Paid
	}
	if params.DueDate != nil {
		item.DueDate = params.DueDate
	}
	item.UpdatedAt = time.Now().UTC()
	item = normalizeBudgetItem(item)
	s.byID[item.ID] = item
	return item, nil
}
```

- [ ] **Step 3: Add a test case verifying vendor is persisted**

Add this test case to the `tests` slice inside `TestBudgetItems`, before the closing brace:

```go
{
	name: "create persists vendor",
	run: func(t *testing.T, h *BudgetHandler, _ *memoryBudgetStore) {
		req := requestWithGuestAuth(
			http.MethodPost,
			"/api/budget/items",
			`{"category":"Catering","item_name":"Dinner","budgeted":5000,"vendor":"Dapur Nusantara"}`,
			"couple", "wed-1",
		)
		rec := httptest.NewRecorder()

		budgetRouter(h).ServeHTTP(rec, req)

		assertStatus(t, rec.Code, http.StatusCreated)
		var got BudgetItem
		decodeBody(t, rec, &got)
		if got.Vendor == nil || *got.Vendor != "Dapur Nusantara" {
			t.Fatalf("vendor = %v; want \"Dapur Nusantara\"", got.Vendor)
		}
	},
},
```

- [ ] **Step 4: Run the tests**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go test ./internal/handlers/... -v -run TestBudgetItems
```

Expected: all test cases PASS, including the new `create persists vendor` case.

- [ ] **Step 5: Commit**

```bash
git add backend/internal/handlers/budget_test.go
git commit -m "test: add vendor field coverage to budget handler tests"
```

---

## Task 4: Register budget routes in Go server

**Files:**
- Modify: `backend/cmd/api/main.go`

- [ ] **Step 1: Add RegisterBudgetRoutes call inside the protected group**

Open `backend/cmd/api/main.go`. Inside the `r.Group(func(r chi.Router) {` block, after `guestHandler.RegisterRoutes(r)`, add:

```go
internalhandlers.RegisterBudgetRoutes(r, pool)
```

The protected group should now look like this at the bottom:

```go
r.Group(func(r chi.Router) {
    r.Use(authmw.AuthMiddleware(jwksURL))
    r.Use(func(next http.Handler) http.Handler {
        // ... existing user-id / couple-auth middleware unchanged ...
    })

    r.Get("/api/dashboard", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok", "message": "authenticated"})
    })
    r.Post("/api/invitations", invHandler.Create)
    r.Patch("/api/invitations/{id}", invHandler.Update)
    r.Delete("/api/invitations/{id}", invHandler.Delete)
    guestHandler.RegisterRoutes(r)
    internalhandlers.RegisterBudgetRoutes(r, pool)  // ← new line
})
```

- [ ] **Step 2: Build to confirm no compile errors**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./cmd/api/...
```

Expected: clean build, no output.

- [ ] **Step 3: Start the backend and smoke-test the route**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go run ./cmd/api/main.go &
```

Test that the route exists (will return 403 since no JWT is present — that is correct):

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/budget/summary
```

Expected output: `403` (forbidden — route is registered and auth is working).

Stop the background server: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add backend/cmd/api/main.go
git commit -m "feat: register budget routes in api server"
```

---

## Task 5: Frontend API layer — lib/api/budget.ts

**Files:**
- Create: `frontend/lib/api/budget.ts`

- [ ] **Step 1: Create the file**

```ts
import { authClient } from '@/lib/auth-client';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export type BudgetCategorySummary = {
  name: string;
  budgeted: number;
  actual: number;
  overspend: boolean;
};

export type BudgetSummary = {
  total_budgeted: number;
  total_actual: number;
  overspend: boolean;
  categories: BudgetCategorySummary[];
};

export type CreateBudgetItemInput = {
  category: string;
  item_name: string;
  vendor?: string;
  estimated_amount: number;
  actual_amount: number;
  paid: boolean;
};

export type BudgetItem = {
  id: string;
  category: string;
  item_name: string;
  vendor?: string | null;
  estimated_amount: number;
  actual_amount: number;
  paid: boolean;
};

async function getToken(): Promise<string | null> {
  const { data } = await authClient.getToken();
  return data?.token ?? null;
}

async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function fetchBudgetSummary(): Promise<BudgetSummary> {
  const res = await authedFetch(`${BASE}/api/budget/summary`);
  if (!res.ok) throw new Error(`Budget summary fetch failed: ${res.status}`);
  return res.json();
}

export async function createBudgetItem(params: CreateBudgetItemInput): Promise<BudgetItem> {
  const res = await authedFetch(`${BASE}/api/budget/items`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Create budget item failed: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/pangkywaradjodi/rimba/frontend
npx tsc --noEmit
```

Expected: no errors related to `lib/api/budget.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/api/budget.ts
git commit -m "feat: add budget API client with JWT auth"
```

---

## Task 6: Rewrite BudgetPage.tsx

**Files:**
- Modify: `frontend/components/dashboard/BudgetPage.tsx`

Replace the entire file contents with the following. This removes all mock data and wires real API calls.

- [ ] **Step 1: Replace BudgetPage.tsx**

```tsx
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AddCircle,
  DangerTriangle,
} from '@solar-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchBudgetSummary,
  createBudgetItem,
  type BudgetCategorySummary,
} from '@/lib/api/budget';

const FIXED_CATEGORIES = [
  'Venue',
  'Catering',
  'Attire',
  'Decoration & Florist',
  'Photo & Video',
  'Entertainment & MC',
  'Others',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Venue': 'bg-clay-teal',
  'Catering': 'bg-clay-pink',
  'Attire': 'bg-clay-ochre',
  'Decoration & Florist': 'bg-clay-lavender',
  'Photo & Video': 'bg-clay-peach',
  'Entertainment & MC': 'bg-[#7dd3fc]',
  'Others': 'bg-[#d1d5db]',
};

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function mergeWithFixed(apiCategories: BudgetCategorySummary[]): BudgetCategorySummary[] {
  const byName = new Map(apiCategories.map(c => [c.name, c]));
  return FIXED_CATEGORIES.map(name =>
    byName.get(name) ?? { name, budgeted: 0, actual: 0, overspend: false }
  );
}

type PaymentStatus = 'unpaid' | 'partial' | 'paid';

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Belum Bayar',
  partial: 'DP',
  paid: 'Lunas',
};

function AddItemModal({
  isOpen,
  onClose,
  defaultCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>(defaultCategory ?? FIXED_CATEGORIES[0]);
  const [itemName, setItemName] = useState('');
  const [vendor, setVendor] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory ?? FIXED_CATEGORIES[0]);
    }
  }, [isOpen, defaultCategory]);

  const mutation = useMutation({
    mutationFn: createBudgetItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary'] });
      onClose();
      setItemName('');
      setVendor('');
      setEstimatedAmount('');
      setActualAmount('');
      setPaymentStatus('unpaid');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      category,
      item_name: itemName,
      vendor: vendor.trim() || undefined,
      estimated_amount: parseFloat(estimatedAmount) || 0,
      actual_amount: parseFloat(actualAmount) || 0,
      paid: paymentStatus === 'paid',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-8 pt-6">
        <h2 className="font-amoria text-2xl text-clay-ink mb-6">Add Budget Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-poppins text-xs text-clay-ink/60 mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full font-poppins text-sm text-clay-ink border border-[#0a0a0a]/8 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-clay-teal/30"
            >
              {FIXED_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-poppins text-xs text-clay-ink/60 mb-1.5 block">Item Name *</label>
            <Input
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="e.g. Catering (300 pax)"
              required
            />
          </div>

          <div>
            <label className="font-poppins text-xs text-clay-ink/60 mb-1.5 block">Vendor / Notes</label>
            <Input
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              placeholder="e.g. Dapur Nusantara"
            />
          </div>

          <div>
            <label className="font-poppins text-xs text-clay-ink/60 mb-1.5 block">Budgeted Amount (IDR) *</label>
            <Input
              type="number"
              value={estimatedAmount}
              onChange={e => setEstimatedAmount(e.target.value)}
              placeholder="15000000"
              min="0"
              required
            />
          </div>

          <div>
            <label className="font-poppins text-xs text-clay-ink/60 mb-1.5 block">Actual Amount (IDR)</label>
            <Input
              type="number"
              value={actualAmount}
              onChange={e => setActualAmount(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="font-poppins text-xs text-clay-ink/60 mb-1.5 block">Payment Status</label>
            <div className="flex rounded-xl overflow-hidden border border-[#0a0a0a]/8">
              {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map((status, i) => {
                const isActive = paymentStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPaymentStatus(status)}
                    className={`flex-1 py-2.5 font-poppins text-xs font-medium transition-colors ${
                      isActive
                        ? status === 'paid'
                          ? 'bg-[#22c55e] text-white'
                          : status === 'partial'
                          ? 'bg-clay-ochre text-white'
                          : 'bg-clay-surface-strong text-clay-ink'
                        : 'bg-white text-clay-ink/50 hover:bg-clay-surface-strong/30'
                    } ${i > 0 ? 'border-l border-[#0a0a0a]/8' : ''}`}
                  >
                    {PAYMENT_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Add Item'}
          </Button>

          {mutation.isError && (
            <p className="font-poppins text-xs text-[#ef4444] text-center mt-1">
              Failed to add item. Please try again.
            </p>
          )}
        </form>
      </div>
    </Modal>
  );
}

function BudgetSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-[24px]" />)}
      </div>
      <div className="space-y-3">
        {FIXED_CATEGORIES.map(name => (
          <Skeleton key={name} className="h-[76px] rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const t = useTranslations('Dashboard');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<string | undefined>(undefined);

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['budget', 'summary'],
    queryFn: fetchBudgetSummary,
  });

  const openModal = (defaultCategory?: string) => {
    setModalDefaultCategory(defaultCategory);
    setModalOpen(true);
  };

  if (isLoading) return <BudgetSkeleton />;

  if (isError) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <p className="font-poppins text-sm text-clay-ink/50">
          Failed to load budget data. Please refresh.
        </p>
      </div>
    );
  }

  const categories = mergeWithFixed(summary?.categories ?? []);
  const totalAllocated = summary?.total_budgeted ?? 0;
  const totalActual = summary?.total_actual ?? 0;
  const totalRemaining = totalAllocated - totalActual;
  const overallPct = totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 100) : 0;
  const isOverBudget = summary?.overspend ?? false;

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-amoria text-3xl md:text-4xl text-clay-ink tracking-tight mb-1">
            {t('budget')}
          </h1>
          <p className="font-poppins text-sm text-clay-ink/40">
            {t('budgetDesc')}
          </p>
        </div>
        <Button size="sm" className="gap-2 self-start" onClick={() => openModal()}>
          <AddCircle size={14} weight="Bold" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-clay-teal text-clay-canvas rounded-[24px] p-6">
          <p className="font-poppins text-[10px] uppercase opacity-50 mb-3">
            {t('totalBudget')}
          </p>
          <p className="font-amoria text-3xl leading-none mb-2">{formatRupiah(totalAllocated)}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white/80" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="font-poppins text-[11px] opacity-70">{overallPct}%</span>
          </div>
        </div>

        <div className="bg-clay-pink text-white rounded-[24px] p-6">
          <p className="font-poppins text-[10px] uppercase opacity-50 mb-3">
            {t('totalSpent')}
          </p>
          <p className="font-amoria text-3xl leading-none">{formatRupiah(totalActual)}</p>
        </div>

        <div className={`rounded-[24px] p-6 border ${
          isOverBudget
            ? 'bg-[#ef4444]/5 border-[#ef4444]/20'
            : 'bg-clay-surface-card border-[#0a0a0a]/8'
        }`}>
          <p className={`font-poppins text-[10px] uppercase mb-3 ${
            isOverBudget ? 'text-[#ef4444]/60' : 'text-clay-ink/40'
          }`}>
            {t('remaining')}
          </p>
          <p className={`font-amoria text-3xl leading-none ${
            isOverBudget ? 'text-[#ef4444]' : 'text-clay-ink'
          }`}>
            {formatRupiah(totalRemaining)}
          </p>
          {isOverBudget && (
            <div className="flex items-center gap-1.5 mt-2">
              <DangerTriangle size={12} weight="Bold" className="text-[#ef4444]" />
              <span className="font-poppins text-[10px] text-[#ef4444] font-medium">
                {t('overBudget')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {categories.map(category => {
          const isExpanded = expandedId === category.name;
          const pct = category.budgeted > 0
            ? Math.round((category.actual / category.budgeted) * 100)
            : 0;
          const color = CATEGORY_COLORS[category.name] ?? CATEGORY_COLORS['Others'];

          return (
            <div
              key={category.name}
              className={`bg-clay-surface-card rounded-[24px] border overflow-hidden transition-all ${
                category.overspend ? 'border-[#ef4444]/30' : 'border-[#0a0a0a]/8'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : category.name)}
                className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-clay-surface-strong/20 transition-colors"
              >
                <span className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-poppins font-semibold text-sm text-clay-ink">
                      {category.name}
                    </h3>
                    <span className={`font-poppins text-xs ml-2 ${
                      category.overspend ? 'text-[#ef4444]' : 'text-clay-ink/40'
                    }`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-clay-surface-strong/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        category.overspend ? 'bg-[#ef4444]' : color
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-poppins text-[11px] text-clay-ink/40">
                      {formatRupiah(category.actual)} / {formatRupiah(category.budgeted)}
                    </span>
                    {category.overspend && (
                      <DangerTriangle size={11} weight="Bold" className="text-[#ef4444]" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[#0a0a0a]/6 bg-clay-canvas/50">
                  <div className="px-6 py-3">
                    <button
                      onClick={() => openModal(category.name)}
                      className="flex items-center gap-2 text-clay-ink/30 hover:text-clay-ink/60 transition-colors"
                    >
                      <AddCircle size={13} weight="Bold" />
                      <span className="font-poppins text-xs font-medium">{t('addItem')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultCategory={modalDefaultCategory}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/pangkywaradjodi/rimba/frontend
npx tsc --noEmit
```

Expected: no errors in `BudgetPage.tsx` or `lib/api/budget.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/dashboard/BudgetPage.tsx
git commit -m "feat: wire BudgetPage to live API with useQuery and AddItemModal"
```

---

## Task 7: End-to-end smoke test

- [ ] **Step 1: Start both servers**

Terminal 1 — Go backend:
```bash
cd /Users/pangkywaradjodi/rimba/backend
go run ./cmd/api/main.go
```

Terminal 2 — Next.js frontend:
```bash
cd /Users/pangkywaradjodi/rimba/frontend
npm run dev
```

- [ ] **Step 2: Open the budget page and verify loading state**

Navigate to `http://localhost:3000/dashboard/budget` (or the locale-prefixed path in use).

Expected: skeleton shimmer renders briefly, then the 7 category cards appear with 0/0 totals (no items yet).

- [ ] **Step 3: Add 3 items across 2 categories**

1. Click **Add Item** → select `Catering`, name `Catering (300 pax)`, vendor `Dapur Nusantara`, budgeted `15000000`, actual `0`. Submit.
2. Click **Add Item** → select `Catering`, name `Snacks Break`, vendor `Kue Ibu`, budgeted `3000000`, actual `3500000`. Submit.
3. Click **Add Item** → select `Venue`, name `Grand Ballroom`, vendor `Hotel Mulia`, budgeted `20000000`, actual `0`. Submit.

After each add: the modal closes and the cards refresh automatically.

- [ ] **Step 4: Verify totals and overspend**

Expected state after 3 items:
- **Catering card**: shows `Rp 3.500.000 / Rp 18.000.000` (18jt budgeted, 3.5jt actual). `overspend: true` because Snacks Break actual (3.5jt) > budgeted (3jt). Red border, red progress bar.
- **Venue card**: shows `Rp 0 / Rp 20.000.000`. No overspend.
- **Total Spent** card: `Rp 3.500.000`.
- **Remaining** card: `Rp 34.500.000`.

- [ ] **Step 5: Measure summary endpoint latency**

```bash
curl -s -o /dev/null -w "Time: %{time_total}s\n" \
  -H "Authorization: Bearer $(curl -s -X POST http://localhost:3000/api/auth/token ... | jq -r .token)" \
  http://localhost:8080/api/budget/summary
```

(Or check Next.js network tab in DevTools — look for `/api/budget/summary` XHR.)

If `time_total` > 0.300 seconds, proceed to Task 8. Otherwise skip it.

---

## Task 8: DB index (conditional — only if summary > 300ms)

- [ ] **Step 1: Apply the covering index**

```bash
psql "$DATABASE_URL" -c "CREATE INDEX IF NOT EXISTS budget_items_wedding_id_idx ON budget_items(wedding_id);"
```

Expected:
```
CREATE INDEX
```

- [ ] **Step 2: Re-measure latency**

Repeat the curl from Task 7 Step 5. Expected: response time now < 100ms.

- [ ] **Step 3: Add the index to the migration file for future deploys**

Append to `db/migrations/00003_budget_items_vendor.sql`:

```sql
-- +goose Up
ALTER TABLE budget_items ADD COLUMN vendor text;
CREATE INDEX IF NOT EXISTS budget_items_wedding_id_idx ON budget_items(wedding_id);

-- +goose Down
DROP INDEX IF EXISTS budget_items_wedding_id_idx;
ALTER TABLE budget_items DROP COLUMN vendor;
```

- [ ] **Step 4: Commit**

```bash
git add db/migrations/00003_budget_items_vendor.sql
git commit -m "perf: add index on budget_items(wedding_id)"
```
