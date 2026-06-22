# Kisah Series Tier — Design Spec
**Date:** 2026-06-19  
**Tier:** kisah-series-tier (higher than kenangan-series-tier)  
**Theme name:** `sinema-kisah`  
**Theme folder:** `kategori-adat/kisah-series-tier/sinema-kisah/`  
**Aesthetic:** Ink & Amber — Cinematic Chapter Magazine

---

## 1. Product Positioning

kisah-series-tier must be architecturally and experientially distinct from kenangan-series-tier (sacred-luxe, warm-narrative). The core UX difference:

| Dimension | kenangan-series-tier | kisah-series-tier |
|-----------|---------------------|-------------------|
| Scroll axis | Vertical snap | Horizontal page-turn |
| Mental model | Landing page sections | Book / magazine chapters |
| Section count | 10–11 vertical sections | 13 horizontal slides in 5 chapters |
| Chapter covers | None | Full-bleed dramatic cover per chapter |
| Progress indicator | None | 5-chapter film-strip bar at bottom |

---

## 2. Visual Identity — "Ink & Amber"

### Color Tokens

| Token | Value | Name |
|-------|-------|------|
| `--bg` | `#0E0C0A` | Deep Ink |
| `--surface` | `#181410` | Ash |
| `--surface-2` | `#221D18` | Ember |
| `--amber` | `#C8915A` | Terracotta Amber |
| `--amber-light` | `#E0A96A` | Warm Highlight |
| `--amber-dim` | `#7A5538` | Subdued Amber |
| `--cream` | `#F2EBE1` | Ivory |
| `--cream-muted` | `#B8AA9A` | Linen |
| `--cream-dim` | `#7A6E64` | Stone |
| `--border` | `rgba(200,145,90,0.18)` | Amber Border |
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.6)` | Card shadow |
| `--grain-opacity` | `0.045` | Film grain overlay intensity |

Differentiation from sacred-luxe: sacred-luxe uses yellow-gold `#C9A84C` on near-black `#0A0A08`. Kisah uses terracotta amber `#C8915A` on ink-warm `#0E0C0A`. Same dark register, completely different warmth character. warm-narrative is light parchment — kisah is cinematic dark.

### Typography

| Role | Font | Weight / Style | Size |
|------|------|----------------|------|
| Chapter numerals | DM Serif Display | 400 italic | `clamp(120px, 38vw, 200px)` |
| Chapter titles | DM Serif Display | 400 italic | 28–36px |
| Couple / hero names | DM Serif Display | 400 regular | `clamp(48px, 14vw, 80px)` |
| Section headings | DM Serif Display | 400 italic | 22–28px |
| Body / quotes | Lora | 400 italic | 14–16px |
| Labels / metadata | Jost | 300, tracked 0.25–0.35em | 9–11px |

Google Fonts imports: `DM+Serif+Display:ital@0,1&family=Lora:ital@0,1&family=Jost:wght@300;400;500`

CSS class aliases:
- `.font-display` → DM Serif Display
- `.font-body` → Lora
- `.font-label` → Jost

### Film Grain Overlay

SVG feTurbulence filter injected as a fixed pseudo-element on `.film-grain` class:
```css
.film-grain::after {
  content: "";
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,...feTurbulence...");
  opacity: var(--grain-opacity);
  pointer-events: none; z-index: 9999;
}
```

---

## 3. Architecture

### Horizontal Scroll Controller

Single horizontal container: all slides laid flat, `display: flex`, each slide `width: 100vw; height: 100dvh; flex-shrink: 0`. Container `width: calc(13 * 100vw)`.

Navigation uses `transform: translateX(-currentSlide * 100vw)` with `transition: transform 680ms cubic-bezier(0.22, 1, 0.36, 1)` (easeOutCubic). 900ms lock after each navigation.

Input handling:
- **Wheel**: `deltaX` primary, `deltaY` fallback. Inertia filter: reject if `abs(delta) <= abs(prevDelta)`. `data-prevent-snap="true"` bypasses snap.
- **Touch**: Detect horizontal vs vertical via `abs(dx) > abs(dy) * 0.7`. Horizontal swipe threshold 40px. Internal vertical-scrollable elements ignored.
- **Keyboard**: `ArrowLeft` / `ArrowRight`, `PageUp` / `PageDown`.

IntersectionObserver at 55% threshold syncs `currentSlide` index for correct back-navigation.

### Chapter Map — 13 slides

| Slide | Component | Chapter |
|-------|-----------|---------|
| 0 | `ChapterCoverSlide` | I — Pembukaan |
| 1 | `GreetingSlide` | (I content) |
| 2 | `ChapterCoverSlide` | II — Mereka |
| 3 | `CoupleSlide` | (II content) |
| 4 | `ChapterCoverSlide` | III — Kisah Cinta |
| 5 | `LoveStorySlide` | (III content) |
| 6 | `ChapterCoverSlide` | IV — Hari Itu |
| 7 | `EventSlide` (akad) | (IV content) |
| 8 | `EventSlide` (resepsi) | (IV content) |
| 9 | `ChapterCoverSlide` | V — Selamanya |
| 10 | `GallerySlide` | (V content) |
| 11 | `RSVPSlide` | (V content) |
| 12 | `GiftClosingSlide` | (V content) |

