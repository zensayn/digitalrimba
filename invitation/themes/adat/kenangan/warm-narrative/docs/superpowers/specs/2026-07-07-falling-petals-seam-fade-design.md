# Falling Petals Seam Fade — Design

**Date:** 2026-07-07
**Status:** Approved

## Goal

The Cover section's falling sakura petals (`FallingFlowers`) currently vanish
abruptly at the Cover/Greeting boundary because `CoverSection` clips its
overflow. Instead, petals should continue falling into the Greeting section
and fade out gradually, fully disappearing about **40% of the way into
Greeting** (agreed with user). This mirrors the existing garland "overhang"
pattern (`ParallaxScene` seam overhang), where framing pieces deliberately
cross section boundaries.

## Approach (chosen: Option A — extended container + CSS mask)

Fade is **position-based**, not time-based: a `mask-image` gradient on the
petal container makes every petal start fading exactly at the seam,
uniformly, regardless of its individual animation timing.

Rejected alternatives:

- **Option B — keyframe opacity tuning only:** fade percentage must be
  hand-derived from the translateY curve; brittle when the fade distance
  changes later.
- **Option C — second `FallingFlowers` instance in Greeting:** the two
  instances mount at different times, so petals visibly "cut" at the seam.

## Changes

### `src/components/sections/CoverSection.tsx`

1. Remove `overflow: "hidden"` from the `<section>` inline style — it was the
   only thing clipping the petals (`.snap-section` is already
   `overflow: visible`). Add a comment stating the new constraint: the
   section must stay un-clipped so the petals can hang into Greeting.
2. Update the stale comment above the bottom-corner layers that says the
   section clips overflow. Corner positions themselves are unchanged.

### `src/components/shared/FallingFlowers.tsx`

1. Wrapper: `inset: 0` → `top: 0, left: 0, right: 0, height: "140svh"`
   (100svh Cover + first 40svh of Greeting).
2. Add to the wrapper:
   `maskImage` / `WebkitMaskImage:
   linear-gradient(to bottom, #000 0, #000 98svh, transparent 140svh)` —
   solid until just before the seam, then a linear fade to nothing at 40% of
   Greeting. Tuning the fade later = changing these two numbers.
3. Keyframes: extend the final drop from `112vh` to `145vh` so every petal
   exits past the mask's transparent edge before looping (no petal pops out
   mid-fade). Remove the old time-based fade-out (92% → 100% opacity); keep
   the 0 → 8% fade-in. Rescale the mid keyframes proportionally
   (30% → ~36vh, 60% → ~78vh).
4. Stretch `duration` (~6–15s → ~8–20s) and the negative `delay` spread
   (14s → 18s) so the longer travel keeps the same apparent falling speed
   and phase spread.

## Stacking

The petal wrapper (`zIndex: 1`) lives in the Cover section, which is not a
stacking context. Greeting's scene background is locked inside its own
`z-index: 0` stacking context, so overhanging petals paint **above
Greeting's background but below** its overhang garlands (z 5) and content
(z 10) — identical to the existing cross-section garland behaviour.

## Performance / behaviour notes

- The `useInView` pause keeps working: the taller wrapper still intersects
  the viewport while its Greeting portion is visible, and pauses once
  scrolled past.
- No new elements, no JS loop changes — one mask declaration and retuned
  keyframe numbers.

## Verification

Run the dev server, scroll Cover → Greeting slowly:

- Petals cross the seam un-clipped.
- Petals fade to nothing before mid-Greeting.
- No horizontal scrollbar; no petals popping in/out mid-fade.
