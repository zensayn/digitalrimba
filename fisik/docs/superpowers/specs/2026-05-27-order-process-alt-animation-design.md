# OrderProcessAlternative — Animation Reversal & Left Parallax

**Date:** 2026-05-27  
**File:** `frontend/components/OrderProcessAlternative.tsx`  
**Status:** Approved

---

## Goal

Two targeted animation changes to `OrderProcessAlternative`:

1. **Right column stacking order** — Fix z-index so item 1 is the hidden base and item 5 ends on top.
2. **Left column scroll behaviour** — Replace the fully-static sticky feel with a subtle GSAP parallax float.

---

## Current Behaviour

The right column uses GSAP `ScrollTrigger.pin` with `pinSpacing: false`. All five rows pin at `top: 180px` as the user scrolls. Because no explicit `z-index` is set on the rows, GSAP's pin internals control stacking order — resulting in **item 1 ending on top** (wrong).

The left column is CSS-sticky (`sticky top-[180px]`) and completely static — it does not move at all during the section scroll.

---

## Desired Behaviour

### Right column

| Scroll stage | Visible card | Stack (bottom → top) |
|---|---|---|
| Enter section | Item 1 just pinned | 1 |
| Scroll | Item 2 covers 1 | 1 ← 2 |
| Scroll | Item 3 covers 2 | 1 ← 2 ← 3 |
| Scroll | Item 4 covers 3 | 1 ← 2 ← 3 ← 4 |
| End | Item 5 on top | 1 ← 2 ← 3 ← 4 ← 5 |

Item 1 is the permanent base — hidden once item 2 arrives. Item 5 is the final visible card.

### Left column

Smooth parallax follow: column stays approximately in view (sticky positioning retained as a base) but GSAP adds a subtle upward float (`yPercent: 0 → -12`) with `scrub: 1.5` over the section scroll range. This gives the left content a sense of depth rather than feeling locked.

---

## Implementation

### Change 1 — Explicit z-index on row wrappers

Add `style={{ zIndex: i + 1 }}` to the row wrapper `<div>` inside the `.map()`:

```tsx
<div
  key={item.id}
  className="order-alt-row-wrapper ..."
  style={{ zIndex: i + 1 }}   // ← add this
>
```

- Item 1 (i=0): `z-index: 1` → bottom of stack
- Item 5 (i=4): `z-index: 5` → top of stack, always visible at end

### Change 2 — Left column ref + GSAP parallax

1. Add `leftColRef = useRef<HTMLDivElement>(null)` alongside existing refs.
2. Attach `ref={leftColRef}` to the left sticky column `<div>`.
3. Inside the existing `gsap.context()` block, add:

```ts
gsap.to(leftColRef.current, {
  yPercent: -12,
  ease: "none",
  scrollTrigger: {
    trigger: containerRef.current,
    start: "top center",
    end: "bottom center",
    scrub: 1.5,
  },
});
```

No changes to the right-column `ScrollTrigger.create()` loop — only z-index is added via JSX style prop.

---

## Constraints

- No new dependencies — uses existing GSAP + ScrollTrigger already registered.
- No changes to existing pin logic, timing values, or section layout.
- Left column retains `sticky top-[180px]` Tailwind class; GSAP transform is additive.
- Change is scoped entirely to `OrderProcessAlternative.tsx`.

---

## Files Changed

| File | Change |
|---|---|
| `frontend/components/OrderProcessAlternative.tsx` | Add z-index style to row wrappers; add leftColRef + GSAP parallax tween |