Chapter boundaries:
- Chapter I: slides 0–1
- Chapter II: slides 2–3
- Chapter III: slides 4–5
- Chapter IV: slides 6–8
- Chapter V: slides 9–12

### Bottom Chapter Indicator

5 thin horizontal lines (40px wide, 2px tall), one per chapter, spaced 8px apart. Active chapter: line expands to 72px wide, amber fill, chapter title (e.g. "Hari Itu") fades in below in Jost 8px stone. Inactive: 40px, `rgba(200,145,90,0.25)`.

---

## 4. Component Specifications

### `ChapterCoverSlide`

Props: `{ numeral: "I"|"II"|"III"|"IV"|"V", title: string, imageSlot?: string }`

Layout (full 100vw × 100dvh):
- Background: couple photo (or placeholder gradient) with CSS filter `sepia(20%) contrast(1.1) brightness(0.75)`
- Gradient overlay: `linear-gradient(to top, rgba(14,12,10,0.92) 0%, rgba(14,12,10,0.3) 50%, rgba(14,12,10,0.1) 100%)`
- Film grain pseudo-element
- Top label: `"KISAH · BAB {numeral}"` Jost 9px tracked 0.35em `--amber-dim`, positioned `top: env(safe-area-inset-top) + 20px`
- Center: roman numeral in DM Serif Display italic, `clamp(120px, 38vw, 200px)`, `--amber`, `line-height: 0.85` — deliberately bleeds off top and bottom so only the middle third is visible. `overflow: hidden` on parent to clip.
- Divider: 48px wide, 1px, `--amber-dim`, centered, 16px below numeral
- Chapter title: DM Serif Display italic 28px `--cream`, 12px below divider
- Bottom hint: `"geser →"` Jost 10px `--cream-dim`, positioned `bottom: calc(env(safe-area-inset-bottom) + 80px)`, Framer Motion `opacity` pulse `[0.3, 0.7, 0.3]` on 3s loop

Entrance animation (when slide becomes active):
1. Photo cross-fades from black (opacity 0→1, 800ms)
2. Numeral translates up from +40px (opacity 0→1, 600ms, delay 200ms)
3. Divider scaleX 0→1 (400ms, delay 600ms)
4. Title opacity 0→1 (400ms, delay 800ms)
5. Hint opacity 0→0.7 (300ms, delay 1200ms)

### `GreetingSlide`

Full ink background + film grain. Content centered, max-width 300px.

Stack (top to bottom):
1. Bismillah Arabic — DM Serif Display italic 22px `--amber`, `text-align: center`
2. `copper-divider` equivalent: thin amber line 48px
3. Body Lora italic 14px `--cream-muted`, line-height 1.9 — the invitation text
4. Guest name — DM Serif Display 28px `--amber`, letter-by-letter stagger reveal via Framer Motion `variants` (each letter: `{ hidden: {opacity:0, y:8}, visible: (i) => ({opacity:1, y:0, transition:{delay: i*0.04}}) }`)
5. Thin amber divider
6. Signature: `"— Aryan & Sekar"` DM Serif italic 16px `--cream-dim`

### `CoupleSlide`

Asymmetric two-half layout:

Left half (50vw):
- Full-height groom photo, slight amber tint overlay
- Name `"Aryan"` DM Serif Display 56px `--cream`, bottom-left of photo
- Parents: Jost 300 10px `--cream-dim` below name

Center divider:
- `"&"` DM Serif Display italic 72px `--amber`, absolutely centered on the midpoint, with `mix-blend-mode: overlay` softening against both photos
- Thin vertical amber line behind the `&`, full height, 1px

Right half (50vw):
- Full-height bride photo
- Name `"Sekar"` DM Serif Display 56px `--cream`, bottom-right aligned
- Parents below

Below fold (requires internal vertical scroll, `data-prevent-snap`):
- Couple quote Lora italic `--cream-muted`
- Instagram handles Jost 10px

### `LoveStorySlide`

Internal vertical scroll (`data-prevent-snap`, `overflow-y: auto`).

Header: `"Kisah Kami"` DM Serif Display italic 32px `--amber`, padding top.

Per chapter (4 entries from `config.loveStory`):
- Full-width image, warm filter `sepia(25%) contrast(1.08) brightness(0.9)`
- Behind image: chapter roman numeral watermark `position: absolute`, 15% opacity `--amber`, `font-size: clamp(80px, 25vw, 140px)`
- Year badge: Jost 300 11px `--amber-dim`, letter-spacing
- Title: DM Serif Display italic 22px `--cream`
- Quote: Lora italic 14px `--cream-muted`, `line-height: 1.9`
- Left edge: 2px `--amber-dim` vertical timeline connector

### `EventSlide`

Props: `{ event: EventConfig, index: number, sectionId: string }`

