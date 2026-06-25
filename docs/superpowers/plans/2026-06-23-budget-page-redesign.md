# Budget Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the dashboard budget page as an Overview-first experience — a deep-green hero, a "where money goes" SVG donut, at-risk and upcoming-payments cards — plus mobile-first Items and Payments tabs.

**Architecture:** Keep the existing `BudgetPage` tab shell and react-query data layer. Replace the always-on metric strip and flat Summary tab with a composed `OverviewTab`. Build small, focused presentational components fed by pure helpers in `types.ts`. No backend changes.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind, `motion/react`, `@solar-icons/react`, `@tanstack/react-query`.

## Global Constraints

- **Design tokens only.** All colors come from `fisik/frontend/design-template/cohere/DESIGN.md`: primary `#346739`, deep-green `#003c33`, ink `#212121`, action-blue `#1863dc`, focus-blue `#4c6ee6`, coral `#ff7759`, coral-soft `#ffad9b`, slate `#75758a`, soft-stone `#eeece7`, pale-green `#edfce9`, error `#b30000`, neutrals `neutral-100/400/500`.
- **Motion:** reuse `EASE_OUT = cubic-bezier(0.23, 1, 0.32, 1)`. Animate only `transform`, `opacity`, and `strokeDashoffset`. Mount animations are one-shot. Durations ≤ 300ms for UI; gate movement behind `prefers-reduced-motion` (keep opacity fades). No animation added to tab switching beyond the existing 0.22s crossfade.
- **Currency:** always render money via `formatRupiah` / `formatRupiahFull` (Indonesian `jt`/`rb`). Never hand-format.
- **Heading idiom:** `font-poppins`, `text-[#212121]`; card radius `rounded-2xl`; hairline borders `border-neutral-100`.
- **No new dependencies.** Donut is hand-built SVG (do not add recharts usage).
- **Testing approach (deviation from default TDD):** the frontend has no test runner and the budget components are untested presentational React. Per skill instruction-priority (codebase reality wins), each task verifies with `npx tsc --noEmit` (no *new* errors referencing budget files) and `npx eslint <files>`, then commits. A final task does a visual smoke check in `next dev`. Pure helpers are isolated so they can be reasoned about directly.
- **Working directory for all commands:** `digital/frontend/`.
- **Baseline note:** `npx tsc --noEmit` already prints pre-existing errors (e.g. `components/AvailabilityCalendar.tsx`). "Verify typecheck" means *no new error lines mention files you created/edited in this task* — not a zero-error build.

---

### Task 1: Shared helpers and color map in `types.ts`

**Files:**
- Modify: `components/dashboard/budget/types.ts`

**Interfaces:**
- Consumes: `BudgetItem`, `PaymentStatus` from `@/lib/api/budget`.
- Produces:
  - `CATEGORY_COLORS: string[]`
  - `type SpendSegment = { name: string; value: number; color: string }`
  - `buildSpendSegments(categories: { name: string; actual: number }[]): SpendSegment[]`
  - `daysUntil(dateStr?: string | null): number | null`
  - `selectUpcoming(items: BudgetItem[], limit?: number): BudgetItem[]`
  - `isOverdue(item: BudgetItem, now?: Date): boolean`

- [ ] **Step 1: Update the import line**

In `types.ts`, change the first import to also pull `BudgetItem`:

```ts
import type { PaymentStatus, BudgetItem } from '@/lib/api/budget';
```

- [ ] **Step 2: Append helpers at the end of `types.ts`**

