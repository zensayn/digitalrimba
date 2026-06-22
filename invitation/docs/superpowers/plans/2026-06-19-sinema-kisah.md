# sinema-kisah Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `sinema-kisah` — the first theme for kisah-series-tier — a cinematic horizontal chapter-magazine wedding invitation with 13 slides across 5 dramatic chapters.

**Architecture:** Single horizontal flex container with all 13 slides laid flat; custom JS controller (`useHorizontalScrollController`) drives `transform: translateX` instead of CSS scroll-snap. Five chapter-cover slides (full-bleed photo + bleeding roman numeral) precede content slides. `ChapterIndicator` shows a 5-bar film-strip progress at the bottom.

**Tech Stack:** Next.js 16.2.5, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion ^12, Lucide React ^1.14, Google Fonts (DM Serif Display + Lora + Jost via CSS @import)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `invitation.config.json` | CREATE | Couple/event/gallery data for sinema-kisah demo |
| `package.json` | CREATE | Copied from `_boilerplate`, name = `kisah-series-sinema-kisah` |
| `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore` | COPY | Toolchain — unchanged from boilerplate |
| `src/lib/config-types.ts` | COPY | TypeScript interfaces — unchanged |
| `src/lib/css-vars.ts` | COPY | `buildCssVars()` — unchanged |
| `src/data/invitation.ts` | COPY | Typed re-export from config.json — unchanged |
| `src/components/RimbaConfigProvider.tsx` | COPY | Config context + Studio sync — unchanged |
| `src/components/MusicPlayer.tsx` | COPY | Floating music player — unchanged |
| `src/app/globals.css` | CREATE | Ink & Amber tokens, film grain, horizontal slide classes, form utilities |
| `src/app/layout.tsx` | CREATE | Google Fonts import, metadata, RimbaConfigProvider wrapper |
| `src/components/ChapterIndicator.tsx` | CREATE | 5-bar film-strip chapter progress indicator |
| `src/components/slides/ChapterCoverSlide.tsx` | CREATE | Full-bleed chapter cover with bleeding numeral + entrance animation |
| `src/components/slides/GreetingSlide.tsx` | CREATE | Bismillah + letter-by-letter guest name reveal |
| `src/components/slides/CoupleSlide.tsx` | CREATE | Asymmetric two-half photo layout |
| `src/components/slides/LoveStorySlide.tsx` | CREATE | Vertically-scrollable love story timeline |
| `src/components/slides/EventSlide.tsx` | CREATE | Akad / Resepsi detail with map embed |
| `src/components/slides/GallerySlide.tsx` | CREATE | CSS masonry + dress code swatch strip |
| `src/components/slides/RSVPSlide.tsx` | CREATE | Editorial borderless RSVP form |
| `src/components/slides/GiftClosingSlide.tsx` | CREATE | Bank card gift + closing section |
| `src/app/page.tsx` | CREATE | Horizontal controller hook + 13-slide registry + ChapterIndicator |

---

