# Budget Page Redesign — Design Spec

**Date:** 2026-06-23
**Scope:** Redesign `digital/frontend/app/(dashboard)/dashboard/budget/page.tsx` and its
`components/dashboard/budget/*` tree.
**Status:** Approved for implementation (pending spec review).

## Problem

The current budget page is functional and already on the Cohere design system, but it
falls short on four fronts the user flagged:

1. **Feels generic / flat** — reads like a stock admin dashboard, no product identity.
2. **Weak at-a-glance overview** — the "Summary" tab is just a flat list of category
   rows; budget health isn't communicated fast.
3. **Information architecture** — the equal 3-tab split (Summary / Items / Payments) and
   an always-on 5-metric strip are redundant and don't prioritize.
4. **Poor mobile experience** — the Items tab is a horizontally-scrolling table; the
   Payments "Mark paid" action is `opacity-0 group-hover` (invisible on touch).

## Reference research (Mobbin)

Patterns validated across Origin, Copilot Money, YNAB, Mint, Buddy, Revolut (iOS) and
Monarch, Quicken, HoneyBook, YNAB (web):

- Lead with **one dominant figure + progress + a health chip** (Revolut "left to spend ·
  On track · 23 days left"; Origin; Mint; Buddy).
- A **"where money goes" donut** with a category legend (YNAB Spending Breakdown,
  Copilot) reads instantly and is the strongest identity element.
- Category rows = **label + spent/budget + progress bar**, green/red coded (Copilot,
  YNAB, Mint) — our current Summary already matches this; keep it.
- Web overviews are **widget grids** (Monarch, Quicken) with budget + spending + upcoming
  payments visible together.
- **Upcoming payments as a reminder list** (Quicken, HoneyBook Paid/Overdue/Upcoming).

**Key design insight:** Cohere reserves its `deep-green #003c33` band for hero/feature
moments. The fintech colored-hero-header pattern maps exactly onto that — so a deep-green
hero card is simultaneously on-brand and the proven finance pattern. This kills the
"generic/flat" feeling using only documented tokens.

## Decisions (locked)

- **IA:** Overview-first + drill-downs. Tabs become **Overview · Items · Payments**.
- **Hero metric:** Remaining **"left to spend"** is the dominant number.
- **Donut:** Hand-built **SVG ring** (full control, lightweight, animated `stroke-dashoffset`).
  Recharts is installed but not used here, to avoid fighting its default styling.
- The always-visible **5-metric strip is removed**; its numbers fold into the hero.

## Architecture

### Tab structure (`BudgetPage.tsx`)
- `TABS` label `summary` → `Overview` (id stays `summary` to minimize churn, or rename to
  `overview` — implementer's choice, keep consistent).
- Remove the global metrics strip block (lines ~128–141 today).
- Overview tab renders the new `<OverviewTab>`. Items/Payments tabs each get a slim
  one-line context header (e.g. item count / total due) instead of the global strip.
- Keep the existing `AnimatePresence` crossfade between tabs (0.22s, `EASE_OUT`).

### New components (under `components/dashboard/budget/`)

| Component | Purpose | Key props |
| --- | --- | --- |
| `OverviewTab.tsx` | Composes the overview: hero → (donut + at-risk) → upcoming → categories | `summary`, `items`, `isLoading` |
| `BudgetHero.tsx` | Deep-green hero band | `totalBudgeted`, `totalActual`, `eventDate` |
| `SpendDonut.tsx` | SVG ring + legend ("where money goes") | `categories` (name + actual) |
| `AtRiskCard.tsx` | Overspend list (extracted from current SummaryTab) | `categories` |
| `UpcomingPayments.tsx` | Next 3–4 unpaid items by due date, "View all →" | `items`, `onViewAll` |

`CategoryRow` (currently in `SummaryTab.tsx`) is extracted/shared and rendered by
`OverviewTab`. `SummaryTab.tsx` is retired (its content moves into `OverviewTab` +
`AtRiskCard`).

### Data
- Wedding date for the hero countdown: reuse the existing query
  `useQuery({ queryKey: ['wedding','profile'], queryFn: fetchWeddingProfile, staleTime: 5*60*1000 })`
  and the `parseDate` helper, exactly as `TimelinePage.tsx` does. Days-to-wedding =
  `ceil((eventDate - today) / 1 day)`; hide the line if no/past date.
- No backend changes. All figures derive from the existing `BudgetSummary` + `BudgetItem[]`.

## Component detail

### `BudgetHero`
- Full-width card, `bg-[#003c33]`, white text, rounded `2xl` (matches existing card radii),
  generous padding.
- Dominant figure: `Rp {remaining} left` — ~40px desktop / 32px mobile, weight 500.
  If over budget: `Rp {overage} over` in coral `#ff7759`.
- Health chip: `● On track` (pale-green dot) / `● Over budget` (coral dot).
- Thin progress bar (spent / budget), animates `width` 0→pct on mount (`EASE_OUT`).
- Support line: `{pct}% of budget spent` · `{days} days until the big day` (when available).

### `SpendDonut`
- SVG `circle` segments using `stroke-dasharray` / `stroke-dashoffset`; segments animate
  in on mount. Center label: total spent.
- Segments = each category's `actual` as a share of `total_actual`; empty categories
  excluded; tiny remainders grouped into "Others".
- Color map (new in `types.ts`), drawn ONLY from DESIGN.md tokens — green-anchored:
  `#346739` (primary), `#003c33` (deep-green), `#1863dc` (action-blue), `#ff7759` (coral),
  `#75758a` (slate), `#eeece7` (soft-stone), plus a couple of tints. Legend lists category
  + amount + %.
- `prefers-reduced-motion`: render final state, skip the sweep.

### `AtRiskCard`
- The existing overspend block, promoted to a bordered card
  (`border-[#ffad9b] bg-[#fff8f7]`), heading "Over budget", rows of category + `+Rp`.
- Renders nothing when no overspend.

### `UpcomingPayments`
- Filters `items` where `payment_status !== 'paid'` and `due_date` set; sorts ascending;
  shows next 3–4. Row: name · `category · vendor`, amount, due date (coral + bold if
  overdue). "View all →" calls `onViewAll` to switch to the Payments tab.

### Overview layout
- Desktop: hero full-width; then a 2-col row (`SpendDonut` left ~60%, `AtRiskCard` right);
  then `UpcomingPayments`; then category breakdown (`CategoryRow` list).
- Mobile (`< md`): everything single-column in that order.

### `ItemsTab` — mobile-first
- `md+`: keep the existing table.
- `< md`: render **cards** instead of the horizontal-scroll table. Each card: top row =
  item name + status chip; second row = `category · vendor`; then budgeted/actual pair and
  due date; edit/delete via the existing dropdown. Toolbar (search + category + status
  pills) stays, wraps cleanly.

### `PaymentsTab` — polish
- Make the "Mark {next}" button visible on touch: inline (not `opacity-0 group-hover`)
  on `< md`; keep hover-reveal on `md+`.
- Keep month grouping, status pills, `layoutId` filter pill.

## Motion (Emil principles)
- Keep `EASE_OUT = cubic-bezier(0.23, 1, 0.32, 1)` and the container stagger.
- One-shot mount animations: hero bar `width`, donut `stroke-dashoffset`, category bars.
- Add `:active { transform: scale(0.97) }` to pressable elements that lack it (verify
  `TextureButton` already does; add to bare `<button>`s used as controls).
- Animate only `transform` / `opacity` (and cheap `stroke-dashoffset` for the ring).
- Gate movement animations behind `prefers-reduced-motion` (keep opacity fades).
- No new animation on high-frequency tab switching beyond the existing crossfade.

## Styling conventions (match existing codebase)
- Headings: `font-poppins`, `text-[#212121]`, sizes per surrounding pages
  (`text-3xl md:text-4xl` for page-level).
- Reuse `formatRupiah` / `formatRupiahFull` (Indonesian `jt`/`rb` units) and `STATUS_CONFIG`.
- Card radius `rounded-2xl`, hairline borders `border-neutral-100`, as used today.

## Out of scope
- Backend / API changes.
- The `BudgetItemModal` (unchanged).
- Recharts adoption.
- Any other dashboard page.

## Success criteria
- Overview communicates budget health (remaining, % spent, where money goes, what's at
  risk, what's due) without scrolling on desktop.
- Items and Payments are fully usable on a phone (no horizontal scroll; actions tappable).
- Visual identity reads as a premium wedding product, using only DESIGN.md tokens.
- All existing functionality (add/edit/delete item, status change, filters) preserved.