```ts
/* ── Overview helpers ───────────────────────────────────────── */

// Donut palette — DESIGN.md tokens only, green-anchored.
export const CATEGORY_COLORS = [
  '#346739', // primary
  '#003c33', // deep-green
  '#1863dc', // action-blue
  '#ff7759', // coral
  '#4c6ee6', // focus-blue
  '#75758a', // slate
  '#ffad9b', // coral-soft
  '#eeece7', // soft-stone
] as const;

export type SpendSegment = { name: string; value: number; color: string };

/**
 * Build donut segments from category actuals.
 * Sorts desc, keeps the top 6, groups the remainder into "Others".
 * Returns [] when nothing has been spent.
 */
export function buildSpendSegments(
  categories: { name: string; actual: number }[],
): SpendSegment[] {
  const positive = categories
    .filter(c => c.actual > 0)
    .sort((a, b) => b.actual - a.actual);
  const total = positive.reduce((s, c) => s + c.actual, 0);
  if (total === 0) return [];

  const MAX = 6;
  const head = positive.slice(0, MAX);
  const tail = positive.slice(MAX);

  const segments: SpendSegment[] = head.map((c, i) => ({
    name: c.name,
    value: c.actual,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  if (tail.length > 0) {
    segments.push({
      name: 'Others',
      value: tail.reduce((s, c) => s + c.actual, 0),
      color: CATEGORY_COLORS[CATEGORY_COLORS.length - 1],
    });
  }
  return segments;
}

/** Whole days from today until dateStr; null if missing/invalid/past. */
export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

/** True when an unpaid item's due date is before today. */
export function isOverdue(item: BudgetItem, now: Date = new Date()): boolean {
  if (!item.due_date || item.payment_status === 'paid') return false;
  const due = new Date(item.due_date);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return due < today;
}

/** Next unpaid, dated items sorted by soonest due date. */
export function selectUpcoming(items: BudgetItem[], limit = 4): BudgetItem[] {
  return items
    .filter(i => i.payment_status !== 'paid' && i.due_date)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
    .slice(0, limit);
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "components/dashboard/budget/types.ts"`
Expected: no output (no errors referencing the file).

- [ ] **Step 4: Verify lint**

Run: `npx eslint components/dashboard/budget/types.ts`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/budget/types.ts
git commit -m "feat(budget): add overview helpers and donut palette"
```

---

### Task 2: `BudgetHero` component

**Files:**
- Create: `components/dashboard/budget/BudgetHero.tsx`

**Interfaces:**
- Consumes: `EASE_OUT`, `formatRupiah`, `daysUntil` from `./types`; `motion` from `motion/react`; `cn` from `@/lib/utils`.
- Produces: `export function BudgetHero(props: { totalBudgeted: number; totalActual: number; eventDate?: string | null }): JSX.Element`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT, formatRupiah, daysUntil } from './types';

type Props = {
  totalBudgeted: number;
  totalActual: number;
  eventDate?: string | null;
};

export function BudgetHero({ totalBudgeted, totalActual, eventDate }: Props) {
  const reduce = useReducedMotion();
  const remaining = totalBudgeted - totalActual;
  const over = remaining < 0;
  const pct = totalBudgeted > 0
    ? Math.min(Math.round((totalActual / totalBudgeted) * 100), 100)
    : 0;
  const days = daysUntil(eventDate);

  return (
    <div className="rounded-2xl bg-[#003c33] text-white px-6 py-7 md:px-9 md:py-9 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('size-2 rounded-full', over ? 'bg-[#ff7759]' : 'bg-[#edfce9]')} />
        <span className="text-[11px] font-bold uppercase tracking-tight text-white/70">
          {over ? 'Over budget' : 'On track'}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <p className="text-3xl md:text-[40px] font-medium leading-none">
            {formatRupiah(Math.abs(remaining))}
            <span className="text-base md:text-lg font-normal text-white/60 ml-2">
              {over ? 'over' : 'left'}
            </span>
          </p>
          <p className="text-[13px] text-white/60 mt-2">
            {pct}% of {formatRupiah(totalBudgeted)} budget spent
            {days !== null && (
              <>
                {' · '}
                <span className="text-white/80">{days} days until the big day</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="h-2 mt-6 rounded-full bg-white/15 overflow-hidden">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
          className={cn('h-full rounded-full', over ? 'bg-[#ff7759]' : 'bg-[#edfce9]')}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "BudgetHero"`
Expected: no output.

- [ ] **Step 3: Verify lint**

Run: `npx eslint components/dashboard/budget/BudgetHero.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/budget/BudgetHero.tsx
git commit -m "feat(budget): add deep-green hero card"
```

---

### Task 3: `SpendDonut` component

**Files:**
- Create: `components/dashboard/budget/SpendDonut.tsx`

**Interfaces:**
- Consumes: `EASE_OUT`, `formatRupiah`, `buildSpendSegments`, `type SpendSegment` from `./types`.
- Produces: `export function SpendDonut(props: { categories: { name: string; actual: number }[] }): JSX.Element`

- [ ] **Step 1: Create the file**

