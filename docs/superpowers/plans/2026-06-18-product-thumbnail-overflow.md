# Product Thumbnail Overflow Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cap the product detail page's thumbnail rail (desktop sidebar + mobile strip) at 5 tiles, showing a "+N" overflow badge on the 5th tile that opens the existing fullscreen `ProductImageDialog` when a product has more than 5 images.

**Architecture:** Single-file change to `frontend/components/products/ProductInteractive.tsx`. Compute a capped `visibleThumbnails` array and a `hiddenCount` once per render; both the desktop and mobile thumbnail `.map()` blocks consume these instead of the raw `views` array. The last tile gets a conditional dark-scrim overlay and a click handler that opens `ProductImageDialog` (unchanged) instead of just switching the active preview.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS v4. No test framework (Vitest/Jest/RTL/Playwright) is configured anywhere in `frontend/` — verification is manual via the dev server, matching the approved spec's testing section.

**Spec:** `docs/superpowers/specs/2026-06-18-product-thumbnail-overflow-design.md`

## Global Constraints

- No new dependencies.
- No changes to `frontend/components/products/ProductImageDialog.tsx` — it already accepts the full, uncapped `images` list and an `initialViewIndex`, and already renders its own uncapped thumbnail grid.
- `hiddenCount` must be derived from `images.length` every render (`Math.max(0, views.length - 5)`) — never hardcoded.
- Tiles 1-4 (and tile 5 when nothing is hidden) must keep today's exact behavior: `onClick` only calls `setActiveView(i)`.
- Change is scoped entirely to `frontend/components/products/ProductInteractive.tsx`.

---

### Task 1: Shared overflow logic + desktop sidebar

**Files:**
- Modify: `frontend/components/products/ProductInteractive.tsx:113` (add computed values + handler after `const views = images;`)
- Modify: `frontend/components/products/ProductInteractive.tsx:126-150` (desktop sidebar thumbnail block)

**Interfaces:**
- Produces: `MAX_VISIBLE_THUMBNAILS: number`, `visibleThumbnails: ProductView[]`, `hiddenCount: number`, `openOverflow(index: number): void` — all defined inside `ProductInteractive`, consumed by Task 2's mobile block.

- [ ] **Step 1: Add the capped-list computation and overflow click handler**

In `frontend/components/products/ProductInteractive.tsx`, find:

```tsx
  const views = images;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));
```

Replace with:

```tsx
  const views = images;

  const MAX_VISIBLE_THUMBNAILS = 5;
  const visibleThumbnails = views.slice(0, MAX_VISIBLE_THUMBNAILS);
  const hiddenCount = Math.max(0, views.length - MAX_VISIBLE_THUMBNAILS);

  const openOverflow = (index: number) => {
    setActiveView(index);
    setIsDialogOpen(true);
  };

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));
```

- [ ] **Step 2: Cap the desktop sidebar and add the overflow badge**

Find the desktop thumbnails block:

```tsx
          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3 w-[80px] shrink-0">
            {views.map((view, i) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(i)}
                aria-label={`View ${i + 1}`}
                aria-current={activeView === i}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] border"
                style={{
                  borderColor: activeView === i ? "#346739" : "#f2f2f2",
                  transition: `border-color 200ms ${EASE}`,
                }}
              >
                <Image
                  src={view.src}
                  alt={view.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
```

Replace with:

```tsx
          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3 w-[80px] shrink-0">
            {visibleThumbnails.map((view, i) => {
              const isOverflowTile = i === visibleThumbnails.length - 1 && hiddenCount > 0;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => (isOverflowTile ? openOverflow(i) : setActiveView(i))}
                  aria-label={isOverflowTile ? `View ${hiddenCount} more images` : `View ${i + 1}`}
                  aria-current={activeView === i}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] border"
                  style={{
                    borderColor: activeView === i ? "#346739" : "#f2f2f2",
                    transition: `border-color 200ms ${EASE}`,
                  }}
                >
                  <Image
                    src={view.src}
                    alt={view.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {isOverflowTile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                      <span className="font-poppins text-sm font-medium text-white">
                        +{hiddenCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
```

- [ ] **Step 3: Verify the dev stack runs and the desktop sidebar caps correctly**

Run (in three separate terminals, or background the first two):

```bash
docker compose -f backend/docker-compose.yml up -d
```
Expected: `rimba_postgres` container is `running`/`healthy` (check with `docker compose -f backend/docker-compose.yml ps`).

```bash
cd backend && go run ./cmd/seed-catalog
```
Expected: exits 0, logs indicate products were seeded/already present (idempotent).