## Task 1: Scaffold project from boilerplate

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/` (entire directory)

- [ ] **Step 1: Copy boilerplate files**

Run from repo root:
```bash
cp -r _boilerplate/. kategori-adat/kisah-series-tier/sinema-kisah/
```
On Windows PowerShell:
```powershell
Copy-Item -Recurse -Force "_boilerplate\*" "kategori-adat\kisah-series-tier\sinema-kisah\"
```

- [ ] **Step 2: Update package.json name**

Edit `kategori-adat/kisah-series-tier/sinema-kisah/package.json`:
```json
{
  "name": "kisah-series-sinema-kisah",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.14.0",
    "next": "16.2.5",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
cd kategori-adat/kisah-series-tier/sinema-kisah
bun install
```

Expected: `bun install v1.x.x` with lockfile created, no errors.

- [ ] **Step 4: Create public directories**

```bash
mkdir -p public/images public/music
```

- [ ] **Step 5: Commit**

```bash
cd ../../..   # back to repo root
git add kategori-adat/kisah-series-tier/sinema-kisah/
git commit -m "scaffold: init sinema-kisah from boilerplate"
```

---

## Task 2: invitation.config.json

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/invitation.config.json`

- [ ] **Step 1: Write config**

```json
{
  "couple": {
    "groom": {
      "name": "Aryan",
      "fullName": "Aryan Pratama",
      "parents": "Putra Bapak Budi & Ibu Sari",
      "photo": "https://picsum.photos/seed/groom-kisah/600/900",
      "instagram": "@aryan.pratama"
    },
    "bride": {
      "name": "Sekar",
      "fullName": "Sekar Ayu Lestari",
      "parents": "Putri Bapak Hendra & Ibu Dewi",
      "photo": "https://picsum.photos/seed/bride-kisah/600/900",
      "instagram": "@sekar.ayu"
    },
    "hashtag": "#AryanSekar2026",
    "quote": "Dua jiwa yang menemukan rumahnya satu sama lain."
  },
  "events": {
    "akad": {
      "title": "Akad Nikah",
      "day": "Sabtu",
      "date": "21 Maret 2026",
      "time": "08.00 – 10.00 WIB",
      "venue": "Masjid Agung Sunda Kelapa",
      "address": "Jl. Taman Sunda Kelapa No.16, Menteng, Jakarta Pusat",
      "mapsUrl": "https://maps.google.com/?q=-6.1944,106.8229",
      "embedUrl": "https://maps.google.com/maps?q=-6.1944,106.8229&z=16&output=embed",
      "startISO": "20260321T010000Z",
      "endISO": "20260321T030000Z"
    },
    "resepsi": {
      "title": "Resepsi",
      "day": "Sabtu",
      "date": "21 Maret 2026",
      "time": "12.00 – 17.00 WIB",
      "venue": "Gedung Serbaguna Graha Citra",
      "address": "Jl. Gatot Subroto Kav. 21, Jakarta Selatan",
      "mapsUrl": "https://maps.google.com/?q=-6.2293,106.8271",
      "embedUrl": "https://maps.google.com/maps?q=-6.2293,106.8271&z=16&output=embed",
      "startISO": "20260321T050000Z",
      "endISO": "20260321T100000Z"
    }
  },
  "weddingDate": "2026-03-21T08:00:00",
  "gallery": [
    { "src": "https://picsum.photos/seed/k1/600/800", "alt": "Foto 1" },
    { "src": "https://picsum.photos/seed/k2/600/500", "alt": "Foto 2" },
    { "src": "https://picsum.photos/seed/k3/600/700", "alt": "Foto 3" },
    { "src": "https://picsum.photos/seed/k4/600/600", "alt": "Foto 4" },
    { "src": "https://picsum.photos/seed/k5/600/900", "alt": "Foto 5" },
    { "src": "https://picsum.photos/seed/k6/600/500", "alt": "Foto 6" }
  ],
  "bankAccounts": [
    { "bank": "BCA", "name": "Aryan Pratama", "number": "1234 5678 9012" },
    { "bank": "Mandiri", "name": "Sekar Ayu Lestari", "number": "9876 5432 1098" }
  ],
  "loveStory": [
    {
      "chapter": "Awal Bertemu",
      "year": "2020",
      "description": "Sebuah pertemuan tak terduga di sudut kafe kecil Jakarta yang mengubah segalanya.",
      "image": "https://picsum.photos/seed/ls1/600/400"
    },
    {
      "chapter": "Jatuh Cinta",
      "year": "2021",
      "description": "Perasaan itu datang perlahan, seperti fajar yang menyapa langit sebelum matahari muncul.",
      "image": "https://picsum.photos/seed/ls2/600/400"
    },
    {
      "chapter": "Bersama",
      "year": "2022",
      "description": "Setiap perjalanan terasa lebih berarti ketika ada seseorang di sisimu.",
      "image": "https://picsum.photos/seed/ls3/600/400"
    },
    {
      "chapter": "Lamaran",
      "year": "2025",
      "description": "Dengan satu kata 'iya', babak baru dalam kisah ini pun dimulai.",
      "image": "https://picsum.photos/seed/ls4/600/400"
    }
  ],
  "dressCode": {
    "theme": "Earthy Elegance",
    "description": "Warna-warna bumi yang hangat dan elegan untuk merayakan hari istimewa kami.",
    "colors": [
      { "hex": "#C8915A", "name": "Amber" },
      { "hex": "#8B7355", "name": "Mocha" },
      { "hex": "#D4C5A9", "name": "Linen" },
      { "hex": "#3D2B1F", "name": "Dark Coffee" }
    ],
    "avoid": ["Putih", "Merah Muda Terang"]
  },
  "theme": {
    "colors": {
      "bg":          "#0E0C0A",
      "surface":     "#181410",
      "surface2":    "#221D18",
      "gold":        "#C8915A",
      "goldLight":   "#E0A96A",
      "goldDim":     "#7A5538",
      "text":        "#F2EBE1",
      "textMuted":   "#B8AA9A",
      "textDim":     "#7A6E64"
    },
    "typography": {
      "displayFont": "DM Serif Display",
      "bodyFont":    "Lora"
    }
  },
  "sections": {
    "order": [],
    "enabled": {}
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/invitation.config.json
git commit -m "config: add sinema-kisah invitation.config.json with Ink & Amber theme"
```

---

## Task 3: globals.css — Ink & Amber design system

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/app/globals.css`

- [ ] **Step 1: Write globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Lora:ital@0;1&family=Jost:wght@300;400;500&display=swap');

@import "tailwindcss";

/* ─── Design Tokens — Ink & Amber ─────────────────────────────────────────── */
:root {
  --bg:          #0E0C0A;
  --surface:     #181410;
  --surface-2:   #221D18;
  --gold:        #C8915A;
  --gold-light:  #E0A96A;
  --gold-dim:    #7A5538;
  --text:        #F2EBE1;
  --text-muted:  #B8AA9A;
  --text-dim:    #7A6E64;
  --border:      rgba(200,145,90,0.18);
  --shadow-card: 0 4px 24px rgba(0,0,0,0.6);
  --grain-opacity: 0.045;
  --font-label:  'Jost', sans-serif;
}

/* ─── Base ───────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { height: 100%; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-body, 'Lora', serif);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  height: 100dvh;
}

/* ─── Font helpers ───────────────────────────────────────────────────────── */
.font-display { font-family: var(--font-display, 'DM Serif Display', serif); }
.font-body    { font-family: var(--font-body, 'Lora', serif); }
.font-label   { font-family: var(--font-label, 'Jost', sans-serif); }

/* ─── Horizontal slide viewport ─────────────────────────────────────────── */
.slide-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  width: 100vw;
  height: 100dvh;
}

.slide-container {
  display: flex;
  height: 100dvh;
  will-change: transform;
  /* transform + transition set inline by JS controller */
}

.slide-page {
  width: 100vw;
  height: 100dvh;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ─── Film grain overlay ─────────────────────────────────────────────────── */
.film-grain::after {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  opacity: var(--grain-opacity);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
}

/* ─── Amber gradient text ────────────────────────────────────────────────── */
.text-amber-gradient {
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 40%, var(--gold) 70%, var(--gold-dim) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ─── Amber shimmer ──────────────────────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

.text-amber-shimmer {
  background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 25%, var(--gold) 50%, var(--gold-light) 75%, var(--gold) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

/* ─── Dividers ───────────────────────────────────────────────────────────── */
.amber-divider {
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  flex-shrink: 0;
}

.amber-divider-full {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  opacity: 0.25;
}

.amber-divider-vertical {
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--gold-dim), transparent);
  flex-shrink: 0;
}

/* ─── Form elements — editorial borderless ───────────────────────────────── */
.input-amber {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  padding: 10px 0;
  font-family: var(--font-body, 'Lora', serif);
  font-size: 14px;
  font-weight: 400;
  outline: none;
  transition: border-color 0.3s ease;
}

.input-amber::placeholder { color: var(--text-dim); }
.input-amber:focus { border-bottom-color: var(--gold); }
textarea.input-amber { resize: none; line-height: 1.6; }

/* ─── Scrollbar hide ─────────────────────────────────────────────────────── */
.overflow-y-auto::-webkit-scrollbar { display: none; }
.overflow-y-auto { -ms-overflow-style: none; scrollbar-width: none; }

/* ─── Music player ───────────────────────────────────────────────────────── */
.music-player-bar {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  right: 20px;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: rgba(14,12,10,0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 100px;
  white-space: nowrap;
}

/* ─── Vignette ───────────────────────────────────────────────────────────── */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%);
  pointer-events: none;
  z-index: 1;
}

/* ─── Animations ─────────────────────────────────────────────────────────── */
@keyframes pulse-hint {
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 0.7; }
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/app/globals.css
git commit -m "style: add Ink & Amber design system for sinema-kisah"
```

---

## Task 4: layout.tsx

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/app/layout.tsx`

- [ ] **Step 1: Write layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";
import { RimbaConfigProvider } from "@/components/RimbaConfigProvider";

export const metadata: Metadata = {
  title: `${couple.groom.name} & ${couple.bride.name} — Kisah | Rimba Digital`,
  description: `Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan ${couple.groom.name} & ${couple.bride.name}.`,
  openGraph: {
    title: `${couple.groom.name} & ${couple.bride.name} — Kisah`,
    description: `Sebuah kisah cinta yang terangkai indah.",`,
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cssVars = buildCssVars(theme);
  return (
    <html lang="id" className="h-full" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="h-full antialiased overflow-hidden film-grain">
        <RimbaConfigProvider>{children}</RimbaConfigProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/app/layout.tsx
git commit -m "feat: add layout with Ink & Amber theme vars and film grain"
```

---

## Task 5: ChapterIndicator component

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/ChapterIndicator.tsx`

- [ ] **Step 1: Write ChapterIndicator.tsx**

```tsx
"use client";

import { motion } from "framer-motion";

interface Chapter {
  numeral: string;
  title: string;
  slides: number[];
}

interface ChapterIndicatorProps {
  chapters: Chapter[];
  currentSlide: number;
}

export default function ChapterIndicator({ chapters, currentSlide }: ChapterIndicatorProps) {
  const activeChapterIdx = chapters.findIndex((ch) => ch.slides.includes(currentSlide));

  return (
    <div
      className="font-label"
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom) + 20px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {/* Chapter title */}
      <motion.span
        key={activeChapterIdx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          color: "var(--text-dim)",
          fontSize: 8,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        {activeChapterIdx >= 0 ? chapters[activeChapterIdx].title : ""}
      </motion.span>

      {/* 5 bars */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {chapters.map((_, i) => {
          const isActive = i === activeChapterIdx;
          return (
            <motion.div
              key={i}
              animate={{
                width: isActive ? 56 : 32,
                background: isActive ? "var(--gold)" : "rgba(200,145,90,0.25)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: 2, borderRadius: 1 }}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/ChapterIndicator.tsx
git commit -m "feat: add ChapterIndicator film-strip progress bar"
```

---

## Task 6: ChapterCoverSlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/ChapterCoverSlide.tsx`

- [ ] **Step 1: Create slides directory and write ChapterCoverSlide.tsx**

```tsx
"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface ChapterCoverSlideProps {
  numeral: "I" | "II" | "III" | "IV" | "V";
  title: string;
  coverImage: string | null;
  isActive: boolean;
}

export default function ChapterCoverSlide({ numeral, title, coverImage, isActive }: ChapterCoverSlideProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.set("hidden");
      controls.start("visible");
    }
  }, [isActive, controls]);

  const bgStyle = coverImage
    ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg, var(--surface-2) 0%, var(--bg) 100%)" };

  return (
    <div className="slide-page" style={{ ...bgStyle, filter: coverImage ? "sepia(20%) contrast(1.1) brightness(0.75)" : undefined }}>
      {/* Gradient overlay — unfiltered so it looks clean */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(14,12,10,0.92) 0%, rgba(14,12,10,0.3) 50%, rgba(14,12,10,0.05) 100%)",
          filter: "none",
        }}
      />

      {/* Top label */}
      <motion.p
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5, delay: 1.0 } },
        }}
        className="font-label"
        style={{
          position: "absolute",
          top: `calc(env(safe-area-inset-top) + 20px)`,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--gold-dim)",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        KISAH · BAB {numeral}
      </motion.p>

      {/* Center: numeral + divider + title */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          width: "100%",
          height: "min(340px, 60vh)",
          justifyContent: "center",
        }}
      >
        {/* Bleeding numeral */}
        <motion.div
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
          }}
          className="font-display"
          style={{
            fontSize: "clamp(120px, 38vw, 200px)",
            fontStyle: "italic",
            color: "var(--gold)",
            lineHeight: 0.85,
            userSelect: "none",
            textAlign: "center",
          }}
        >
          {numeral}
        </motion.div>

        {/* Divider */}
        <motion.div
          animate={controls}
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 0.4, delay: 0.6 } },
          }}
          className="amber-divider"
          style={{ marginTop: 16, marginBottom: 12 }}
        />

        {/* Chapter title */}
        <motion.p
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.4, delay: 0.8 } },
          }}
          className="font-display"
          style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            fontStyle: "italic",
            color: "var(--text)",
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          {title}
        </motion.p>
      </div>

      {/* Bottom hint */}
      <motion.p
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 0.5, transition: { duration: 0.3, delay: 1.2 } },
        }}
        className="font-label"
        style={{
          position: "absolute",
          bottom: `calc(env(safe-area-inset-bottom) + 80px)`,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "var(--text-dim)",
          whiteSpace: "nowrap",
          animation: "pulse-hint 3s ease-in-out infinite",
          zIndex: 10,
        }}
      >
        geser →
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/
git commit -m "feat: add ChapterCoverSlide with entrance animation"
```

---

## Task 7: GreetingSlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/GreetingSlide.tsx`

- [ ] **Step 1: Write GreetingSlide.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

interface GreetingSlideProps {
  guestName?: string;
}

export default function GreetingSlide({ guestName }: GreetingSlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const { couple } = useInvitationConfig();

  const letters = guestName ? guestName.split("") : [];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="slide-page" style={{ background: "var(--bg)" }}>
      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center text-center"
        style={{ maxWidth: 300, padding: "0 24px", gap: "clamp(16px, 3vh, 24px)" }}
      >
        {/* Bismillah */}
        <motion.p
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{ fontSize: 22, fontStyle: "italic", color: "var(--gold)" }}
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </motion.p>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="amber-divider mx-auto" />
        </motion.div>

        {/* Body text */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-body"
          style={{ fontStyle: "italic", fontSize: "clamp(12px, 3vw, 14px)", color: "var(--text-muted)", lineHeight: 1.9 }}
        >
          Dengan penuh kebahagiaan dan rasa syukur kepada Allah SWT, kami mengundang Anda untuk turut merayakan hari istimewa kami.
        </motion.p>

        {/* Guest name — letter by letter */}
        {guestName && (
          <div className="flex flex-wrap justify-center font-display" style={{ fontSize: "clamp(20px, 6vw, 28px)", color: "var(--gold)" }}>
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: (idx: number) => ({
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.4 + idx * 0.04, duration: 0.5 },
                  }),
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                style={{ display: letter === " " ? "inline-block" : "inline", width: letter === " " ? "0.3em" : "auto" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        )}

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="amber-divider mx-auto" />
        </motion.div>

        {/* Signature */}
        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{ fontStyle: "italic", fontSize: 16, color: "var(--text-dim)" }}
        >
          — {couple.groom.name} &amp; {couple.bride.name}
        </motion.p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/GreetingSlide.tsx
git commit -m "feat: add GreetingSlide with letter-by-letter guest name reveal"
```

---

## Task 8: CoupleSlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/CoupleSlide.tsx`

- [ ] **Step 1: Write CoupleSlide.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function CoupleSlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });
  const { couple } = useInvitationConfig();

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.2, duration: 0.8 } }),
  };

  return (
    <div
      ref={ref}
      data-prevent-snap="true"
      className="slide-page overflow-y-auto"
      style={{ flexDirection: "row", alignItems: "stretch", justifyContent: "stretch" }}
    >
      {/* Groom half */}
      <motion.div
        custom={0} variants={fadeIn} initial="hidden" animate={isInView ? "visible" : "hidden"}
        style={{ position: "relative", width: "50%", flexShrink: 0, overflow: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={couple.groom.photo}
          alt={couple.groom.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            filter: "sepia(15%) contrast(1.05) brightness(0.8)" }}
        />
        {/* Amber tint overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(200,145,90,0.18) 0%, transparent 60%)" }} />
        {/* Name block */}
        <div style={{ position: "absolute", bottom: "clamp(24px,5vh,40px)", left: "clamp(16px,4vw,24px)", right: 8 }}>
          <p className="font-display" style={{ fontSize: "clamp(32px, 9vw, 48px)", color: "var(--text)", lineHeight: 1.1 }}>
            {couple.groom.name}
          </p>
          <p className="font-label" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginTop: 6, lineHeight: 1.6 }}>
            {couple.groom.fullName}
          </p>
          <p className="font-label" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.05em", lineHeight: 1.6 }}>
            {couple.groom.parents}
          </p>
        </div>
      </motion.div>

      {/* Center & divider */}
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, transform: "translateX(-50%)", display: "flex", alignItems: "center", zIndex: 10 }}>
        <div className="amber-divider-vertical" style={{ height: "100%" }} />
        <motion.span
          custom={1} variants={fadeIn} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(48px, 14vw, 80px)",
            fontStyle: "italic",
            color: "var(--gold)",
            mixBlendMode: "overlay",
          }}
        >
          &amp;
        </motion.span>
      </div>

      {/* Bride half */}
      <motion.div
        custom={2} variants={fadeIn} initial="hidden" animate={isInView ? "visible" : "hidden"}
        style={{ position: "relative", width: "50%", flexShrink: 0, overflow: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={couple.bride.photo}
          alt={couple.bride.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            filter: "sepia(15%) contrast(1.05) brightness(0.8)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(200,145,90,0.18) 0%, transparent 60%)" }} />
        {/* Name block — right aligned */}
        <div style={{ position: "absolute", bottom: "clamp(24px,5vh,40px)", right: "clamp(16px,4vw,24px)", left: 8, textAlign: "right" }}>
          <p className="font-display" style={{ fontSize: "clamp(32px, 9vw, 48px)", color: "var(--text)", lineHeight: 1.1 }}>
            {couple.bride.name}
          </p>
          <p className="font-label" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginTop: 6, lineHeight: 1.6 }}>
            {couple.bride.fullName}
          </p>
          <p className="font-label" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.05em", lineHeight: 1.6 }}>
            {couple.bride.parents}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/CoupleSlide.tsx
