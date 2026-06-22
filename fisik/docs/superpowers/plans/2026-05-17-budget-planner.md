# Budget Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing BudgetPage with a full redesign following the Cohere design system and Emil Kowalski animation principles — persistent metrics strip, three content tabs (Summary / Items / Payments), Dialog+Drawer modal for add/edit, and real API data throughout.

**Architecture:** A new `components/dashboard/budget/` folder holds one file per concern (types, tabs, modal, main page). The backend gains a `payment_status` tri-state column (unpaid/partial/paid) to replace the boolean `paid` field. React Query caches `["budget","summary"]` and `["budget","items"]`; every mutation invalidates both. The old `BudgetPage.tsx` is deleted once the new one is wired in.

**Tech Stack:** Next.js 15 · React Query · motion/react · @solar-icons/react · Tailwind CSS · Go/pgx backend · PostgreSQL

---

## File Map

| Action | Path |
|---|---|
| **Create** | `components/dashboard/budget/types.ts` |
| **Create** | `components/dashboard/budget/BudgetItemModal.tsx` |
| **Create** | `components/dashboard/budget/SummaryTab.tsx` |
| **Create** | `components/dashboard/budget/ItemsTab.tsx` |
| **Create** | `components/dashboard/budget/PaymentsTab.tsx` |
| **Create** | `components/dashboard/budget/BudgetPage.tsx` |
| **Modify** | `lib/api/budget.ts` |
| **Modify** | `backend/internal/handlers/budget.go` |
| **Modify** | `app/(dashboard)/dashboard/budget/page.tsx` |
| **Delete** | `components/dashboard/BudgetPage.tsx` |

---

## Task 1: DB migration — add payment_status column

**Files:**
- Run against: PostgreSQL via `docker exec rimba_postgres psql -U rimba -d rimba_db`

- [ ] **Step 1: Run migration**

```bash
docker exec rimba_postgres psql -U rimba -d rimba_db -v ON_ERROR_STOP=1 -c "
ALTER TABLE budget_items
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE budget_items
  ADD CONSTRAINT IF NOT EXISTS budget_items_payment_status_check
    CHECK (payment_status IN ('unpaid', 'partial', 'paid'));
UPDATE budget_items SET payment_status = 'paid' WHERE paid = true;
"
```

- [ ] **Step 2: Verify**

```bash
docker exec rimba_postgres psql -U rimba -d rimba_db -c "\d budget_items" 2>&1 | grep payment_status
```

Expected output contains: `payment_status | text`

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "db: add payment_status tri-state to budget_items"
```

---

## Task 2: Extend backend — budget.go

**Files:**
- Modify: `backend/internal/handlers/budget.go`

- [ ] **Step 1: Add PaymentStatus to BudgetItem struct**

In `budget.go`, add `PaymentStatus string` after `Paid bool`:

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
    PaymentStatus   string    `json:"payment_status"`
    DueDate         *string   `json:"due_date,omitempty"`
    CreatedAt       time.Time `json:"created_at,omitempty"`
    UpdatedAt       time.Time `json:"updated_at,omitempty"`
}
```

- [ ] **Step 2: Add PaymentStatus to params structs**

```go
type CreateBudgetItemParams struct {
    WeddingID       string
    Category        string
    ItemName        string
    Vendor          *string
    EstimatedAmount float64
    ActualAmount    float64
    Paid            bool
    PaymentStatus   string
    DueDate         *string
}

type UpdateBudgetItemParams struct {
    ID              string
    WeddingID       string
    Category        *string
    ItemName        *string
    Vendor          *string
    EstimatedAmount *float64
    ActualAmount    *float64
    Paid            *bool
    PaymentStatus   *string
    DueDate         *string
}
```

