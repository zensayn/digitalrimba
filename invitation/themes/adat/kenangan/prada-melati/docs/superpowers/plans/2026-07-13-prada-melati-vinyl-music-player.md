# Vinyl Music Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti `MusicPlayer.tsx` (bar gold) dengan piringan hitam (vinyl) mini floating adaptasi Componentry, data-driven dari config.

**Architecture:** Blok `music` opsional di `invitation.config.json` → tipe `MusicConfig` → `page.tsx` render `<MusicPlayer music={config.music} />` secara kondisional. Komponen adaptasi Componentry: disc berputar + tonearm mengayun (framer-motion), diperkecil ke ~72–80px, warna gold tema, `fixed` pojok kanan-bawah. Mempertahankan perilaku player lama: autoplay saat event `invitation-open`, loop, muncul dengan delay ~2s, toggle via klik disc.

**Tech Stack:** Next.js 16 (App Router, "use client"), React 19, framer-motion (v12.38, sudah terpasang), Tailwind v4 + CSS var tema. Package manager: bun.

## Global Constraints

- Package manager: **bun** — jalankan script lewat `bun run <script>`. Tidak ada paket baru (framer-motion sudah ada).
- Warna via CSS var tema saja: `var(--gold)`, `var(--gold-dim)`, `var(--surface2)`, `var(--bg)` — jangan hardcode hex.
- `music.src` & `music.coverArt` dipakai sebagai string literal — **jangan** lewat `asset()`.
- Blok `music` opsional: kalau `config.music` falsy, komponen tidak dirender.
- Komentar/copy UI berbahasa Indonesia, ikut gaya file sekitar.
- Tidak ada atribusi Claude/AI di pesan commit.

---

### Task 1: Data plumbing (tipe + config + wiring page)

**Files:**
- Modify: `src/lib/config-types.ts` (tambah `MusicConfig`, field `music?` di `InvitationConfig`)
- Modify: `invitation.config.json` (tambah blok `music`)
- Modify: `src/app/page.tsx:20` (render kondisional)

**Interfaces:**
- Produces: `interface MusicConfig { src: string; coverArt: string; title: string; artist: string }` dan `InvitationConfig.music?: MusicConfig` — dikonsumsi Task 2.

- [ ] **Step 1: Tambah tipe `MusicConfig` dan field `music` di `config-types.ts`**

Tambah interface baru sebelum `interface InvitationConfig` (mis. setelah `InvitationTheme`, sekitar baris 68):

```ts
export interface MusicConfig {
  src: string;
  coverArt: string;
  title: string;
  artist: string;
}
```

Lalu tambahkan field opsional di dalam `interface InvitationConfig` (setelah baris `theme: InvitationTheme;`):

```ts
  music?: MusicConfig;
```

- [ ] **Step 2: Tambah blok `music` di `invitation.config.json`**

Sisipkan setelah blok `"theme": { ... }` (sebelum `"sections"`), dengan koma yang benar:

```jsonc
  "music": {
    "src": "/music/prada-melati.mp3",
    "coverArt": "/images/vinyl-label.png",
    "title": "Judul Lagu",
    "artist": "Nama Artis"
  },
```

- [ ] **Step 3: Render kondisional di `page.tsx`**

Ganti baris `<MusicPlayer />` (baris 20) menjadi:

```tsx
      {config.music && <MusicPlayer music={config.music} />}
```

Import di baris 5 tetap: `import MusicPlayer from "@/components/MusicPlayer";` (belum diubah — Task 2 mengubah prop komponen; typecheck baru hijau setelah Task 2).

- [ ] **Step 4: Verifikasi tipe config valid (JSON + tipe)**

Run: `bun run typecheck`
Expected: Error HANYA di `src/app/page.tsx` (`MusicPlayer` belum menerima prop `music`) — ini normal, diselesaikan Task 2. Tidak boleh ada error lain di `config-types.ts` atau soal `music` di `invitation.config.json`. Kalau ada error selain prop `MusicPlayer`, perbaiki dulu.

- [ ] **Step 5: Commit**

```bash
git add src/lib/config-types.ts invitation.config.json src/app/page.tsx
git commit -m "feat(prada-melati): blok music di config + tipe MusicConfig, wiring player"
```

---

### Task 2: Rewrite komponen vinyl + bersihkan CSS lama

**Files:**
- Modify (full rewrite): `src/components/MusicPlayer.tsx`
- Modify: `src/app/globals.css:246-263` (hapus rule `.music-player-bar`)

**Interfaces:**
- Consumes: `MusicConfig` dari `@/lib/config-types` (Task 1). Prop `{ music: MusicConfig }`.
- Behavior kontrak: dengarkan event `document` `"invitation-open"` → mulai putar (di-dispatch CoverSection, tak diubah di plan ini).

- [ ] **Step 1: Rewrite `src/components/MusicPlayer.tsx`**

Ganti SELURUH isi file dengan:

```tsx
"use client";

// src/components/MusicPlayer.tsx
// ─── Vinyl music player mini (floating pojok kanan-bawah) ─────────────────────
// Piringan hitam berputar saat lagu diputar, tonearm mengayun. Data dari config.
// Autoplay saat CoverSection dispatch event "invitation-open". Loop aktif.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MusicConfig } from "@/lib/config-types";

interface MusicPlayerProps {
  music: MusicConfig;
}

export default function MusicPlayer({ music }: MusicPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady]     = useState(false);
  const audioRef              = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Tampilkan player setelah 2 detik
    const showTimer = setTimeout(() => setVisible(true), 2000);

    // Autoplay saat CoverSection dispatch event "invitation-open"
    const onOpen = () => {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    };
    document.addEventListener("invitation-open", onOpen);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener("invitation-open", onOpen);
      audioRef.current?.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="auto"
        onCanPlayThrough={() => setReady(true)}
        className="hidden"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "fixed",
              bottom: "calc(20px + env(safe-area-inset-bottom))",
              right: 20,
              zIndex: 100,
            }}
          >
            <div
              className="relative cursor-pointer select-none h-[72px] w-[72px] md:h-20 md:w-20"
              onClick={toggle}
              role="button"
              aria-label={playing ? "Jeda musik" : "Putar musik"}
              title={playing ? "Jeda" : "Putar"}
            >
              {/* Tonearm */}
              <motion.div
                className="absolute z-20 top-[-4%] right-[-8%] origin-top-right w-[55%] h-[18%] pointer-events-none"
                initial={{ rotate: 10 }}
                animate={{ rotate: playing ? -20 : 10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Tonearm base */}
                <div
                  className="absolute top-0 right-0 w-3 h-3 rounded-full shadow-md transform translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ background: "var(--gold-dim)", border: "2px solid var(--surface2)" }}
                />
                {/* Tonearm stick & needle */}
                <div
                  className="absolute top-0 right-[6px] w-[90%] h-1 rounded-full origin-right -rotate-12 shadow-sm flex items-center justify-start"
                  style={{ background: "var(--gold-dim)" }}
                >
                  <div
                    className="w-2 h-2 rounded-full shadow-md transform -translate-x-1/2"
                    style={{ background: "var(--gold)" }}
                  />
                </div>
              </motion.div>

              {/* Record disc */}
              <div
                className="relative w-full h-full rounded-full border-2 shadow-lg overflow-hidden bg-black animate-spin"
                style={{
                  borderColor: "rgba(0,0,0,0.4)",
                  animationDuration: "4s",
                  animationPlayState: playing ? "running" : "paused",
                }}
              >
                {/* Album cover background */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `url(${music.coverArt})` }}
                />
                {/* Grooves */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 21%, transparent 22%, transparent 40%, rgba(0,0,0,0.5) 41%, transparent 42%, transparent 62%, rgba(0,0,0,0.4) 63%, transparent 64%, transparent 82%, rgba(0,0,0,0.5) 83%, transparent 84%)",
                  }}
                />
                {/* Glare */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.15) 100%)",
                  }}
                />
                {/* Center label + hole */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full shadow-inner flex items-center justify-center"
                  style={{ background: "var(--surface2)", border: "1px solid var(--gold)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--gold)", border: "1px solid rgba(0,0,0,0.4)" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Hapus rule `.music-player-bar` di `globals.css`**

Hapus blok komentar + rule di baris 246–263 (dari `/* ─── Music player bar ─...` sampai `}` penutup `.music-player-bar`). Sisakan satu baris kosong antara `.btn-gold:hover { ... }` dan `/* ─── RSVP scrollable area ─...`.

- [ ] **Step 3: Verifikasi typecheck hijau menyeluruh**

Run: `bun run typecheck`
Expected: PASS tanpa error (error prop `MusicPlayer` dari Task 1 kini hilang karena komponen menerima `music`).

- [ ] **Step 4: Verifikasi lint & test motion tak regresi**

Run: `bun run lint`
Expected: PASS (tidak ada `no-unused-vars` sisa import lama seperti `Play`/`Pause`/`lucide-react`).

Run: `bun run test:motion`
Expected: PASS (test motion lama tidak menyentuh MusicPlayer; harus tetap hijau).

- [ ] **Step 5: Verifikasi visual pakai skill theme-screenshot**

Jalankan skill `theme-screenshot` (Playwright + Chrome sistem) untuk merender undangan. Cek:
- Disc kecil (~72px) muncul di pojok kanan-bawah setelah ~2s.
- Setelah "buka undangan" (event `invitation-open`), disc berputar & tonearm bergerak ke posisi play.
- Tidak menutupi konten penting di mobile.

Kalau perlu file dummy: taruh `public/music/prada-melati.mp3` & `public/images/vinyl-label.png` sementara untuk verifikasi lokal (public/ di-gitignore, tak ikut commit).

- [ ] **Step 6: Commit**

```bash
git add src/components/MusicPlayer.tsx src/app/globals.css
git commit -m "feat(prada-melati): vinyl music player mini floating (adaptasi Componentry)"
```

---

## Self-Review

**Spec coverage:**
- Blok `music` config + tipe → Task 1. ✓
- Render kondisional di page → Task 1 Step 3. ✓
- Rewrite komponen (buang YouTube/`cn`/konstanta, pertahankan disc/grooves/glare/tonearm, ukuran mini, warna gold) → Task 2 Step 1. ✓
- Perilaku: autoplay `invitation-open`, loop, delayed appearance, toggle klik disc, cleanup → Task 2 Step 1 (`useEffect`, `loop`, `setTimeout`, `toggle`, cleanup). ✓
- Hapus `.music-player-bar` CSS + konstanta + import lucide → Task 2 Step 1 & 2. ✓
- Testing typecheck/lint/motion/screenshot → Task 2 Step 3–5. ✓
- framer-motion sudah ada, tak `bun add` → Global Constraints. ✓

**Placeholder scan:** Copy `"Judul Lagu"`/`"Nama Artis"`/path file adalah nilai contoh yang memang diisi pembuat undangan (bukan placeholder plan) — konsisten dengan pola tema (data contoh). Tidak ada TBD/TODO di langkah teknis.

**Type consistency:** `MusicConfig { src, coverArt, title, artist }` dipakai konsisten: komponen membaca `music.src` & `music.coverArt` (`title`/`artist` tersedia untuk perluasan, tak dipakai di UI mini — sesuai keputusan floating shrunk). Prop `{ music: MusicConfig }` cocok dengan `<MusicPlayer music={config.music} />`.