git commit -m "feat: add CoupleSlide asymmetric two-half photo layout"
```

---

## Task 9: LoveStorySlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/LoveStorySlide.tsx`

- [ ] **Step 1: Write LoveStorySlide.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

const ROMAN = ["I", "II", "III", "IV", "V"];

export default function LoveStorySlide() {
  const { loveStory } = useInvitationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto w-full"
        style={{ height: "100dvh", paddingBottom: "clamp(80px, 15vh, 120px)" }}
      >
        {/* Header */}
        <div style={{ padding: "clamp(40px,8vh,64px) 24px clamp(20px,4vh,32px)" }}>
          <motion.p
            className="font-label"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}
          >
            Perjalanan Kami
          </motion.p>
          <motion.h2
            className="font-display"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: "clamp(28px, 8vw, 40px)", fontStyle: "italic", color: "var(--gold)" }}
          >
            Kisah Kami
          </motion.h2>
        </div>

        {/* Story entries */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {loveStory.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              style={{ display: "flex", position: "relative", paddingLeft: 24, paddingRight: 24, paddingBottom: 40 }}
            >
              {/* Timeline line */}
              <div style={{ position: "absolute", left: 24, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, var(--gold-dim), transparent)" }} />

              {/* Content */}
              <div style={{ paddingLeft: 20, width: "100%" }}>
                {/* Image */}
                <div style={{ position: "relative", marginBottom: 16, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.image}
                    alt={entry.chapter}
                    style={{ width: "100%", display: "block", filter: "sepia(25%) contrast(1.08) brightness(0.9)" }}
                  />
                  {/* Numeral watermark behind */}
                  <div
                    className="font-display"
                    style={{
                      position: "absolute", top: "50%", right: 8,
                      transform: "translateY(-50%)",
                      fontSize: "clamp(80px, 25vw, 140px)",
                      fontStyle: "italic",
                      color: "var(--gold)",
                      opacity: 0.12,
                      lineHeight: 1,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {ROMAN[i] ?? (i + 1).toString()}
                  </div>
                </div>

                {/* Year */}
                <p className="font-label" style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--gold-dim)", marginBottom: 6 }}>
                  {entry.year}
                </p>
                {/* Chapter title */}
                <h3 className="font-display" style={{ fontSize: "clamp(18px, 5vw, 22px)", fontStyle: "italic", color: "var(--text)", marginBottom: 8 }}>
                  {entry.chapter}
                </h3>
                {/* Description */}
                <p className="font-body" style={{ fontStyle: "italic", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.9 }}>
                  {entry.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/LoveStorySlide.tsx
git commit -m "feat: add LoveStorySlide vertical timeline with cinematic photo entries"
```

---

## Task 10: EventSlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/EventSlide.tsx`

- [ ] **Step 1: Write EventSlide.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import type { EventConfig } from "@/lib/config-types";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

interface EventSlideProps {
  event: EventConfig;
  index: number;
  sectionId: string;
}

export default function EventSlide({ event, index, sectionId }: EventSlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const { couple } = useInvitationConfig();

  const [dateNum] = event.date.split(" ");
  const isAkad = index === 0;
  const eventLabel = isAkad ? "AKAD NIKAH" : "RESEPSI";

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${isAkad ? "Akad Nikah" : "Resepsi"} ${couple.groom.name} & ${couple.bride.name}`)}&dates=${event.startISO}/${event.endISO}&details=${encodeURIComponent(`${event.venue}, ${event.address}`)}&location=${encodeURIComponent(event.address)}`;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const } }),
  };

  return (
    <div id={sectionId} className="slide-page" style={{ background: "var(--surface)", justifyContent: "flex-start" }}>
      {/* Giant date watermark */}
      <div
        className="font-display"
        style={{
          position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)",
          fontSize: "clamp(100px, 30vw, 160px)", fontWeight: 400,
          color: "var(--text)", opacity: 0.04, lineHeight: 1, userSelect: "none", pointerEvents: "none",
        }}
      >
        {dateNum}
      </div>

      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto w-full"
        style={{ height: "100dvh", paddingBottom: "clamp(80px,15vh,120px)" }}
      >
        <div style={{ padding: "clamp(40px,8vh,64px) 28px 0" }}>
          {/* Event label */}
          <motion.p custom={0} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label"
            style={{ fontSize: 9, letterSpacing: "0.35em", color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 16 }}
          >
            {eventLabel}
          </motion.p>

          {/* Date */}
          <motion.p custom={1} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{ fontSize: "clamp(22px, 6vw, 32px)", color: "var(--text)", marginBottom: 8 }}
          >
            {event.day}, {event.date}
          </motion.p>

          {/* Divider */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            style={{ marginBottom: 16 }}
          >
            <div className="amber-divider" />
          </motion.div>

          {/* Time */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            style={{ marginBottom: 20 }}
          >
            <span
              className="font-label"
              style={{
                display: "inline-block", padding: "5px 14px",
                border: "1px solid var(--border)", borderRadius: 100,
                fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)",
              }}
            >
              {event.time}
            </span>
          </motion.div>

          {/* Venue */}
          <motion.p custom={4} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-display"
            style={{ fontStyle: "italic", fontSize: "clamp(17px, 4.5vw, 22px)", color: "var(--text)", marginBottom: 6 }}
          >
            {event.venue}
          </motion.p>

          {/* Address */}
          <motion.p custom={5} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-body"
            style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}
          >
            {event.address}
          </motion.p>

          {/* Map */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            style={{ position: "relative", marginBottom: 16, overflow: "hidden" }}
          >
            {/* SVG corner accents */}
            {[["0,0", "0,0", "16,0", "0,0", "0,16"], ["100%,0", "100%,0", "calc(100% - 16px),0", "100%,0", "100%,16"]].map((_, ci) => (
              <svg key={ci} style={{ position: "absolute", top: ci === 0 ? 0 : undefined, bottom: ci === 1 ? 0 : undefined,
                left: ci === 0 ? 0 : undefined, right: ci === 1 ? 0 : undefined, width: 16, height: 16, zIndex: 2 }}>
                <polyline points={ci === 0 ? "16,0 0,0 0,16" : "0,0 16,0 16,16"} fill="none" stroke="var(--gold-dim)" strokeWidth="1" />
              </svg>
            ))}
            <iframe
              src={event.embedUrl}
              width="100%" height="180"
              style={{ border: 0, display: "block", filter: "sepia(30%) contrast(0.9) brightness(0.8) saturate(0.7)" }}
              loading="lazy"
              allowFullScreen
            />
          </motion.div>

          {/* Links */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            style={{ display: "flex", gap: 20 }}
          >
            <a
              href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="font-label"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.1em",
                color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
            >
              <MapPin size={12} /> Buka Maps →
            </a>
            <a
              href={calendarUrl} target="_blank" rel="noopener noreferrer"
              className="font-label"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.1em",
                color: "var(--text-dim)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
            >
              <Calendar size={12} /> Simpan Kalender →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/EventSlide.tsx
git commit -m "feat: add EventSlide with map embed and calendar link"
```

---

## Task 11: GallerySlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/GallerySlide.tsx`

- [ ] **Step 1: Write GallerySlide.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function GallerySlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });
  const { gallery, dressCode } = useInvitationConfig();

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      {/* Header — fixed at top */}
      <div
        ref={ref}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "clamp(32px,6vh,48px) 20px 16px",
          background: "linear-gradient(to bottom, var(--bg) 60%, transparent)",
          zIndex: 20, flexShrink: 0,
        }}
      >
        <motion.p
          className="font-label"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 4 }}
        >
          Kenangan Terindah
        </motion.p>
        <motion.h2
          className="font-display"
          initial={{ opacity: 0, y: 12 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontStyle: "italic", fontSize: "clamp(24px, 7vw, 36px)", color: "var(--gold)" }}
        >
          Kenangan
        </motion.h2>
      </div>

      {/* Scrollable masonry */}
      <div
        data-prevent-snap="true"
        className="overflow-y-auto w-full"
        style={{ height: "100dvh", paddingTop: "clamp(100px,18vh,130px)", paddingBottom: "clamp(100px,18vh,140px)", paddingLeft: 12, paddingRight: 12 }}
      >
        <motion.div
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ columns: "2 auto", columnGap: 8 }}
        >
          {gallery.map((item, i) => (
            <div key={i} style={{ breakInside: "avoid", marginBottom: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src} alt={item.alt} loading="lazy"
                style={{ width: "100%", display: "block", filter: "sepia(20%) contrast(1.05) brightness(0.9)" }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dress code swatch strip — sticky at bottom */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
          padding: "32px 20px calc(env(safe-area-inset-bottom) + 80px)",
          background: "linear-gradient(to top, var(--bg) 40%, transparent)",
        }}
      >
        <p className="font-label" style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 10, textAlign: "center" }}>
          Dress Code · {dressCode.theme}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {dressCode.colors.map((c, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: c.hex, border: "1px solid var(--border)",
                boxShadow: `0 0 0 3px rgba(0,0,0,0.3), 0 0 8px ${c.hex}40`,
              }} />
              <span className="font-label" style={{ fontSize: 7, color: "var(--text-dim)", letterSpacing: "0.1em" }}>
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/GallerySlide.tsx
git commit -m "feat: add GallerySlide with masonry grid + dress code swatch strip"
```

---

## Task 12: RSVPSlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/RSVPSlide.tsx`

- [ ] **Step 1: Write RSVPSlide.tsx**

```tsx
"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";

export default function RSVPSlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "tidak_hadir" | null>(null);
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !attendance) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: "easeOut" as const } }),
  };

  return (
    <div className="slide-page" style={{ background: "var(--surface)" }}>
      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto w-full"
        style={{ height: "100dvh", paddingBottom: "clamp(80px,15vh,120px)" }}
      >
        <div style={{ maxWidth: 320, margin: "0 auto", padding: "clamp(40px,8vh,64px) 28px 0" }}>
          <motion.p custom={0} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label" style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}
          >
            Konfirmasi Kehadiran
          </motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-display" style={{ fontStyle: "italic", fontSize: "clamp(28px, 8vw, 40px)", color: "var(--gold)", marginBottom: 32 }}
          >
            RSVP
          </motion.h2>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 32 }}
            >
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1px solid var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={20} color="var(--gold)" strokeWidth={1.5} />
              </div>
              <p className="font-display" style={{ fontStyle: "italic", color: "var(--gold)", fontSize: 22 }}>Terima Kasih</p>
              <p className="font-body" style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.8, textAlign: "center" }}>
                Konfirmasi Anda telah kami terima.<br />Kami sangat menantikan kehadiran Anda.
              </p>
            </motion.div>
          ) : (
            <motion.form custom={2} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
              onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label className="font-label" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Nama Tamu
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda" className="input-amber" required />
              </div>

              {/* Attendance */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="font-label" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Konfirmasi
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["hadir", "tidak_hadir"] as const).map((opt) => (
                    <button key={opt} type="button" onClick={() => setAttendance(opt)}
                      className="font-label"
                      style={{
                        flex: 1, padding: "12px 8px", border: `1px solid ${attendance === opt ? "var(--gold)" : "var(--border)"}`,
                        background: attendance === opt ? "var(--gold)" : "transparent",
                        color: attendance === opt ? "var(--bg)" : "var(--text-dim)",
                        fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {opt === "hadir" ? "Hadir" : "Tidak Hadir"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pax */}
              {attendance === "hadir" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <label className="font-label" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                    Jumlah Tamu
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <button type="button" onClick={() => setPax(Math.max(1, pax - 1))}
                      style={{ width: 32, height: 32, border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                      −
                    </button>
                    <span className="font-display" style={{ color: "var(--gold)", fontSize: 28, minWidth: "1.5ch", textAlign: "center" }}>{pax}</span>
                    <button type="button" onClick={() => setPax(Math.min(5, pax + 1))}
                      style={{ width: 32, height: 32, border: "1px solid var(--border)", color: "var(--text-muted)", background: "transparent", cursor: "pointer", fontSize: 18 }}>
                      +
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label className="font-label" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Ucapan (opsional)
                </label>
                <textarea ref={messageRef} value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (messageRef.current) {
                      messageRef.current.style.height = "auto";
                      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
                    }
                  }}
                  placeholder="Tuliskan ucapan selamat..." className="input-amber overflow-hidden resize-none"
                  rows={1} style={{ minHeight: 40 }}
                />
              </div>

              <button type="submit" disabled={loading || !name || !attendance}
                className="font-label"
                style={{
                  width: "100%", padding: "14px", background: "var(--gold)", color: "var(--bg)",
                  border: "none", cursor: !name || !attendance ? "not-allowed" : "pointer",
                  fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                  opacity: !name || !attendance ? 0.45 : 1, transition: "opacity 0.2s",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Konfirmasi"}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/RSVPSlide.tsx
git commit -m "feat: add RSVPSlide with editorial borderless form"
```

---

## Task 13: GiftClosingSlide

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/GiftClosingSlide.tsx`

- [ ] **Step 1: Write GiftClosingSlide.tsx**

```tsx
"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function GiftClosingSlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10%" });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { bankAccounts, couple } = useInvitationConfig();

  const handleCopy = (text: string, idx: number) => {
    const clean = text.replace(/\s/g, "");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(clean);
    } else {
      const el = document.createElement("textarea");
      el.value = clean;
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.8, ease: "easeOut" as const } }),
  };

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto w-full"
        style={{ height: "100dvh", paddingBottom: "clamp(80px,15vh,120px)" }}
      >
        {/* ── Gift section ── */}
        <div style={{ padding: "clamp(40px,8vh,64px) 28px clamp(32px,6vh,48px)", borderBottom: "1px solid var(--border)" }}>
          <motion.p custom={0} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label" style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 8 }}
          >
            Amplop Digital
          </motion.p>
          <motion.h2 custom={1} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-display" style={{ fontStyle: "italic", fontSize: "clamp(26px, 7vw, 36px)", color: "var(--gold)", marginBottom: 12 }}
          >
            Hadiah
          </motion.h2>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-body" style={{ fontStyle: "italic", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.9, marginBottom: 24 }}
          >
            Doa dan kehadiran Anda adalah hadiah terbesar bagi kami.
          </motion.p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bankAccounts.map((acc, i) => (
              <motion.div key={i} custom={i + 3} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 18px", border: "1px solid var(--border)", background: "var(--surface-2)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span className="font-label" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>
                    {acc.bank}
                  </span>
                  <span className="font-body" style={{ fontSize: 14, color: "var(--text)", letterSpacing: "0.05em" }}>
                    {acc.number}
                  </span>
                  <span className="font-label" style={{ fontSize: 10, color: "var(--text-dim)" }}>a.n. {acc.name}</span>
                </div>
                <button onClick={() => handleCopy(acc.number, i)}
                  style={{
                    padding: "8px 12px", border: "1px solid var(--border)", background: "transparent",
                    color: copiedIdx === i ? "var(--gold)" : "var(--text-dim)",
                    cursor: "pointer", transition: "color 0.2s",
                  }}
                >
                  {copiedIdx === i ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Closing section ── */}
        <div style={{ padding: "clamp(32px,6vh,48px) 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Intersecting rings */}
          <div style={{ position: "relative", width: 160, height: 80, marginBottom: 32, flexShrink: 0 }}>
            <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "1px solid var(--border)", opacity: 0.4, top: "50%", left: "50%", transform: "translate(-60%, -50%)" }} />
            <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "1px solid var(--border)", opacity: 0.4, top: "50%", left: "50%", transform: "translate(-40%, -50%)" }} />
          </div>

          <motion.p custom={0} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label" style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 16 }}
          >
            Terima Kasih
          </motion.p>

          <motion.h2 custom={1} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-display text-amber-gradient" style={{ fontSize: "clamp(36px, 12vw, 56px)", lineHeight: 1.1, marginBottom: 4 }}
          >
            {couple.groom.name}
          </motion.h2>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}
          >
            <div className="amber-divider" />
            <span className="font-display" style={{ fontStyle: "italic", color: "var(--gold-dim)", fontSize: 24 }}>&amp;</span>
            <div className="amber-divider" />
          </motion.div>

          <motion.h2 custom={3} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-display text-amber-gradient" style={{ fontSize: "clamp(36px, 12vw, 56px)", lineHeight: 1.1, marginBottom: 24 }}
          >
            {couple.bride.name}
          </motion.h2>

          <motion.p custom={4} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-body" style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.9, marginBottom: 8 }}
          >
            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri.&rdquo;
          </motion.p>
          <motion.span custom={5} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label" style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}
          >
            — QS. Ar-Rum: 21
          </motion.span>

          <motion.div custom={6} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            style={{ marginTop: 20, marginBottom: 12 }}
          >
            <div className="amber-divider mx-auto" />
          </motion.div>

          <motion.p custom={7} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold-dim)" }}
          >
            {couple.hashtag}
          </motion.p>

          <motion.p custom={8} variants={fadeUp} initial="hidden" animate={isInView ? "visible" : "hidden"}
            className="font-label" style={{ marginTop: 24, fontSize: 8, letterSpacing: "0.3em", color: "var(--text-dim)" }}
          >
            RIMBA DIGITAL · KISAH
          </motion.p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/components/slides/GiftClosingSlide.tsx