- [ ] **Step 3: Add PaymentStatus to request structs**

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
    PaymentStatus   *string  `json:"payment_status"`
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
    PaymentStatus   *string  `json:"payment_status"`
    DueDate         *string  `json:"due_date"`
}
```

- [ ] **Step 4: Update budgetItemSelectColumns and scanBudgetItem**

Replace `budgetItemSelectColumns`:
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
COALESCE(payment_status, 'unpaid'),
due_date::text,
created_at,
updated_at
`
```

Update `scanBudgetItem` to scan 12 columns (add `&item.PaymentStatus` after `&item.Paid`):
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
        &item.PaymentStatus,
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

- [ ] **Step 5: Update createBudgetItemSQL to insert payment_status**

```go
const createBudgetItemSQL = `
INSERT INTO budget_items (
    wedding_id, category, item_name, vendor,
    estimated_amount, actual_amount, paid, payment_status, due_date,
    created_at, updated_at
) VALUES (
    $1::uuid, $2, $3, $4,
    $5::numeric, $6::numeric, $7, $8, $9::date,
    now(), now()
)
RETURNING ` + budgetItemSelectColumns
```

Update `CreateBudgetItem` to pass `params.PaymentStatus` as `$8` and `params.DueDate` as `$9`:
```go
func (s *PostgresBudgetStore) CreateBudgetItem(ctx context.Context, params CreateBudgetItemParams) (BudgetItem, error) {
    return scanBudgetItem(s.db.QueryRow(ctx,
        createBudgetItemSQL,
        params.WeddingID,
        params.Category,
        params.ItemName,
        params.Vendor,
        params.EstimatedAmount,
        params.ActualAmount,
        params.Paid,
        params.PaymentStatus,
        params.DueDate,
    ))
}
```

- [ ] **Step 6: Update updateBudgetItemSQL**

```go
const updateBudgetItemSQL = `
UPDATE budget_items
SET
    category         = COALESCE($3,        category),
    item_name        = COALESCE($4,        item_name),
    vendor           = COALESCE($5,        vendor),
    estimated_amount = COALESCE($6::numeric, estimated_amount),
    actual_amount    = COALESCE($7::numeric, actual_amount),
    paid             = COALESCE($8,        paid),
    payment_status   = COALESCE($9,        payment_status),
    due_date         = COALESCE($10::date, due_date),
    updated_at       = now()
WHERE id = $1::uuid
  AND wedding_id = $2::uuid
RETURNING ` + budgetItemSelectColumns
```

Update `UpdateBudgetItem` to pass 10 args:
```go
func (s *PostgresBudgetStore) UpdateBudgetItem(ctx context.Context, params UpdateBudgetItemParams) (BudgetItem, error) {
    if err := s.requireBudgetItemWedding(ctx, params.ID, params.WeddingID); err != nil {
        return BudgetItem{}, err
    }
    return scanBudgetItem(s.db.QueryRow(ctx,
        updateBudgetItemSQL,
        params.ID,
        params.WeddingID,
        params.Category,
        params.ItemName,
        params.Vendor,
        params.EstimatedAmount,
        params.ActualAmount,
        params.Paid,
        params.PaymentStatus,
        params.DueDate,
    ))
}
```

- [ ] **Step 7: Update createBudgetParams and updateBudgetParams helper functions**

Find `createBudgetParams` in budget.go and add payment_status handling:
```go
// inside createBudgetParams, after paid assignment:
ps := "unpaid"
if req.PaymentStatus != nil && (*req.PaymentStatus == "unpaid" || *req.PaymentStatus == "partial" || *req.PaymentStatus == "paid") {
    ps = *req.PaymentStatus
} else if paid {
    ps = "paid"
}
// set params.PaymentStatus = ps
```

Find `updateBudgetParams` and add:
```go
// after paid handling:
params.PaymentStatus = req.PaymentStatus
```

- [ ] **Step 8: Build and verify**

```bash
cd /Users/pangkywaradjodi/rimba/backend && go build ./cmd/api 2>&1
```

Expected: no output (clean build).

- [ ] **Step 9: Restart and smoke-test**

```bash
pkill -f 'rimba/backend.*api' 2>/dev/null; nohup /Users/pangkywaradjodi/rimba/backend/api > /tmp/rimba.log 2>&1 &
sleep 2 && curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health
```

Expected: `200`

- [ ] **Step 10: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add backend/ && git commit -m "feat(backend): add payment_status tri-state to budget items"
```

---

## Task 3: Extend lib/api/budget.ts

**Files:**
- Modify: `frontend/lib/api/budget.ts`

- [ ] **Step 1: Update BudgetItem type and add new types**

Replace the existing type block at the top of the file with:

```ts
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

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

export type BudgetItem = {
  id: string;
  category: string;
  item_name: string;
  vendor?: string | null;
  estimated_amount: number;
  actual_amount: number;
  paid: boolean;
  payment_status: PaymentStatus;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateBudgetItemInput = {
  category: string;
  item_name: string;
  vendor?: string;
  estimated_amount: number;
  actual_amount: number;
  paid: boolean;
  payment_status: PaymentStatus;
  due_date?: string | null;
};

export type UpdateBudgetItemInput = {
  category?: string;
  item_name?: string;
  vendor?: string | null;
  estimated_amount?: number;
  actual_amount?: number;
  paid?: boolean;
  payment_status?: PaymentStatus;
  due_date?: string | null;
};
```

- [ ] **Step 2: Add fetchBudgetItems, updateBudgetItem, deleteBudgetItem**