Full height layout:
- Giant date number (`"21"`) DM Serif Display `clamp(100px, 30vw, 160px)`, `--cream` at 6% opacity — absolute positioned center-right as watermark
- Event label: Jost 9px tracked `--amber-dim` uppercase (`"AKAD NIKAH"` or `"RESEPSI"`)
- Date full: DM Serif Display 28px `--cream`
- Thin amber divider
- Time: Jost 11px `--amber` in pill border
- Venue: DM Serif italic 20px `--cream`
- Address: Lora 13px `--cream-muted`
- Map iframe: `sepia(30%) contrast(0.9) brightness(0.8) saturate(0.7)` + SVG corner accents
- Links: Maps + Kalender, Jost 10px with `→` arrow, amber hover

### `GallerySlide`

Internal vertical scroll (`data-prevent-snap`).

Header: `"Kenangan"` DM Serif Display italic 28px `--amber`.

2-column CSS masonry (`columns: 2 auto`, `column-gap: 10px`).

Each image: warm filter `sepia(20%) contrast(1.05) brightness(0.9)`. Thin amber border `1px solid var(--border)`.

Bottom sticky strip (dress code): 3–4 color swatches in circles (40px diameter), amber border, hex label Jost 8px. Sticky `bottom: 0`, `background: linear-gradient(transparent, var(--bg) 40%)`.

### `RSVPSlide`

Dark surface, internal scroll (`data-prevent-snap`).

Form styling — editorial borderless: inputs have `border: none; border-bottom: 1px solid var(--border); background: transparent; color: var(--cream)`. Focus state: bottom border becomes `--amber`.

Attendance toggle: two full-width buttons `HADIR` / `TIDAK HADIR` in Jost 400 tracked. Selected state: `background: var(--amber); color: var(--bg)`. Unselected: transparent with amber border.

Submit: full-width `background: var(--amber); color: var(--bg)` button in Jost 400.

### `GiftClosingSlide`

Two sections, internal scroll (`data-prevent-snap`):

**Gift half:**
- `"Amplop Digital"` label Jost 9px
- `"Hadiah"` DM Serif italic 32px `--amber`
- Body text Lora italic
- Bank cards: `--surface-2` bg, amber border, Jost for bank name + number, copy button with Check/Copy icon

**Closing half:**
- Intersecting rings (same pattern as warm-narrative)
- Names DM Serif Display 64px `--cream`
- `"&"` italic amber
- Ar-Rum 21 in Lora italic `--cream-muted`
- Hashtag Jost `--amber-dim`
- Brand footer: `"RIMBA DIGITAL · KISAH"` Jost 9px tracked

---

## 5. `page.tsx` Structure

```
CHAPTERS constant:
[
  { numeral:"I",   title:"Pembukaan",   slides:[0,1],     coverImage: config.couple.groom.photo },
  { numeral:"II",  title:"Mereka",      slides:[2,3],     coverImage: config.couple.bride.photo },
  { numeral:"III", title:"Kisah Cinta", slides:[4,5],     coverImage: config.loveStory[0].photo },
  { numeral:"IV",  title:"Hari Itu",    slides:[6,7,8],   coverImage: config.events.akad.mapEmbed ?? null },
  { numeral:"V",   title:"Selamanya",   slides:[9,10,11,12], coverImage: config.gallery[0]?.src ?? null },
  // null coverImage → fallback gradient: linear-gradient(135deg, var(--surface-2), var(--bg))
]
```

`renderSlide(index)` switch: 0→ChapterCoverSlide(I), 1→GreetingSlide, 2→ChapterCoverSlide(II), etc.

`currentChapter` derived from `currentSlide` by checking which chapter's `slides` array contains it.

`useHorizontalScrollController(totalSlides: 13)` — analogous to kenangan's `useScrollController` but horizontal axis.

---

## 6. File Structure

```
kisah-series-tier/<theme-name>/
├── invitation.config.json
├── src/
│   ├── app/
│   │   ├── globals.css          ← Ink & Amber tokens + utilities
│   │   ├── layout.tsx
│   │   └── page.tsx             ← Horizontal controller + slide registry
│   ├── components/
│   │   ├── RimbaConfigProvider.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── ChapterIndicator.tsx ← 5-chapter film-strip progress bar
│   │   └── slides/              ← (not "sections" — slides)
│   │       ├── ChapterCoverSlide.tsx
│   │       ├── GreetingSlide.tsx
│   │       ├── CoupleSlide.tsx
│   │       ├── LoveStorySlide.tsx
│   │       ├── EventSlide.tsx
│   │       ├── GallerySlide.tsx
│   │       ├── RSVPSlide.tsx
│   │       └── GiftClosingSlide.tsx
│   ├── data/
│   │   └── invitation.ts
│   └── lib/
│       ├── config-types.ts
│       └── css-vars.ts
```

---

## 7. Constraints

- No CSS scroll-snap — custom JS controller only
- `data-prevent-snap="true"` on all internal-scrollable elements
- All images via `invitation.config.json` — no hardcoded paths
- `bun dev` / `bun run build` — no npm
- TypeScript strict, zero `any`
- Framer Motion for all entrance animations; CSS transitions for scroll controller
- Google Fonts loaded via `next/font/google`
