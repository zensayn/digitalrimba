# ProductInteractive — Capped Thumbnail Strip with Overflow Indicator

**Date:** 2026-06-18
**File:** `frontend/components/products/ProductInteractive.tsx`
**Status:** Approved

---

## Goal

The product detail page's thumbnail rail (desktop vertical sidebar + mobile horizontal strip) renders every product image with no limit. Products with many images (up to 14 in seed data, e.g. `aurelia`) produce an overly long, unwieldy thumbnail rail.

Cap the rail at 5 visible thumbnails. When there are more than 5 images, overlay a "+N" badge on the 5th tile and route its click into the existing fullscreen image dialog so the user can still reach every image.

---

## Current Behaviour

- `views.map(...)` renders one thumbnail button per image, unbounded, in both the desktop sidebar (`hidden lg:flex flex-col gap-3 w-[80px]`, ~line 127) and the mobile strip (`flex lg:hidden gap-2 mt-3`, ~line 179).
- Clicking any thumbnail calls `setActiveView(i)`, swapping the main preview image. Nothing else happens.
- Clicking the *main* preview image already opens `ProductImageDialog` (`cursor-zoom-in` handler, ~line 158), which shows a large image with prev/next nav and its own thumbnail sidebar listing **all** images uncapped. This dialog requires no changes — it's the existing "view everything" mechanism this design hooks into.

---

## Desired Behaviour

- Both thumbnail rails show at most 5 tiles, regardless of how many images the product has.
- If the product has 5 or fewer images: zero behavior change, no overlay ever appears.
- If the product has more than 5 images: the 5th tile shows its image with a dark scrim (`bg-black/55`) and centered white `+N` text, where `N = images.length - 5` (count of images not shown in the rail at all).
- Clicking the 5th tile when it's in "overflow" state sets it as the active preview **and** opens `ProductImageDialog` at that index — landing the user directly in the fullscreen-style dialog, where its own uncapped thumbnail grid exposes the rest.
- Clicking tiles 1-4 (or tile 5 when there's no overflow) behaves exactly as today — only `setActiveView` fires, no dialog.

---

## Implementation

### Change 1 — Compute visible/hidden split once

Near the existing `const views = images;` line:

```ts
const MAX_VISIBLE_THUMBNAILS = 5;
const visibleThumbnails = views.slice(0, MAX_VISIBLE_THUMBNAILS);
const hiddenCount = Math.max(0, views.length - MAX_VISIBLE_THUMBNAILS);
```

### Change 2 — New click handler for the overflow tile

```ts
const openOverflow = (index: number) => {
  setActiveView(index);
  setIsDialogOpen(true);
};
```

### Change 3 — Desktop sidebar (~line 127)

Map over `visibleThumbnails` instead of `views`. For the last rendered tile, when `hiddenCount > 0`:
- Keep rendering its `<Image>` as-is.
- Add an absolutely-positioned overlay `<span>`/`<div>` with `bg-black/55` covering the tile, centered `+{hiddenCount}` text, white, medium weight.
- `onClick` → `openOverflow(i)` instead of `setActiveView(i)`.
- `aria-label` → `` `View ${hiddenCount} more images` `` instead of `` `View ${i + 1}` ``.

### Change 4 — Mobile strip (~line 179)

Same treatment as Change 3, applied to the `flex lg:hidden` strip that currently maps over `views`.

### Change 5 — No changes to `ProductImageDialog.tsx`

It already accepts `images` (the full, uncapped list) and `initialViewIndex`, and already renders an uncapped thumbnail grid internally. The overflow tile's click handler opens it with `initialViewIndex` pointing at the 5th image; the dialog's own UI lets the user reach images 6+ via its thumbnail grid or prev/next arrows.

---

## Constraints

- No new dependencies.
- No changes to `ProductImageDialog.tsx` — it already does what's needed for "view all images fullscreen."
- `hiddenCount` is derived from `images.length` every render — never hardcoded, so it stays correct as catalog data changes.
- Change is scoped entirely to `ProductInteractive.tsx`.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `images.length <= 5` | No overlay anywhere, all tiles behave as today. |
| `images.length === 6` | Tile 5 shows `+1` overlay. |
| `images.length === 14` (e.g. `aurelia`) | Tile 5 shows `+9` overlay. |
| Click tile 1-4 | `setActiveView` only, dialog stays closed. |
| Click tile 5 with overflow | `setActiveView` + dialog opens at that index. |

---

## Testing

Manual verification in the dev server (requires Postgres running, per `backend/cmd/seed-catalog`):
- A product with >5 images (`aurelia`, 14 images) — confirm overlay count, confirm click opens the dialog at the right image, confirm dialog's own thumbnail grid still reaches every image.
- A product with ≤5 images — confirm no overlay, no behavior change.
- Both desktop (≥1024px) and mobile breakpoints.

---

## Files Changed

| File | Change |
|---|---|
| `frontend/components/products/ProductInteractive.tsx` | Cap both thumbnail rails at 5 tiles; add overflow badge + dialog-opening click handler on the 5th tile when more images exist. |