git commit -m "feat: add GiftClosingSlide with bank cards + closing ceremony"
```

---

## Task 14: page.tsx — Horizontal controller + slide registry

**Files:**
- Create: `kategori-adat/kisah-series-tier/sinema-kisah/src/app/page.tsx`

- [ ] **Step 1: Write page.tsx**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";
import MusicPlayer from "@/components/MusicPlayer";
import ChapterIndicator from "@/components/ChapterIndicator";

import ChapterCoverSlide from "@/components/slides/ChapterCoverSlide";
import GreetingSlide     from "@/components/slides/GreetingSlide";
import CoupleSlide       from "@/components/slides/CoupleSlide";
import LoveStorySlide    from "@/components/slides/LoveStorySlide";
import EventSlide        from "@/components/slides/EventSlide";
import GallerySlide      from "@/components/slides/GallerySlide";
import RSVPSlide         from "@/components/slides/RSVPSlide";
import GiftClosingSlide  from "@/components/slides/GiftClosingSlide";

const TOTAL_SLIDES = 13;

const CHAPTERS = [
  { numeral: "I"   as const, title: "Pembukaan",   slides: [0, 1] },
  { numeral: "II"  as const, title: "Mereka",       slides: [2, 3] },
  { numeral: "III" as const, title: "Kisah Cinta",  slides: [4, 5] },
  { numeral: "IV"  as const, title: "Hari Itu",     slides: [6, 7, 8] },
  { numeral: "V"   as const, title: "Selamanya",    slides: [9, 10, 11, 12] },
];

// ── Horizontal scroll controller ─────────────────────────────────────────────
function useHorizontalScrollController() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let locked = false;
    let lockTimer: ReturnType<typeof setTimeout>;
    let prevDelta = 0;
    let wheelResetTimer: ReturnType<typeof setTimeout>;

    const goto = (next: number) => {
      if (locked) return;
      const clamped = Math.max(0, Math.min(next, TOTAL_SLIDES - 1));
      if (clamped === slideRef.current) return;
      locked = true;
      slideRef.current = clamped;
      setCurrentSlide(clamped);
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { locked = false; }, 900);
    };

    // Wheel — prefer deltaX (trackpad horizontal), fallback to deltaY
    const onWheel = (e: WheelEvent) => {
      let el = e.target as Element | null;
      while (el && el !== container) {
        if (el.getAttribute("data-prevent-snap") === "true") return;
        el = el.parentElement;
      }
      e.preventDefault();

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const absDelta = Math.abs(delta);
      const prevAbs = Math.abs(prevDelta);

      if (wheelResetTimer) clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { prevDelta = 0; }, 150);
      prevDelta = delta;

      if (locked) return;
      if (prevAbs > 0 && absDelta <= prevAbs) return; // inertia filter
      goto(slideRef.current + (delta > 0 ? 1 : -1));
    };

    // Touch
    let x0 = 0, y0 = 0, touchStartSlide = 0, isTouchActive = false;

    const onTouchStart = (e: TouchEvent) => {
      let el = e.target as Element | null;
      while (el && el !== container) {
        if (el.getAttribute("data-prevent-snap") === "true") return;
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      touchStartSlide = slideRef.current;
      isTouchActive = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouchActive) return;
      isTouchActive = false;
      const dx = x0 - e.changedTouches[0].clientX;
      const dy = y0 - e.changedTouches[0].clientY;
      if (Math.abs(dy) > Math.abs(dx) * 0.7) return; // more vertical — ignore
      if (Math.abs(dx) < 40) return;                   // threshold
      goto(touchStartSlide + (dx > 0 ? 1 : -1));
    };

    // Keyboard
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); goto(slideRef.current + 1); }
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   { e.preventDefault(); goto(slideRef.current - 1); }
    };

    container.addEventListener("wheel",      onWheel,      { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend",   onTouchEnd,   { passive: true });
    document.addEventListener("keydown",     onKey);

    return () => {
      container.removeEventListener("wheel",      onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend",   onTouchEnd);
      document.removeEventListener("keydown",     onKey);
      clearTimeout(lockTimer);
      clearTimeout(wheelResetTimer);
    };
  }, []);

  return { currentSlide, containerRef };
}

// ── Slide renderer ────────────────────────────────────────────────────────────
function InvitationContent() {
  const config = useInvitationConfig();
  const { currentSlide, containerRef } = useHorizontalScrollController();
  const [guestName, setGuestName] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("to");
    if (name) setGuestName(name);
  }, []);

  // Chapter cover images derived from config
  const coverImages: (string | null)[] = [
    config.couple.groom.photo,       // Chapter I
    config.couple.bride.photo,        // Chapter II
    config.loveStory[0]?.image ?? null, // Chapter III
    config.gallery[0]?.src ?? null,   // Chapter IV — fallback to gallery
    config.gallery[1]?.src ?? null,   // Chapter V — fallback to gallery
  ];

  const renderSlide = (index: number) => {
    const chapterIdx = CHAPTERS.findIndex((ch) => ch.slides[0] === index);

    switch (index) {
      case 0: return (
        <ChapterCoverSlide key="ch-cover-0" numeral="I" title="Pembukaan"
          coverImage={coverImages[0]} isActive={currentSlide === 0} />
      );
      case 1: return <GreetingSlide key="greeting" guestName={guestName} />;
      case 2: return (
        <ChapterCoverSlide key="ch-cover-2" numeral="II" title="Mereka"
          coverImage={coverImages[1]} isActive={currentSlide === 2} />
      );
      case 3: return <CoupleSlide key="couple" />;
      case 4: return (
        <ChapterCoverSlide key="ch-cover-4" numeral="III" title="Kisah Cinta"
          coverImage={coverImages[2]} isActive={currentSlide === 4} />
      );
      case 5: return <LoveStorySlide key="lovestory" />;
      case 6: return (
        <ChapterCoverSlide key="ch-cover-6" numeral="IV" title="Hari Itu"
          coverImage={coverImages[3]} isActive={currentSlide === 6} />
      );
      case 7: return <EventSlide key="akad"    event={config.events.akad}    index={0} sectionId="akad" />;
      case 8: return <EventSlide key="resepsi" event={config.events.resepsi} index={1} sectionId="resepsi" />;
      case 9: return (
        <ChapterCoverSlide key="ch-cover-9" numeral="V" title="Selamanya"
          coverImage={coverImages[4]} isActive={currentSlide === 9} />
      );
      case 10: return <GallerySlide key="gallery" />;
      case 11: return <RSVPSlide key="rsvp" />;
      case 12: return <GiftClosingSlide key="gift-closing" />;
      default: return null;
    }
    void chapterIdx; // suppress unused warning
  };

  return (
    <>
      <MusicPlayer />

      {/* Horizontal slide viewport */}
      <div className="slide-viewport">
        <div
          ref={containerRef}
          className="slide-container"
          style={{
            width: `${TOTAL_SLIDES * 100}vw`,
            transform: `translateX(-${currentSlide * 100}vw)`,
            transition: "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <div key={i} className="slide-page" style={{ overflow: "hidden" }}>
              {renderSlide(i)}
            </div>
          ))}
        </div>
      </div>

      {/* Chapter indicator */}
      <ChapterIndicator chapters={CHAPTERS} currentSlide={currentSlide} />
    </>
  );
}

export default function Page() {
  return <InvitationContent />;
}
```

