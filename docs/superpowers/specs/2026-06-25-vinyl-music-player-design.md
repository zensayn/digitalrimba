# Vinyl Music Player Widget — warm-narrative theme

**Date:** 2026-06-25
**Theme:** `invitation/themes/adat/kenangan/warm-narrative`
**File:** `src/components/shared/MusicPlayer.tsx`

---

## Goal

Replace the existing horizontal pill music player bar with a floating vinyl record widget that matches the warm-narrative aesthetic: warm cream tones, copper-gold accents, paper texture, elegant serif feel.

---

## Visual Design

### Widget

- **Size:** 72×72px circular div
- **Position:** `fixed`, `bottom: 24px`, `right: 20px`, `z-index: 100`
- **Entry animation:** `fadeIn + scale(0.8 → 1.0)` after 2-second delay

### Vinyl Layers (bottom to top)

1. **Outer disc** — `background: #1A1410` (warm near-black), with concentric groove rings via `radial-gradient` using `rgba(255,255,255,0.04)` bands
2. **Center label** — `26×26px` circle at center, `background: var(--surface)` (#F2EDE4), contains a small copper dot or ornament (`var(--gold)`)
3. **Gloss highlight** — pseudo-element `::before`, top-half ellipse, `rgba(255,255,255,0.08)` — gives depth/sheen

### Rotation

- **Playing:** `animation: vinyl-spin 4s linear infinite`
- **Paused:** `animation-play-state: paused` — stops at current rotation angle (no snap-back)

### Tooltip (info lagu)

- Triggers on **hover** (desktop) and **tap** (mobile, via `useState`)
- Appears to the **left** of the vinyl: `right: calc(72px + 12px)`
- Content: `"{SONG_TITLE} · {SONG_ARTIST}"` — single line, ellipsis overflow
- Style: `background: rgba(242,237,228,0.92)`, `backdrop-filter: blur(10px)`, `border: 1px solid var(--border)`, `border-radius: 100px`, font Inter 10px, letter-spacing 0.06em, color `var(--text-muted)`
- Animation: `AnimatePresence` fade + `x: 8 → 0`

### Play/Pause

- **Tap anywhere on the vinyl** → toggle
- Visual feedback: rotation starts/stops
- No separate button UI — the vinyl IS the button (`cursor: pointer`)
- `disabled` + `opacity: 0.5` while audio not ready (`!ready`)

---

## CSS additions to globals.css

```css
@keyframes vinyl-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

No new CSS classes needed — styles are inline in the component for encapsulation.

---

## Component changes (MusicPlayer.tsx)

- Remove: `music-player-bar` class usage, waveform bars, song info divs, separate play button
- Add: vinyl disc structure with groove radial-gradient, center label, gloss pseudo via inline style + `::before` workaround (or a nested div)
- Add: `showTooltip` state (boolean), toggled on `onMouseEnter`/`onMouseLeave` and `onClick` on mobile
- Keep: all audio logic unchanged (`Audio`, `invitation-open` event, `ready` state, `toggle`)
- Keep: `visible` state with 2-second delay entry

---

## Constraints

- No new files — changes confined to `MusicPlayer.tsx` and `globals.css`
- Must work on mobile (no persistent hover) — tooltip via tap toggle with `onMouseEnter`/`onMouseLeave` + touch fallback
- Preserve all existing audio logic verbatim
- `MUSIC_SRC`, `SONG_TITLE`, `SONG_ARTIST` constants remain at top of file for easy customization