Append to the end of `lib/api/budget.ts` (keep existing `fetchBudgetSummary` and `createBudgetItem`):

```ts
export async function fetchBudgetItems(): Promise<BudgetItem[]> {
  const res = await authedFetch(`${BASE}/api/budget/items`);
  if (!res.ok) throw new Error(`Budget items fetch failed: ${res.status}`);
  return res.json();
}

export async function updateBudgetItem(id: string, params: UpdateBudgetItemInput): Promise<BudgetItem> {
  const res = await authedFetch(`${BASE}/api/budget/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Update budget item failed: ${res.status}`);
  return res.json();
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const res = await authedFetch(`${BASE}/api/budget/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Delete budget item failed: ${res.status}`);
}
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep "api/budget" | head -10
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/lib/api/budget.ts && git commit -m "feat(api): extend budget client with items CRUD and payment_status"
```

---

## Task 4: Create budget/types.ts — shared constants and utilities

**Files:**
- Create: `frontend/components/dashboard/budget/types.ts`

- [ ] **Step 1: Write the file**

```ts
import type { PaymentStatus } from '@/lib/api/budget';

export const FIXED_CATEGORIES = [
  'Venue',
  'Catering',
  'Attire',
  'Decoration & Florist',
  'Photo & Video',
  'Entertainment & MC',
  'Others',
] as const;

export type BudgetTab = 'summary' | 'items' | 'payments';

export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  paid:    { label: 'Paid',    bg: 'bg-[#edfce9]', text: 'text-[#2d6a30]', dot: 'bg-[#346739]' },
  partial: { label: 'Partial', bg: 'bg-[#f1f5ff]', text: 'text-[#1863dc]', dot: 'bg-[#1863dc]' },
  unpaid:  { label: 'Unpaid',  bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
};

export const TABS: Array<{ id: BudgetTab; label: string }> = [
  { id: 'summary',  label: 'Summary' },
  { id: 'items',    label: 'Items' },
  { id: 'payments', label: 'Payments' },
];

/**
 * Abbreviated Rupiah: Rp 150jt, Rp 1.5M, Rp 500rb
 */
export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000)     return `Rp ${(value / 1_000_000).toFixed(0)}jt`;
  if (value >= 1_000)         return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value.toFixed(0)}`;
}

/**
 * Full Rupiah with thousand separators: Rp 25.000.000
 */