- [ ] **Step 2: Commit**

```bash
git add kategori-adat/kisah-series-tier/sinema-kisah/src/app/page.tsx
git commit -m "feat: add horizontal scroll controller + 13-slide chapter registry"
```

---

## Task 15: Type check + build verification

**Files:** None created — verification only.

- [ ] **Step 1: Type check**

```bash
cd kategori-adat/kisah-series-tier/sinema-kisah
bunx tsc --noEmit
```

Expected: Zero output (no errors).

Common fixes if errors occur:
- `useAnimation` import: ensure it's from `"framer-motion"` not `"framer-motion/client"`
- `EventConfig` prop types: check import path is `@/lib/config-types`
- `data-prevent-snap` attribute: add `declare module "react" { namespace JSX { ... } }` if TypeScript complains about unknown HTML attribute

- [ ] **Step 2: Build**

```bash
bun run build
```

Expected: `✓ Compiled successfully` with no errors. Build output should include all 13 slide components.

- [ ] **Step 3: Dev server smoke test**

```bash
bun dev
```

Open `http://localhost:3000` — verify:
- [ ] Page loads without hydration errors
- [ ] Swipe/arrow keys advance slides
- [ ] ChapterCoverSlide entrance animation plays when slide becomes active
- [ ] ChapterIndicator updates active bar on slide change
- [ ] `?to=Nama+Tamu` URL param shows guest name with letter-by-letter animation
- [ ] RSVP form submits and shows thank-you state
- [ ] Bank number copy button shows Check icon for 2 seconds

