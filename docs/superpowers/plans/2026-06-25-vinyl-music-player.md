# Vinyl Music Player Widget — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the horizontal pill music player bar in warm-narrative theme with a floating vinyl record widget that rotates when playing and shows a song info tooltip on hover.

**Architecture:** Two file changes only — add `@keyframes vinyl-spin` to `globals.css` and replace the JSX/styles in `MusicPlayer.tsx`. All audio logic is preserved verbatim; only the visual structure changes.

**Tech Stack:** React (Next.js), Framer Motion (`motion`, `AnimatePresence`), CSS custom properties, inline styles.

## Global Constraints

- Changes confined to exactly 2 files: `globals.css` and `MusicPlayer.tsx`
- No new files, no new npm packages
- All audio logic (`Audio`, `invitation-open` event, `ready` state, `toggle`, `loop`, `preload`) must be preserved unchanged
- Constants `MUSIC_SRC`, `SONG_TITLE`, `SONG_ARTIST` remain at top of file
- Must work on mobile (no hover) — tooltip only on desktop hover; tap = play/pause only
- Use existing CSS custom properties: `--surface`, `--gold`, `--gold-dim`, `--text-muted`, `--border`, `--shadow-card`, `--shadow-warm`

---

### Task 1: Add vinyl-spin keyframe and clean up globals.css

**Files:**
- Modify: `invitation/themes/adat/kenangan/warm-narrative/src/app/globals.css`

**Interfaces:**
- Produces: `@keyframes vinyl-spin` — available globally, used by Task 2's inline `animation` style

- [ ] **Step 1: Add `@keyframes vinyl-spin` to globals.css**

In `globals.css`, find the `/* ─── Animations ───` section (around line 165) and add after the existing `@keyframes float` block:

```css
@keyframes vinyl-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

- [ ] **Step 2: Remove the `.music-player-bar` CSS block**

Find and delete the entire `.music-player-bar` block (lines 253–271):

```css
/* ─── Music player bar ───────────────────────────────────────────────────────── */
.music-player-bar {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  right: 20px;
  left: auto;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: rgba(242, 237, 228, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 100px;
  white-space: nowrap;
  box-shadow: var(--shadow-warm);
}
```

- [ ] **Step 3: Verify globals.css compiles — check for syntax errors**

Run: `cd invitation && bun run build 2>&1 | head -30`
Expected: no CSS parse errors (build may fail on other things — only check CSS section)

- [ ] **Step 4: Commit**

```bash
git add invitation/themes/adat/kenangan/warm-narrative/src/app/globals.css
git commit -m "feat(warm-narrative): add vinyl-spin keyframe, remove pill player styles"
```

---

### Task 2: Rewrite MusicPlayer.tsx as vinyl widget

**Files:**
- Modify: `invitation/themes/adat/kenangan/warm-narrative/src/components/shared/MusicPlayer.tsx`

**Interfaces:**
- Consumes: `@keyframes vinyl-spin` from Task 1 (referenced as `"vinyl-spin 4s linear infinite"` in inline style)
- Produces: `<MusicPlayer />` — default export, no props, same API as before

- [ ] **Step 1: Replace the entire file content**

Replace `MusicPlayer.tsx` with:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── GANTI SESUAI TEMA ─────────────────────────────────────────────────────────
const MUSIC_SRC   = "/music/NAMA_FILE.mp3";
const SONG_TITLE  = "Judul Lagu";
const SONG_ARTIST = "Nama Artis";
// ─────────────────────────────────────────────────────────────────────────────

export default function MusicPlayer() {
  const [playing, setPlaying]         = useState(false);
  const [visible, setVisible]         = useState(false);
  const [ready, setReady]             = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const audioRef                      = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio    = new Audio(MUSIC_SRC);
    audio.loop     = true;
    audio.preload  = "auto";
    audio.oncanplaythrough = () => setReady(true);
    audioRef.current = audio;

    const showTimer = setTimeout(() => setVisible(true), 2000);

    const onOpen = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    document.addEventListener("invitation-open", onOpen);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener("invitation-open", onOpen);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: "calc(24px + env(safe-area-inset-bottom))",
            right: 20,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Tooltip — desktop hover only */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginRight: 10,
                  padding: "5px 14px",
                  background: "rgba(242,237,228,0.92)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid var(--border)",
                  borderRadius: 100,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {SONG_TITLE} · {SONG_ARTIST}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vinyl disc */}
          <div
            id="music-toggle-btn"
            onClick={toggle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              cursor: ready ? "pointer" : "default",
              opacity: ready ? 1 : 0.45,
              position: "relative",
              flexShrink: 0,
              // Always present so rotation persists on pause (animationPlayState pauses in-place)
              animation: "vinyl-spin 4s linear infinite",
              animationPlayState: playing ? "running" : "paused",
              background: `radial-gradient(circle at center,
                #1A1410 0%,
                #1A1410 39%,
                rgba(255,255,255,0.07) 41%,
                #1A1410 42%,
                rgba(255,255,255,0.05) 54%,
                #1A1410 55%,
                rgba(255,255,255,0.04) 67%,
                #1A1410 68%,
                rgba(255,255,255,0.04) 80%,
                #1A1410 81%,
                rgba(255,255,255,0.03) 92%,
                #1A1410 93%
              )`,
              boxShadow: "0 4px 20px rgba(42,34,24,0.3)",
            }}
          >
            {/* Center label */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--surface)",
                boxShadow: "0 0 0 1px rgba(192,120,48,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Spindle dot */}
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: playing ? "var(--gold)" : "var(--gold-dim)",
                  transition: "background 0.4s ease",
                }}
              />
            </div>

            {/* Gloss highlight */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at 36% 28%, rgba(255,255,255,0.10) 0%, transparent 55%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles without errors**

Run: `cd invitation && bun run build 2>&1 | grep -E "error|Error" | head -20`
Expected: no TypeScript errors in MusicPlayer.tsx

- [ ] **Step 3: Manual visual check**

Run the dev server: `cd invitation/themes/adat/kenangan/warm-narrative && bun dev`
Open `http://localhost:3000` and verify:
- [ ] Vinyl circle appears at bottom-right after ~2 seconds
- [ ] Vinyl is dark with subtle groove rings and cream center label
- [ ] Tapping vinyl toggles rotation (spin = playing, paused = stopped)
- [ ] Hovering shows tooltip left of vinyl with song info
- [ ] Spindle dot changes from `gold-dim` → `gold` when playing
- [ ] Entry is a smooth scale-up fade-in

- [ ] **Step 4: Commit**

```bash
git add invitation/themes/adat/kenangan/warm-narrative/src/components/shared/MusicPlayer.tsx
git commit -m "feat(warm-narrative): replace pill player with vinyl record widget"
```