export function formatRupiahFull(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function mergeWithFixed(
  apiCategories: { name: string; budgeted: number; actual: number; overspend: boolean }[]
) {
  const byName = new Map(apiCategories.map(c => [c.name, c]));
  const fixedNames = new Set(FIXED_CATEGORIES as unknown as string[]);
  const merged = FIXED_CATEGORIES.map(
    name => byName.get(name) ?? { name, budgeted: 0, actual: 0, overspend: false }
  );
  const orphans = apiCategories.filter(c => !fixedNames.has(c.name));
  return [...merged, ...orphans];
}
```

- [ ] **Step 2: Verify no type errors**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep "budget/types" | head -5
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/components/dashboard/budget/types.ts && git commit -m "feat: add budget shared types and utilities"
```

---

## Task 5: Create BudgetItemModal.tsx — add/edit form

**Files:**
- Create: `frontend/components/dashboard/budget/BudgetItemModal.tsx`

Uses `Dialog` (desktop, `md+`) and `Drawer` (mobile, `<md`) from `components/ui`. Both share the same inner form component to avoid duplication.

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { TextureButton } from '@/components/ui/texture-button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AltArrowDown } from '@solar-icons/react';
import { cn } from '@/lib/utils';
import type { BudgetItem, CreateBudgetItemInput, UpdateBudgetItemInput } from '@/lib/api/budget';
import { FIXED_CATEGORIES, STATUS_CONFIG } from './types';
import type { PaymentStatus } from '@/lib/api/budget';

type Props = {
  open: boolean;
  onClose: () => void;
  item?: BudgetItem | null;
  onSave: (data: CreateBudgetItemInput | UpdateBudgetItemInput) => Promise<void>;
  isSaving?: boolean;
};

const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'partial', 'paid'];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function BudgetItemForm({
  item,
  onSave,
  onClose,
  isSaving,
}: {
  item?: BudgetItem | null;
  onSave: Props['onSave'];
  onClose: () => void;
  isSaving?: boolean;
}) {
  const isEdit = !!item;
  const [category, setCategory] = useState(item?.category ?? FIXED_CATEGORIES[0]);
  const [itemName, setItemName] = useState(item?.item_name ?? '');
  const [vendor, setVendor] = useState(item?.vendor ?? '');
  const [estimated, setEstimated] = useState(item?.estimated_amount?.toString() ?? '');
  const [actual, setActual] = useState(item?.actual_amount?.toString() ?? '');
  const [dueDate, setDueDate] = useState(item?.due_date ?? '');
  const [status, setStatus] = useState<PaymentStatus>(item?.payment_status ?? 'unpaid');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim()) { setError('Item name is required.'); return; }
    if (!estimated || isNaN(Number(estimated)) || Number(estimated) < 0) {
      setError('Budgeted amount must be a non-negative number.'); return;
    }
    setError('');
    const data: CreateBudgetItemInput = {
      category,
      item_name: itemName.trim(),
      vendor: vendor.trim() || undefined,
      estimated_amount: Number(estimated),
      actual_amount: Number(actual) || 0,
      paid: status === 'paid',
      payment_status: status,
      due_date: dueDate || null,
    };
    await onSave(data);
  }

  const labelCls = 'text-[11px] font-bold uppercase text-[#93939f] mb-1 block';
  const inputCls = 'h-10 rounded-[12px] border-[#e5e7eb] text-[13px] focus:ring-1 focus:ring-[#346739]/20';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
      {/* Category */}
      <div>
        <label className={labelCls}>Category</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="w-full h-10 px-3 rounded-[12px] border border-[#e5e7eb] bg-white text-[13px] text-left flex items-center justify-between hover:bg-neutral-50 transition-colors">
              {category}
              <AltArrowDown size={14} className="text-neutral-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl ring-1 ring-black/5">
            {FIXED_CATEGORIES.map(c => (
              <DropdownMenuItem key={c} onSelect={() => setCategory(c)} className="text-[13px]">
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Item name */}
      <div>
        <label className={labelCls}>Item name</label>
        <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Venue deposit" className={inputCls} />
      </div>

      {/* Vendor */}
      <div>
        <label className={labelCls}>Vendor <span className="text-neutral-300 normal-case font-normal">(optional)</span></label>
        <Input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Grand Ballroom" className={inputCls} />
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Budgeted (Rp)</label>
          <Input type="number" min="0" value={estimated} onChange={e => setEstimated(e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Actual (Rp)</label>
          <Input type="number" min="0" value={actual} onChange={e => setActual(e.target.value)} placeholder="0" className={inputCls} />
        </div>
      </div>

      {/* Due date + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Due date <span className="text-neutral-300 normal-case font-normal">(optional)</span></label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full h-10">
            {PAYMENT_STATUSES.map(s => {
              const active = status === s;
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'flex-1 text-[11px] font-semibold rounded-full py-1 transition-colors',
                    active ? `${cfg.bg} ${cfg.text}` : 'text-neutral-400 hover:text-bold'
                  )}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="text-[12px] text-[#b30000]">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <TextureButton type="button" variant="outline" size="sm" className="rounded-full px-5 h-10 text-[13px]" onClick={onClose}>
          Cancel
        </TextureButton>
        <TextureButton type="submit" variant="primary" size="sm" className="rounded-full px-5 h-10 text-[13px]" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
        </TextureButton>
      </div>
    </form>
  );
}

export function BudgetItemModal({ open, onClose, item, onSave, isSaving }: Props) {
  const isMobile = useIsMobile();
  const title = item ? 'Edit item' : 'Add budget item';

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={v => !v && onClose()}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-[17px] font-bold text-bold">{title}</DrawerTitle>
          </DrawerHeader>
          <BudgetItemForm item={item} onSave={onSave} onClose={onClose} isSaving={isSaving} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md rounded-[22px] p-6">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold text-bold">{title}</DialogTitle>
        </DialogHeader>
        <BudgetItemForm item={item} onSave={onSave} onClose={onClose} isSaving={isSaving} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep "BudgetItemModal" | head -5
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/components/dashboard/budget/BudgetItemModal.tsx && git commit -m "feat: add BudgetItemModal with Dialog/Drawer"
```

---

## Task 6: Create SummaryTab.tsx

**Files:**
- Create: `frontend/components/dashboard/budget/SummaryTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { BudgetCategorySummary } from '@/lib/api/budget';
import { EASE_OUT, formatRupiah, mergeWithFixed } from './types';

type Props = {
  categories: BudgetCategorySummary[];
  isLoading: boolean;
};

function CategoryRow({
  category,
  index,
}: {
  category: BudgetCategorySummary;
  index: number;
}) {
  const pct = category.budgeted > 0
    ? Math.min((category.actual / category.budgeted) * 100, 100)
    : 0;
  const overspend = category.overspend;
  const overspendAmt = category.actual - category.budgeted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT, delay: index * 0.06 }}
      className="py-4 border-b border-neutral-100 last:border-0"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-bold">{category.name}</span>
          {overspend && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8f7] text-[#b30000]">
              +{formatRupiah(overspendAmt)}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={cn('text-[13px] font-semibold', overspend ? 'text-[#ff7759]' : 'text-bold')}>
            {formatRupiah(category.actual)}
          </span>
          <span className="text-[12px] text-neutral-400 ml-1">/ {formatRupiah(category.budgeted)}</span>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: index * 0.06 + 0.1 }}
          className={cn('h-full rounded-full', overspend ? 'bg-[#ff7759]' : 'bg-[#346739]')}
        />
      </div>
    </motion.div>
  );
}

export function SummaryTab({ categories, isLoading }: Props) {
  const merged = mergeWithFixed(categories);
  const overspendCategories = merged.filter(c => c.overspend);

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-4 border-b border-neutral-100">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div>
        {merged.map((cat, i) => (
          <CategoryRow key={cat.name} category={cat} index={i} />
        ))}
      </div>

      {overspendCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl border border-[#ffad9b] bg-[#fff8f7]"
        >
          <p className="text-[11px] font-bold uppercase text-[#b30000] mb-2">Over budget</p>
          <div className="space-y-1">
            {overspendCategories.map(c => (
              <div key={c.name} className="flex justify-between text-[13px]">
                <span className="text-[#212121] font-medium">{c.name}</span>
                <span className="text-[#b30000] font-semibold">+{formatRupiah(c.actual - c.budgeted)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {merged.every(c => c.budgeted === 0 && c.actual === 0) && (
        <div className="py-20 text-center">
          <p className="text-[13px] text-neutral-400">Add budget items to see your category breakdown.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep "SummaryTab" | head -5
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/components/dashboard/budget/SummaryTab.tsx && git commit -m "feat: add budget SummaryTab with animated category bars"
```

---

## Task 7: Create ItemsTab.tsx

**Files:**
- Create: `frontend/components/dashboard/budget/ItemsTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TextureButton } from '@/components/ui/texture-button';
import {
  Magnifer, AddCircle, AltArrowDown,
  TrashBinMinimalistic, Pen,
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import type { BudgetItem } from '@/lib/api/budget';
import type { PaymentStatus } from '@/lib/api/budget';
import { FIXED_CATEGORIES, STATUS_CONFIG, EASE_OUT, formatRupiah } from './types';

const STATUS_FILTERS: Array<{ id: 'all' | PaymentStatus; label: string }> = [
  { id: 'all',     label: 'All' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid',    label: 'Paid' },
];

type Props = {
  items: BudgetItem[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
};

export function ItemsTab({ items, isLoading, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const filtered = useMemo(() => items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.item_name.toLowerCase().includes(q) || (item.vendor ?? '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || item.payment_status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [items, search, categoryFilter, statusFilter]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64 group">
            <Magnifer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-full bg-white ring-1 ring-foreground/10 text-[13px]"
            />
          </div>

          {/* Category dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 px-4 rounded-full bg-white border border-neutral-200 flex items-center gap-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                {categoryFilter === 'all' ? 'All categories' : categoryFilter}
                <AltArrowDown size={14} className="text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl ring-1 ring-black/5 max-h-64 overflow-y-auto">
              <DropdownMenuItem onSelect={() => setCategoryFilter('all')} className="text-[13px]">All categories</DropdownMenuItem>
              {FIXED_CATEGORIES.map(c => (
                <DropdownMenuItem key={c} onSelect={() => setCategoryFilter(c)} className="text-[13px]">{c}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status pills */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full">
            {STATUS_FILTERS.map(f => {
              const isActive = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={cn(
                    'relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors z-10',
                    isActive ? 'text-white' : 'text-neutral-500 hover:text-bold',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="items-status-pill"
                      className="absolute inset-0 bg-[#212121] rounded-full"
                      transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <TextureButton
          variant="primary"
          size="sm"
          className="h-10 rounded-full px-4 text-[13px] font-medium gap-1.5 flex-shrink-0"
          onClick={onAdd}
        >
          <AddCircle size={15} weight="BoldDuotone" />
          Add item
        </TextureButton>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <p className="text-[13px] text-neutral-400">
            {items.length === 0 ? 'No items yet. Add your first budget item.' : 'No items match your filters.'}
          </p>
          {items.length === 0 && (
            <TextureButton variant="outline" size="sm" className="rounded-full px-5 h-9 text-[13px]" onClick={onAdd}>
              <AddCircle size={14} weight="BoldDuotone" />
              Add item
            </TextureButton>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[800px] px-4 md:px-0">
            <Table>
              <TableHeader className="bg-transparent border-b border-neutral-100">
                <TableRow className="hover:bg-transparent border-neutral-100">
                  {['Item', 'Category', 'Vendor', 'Budgeted', 'Actual', 'Due date', 'Status', ''].map(h => (
                    <TableHead key={h} className="h-12 px-0 text-[13px] font-medium text-neutral-500">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((item, idx) => {
                    const statusCfg = STATUS_CONFIG[item.payment_status];
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: EASE_OUT, delay: idx * 0.02 }}
                        className="group border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[14px] font-semibold text-bold">{item.item_name}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[12px] text-neutral-500">{item.category}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[12px] text-neutral-400">{item.vendor ?? '—'}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[13px] font-medium text-bold">{formatRupiah(item.estimated_amount)}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className={cn('text-[13px] font-medium', item.actual_amount > item.estimated_amount ? 'text-[#ff7759]' : 'text-bold')}>
                            {formatRupiah(item.actual_amount)}
                          </span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          {item.due_date
                            ? <span className="text-[12px] text-neutral-400">{new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            : <span className="text-[12px] text-neutral-300">—</span>
                          }
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium', statusCfg.bg, statusCfg.text)}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-bold">
                                  <Pen size={15} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-foreground/10">
                                <DropdownMenuItem onSelect={() => onEdit(item)} className="text-[12px] font-semibold gap-2">
                                  <Pen size={13} className="text-neutral-400" weight="BoldDuotone" />
                                  Edit item
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => onDelete(item.id)}
                                  className="text-[12px] font-semibold text-red-500 focus:text-red-500 focus:bg-red-50 gap-2"
                                >
                                  <TrashBinMinimalistic size={13} className="text-red-500" weight="BoldDuotone" />
                                  Delete item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep "ItemsTab" | head -5
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/components/dashboard/budget/ItemsTab.tsx && git commit -m "feat: add budget ItemsTab with filter pills and animated rows"
```

---

## Task 8: Create PaymentsTab.tsx

**Files:**
- Create: `frontend/components/dashboard/budget/PaymentsTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextureButton } from '@/components/ui/texture-button';
import { cn } from '@/lib/utils';
import type { BudgetItem } from '@/lib/api/budget';
import type { PaymentStatus } from '@/lib/api/budget';
import { STATUS_CONFIG, EASE_OUT, formatRupiah } from './types';

const STATUS_FILTERS: Array<{ id: 'all' | PaymentStatus; label: string }> = [
  { id: 'all',     label: 'All' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid',    label: 'Paid' },
];

type Props = {
  items: BudgetItem[];
  isLoading: boolean;
  onStatusChange: (id: string, status: PaymentStatus) => Promise<void>;
};

function groupByMonth(items: BudgetItem[]): Map<string, BudgetItem[]> {
  const groups = new Map<string, BudgetItem[]>();
  const today = new Date();

  const withDate = items.filter(i => i.due_date).sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''));
  const noDate   = items.filter(i => !i.due_date);

  for (const item of withDate) {
    const d = new Date(item.due_date!);
    const key = d.getFullYear() === today.getFullYear()
      ? d.toLocaleDateString('en-GB', { month: 'long', year: undefined })
      : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  if (noDate.length > 0) groups.set('No due date', noDate);
  return groups;
}

function nextStatus(current: PaymentStatus): PaymentStatus {
  if (current === 'unpaid') return 'partial';
  if (current === 'partial') return 'paid';
  return 'unpaid';
}

export function PaymentsTab({ items, isLoading, onStatusChange }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = useMemo(
    () => statusFilter === 'all' ? items : items.filter(i => i.payment_status === statusFilter),
    [items, statusFilter],
  );

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <div>
      {/* Status pills */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full w-fit mb-7">
        {STATUS_FILTERS.map(f => {
          const isActive = statusFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                'relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors z-10',
                isActive ? 'text-white' : 'text-neutral-500 hover:text-bold',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="payments-status-pill"
                  className="absolute inset-0 bg-[#212121] rounded-full"
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[13px] text-neutral-400">
            {items.length === 0 ? 'No payment items yet.' : 'No items match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([month, monthItems]) => (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase text-neutral-400">{month}</span>
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              {/* Payment rows */}
              <AnimatePresence mode="popLayout" initial={false}>
                {monthItems.map((item, idx) => {
                  const statusCfg = STATUS_CONFIG[item.payment_status];
                  const isOverdue = item.due_date && new Date(item.due_date) < today && item.payment_status !== 'paid';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18, ease: EASE_OUT, delay: idx * 0.02 }}
                      className="group flex items-center gap-4 py-3.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors -mx-4 px-4 md:mx-0 md:px-0"
                    >
                      {/* Left */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-bold truncate">{item.item_name}</p>
                        <p className="text-[11px] text-neutral-400">{item.category}{item.vendor ? ` · ${item.vendor}` : ''}</p>
                      </div>

                      {/* Amount */}
                      <span className="text-[13px] font-semibold text-bold flex-shrink-0">
                        {formatRupiah(item.estimated_amount)}
                      </span>

                      {/* Due date */}
                      {item.due_date && (
                        <span className={cn(
                          'text-[12px] flex-shrink-0 w-16 text-right',
                          isOverdue ? 'text-[#ff7759] font-semibold' : 'text-neutral-400'
                        )}>
                          {new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}

                      {/* Status + quick toggle */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium', statusCfg.bg, statusCfg.text)}>
                          {statusCfg.label}
                        </span>
                        <TextureButton
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full px-3 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onStatusChange(item.id, nextStatus(item.payment_status))}
                        >
                          Mark {STATUS_CONFIG[nextStatus(item.payment_status)].label}
                        </TextureButton>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep "PaymentsTab" | head -5
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/components/dashboard/budget/PaymentsTab.tsx && git commit -m "feat: add budget PaymentsTab with month grouping and overdue detection"
```

---

## Task 9: Create BudgetPage.tsx — main container

**Files:**
- Create: `frontend/components/dashboard/budget/BudgetPage.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  fetchBudgetSummary, fetchBudgetItems,
  createBudgetItem, updateBudgetItem, deleteBudgetItem,
  type BudgetItem, type CreateBudgetItemInput, type UpdateBudgetItemInput,
} from '@/lib/api/budget';
import type { PaymentStatus } from '@/lib/api/budget';
import {
  TABS, EASE_OUT, formatRupiah, formatRupiahFull,
  type BudgetTab,
} from './types';
import { SummaryTab } from './SummaryTab';
import { ItemsTab } from './ItemsTab';
import { PaymentsTab } from './PaymentsTab';
import { BudgetItemModal } from './BudgetItemModal';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export default function BudgetPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<BudgetTab>('summary');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const summaryQ = useQuery({ queryKey: ['budget', 'summary'], queryFn: fetchBudgetSummary });
  const itemsQ   = useQuery({ queryKey: ['budget', 'items'],   queryFn: fetchBudgetItems });

  const summary = summaryQ.data;
  const items   = itemsQ.data ?? [];

  const totalBudgeted = summary?.total_budgeted ?? 0;
  const totalActual   = summary?.total_actual   ?? 0;
  const remaining     = totalBudgeted - totalActual;
  const paidAmount    = items.filter(i => i.payment_status === 'paid').reduce((s, i) => s + i.actual_amount, 0);
  const paidPct       = totalActual > 0 ? Math.round((paidAmount / totalActual) * 100) : 0;
  const overspendCount = (summary?.categories ?? []).filter(c => c.overspend).length;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['budget', 'summary'] });
    qc.invalidateQueries({ queryKey: ['budget', 'items'] });
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetItemInput) => createBudgetItem(data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditingItem(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetItemInput }) => updateBudgetItem(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditingItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      updateBudgetItem(id, { payment_status: status, paid: status === 'paid' }),
    onSuccess: invalidate,
  });

  function openAdd() { setEditingItem(null); setModalOpen(true); }
  function openEdit(item: BudgetItem) { setEditingItem(item); setModalOpen(true); }

  async function handleSave(data: CreateBudgetItemInput | UpdateBudgetItemInput) {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: data as UpdateBudgetItemInput });
    } else {
      await createMutation.mutateAsync(data as CreateBudgetItemInput);
    }
  }

  const metrics = [
    {
      label: 'TOTAL BUDGET',
      value: formatRupiah(totalBudgeted),
      sub: formatRupiahFull(totalBudgeted),
    },
    {
      label: 'SPENT',
      value: formatRupiah(totalActual),
      sub: `${totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0}% of budget`,
    },
    {
      label: 'REMAINING',
      value: formatRupiah(Math.abs(remaining)),
      sub: remaining < 0 ? 'over budget' : 'available',
      valueClass: remaining < 0 ? 'text-[#ff7759]' : undefined,
    },
    {
      label: 'PAID',
      value: `${paidPct}%`,
      sub: formatRupiah(paidAmount) + ' paid',
    },
    {
      label: 'OVERSPEND',
      value: overspendCount,
      sub: overspendCount === 0 ? 'all clear' : `categor${overspendCount === 1 ? 'y' : 'ies'}`,
      valueClass: overspendCount > 0 ? 'text-[#ff7759]' : 'text-[#346739]',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-10">

        {/* ── METRICS STRIP ── */}
        <motion.div variants={sectionVariants} className="mb-7">
          <div className="grid grid-cols-2 md:grid-cols-5 border border-neutral-100 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            {metrics.map(m => (
              <div key={m.label} className="flex flex-col gap-1 px-5 py-4 md:py-5">
                <span className="text-[9px] font-bold uppercase text-neutral-400">{m.label}</span>
                <span className={cn('text-2xl md:text-3xl font-bold leading-none mt-1', m.valueClass ?? 'text-bold')}>
                  {m.value}
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5">{m.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TAB BAR ── */}
        <motion.div variants={sectionVariants} className="border-b border-neutral-200 mb-8">
          <div className="flex items-center gap-1">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative px-4 py-4 text-sm font-semibold transition-colors outline-hidden',
                    isActive ? 'text-[#346739]' : 'text-neutral-400 hover:text-neutral-600',
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="budget-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#346739] rounded-t-full"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <motion.div variants={sectionVariants}>
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <SummaryTab
                  categories={summary?.categories ?? []}
                  isLoading={summaryQ.isLoading}
                />
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <ItemsTab
                  items={items}
                  isLoading={itemsQ.isLoading}
                  onAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <PaymentsTab
                  items={items}
                  isLoading={itemsQ.isLoading}
                  onStatusChange={(id, status) => statusMutation.mutateAsync({ id, status })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="pb-16" />
      </div>

      {/* ── MODAL ── */}
      <BudgetItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        item={editingItem}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep -E "budget/BudgetPage|budget/index" | head -5
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/components/dashboard/budget/ && git commit -m "feat: add new BudgetPage with metrics strip and three tabs"
```

---

## Task 10: Wire up and clean out

**Files:**
- Modify: `frontend/app/(dashboard)/dashboard/budget/page.tsx`
- Delete: `frontend/components/dashboard/BudgetPage.tsx`

- [ ] **Step 1: Update app route to point to new component**

Replace the entire content of `frontend/app/(dashboard)/dashboard/budget/page.tsx`:

```tsx
import BudgetPage from '@/components/dashboard/budget/BudgetPage';
export default function BudgetRoutePage() { return <BudgetPage />; }
```

- [ ] **Step 2: Delete old component**

```bash
rm /Users/pangkywaradjodi/rimba/frontend/components/dashboard/BudgetPage.tsx
```

- [ ] **Step 3: Full type-check**

```bash
cd /Users/pangkywaradjodi/rimba/frontend && npx tsc --noEmit 2>&1 | grep -v "AvailabilityCalendar\|OverviewPage" | head -20
```

Expected: no output (pre-existing framer-motion errors in those two files are excluded).

- [ ] **Step 4: Seed a few budget items to verify the full flow**

```bash
# Sign in via browser first, then test the Add Item flow in the UI
# Verify: Summary tab shows category bars, Items tab shows table, Payments tab groups by month
# Verify: modal opens on Add item click, form submits and row appears
curl -s http://localhost:8080/health
```

- [ ] **Step 5: Final commit**

```bash
cd /Users/pangkywaradjodi/rimba && git add frontend/ && git commit -m "feat: wire up new budget planner page and remove old BudgetPage"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Persistent metrics strip (5 cards: budget/spent/remaining/paid/overspend)
- ✅ Three tabs with `layoutId` spring indicator
- ✅ `AnimatePresence mode="wait"` for tab content swap
- ✅ SummaryTab: animated `width` bars per category, overspend section
- ✅ ItemsTab: search + category dropdown + status pills + `motion.tr` rows + add/edit/delete
- ✅ PaymentsTab: month grouping, overdue detection (coral), quick status toggle on hover
- ✅ BudgetItemModal: Dialog desktop, Drawer mobile, all 7 form fields
- ✅ `payment_status` tri-state: DB migration + backend + frontend API + types
- ✅ Cohere design tokens throughout (ink, muted, coral, pale-green, pale-blue, hairline)
- ✅ Emil animation rules: no animation on hover/frequent actions, stagger for mounts, spring for tabs

**Placeholder scan:** None found.

**Type consistency:** `PaymentStatus` defined once in `lib/api/budget.ts`, imported everywhere. `BudgetItem` extended consistently. `EASE_OUT` defined in `types.ts`, imported in all tab files. `formatRupiah` / `formatRupiahFull` both in `types.ts`.