- [ ] **Step 4: Final commit**

```bash
cd ../../..
git add kategori-adat/kisah-series-tier/sinema-kisah/
git commit -m "feat: complete sinema-kisah — cinematic horizontal chapter magazine

5 chapters, 13 slides, Ink & Amber palette, DM Serif Display + Lora + Jost.
Horizontal JS scroll controller with inertia filtering, 680ms easeOutCubic.
Chapter cover slides with full-bleed photo + bleeding roman numeral entrance animation."
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Horizontal controller with wheel/touch/keyboard — Task 14
- [x] 13 slides in 5 chapters — Task 14
- [x] ChapterCoverSlide with bleeding numeral + entrance animation — Task 6
- [x] GreetingSlide with letter-by-letter guest name — Task 7
- [x] CoupleSlide asymmetric two-half — Task 8
- [x] LoveStorySlide vertical scroll + timeline — Task 9
- [x] EventSlide × 2 with map embed — Task 10
- [x] GallerySlide + dress code swatch strip — Task 11
- [x] RSVPSlide editorial borderless form — Task 12
- [x] GiftClosingSlide bank cards + closing — Task 13
- [x] ChapterIndicator 5-bar film-strip — Task 5
- [x] Ink & Amber CSS tokens — Task 3
- [x] DM Serif Display + Lora + Jost fonts — Task 3
- [x] Film grain overlay via `.film-grain::after` — Task 3, Task 4
- [x] `data-prevent-snap` on all internal-scrollable elements — Tasks 8,9,10,11,12,13
- [x] `invitation.config.json` with all Ink & Amber colors — Task 2
- [x] `bun install / bun run build` — Task 1, Task 15

**Type consistency check:**
- `ChapterCoverSlide` props: `numeral`, `title`, `coverImage`, `isActive` — all used correctly in Task 14
- `EventSlide` props: `event: EventConfig`, `index: number`, `sectionId: string` — matches Task 10 definition and Task 14 usage
- `ChapterIndicator` props: `chapters` (array with `numeral/title/slides`), `currentSlide` — CHAPTERS constant in Task 14 matches Task 5 interface
- `useHorizontalScrollController` returns `{ currentSlide, containerRef }` — used correctly in Task 14
- `TOTAL_SLIDES = 13` referenced in controller clamp — correct