```bash
cd backend && go run ./cmd/api
```
Expected: log line `rimba-api listening on :8080`.

```bash
cd frontend && bun dev
```
Expected: Next.js dev server ready on `http://localhost:3000`.

Then open `http://localhost:3000/id/products/aurelia` in a browser at a desktop viewport width (≥1024px):
- Expected: the left sidebar shows exactly 5 thumbnails. The 5th has a dark overlay reading `+9` (Aurelia has 14 images: 14 − 5 = 9).
- Click the `+9` tile. Expected: `ProductImageDialog` opens, showing Aurelia's 5th image as the active large preview.
- Close the dialog, click thumbnail 1. Expected: dialog stays closed, main preview switches to image 1 (unchanged behavior).

Then open `http://localhost:3000/id/products/midnight` (exactly 5 images — confirmed via `image_count` in `db/seed/catalog-seed.json`) at the same desktop width:
- Expected: no overlay on any tile, sidebar shows all 5 of that product's images with no badge.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/products/ProductInteractive.tsx
git commit -m "$(cat <<'EOF'
Cap desktop product thumbnail sidebar at 5 with +N overflow tile

Clicking the overflow tile opens the existing fullscreen image
dialog at that index so every image stays reachable.
EOF
)"
```

---

### Task 2: Mobile thumbnail strip

**Files:**
- Modify: `frontend/components/products/ProductInteractive.tsx:178-202` (mobile thumbnail strip block)

**Interfaces:**
- Consumes: `visibleThumbnails`, `hiddenCount`, `openOverflow` from Task 1 (same component, already in scope — no import needed).

- [ ] **Step 1: Cap the mobile strip and add the overflow badge**

Find the mobile thumbnail strip block:

```tsx
            {/* Mobile thumbnail strip */}
            <div className="flex lg:hidden gap-2 mt-3">
              {views.map((view, i) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(i)}
                  aria-label={`View ${i + 1}`}
                  aria-current={activeView === i}
                  className="relative flex-1 aspect-[3/4] overflow-hidden rounded-[10px] border"
                  style={{
                    borderColor: activeView === i ? "#346739" : "#f2f2f2",
                    transition: `border-color 200ms ${EASE}`,
                  }}
                >
                  <Image
                    src={view.src}
                    alt={view.alt}
                    fill
                    sizes="(max-width: 640px) 33vw, 25vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
```

Replace with:

```tsx
            {/* Mobile thumbnail strip */}
            <div className="flex lg:hidden gap-2 mt-3">
              {visibleThumbnails.map((view, i) => {
                const isOverflowTile = i === visibleThumbnails.length - 1 && hiddenCount > 0;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => (isOverflowTile ? openOverflow(i) : setActiveView(i))}
                    aria-label={isOverflowTile ? `View ${hiddenCount} more images` : `View ${i + 1}`}
                    aria-current={activeView === i}
                    className="relative flex-1 aspect-[3/4] overflow-hidden rounded-[10px] border"
                    style={{
                      borderColor: activeView === i ? "#346739" : "#f2f2f2",
                      transition: `border-color 200ms ${EASE}`,
                    }}
                  >
                    <Image
                      src={view.src}
                      alt={view.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 25vw"
                      className="object-cover"
                    />
                    {isOverflowTile && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                        <span className="font-poppins text-xs font-medium text-white">
                          +{hiddenCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
```

- [ ] **Step 2: Verify mobile strip caps correctly (dev stack from Task 1 still running)**

In the browser, switch to a mobile viewport (e.g. browser dev tools device toolbar, ≤640px width) and reload `http://localhost:3000/id/products/aurelia`:
- Expected: the horizontal strip below the main image shows exactly 5 thumbnails. The 5th has a dark overlay reading `+9`.
- Tap/click the `+9` tile. Expected: `ProductImageDialog` opens at Aurelia's 5th image.
- Close the dialog, tap thumbnail 1. Expected: dialog stays closed, main preview switches to image 1.

Switch back to a desktop viewport (≥1024px) on the same page:
- Expected: desktop sidebar still shows the `+9` overlay on tile 5 (confirms Task 1 didn't regress).

Reload `http://localhost:3000/id/products/midnight` (the 5-image product from Task 1's Step 3) at mobile width:
- Expected: no overlay on any tile in the mobile strip.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/products/ProductInteractive.tsx
git commit -m "$(cat <<'EOF'
Cap mobile product thumbnail strip at 5 with +N overflow tile

Mirrors the desktop sidebar behavior: the 5th tile opens the
fullscreen image dialog when more images exist than fit the strip.
EOF
)"
```