Geometry: a 160×160 viewBox, radius `r = 70`, `stroke-width 18`. Circumference `C = 2πr`. Each segment is a rotated `<circle>` whose visible dash length is its share of `C`, revealed by animating `strokeDashoffset` from `arcLen` → `0`. A 2px gap between segments is subtracted from each arc.

```tsx
"use client";

import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT, formatRupiah, buildSpendSegments } from './types';

type Props = {
  categories: { name: string; actual: number }[];
};

const R = 70;
const SIZE = 160;
const STROKE = 18;
const C = 2 * Math.PI * R;
const GAP = 2; // px gap between segments

export function SpendDonut({ categories }: Props) {
  const reduce = useReducedMotion();
  const segments = buildSpendSegments(categories);
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (segments.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-100 p-6 flex items-center justify-center min-h-[220px]">
        <p className="text-[13px] text-neutral-400">No spending recorded yet.</p>
      </div>
    );
  }

  let cumulative = 0;

  return (
    <div className="rounded-2xl border border-neutral-100 p-6">
      <p className="text-[11px] font-bold uppercase text-neutral-400 mb-4">Where money goes</p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {segments.map((seg, i) => {
              const fraction = seg.value / total;
              const arcLen = Math.max(fraction * C - GAP, 0);
              const rotation = (cumulative / total) * 360 - 90;
              cumulative += seg.value;
              return (
                <motion.circle
                  key={seg.name}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${arcLen} ${C - arcLen}`}
                  strokeLinecap="butt"
                  transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
                  initial={reduce ? false : { strokeDashoffset: arcLen }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 + i * 0.06 }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase text-neutral-400">Spent</span>
            <span className="text-lg font-medium text-[#212121] leading-none mt-0.5">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        <ul className="flex-1 w-full space-y-2">
          {segments.map(seg => (
            <li key={seg.name} className="flex items-center gap-2 text-[13px]">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[#212121] truncate flex-1">{seg.name}</span>
              <span className="text-neutral-400">{Math.round((seg.value / total) * 100)}%</span>
              <span className="text-[#212121] font-medium w-20 text-right">{formatRupiah(seg.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "SpendDonut"`
Expected: no output.

- [ ] **Step 3: Verify lint**

Run: `npx eslint components/dashboard/budget/SpendDonut.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/budget/SpendDonut.tsx
git commit -m "feat(budget): add where-money-goes SVG donut"
```

---

### Task 4: `AtRiskCard` component

**Files:**
- Create: `components/dashboard/budget/AtRiskCard.tsx`

**Interfaces:**
- Consumes: `formatRupiah` from `./types`; `BudgetCategorySummary` from `@/lib/api/budget`.
- Produces: `export function AtRiskCard(props: { categories: BudgetCategorySummary[] }): JSX.Element | null`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import type { BudgetCategorySummary } from '@/lib/api/budget';
import { formatRupiah } from './types';

type Props = {
  categories: BudgetCategorySummary[];
};

export function AtRiskCard({ categories }: Props) {
  const overspend = categories.filter(c => c.overspend);
  if (overspend.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#ffad9b] bg-[#fff8f7] p-6">
      <p className="text-[11px] font-bold uppercase text-[#b30000] mb-3">At risk · over budget</p>
      <div className="space-y-2">
        {overspend.map(c => (
          <div key={c.name} className="flex justify-between text-[13px]">
            <span className="text-[#212121] font-medium">{c.name}</span>
            <span className="text-[#b30000] font-semibold">+{formatRupiah(c.actual - c.budgeted)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "AtRiskCard"`
Expected: no output.

- [ ] **Step 3: Verify lint**

Run: `npx eslint components/dashboard/budget/AtRiskCard.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/budget/AtRiskCard.tsx
git commit -m "feat(budget): add at-risk overspend card"
```

---

### Task 5: `UpcomingPayments` component

**Files:**
- Create: `components/dashboard/budget/UpcomingPayments.tsx`

**Interfaces:**
- Consumes: `EASE_OUT`, `formatRupiah`, `selectUpcoming`, `isOverdue` from `./types`; `BudgetItem` from `@/lib/api/budget`; `AltArrowRight` from `@solar-icons/react`.
- Produces: `export function UpcomingPayments(props: { items: BudgetItem[]; onViewAll: () => void }): JSX.Element | null`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { motion, useReducedMotion } from 'motion/react';
import { AltArrowRight } from '@solar-icons/react';
import { cn } from '@/lib/utils';
import type { BudgetItem } from '@/lib/api/budget';
import { EASE_OUT, formatRupiah, selectUpcoming, isOverdue } from './types';

type Props = {
  items: BudgetItem[];
  onViewAll: () => void;
};

export function UpcomingPayments({ items, onViewAll }: Props) {
  const reduce = useReducedMotion();
  const upcoming = selectUpcoming(items, 4);
  if (upcoming.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase text-neutral-400">Upcoming payments</p>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-[12px] font-medium text-[#346739] hover:opacity-70 transition-opacity active:scale-[0.97]"
        >
          View all
          <AltArrowRight size={13} />
        </button>
      </div>

      <div>
        {upcoming.map((item, idx) => {
          const overdue = isOverdue(item);
          return (
            <motion.div
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT, delay: idx * 0.04 }}
              className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#212121] truncate">{item.item_name}</p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {item.category}{item.vendor ? ` · ${item.vendor}` : ''}
                </p>
              </div>
              <span className="text-[13px] font-semibold text-[#212121] shrink-0">
                {formatRupiah(item.estimated_amount)}
              </span>
              <span className={cn(
                'text-[12px] shrink-0 w-16 text-right',
                overdue ? 'text-[#ff7759] font-semibold' : 'text-neutral-400',
              )}>
                {item.due_date
                  ? new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                  : '—'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the icon export exists**

Run: `grep -r "AltArrowRight" node_modules/@solar-icons/react/dist/*.d.ts | head -1`
Expected: a match. If empty, fall back to `AltArrowRight` → use `AltArrowDown` rotated, or another arrow already imported in `ItemsTab.tsx`. (`AltArrowDown` is confirmed present.)

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "UpcomingPayments"`
Expected: no output.

- [ ] **Step 4: Verify lint**

Run: `npx eslint components/dashboard/budget/UpcomingPayments.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/budget/UpcomingPayments.tsx
git commit -m "feat(budget): add upcoming payments preview"
```

---

### Task 6: Extract `CategoryRow` into its own file

**Files:**
- Create: `components/dashboard/budget/CategoryRow.tsx`

**Interfaces:**
- Consumes: `EASE_OUT`, `formatRupiah` from `./types`; `BudgetCategorySummary` from `@/lib/api/budget`; `cn`; `motion`.
- Produces: `export function CategoryRow(props: { category: BudgetCategorySummary; index: number }): JSX.Element`

This is the existing `CategoryRow` from `SummaryTab.tsx`, lifted verbatim into a shared file so `OverviewTab` can use it. `SummaryTab.tsx` is removed in Task 8.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { BudgetCategorySummary } from '@/lib/api/budget';
import { EASE_OUT, formatRupiah } from './types';

export function CategoryRow({
  category,
  index,
}: {
  category: BudgetCategorySummary;
  index: number;
}) {
  const reduce = useReducedMotion();
  const pct = category.budgeted > 0
    ? Math.min((category.actual / category.budgeted) * 100, 100)
    : 0;
  const overspend = category.overspend;
  const overspendAmt = category.actual - category.budgeted;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT, delay: index * 0.06 }}
      className="py-4 border-b border-neutral-100 last:border-0"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#212121]">{category.name}</span>
          {overspend && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8f7] text-[#b30000]">
              +{formatRupiah(overspendAmt)}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={cn('text-[13px] font-semibold', overspend ? 'text-[#ff7759]' : 'text-[#212121]')}>
            {formatRupiah(category.actual)}
          </span>
          <span className="text-[12px] text-neutral-400 ml-1">/ {formatRupiah(category.budgeted)}</span>
        </div>
      </div>

      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: index * 0.06 + 0.1 }}
          className={cn('h-full rounded-full', overspend ? 'bg-[#ff7759]' : 'bg-[#346739]')}
        />
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "CategoryRow"`
Expected: no output.

- [ ] **Step 3: Verify lint**

Run: `npx eslint components/dashboard/budget/CategoryRow.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/budget/CategoryRow.tsx
git commit -m "refactor(budget): extract CategoryRow into shared component"
```

---

### Task 7: `OverviewTab` composition

**Files:**
- Create: `components/dashboard/budget/OverviewTab.tsx`

**Interfaces:**
- Consumes: `BudgetHero`, `SpendDonut`, `AtRiskCard`, `UpcomingPayments`, `CategoryRow`; `mergeWithFixed`, `EASE_OUT` from `./types`; `BudgetSummary`, `BudgetItem` from `@/lib/api/budget`.
- Produces: `export function OverviewTab(props: { summary?: BudgetSummary; items: BudgetItem[]; eventDate?: string | null; isLoading: boolean; onViewAll: () => void }): JSX.Element`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import type { BudgetSummary, BudgetItem } from '@/lib/api/budget';
import { mergeWithFixed } from './types';
import { BudgetHero } from './BudgetHero';
import { SpendDonut } from './SpendDonut';
import { AtRiskCard } from './AtRiskCard';
import { UpcomingPayments } from './UpcomingPayments';
import { CategoryRow } from './CategoryRow';

type Props = {
  summary?: BudgetSummary;
  items: BudgetItem[];
  eventDate?: string | null;
  isLoading: boolean;
  onViewAll: () => void;
};

export function OverviewTab({ summary, items, eventDate, isLoading, onViewAll }: Props) {
  const categories = summary?.categories ?? [];
  const merged = mergeWithFixed(categories);
  const totalBudgeted = summary?.total_budgeted ?? 0;
  const totalActual = summary?.total_actual ?? 0;
  const empty = merged.every(c => c.budgeted === 0 && c.actual === 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-5">
          <div className="h-56 rounded-2xl bg-neutral-100 animate-pulse" />
          <div className="h-56 rounded-2xl bg-neutral-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetHero totalBudgeted={totalBudgeted} totalActual={totalActual} eventDate={eventDate} />

      {!empty && (
        <div className="grid md:grid-cols-5 gap-5">
          <div className="md:col-span-3">
            <SpendDonut categories={categories} />
          </div>
          <div className="md:col-span-2 space-y-5">
            <AtRiskCard categories={categories} />
            <UpcomingPayments items={items} onViewAll={onViewAll} />
          </div>
        </div>
      )}

      {empty ? (
        <div className="py-16 text-center">
          <p className="text-[13px] text-neutral-400">Add budget items to see your overview.</p>
        </div>
      ) : (
        <div>
          <p className="text-[11px] font-bold uppercase text-neutral-400 mb-1">By category</p>
          {merged.map((cat, i) => (
            <CategoryRow key={cat.name} category={cat} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "OverviewTab"`
Expected: no output.

- [ ] **Step 3: Verify lint**

Run: `npx eslint components/dashboard/budget/OverviewTab.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/budget/OverviewTab.tsx
git commit -m "feat(budget): compose overview tab"
```

---

### Task 8: Wire `BudgetPage` — remove strip, mount OverviewTab, add wedding query

**Files:**
- Modify: `components/dashboard/budget/BudgetPage.tsx`
- Modify: `components/dashboard/budget/types.ts` (TABS label)
- Delete: `components/dashboard/budget/SummaryTab.tsx`

**Interfaces:**
- Consumes: `OverviewTab` (Task 7); `fetchWeddingProfile` from `@/lib/api/weddings`.
- Produces: a working page whose default tab is the Overview composition.

- [ ] **Step 1: Rename the first tab label in `types.ts`**

Change the `TABS` array entry:

```ts
export const TABS: Array<{ id: BudgetTab; label: string }> = [
  { id: 'summary',  label: 'Overview' },
  { id: 'items',    label: 'Items' },
  { id: 'payments', label: 'Payments' },
];
```

(Keep id `summary` to avoid touching the `BudgetTab` union and state.)

- [ ] **Step 2: Update imports in `BudgetPage.tsx`**

Replace the `SummaryTab` import line:

```ts
import { OverviewTab } from './OverviewTab';
```

Add the wedding profile import near the other api imports:

```ts
import { fetchWeddingProfile } from '@/lib/api/weddings';
```

- [ ] **Step 3: Add the wedding query and remove the metrics array**

Inside `BudgetPage`, after the `itemsQ` query add:

```ts
  const weddingQ = useQuery({
    queryKey: ['wedding', 'profile'],
    queryFn: fetchWeddingProfile,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
```

Delete the entire `const metrics = [ ... ];` block (the five-entry array) — it is no longer used. Also delete now-unused locals that only fed it: `remaining`, `paidAmount`, `paidPct`, `overspendCount`, and the `formatRupiahFull` import. Keep `totalBudgeted` / `totalActual` only if still referenced (they are not after this step — remove them too). Leave `summary`, `items`, `summaryQ`, `itemsQ` intact.

- [ ] **Step 4: Remove the metrics strip JSX**

Delete the entire `{/* ── METRICS STRIP ── */}` `<motion.div>` block (the bordered grid of `metrics.map(...)`).

- [ ] **Step 5: Replace the Summary tab body with OverviewTab**

In the `activeTab === 'summary'` branch, replace the `<SummaryTab .../>` usage with:

```tsx
                <OverviewTab
                  summary={summary}
                  items={items}
                  eventDate={weddingQ.data?.event_date}
                  isLoading={summaryQ.isLoading || itemsQ.isLoading}
                  onViewAll={() => setActiveTab('payments')}
                />
```

- [ ] **Step 6: Delete the now-unused SummaryTab file**

```bash
git rm components/dashboard/budget/SummaryTab.tsx
```

- [ ] **Step 7: Verify no dangling references**

Run: `grep -rn "SummaryTab\|formatRupiahFull\|metrics" components/dashboard/budget/`
Expected: no remaining import or usage of `SummaryTab`; `formatRupiahFull` may still be exported from `types.ts` (fine) but must not be imported in `BudgetPage.tsx`.

- [ ] **Step 8: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "components/dashboard/budget/BudgetPage.tsx"`
Expected: no output.

- [ ] **Step 9: Verify lint**

Run: `npx eslint components/dashboard/budget/BudgetPage.tsx components/dashboard/budget/types.ts`
Expected: no errors (no unused-var warnings for removed locals).

- [ ] **Step 10: Commit**

```bash
git add -A components/dashboard/budget/
git commit -m "feat(budget): replace metric strip + summary with overview tab"
```

---

### Task 9: Mobile-first cards in `ItemsTab`

**Files:**
- Modify: `components/dashboard/budget/ItemsTab.tsx`

**Interfaces:**
- Consumes: existing props (unchanged). Adds a mobile card list alongside the desktop table.
- Produces: same component; table hidden below `md`, cards hidden at `md+`.

- [ ] **Step 1: Hide the table wrapper below `md`**

Change the table container `<div className="overflow-x-auto -mx-4 md:mx-0">` to `<div className="hidden md:block overflow-x-auto -mx-4 md:mx-0">`. The `min-w-[800px]` inner div can stay since the wrapper is now `md+` only — change `min-w-[800px] px-4 md:px-0` to `min-w-full`.

- [ ] **Step 2: Add the mobile card list**

Immediately *before* the (now `hidden md:block`) table wrapper, and inside the same `filtered.length > 0` branch, add a mobile-only list. Replace the single `) : (` table branch with a fragment containing both:

```tsx
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((item, idx) => {
                const statusCfg = STATUS_CONFIG[item.payment_status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_OUT, delay: idx * 0.02 }}
                    className="rounded-2xl border border-neutral-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#212121] truncate">{item.item_name}</p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {item.category}{item.vendor ? ` · ${item.vendor}` : ''}
                        </p>
                      </div>
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0', statusCfg.bg, statusCfg.text)}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-neutral-400">
                        Budget <span className="text-[#212121] font-medium">{formatRupiah(item.estimated_amount)}</span>
                      </span>
                      <span className={cn(item.actual_amount > item.estimated_amount ? 'text-[#ff7759]' : 'text-neutral-400')}>
                        Actual <span className={cn('font-medium', item.actual_amount > item.estimated_amount ? 'text-[#ff7759]' : 'text-[#212121]')}>{formatRupiah(item.actual_amount)}</span>
                      </span>
                      {item.due_date && (
                        <span className="text-neutral-400">
                          {new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-full text-neutral-400 hover:bg-neutral-100 active:scale-[0.97] transition"
                        aria-label="Edit item"
                      >
                        <Pen size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-50 active:scale-[0.97] transition"
                        aria-label="Delete item"
                      >
                        <TrashBinMinimalistic size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-full px-4 md:px-0">
              <Table>
```

Keep the rest of the existing `<Table>…</Table>` markup exactly as-is, and ensure the closing `</div></div>` now closes with `</>` for the fragment. (Concretely: the previous `) : (` opened a single `<div className="overflow-x-auto …">`; it is now `) : (` → `<>` → mobile list → desktop table div. Add the matching `</>` before the final `)}` of the ternary.)

- [ ] **Step 3: Verify the closing tags balance**

Run: `npx tsc --noEmit 2>&1 | grep "ItemsTab"`
Expected: no output (a mismatched fragment/JSX will surface here).

- [ ] **Step 4: Verify lint**

Run: `npx eslint components/dashboard/budget/ItemsTab.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/budget/ItemsTab.tsx
git commit -m "feat(budget): mobile-first item cards"
```

---

### Task 10: Touch-visible action in `PaymentsTab`

**Files:**
- Modify: `components/dashboard/budget/PaymentsTab.tsx`

**Interfaces:**
- Consumes: existing props (unchanged).
- Produces: the "Mark {status}" button visible on touch, hover-reveal on `md+`.

- [ ] **Step 1: Update the action button className**

Find the `TextureButton` with `className="h-8 rounded-full px-3 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"` and change the visibility classes:

```tsx
                        <TextureButton
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full px-3 text-[11px] gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity active:scale-[0.97]"
                          onClick={() => onStatusChange(item.id, nextStatus(item.payment_status))}
                        >
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "PaymentsTab"`
Expected: no output.

- [ ] **Step 3: Verify lint**

Run: `npx eslint components/dashboard/budget/PaymentsTab.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/budget/PaymentsTab.tsx
git commit -m "feat(budget): make mark-paid action tappable on mobile"
```

---

### Task 11: Visual smoke check

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (from `digital/frontend/`). Ensure the backend/DB are up per the project's docker-compose (Postgres on host port 5433) so the budget API resolves.

- [ ] **Step 2: Open the budget page**

Navigate to `/dashboard/budget`. Confirm:
- Overview tab shows the deep-green hero with "Rp X left", health chip, progress bar, and (if a wedding date exists) "N days until the big day".
- Donut renders with a legend; at-risk card appears only when a category is over budget; upcoming payments lists soonest-due unpaid items and "View all" switches to Payments.
- Category bars render below.

- [ ] **Step 3: Check mobile width**

In devtools responsive mode (≤ 400px): hero/donut/cards stack single-column; Items tab shows cards (no horizontal scroll); Payments "Mark …" button is visible without hover.

- [ ] **Step 4: Check reduced motion**

Enable "prefers-reduced-motion" in devtools rendering pane; reload; confirm bars/donut appear in final state without sweeping movement.

- [ ] **Step 5: Production build sanity**

Run: `npm run build`
Expected: build completes; no errors referencing `components/dashboard/budget/*`.

- [ ] **Step 6: Commit (if any tweaks were needed)**

```bash
git add -A components/dashboard/budget/
git commit -m "fix(budget): visual smoke-check adjustments"
```

(Skip if no changes.)

---

## Self-Review

**Spec coverage:**
- IA → Overview·Items·Payments, strip removed: Task 8. ✓
- Deep-green hero, remaining metric, days-to-wedding: Task 2 + Task 8 (wedding query). ✓
- SVG donut "where money goes": Task 3. ✓
- At-risk card: Task 4. ✓
- Upcoming payments preview + View all → Payments: Task 5 + Task 8. ✓
- Category breakdown reuse: Task 6 + Task 7. ✓
- Items mobile cards: Task 9. ✓
- Payments touch action: Task 10. ✓
- Motion / reduced-motion / tokens: Global Constraints + each component. ✓
- Out of scope (backend, modal, recharts): honored. ✓

**Placeholder scan:** No "TBD/TODO"; every code step has full code; no "similar to Task N".

**Type consistency:** Helper names (`buildSpendSegments`, `daysUntil`, `isOverdue`, `selectUpcoming`, `SpendSegment`, `CATEGORY_COLORS`) defined in Task 1 and consumed with identical signatures in Tasks 3/5/7. `OverviewTab` prop shape matches the call site in Task 8 (`summary`, `items`, `eventDate`, `isLoading`, `onViewAll`). `BudgetHero` props (`totalBudgeted`, `totalActual`, `eventDate`) match Task 7's usage. Tab id stays `summary` throughout.
