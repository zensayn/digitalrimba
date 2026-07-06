# Visual Upgrade — Warm Narrative
**Date:** 2026-06-28  
**Status:** Approved

## Context

The warm-narrative wedding invitation theme felt visually flat past the cover section. All sections used the same pattern: center-aligned text, simple `fadeUp` animations, `copper-divider`, and a nearly-invisible paper overlay. Goal: give every section a distinct visual personality through unique motion signatures, layout upgrades, and gradient differentiation — while staying inside the existing design system (gold/copper palette, Playfair Display + Source Serif 4, framer-motion).

No new libraries needed. All motion uses existing framer-motion installation.

---

## Section-by-Section Design

### 1. Greeting Section
**Motion signature:** Bismillah text clip-reveal left-to-right (`clipPath: "inset(0 100% 0 0)" → "inset(0 0% 0 0)"`), gold divider draws in after with the same technique.  
**Floating surat:** Apply CSS `float` keyframe (already in globals.css) to the Surat.webp — subtle 4px y-oscillation, 4s loop.  
**Gradient:** Existing radial glow enhanced — `rgba(192,120,48,0.10)` (up from 0.06).  
**No layout change.**

### 2. Couple Section
**Layout change:** Replace initials circles with tall portrait photos (3:4 ratio, `~140px` wide). Two photos side-by-side, centered horizontally.  
**Photo source:** `couple.groom.photo` + `couple.bride.photo` from config — update JSON to Unsplash portrait URLs.  
**Photo style:** `filter: sepia(18%) contrast(1.04) brightness(0.97)` + 1px border `var(--border)` + corner ornaments (existing `.corner-ornament` CSS).  
**Motion signature:** Photos reveal via `clipPath: "inset(100% 0 0 0)" → "inset(0 0 0 0)"` — appear to "rise from the paper". Stagger: groom at `delay: 0`, bride at `delay: 0.12`.  
**Background:** BungaPutihBorder opacity `0.2 → 0.32`. Watermark "Mempelai" stays.  
**Gradient accent:** Add soft radial gradient centered behind the two photos: `radial-gradient(ellipse 70% 50% at 50% 45%, rgba(192,120,48,0.07) 0%, transparent 70%)`.

### 3. Love Story Section
**Layout change:** Zigzag text-alignment per chapter. Odd chapters (index 0, 2): image slight left offset, text/year left-aligned. Even chapters (index 1, 3): image slight right offset, text/year right-aligned.  
**Vertical timeline:** A single gold vertical line spanning the full section height, on the left margin. Uses `useScroll` + `useTransform` to animate `scaleY: 0 → 1` as the section scrolls into view. `transform-origin: top`.  
**Timeline dots:** Small filled circle (6px, gold) at each chapter's y-position on the line.  
**Motion signature:** Images reveal via `clipPath: "inset(0 0 100% 0)" → "inset(0 0 0% 0)"` (rise from bottom). Chapter title appears with `x: -20 → 0` for odd, `x: 20 → 0` for even.  
**Chapter title size:** `clamp(32px, 9vw, 48px)` (up from `clamp(26px, 8vw, 42px)`).  
**Gradient:** Section background `var(--surface)` gets a left-edge warm wash: `linear-gradient(90deg, rgba(192,120,48,0.05) 0%, transparent 40%)`.

### 4. Event Section (Akad + Resepsi)
**SVG animated ring:** A circle SVG surrounding the large date number. On section enter, `strokeDashoffset` animates from full circumference → 0 (ring "draws itself"). Ring is thin (1px), gold-dim color. Radius: ~65px.  
**Background asset parallax:** `useScroll` + `useTransform` — background image (CincinEmas / TempatPernikahan) translates Y by `[-20px, 20px]` as user scrolls through the section.  
**Background opacity:** Akad: `0.10 → 0.18`. Resepsi: `0.20 → 0.30`.  
**Venue card:** Apply 4 `.corner-ornament` elements (tl/tr/bl/br — CSS already exists).  
**Motion signature (Akad):** Elements enter with `x: -16 → 0` (slide from left).  
**Motion signature (Resepsi):** Elements enter with `x: 16 → 0` (slide from right) — creates contrast between the two sibling sections.  
**Gradient differentiation:** Akad keeps `var(--surface)`. Resepsi gets `var(--bg)` with a subtle radial at top-right: `radial-gradient(ellipse 60% 40% at 80% 20%, rgba(212,160,86,0.08) 0%, transparent 60%)` — slightly warmer gold-light tint.

### 5. Dress Code Section
**Layout change:** Replace small circles (34–46px) with rectangular fabric swatches (`72px × 104px`). 3-column grid. Each swatch: solid color block (top ~75%) + color name + hex below (bottom ~25%, tiny Inter font).  
**Swatch styling:** `border: 1px solid rgba(192,120,48,0.2)`, `box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(42,34,24,0.10)`.  
**Motion signature:** Swatches enter in stagger (`i * 0.06s`) with alternating direction — even-index from `x: -20`, odd-index from `x: 20`. None of them do plain `y` fade-up (different from every other section).  
**Gradient:** Background `var(--surface)` + a subtle center vignette: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(42,34,24,0.04) 100%)`.

### 6. Closing Section
**Full-bleed background photo:** `gallery[0].src` (first gallery photo) as `position: absolute; inset: 0; object-fit: cover`. This is guaranteed to exist per config shape.  
**Photo treatment:** `filter: blur(3px) sepia(35%) brightness(0.32) contrast(1.1)` + warm dark overlay `linear-gradient(180deg, rgba(42,34,24,0.65) 0%, rgba(42,34,24,0.78) 100%)`.  
**Text color adjustment:** Names stay `text-copper-gradient` (works on dark bg). Quote text changes to `rgba(250,247,242,0.85)` (light parchment on dark). Intersecting rings border: `rgba(192,120,48,0.5)` (up from current).  
**Motion signature:** Names (`couple.groom.name`, `couple.bride.name`) split into individual characters, each character animates in with `y: 40 → 0, opacity: 0 → 1` with per-character stagger `i * 0.04s`. This is the most dramatic reveal in the whole invitation — befitting the closing.  
**Gradient:** The overlay is itself a gradient (top lighter → bottom darker) to create depth.

---

## Cross-Cutting

### Per-Section Gradient Identity Summary
| Section | Background | Gradient Accent |
|---|---|---|
| Greeting | `--surface` | Radial gold center (enhanced) |
| Couple | `--bg` | Radial behind photos |
| Love Story | `--surface` | Left-edge warm wash |
| Akad | `--surface` | Existing glow |
| Resepsi | `--bg` | Top-right gold-light radial |
| Dress Code | `--surface` | Center vignette dark |
| Closing | Dark photo | Gradient overlay top→bottom |

### Motion Variety Summary
| Section | Signature Motion |
|---|---|
| Greeting | Clip-path left→right (horizontal reveal) |
| Couple | Clip-path bottom→top (vertical rise) |
| Love Story | Clip-path bottom→top on images + x-slide on text |
| Akad | x-slide from left |
| Resepsi | x-slide from right |
| Dress Code | x-slide alternating left/right (no y at all) |
| Closing | Per-character y-stagger |

No two adjacent sections share the same motion signature.

---

## Config Changes

`invitation.config.json`:
- `couple.groom.photo` → Unsplash portrait URL (man, formal/warm)
- `couple.bride.photo` → Unsplash portrait URL (woman, formal/warm)

## Files to Change

1. `src/components/sections/GreetingSection.tsx` — bismillah clip reveal, floating surat
2. `src/components/sections/CoupleSection.tsx` — photo portrait layout, clip reveal
3. `src/components/sections/LoveStorySection.tsx` — zigzag, timeline, clip reveals
4. `src/components/sections/EventSection.tsx` — SVG ring, parallax, corner ornaments, slide direction
5. `src/components/sections/DressCodeSection.tsx` — fabric swatches, x-stagger
6. `src/components/sections/ClosingSection.tsx` — full-bleed photo bg, character stagger
7. `invitation.config.json` — update photo URLs
