# Prada Melati — Implementation Plan (Fase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mendirikan tema `adat/kenangan/prada-melati` sampai ia hidup di `bun dev` dengan token terkunci, tipografi benar, `RonceanMelati` bergoyang, dan satu scene `cover` berlapis — setelah medium prada gold-leaf terbukti tidak terlihat murah.

**Architecture:** App Next.js mandiri, disalin dari `_boilerplate`, disajikan sebagai Cloudflare Worker lewat `@opennextjs/cloudflare`. Token warna berlapis dua: `buildCssVars` menimpa sembilan token dari `invitation.config.json` saat runtime; sisanya statik di `globals.css`. Aset `.webp` tinggal di R2, dirujuk lewat `src/lib/assets.ts`. Kedalaman datang dari parallax berlapis, bukan bayangan.

**Tech Stack:** Next.js 16.2.5, React 19.2.4, framer-motion ^12.38.0, Tailwind v4, TypeScript, bun, `@opennextjs/cloudflare` ^1.20.0, wrangler ^4.105.0, `node --test`.

## Global Constraints

- Spec sumber: `themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-melati-design.md`. Setiap keputusan desain berasal dari sana.
- Kontrak aksesibilitas `DESIGN_SYSTEM.md` §9: kontras teks normal **minimal 4.5:1**, teks besar minimal 3:1. `prefers-reduced-motion: reduce` mematikan semua motion non-esensial.
- Medium terkunci: siluet emas pipih. **Kedalaman tidak boleh datang dari bayangan.** Kalau scene terasa datar, naikkan `depth` L2 atau tambah serat kain di L0.
- Path R2: bucket `rimba-themes`, prefix `adat/kenangan/prada-melati/`. Disajikan lewat `https://assets-themes.rimba.io`.
- Budget aset: L0 opaque < 180KB, layer transparan < 120KB.
- Font: Marcellus (display), Lora (body), Inter (label). Playfair Display dan Cormorant Garamond **dilarang** — keduanya suara tema lain.
- Semua pekerjaan di branch `feat/prada-melati-impl`. Jangan commit ke `feat/prada-melati-design` (beku, sedang direview di PR #27).
- Tema ini **belum** didaftarkan di router, sync-shared, backend, maupun TemplateSelector. Itu Fase 2.

---

### Task 1: Gerbang — buktikan medium prada gold-leaf

Kalau siluet emas pipih ternyata terlihat seperti stiker murah, seluruh art direction gugur dan tidak ada gunanya scaffold apa pun. Tiga gambar percobaan jauh lebih murah daripada dua puluh empat.

**Ini satu-satunya task yang butuh manusia.** Claude tidak dapat menggenerate gambar; ia hanya dapat menilainya lewat tool `Read`.

**Files:**
- Create: `invitation/themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-medium-trial.md`
- Scratch (jangan di-commit): `<scratchpad>/prada-trial/`

**Interfaces:**
- Consumes: style bible dari spec §3.
- Produces: keputusan `LULUS` atau `GAGAL`. Task 2–7 hanya berjalan bila `LULUS`.

- [ ] **Step 1: Generate tiga gambar percobaan**

Prompt-nya tinggal di spec §5d, bukan di sini. Menyalinnya ke plan akan melahirkan dua versi yang perlahan menyimpang.

Buka `themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-melati-design.md` §5d, lalu salin **tiga** prompt ini apa adanya ke image model pilihanmu. Setiap prompt sudah berdiri sendiri — style bible §3 tertanam di dalamnya.

| Prompt | Kenapa ini yang diuji |
|---|---|
| `PradaGunungan.webp` | Bentuk paling rumit. Kalau model gagal, ia gagal di sini dulu |
| `PradaSuluranCornerL.webp` | Menguji apakah "sudut" dipatuhi dan bagian tengah benar-benar kosong |
| `RonceanMelatiL.webp` | Menguji apakah melati tetap gading dan tidak ikut keemasan |

Simpan hasilnya sebagai PNG/WebP di folder scratch. Tiga gambar sudah cukup: kalau ketiganya lulus, dua puluh lima sisanya memakai fondasi gaya yang sama.

- [ ] **Step 2: Nilai ketiganya terhadap kriteria terima**

Minta Claude membaca ketiga berkas itu (`Read` menampilkan gambar). Nilai satu per satu:

| Kriteria | Lulus bila |
|---|---|
| Kepipihan | Tidak ada bayangan jatuh, tidak ada gradasi yang meniru volume |
| Tekstur | Retak daun emas dan serat kain **terlihat**; emasnya tidak rata seperti vektor |
| Keterbacaan sudut | Prompt B mengosongkan bagian tengah; teks bisa duduk di sana |
| Gading, bukan emas | Prompt C berwarna gading `#F3E9D2`; melati **tidak** ikut keemasan |
| Bukan stiker | Ornamen menyatu dengan latar sogan, bukan tempelan bertepi keras |

Gagal pada **Kepipihan** atau **Tekstur** = medium gugur. Gagal pada dua lainnya = prompt yang diperbaiki, bukan medium.

- [ ] **Step 3: Catat putusannya**

Tulis `invitation/themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-medium-trial.md` berisi: ketiga prompt di atas, putusan per kriteria, dan satu paragraf kesimpulan. Kalau `GAGAL`, tulis medium pengganti yang diusulkan dan **berhenti di sini** — spec §2.1 harus dibuka ulang lewat brainstorming, bukan ditambal di plan.

- [ ] **Step 4: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/docs
git commit -m "docs(prada-melati): putusan uji medium prada gold-leaf"
```

---

### Task 2: Scaffold folder tema

**Files:**
- Create: `invitation/themes/adat/kenangan/prada-melati/` (disalin dari `_boilerplate`)
- Create: `invitation/themes/adat/kenangan/prada-melati/wrangler.jsonc`
- Create: `invitation/themes/adat/kenangan/prada-melati/open-next.config.ts`
- Create: `invitation/themes/adat/kenangan/prada-melati/next.config.ts`
- Modify: `invitation/themes/adat/kenangan/prada-melati/package.json`

**Interfaces:**
- Produces: folder tema yang `bun dev`-nya menyala di `http://localhost:3000`.

- [ ] **Step 1: Salin boilerplate**

```bash
cd invitation/themes/adat/kenangan
cp -r ../../../_boilerplate prada-melati
cd prada-melati
```

- [ ] **Step 2: Ganti `package.json`**

Nama paket mengikuti id tema. Jangan tiru `kisah-series-warm-narrative` — nama itu sisa dari zaman tema tersebut dikira milik tier Kisah.

```json
{
  "name": "prada-melati",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test:contrast": "node --test scripts/__tests__/contrast-contract.test.mjs",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
  },
  "dependencies": {
    "@opennextjs/cloudflare": "^1.20.0",
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
    "typescript": "^5",
    "wrangler": "^4.105.0"
  }
}
```

- [ ] **Step 3: Tulis `open-next.config.ts`**

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

- [ ] **Step 4: Tulis `wrangler.jsonc`**

Nama Worker `rimba-prada-melati`, subdomain demo `prada-melati.rimba.io`. `compatibility_date` dan `nodejs_compat` menyalin warm-narrative karena keduanya harus sama-sama jalan di balik router yang sama.

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "rimba-prada-melati",
  "main": ".open-next/worker.js",
  "workers_dev": false,
  "preview_urls": false,
  "compatibility_date": "2026-06-25",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  },
  "routes": [
    {
      "pattern": "prada-melati.rimba.io",
      "custom_domain": true
    }
  ],
  "vars": {
    "NEXT_PUBLIC_THEMES_CDN": "https://assets-themes.rimba.io",
    "NEXT_PUBLIC_PHOTOS_CDN": "https://assets-invitations.rimba.io",
    "API_URL": "https://api.rimba.io"
  }
}
```

- [ ] **Step 5: Tulis `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [{ protocol: "https", hostname: "assets-themes.rimba.io" }],
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.(webp|png|jpg|jpeg|svg|woff2|woff)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 6: Pasang dependensi dan jalankan**

```bash
bun install
bun dev
```

Buka `http://localhost:3000`. Harapan: halaman boilerplate tampil tanpa error di konsol. Hentikan dengan Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati
git commit -m "feat(prada-melati): scaffold app dari _boilerplate"
```

---

### Task 3: Kunci token dan tegakkan kontrak kontras

Palet gelap gampang melanggar WCAG tanpa ketahuan. Tes ini yang menahannya, dan ia harus ditulis **sebelum** tokennya dipakai.

Angka di bawah sudah dihitung: `--text-dim #8C8070` yang tertulis di spec §6 **gagal** (4.24 di atas `--bg`, 2.98 di atas `--surface-2`). Penggantinya `#B3AA9D` (terburuk 5.01).

**Files:**
- Create: `invitation/themes/adat/kenangan/prada-melati/scripts/__tests__/contrast-contract.test.mjs`
- Modify: `invitation/themes/adat/kenangan/prada-melati/invitation.config.json`
- Modify: `invitation/themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-melati-design.md` (§6, §12)

**Interfaces:**
- Produces: `theme.colors` pada `invitation.config.json` — dibaca `buildCssVars`, dipakai seluruh task berikutnya.

- [ ] **Step 1: Tulis tes yang gagal**

`scripts/__tests__/contrast-contract.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../../invitation.config.json", import.meta.url)));
const c = config.theme.colors;

const lin = (v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const SURFACES = [c.bg, c.surface, c.surface2];
const TEXT_TOKENS = { text: c.text, textMuted: c.textMuted, textDim: c.textDim, gold: c.gold };

test("setiap token teks memenuhi 4.5:1 di atas semua permukaan", () => {
  for (const [name, fg] of Object.entries(TEXT_TOKENS)) {
    for (const bg of SURFACES) {
      const r = ratio(fg, bg);
      assert.ok(r >= 4.5, `${name} (${fg}) di atas ${bg} hanya ${r.toFixed(2)}:1, butuh 4.5`);
    }
  }
});

test("goldDim dekoratif, cukup 3:1 untuk teks besar", () => {
  for (const bg of SURFACES) {
    const r = ratio(c.goldDim, bg);
    assert.ok(r >= 3, `goldDim (${c.goldDim}) di atas ${bg} hanya ${r.toFixed(2)}:1`);
  }
});
```

- [ ] **Step 2: Jalankan tes, pastikan GAGAL**

```bash
bun run test:contrast
```

Harapan: FAIL. `invitation.config.json` masih memuat palet boilerplate, bukan palet prada.

- [ ] **Step 3: Tulis palet ke `invitation.config.json`**

Ganti blok `theme` menjadi:

```json
{
  "theme": {
    "colors": {
      "bg": "#2A1D12",
      "surface": "#3A2A1B",
      "surface2": "#4A3524",
      "gold": "#C9A227",
      "goldLight": "#E3C766",
      "goldDim": "#8A6E28",
      "text": "#F3E9D2",
      "textMuted": "#C9BCA1",
      "textDim": "#B3AA9D"
    },
    "typography": {
      "displayFont": "Marcellus",
      "bodyFont": "Lora"
    }
  }
}
```

- [ ] **Step 4: Jalankan tes, pastikan LULUS**

```bash
bun run test:contrast
```

Harapan: PASS, dua tes.

Catatan: `goldDim #8A6E28` hanya 2.38:1 di atas `--surface-2`. Kalau tes kedua gagal, **jangan** turunkan ambangnya — naikkan `goldDim` sampai lulus 3:1, sebab ia dipakai pada label kecil.

- [ ] **Step 5: Perbaiki spec agar tidak berbohong**

Di `themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-melati-design.md`:

- §6, baris `--text-dim`: ganti `#8C8070` menjadi `#B3AA9D`, nama tetap "Debu".
- §6, hapus paragraf **Belum diverifikasi**, ganti dengan: `Kontras diverifikasi terhadap DESIGN_SYSTEM.md §9 dan dijaga oleh scripts/__tests__/contrast-contract.test.mjs.`
- §12, hapus butir pertama (`--text-dim mungkin gagal kontras`) — ia sudah gagal, sudah diperbaiki, dan sudah dijaga tes.

- [ ] **Step 6: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati
git commit -m "feat(prada-melati): kunci palet sogan, tegakkan kontrak kontras WCAG"
```

---

### Task 4: Tipografi dan token statik

**Files:**
- Modify: `invitation/themes/adat/kenangan/prada-melati/src/app/layout.tsx`
- Modify: `invitation/themes/adat/kenangan/prada-melati/src/app/globals.css`

**Interfaces:**
- Consumes: `theme.typography` dari Task 3.
- Produces: kelas `.font-display`, `.font-body`, `.font-label`; token statik `--border`, `--gold-deep`, `--fabric-grain`.

- [ ] **Step 1: Muat font di `layout.tsx`**

Sisipkan di atas `export const metadata`:

```tsx
import { Marcellus, Lora, Inter } from "next/font/google";

const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
```

Lalu ubah tag `<html>` agar membawa ketiga variabel:

```tsx
<html
  lang="id"
  className={`h-full ${marcellus.variable} ${lora.variable} ${inter.variable}`}
  style={{ colorScheme: "dark" }}
  suppressHydrationWarning
>
```

- [ ] **Step 2: Tambahkan token statik dan kelas font di `globals.css`**

Di dalam `:root`, setelah token yang ditimpa runtime:

```css
  /* Statik — tidak ditimpa buildCssVars. Diberi nama sendiri justru agar
     tidak ikut tertimpa, sama seperti --gold-deep pada warm-narrative. */
  --border:       rgba(201, 162, 39, 0.22);
  --gold-deep:    #8A6E28;
  --fabric-grain: rgba(243, 233, 210, 0.03);
```

Dan kelas font:

```css
.font-display { font-family: var(--font-marcellus), Georgia, serif; }
.font-body    { font-family: var(--font-lora), Georgia, serif; }
.font-label   { font-family: var(--font-inter), sans-serif; }
```

- [ ] **Step 3: Verifikasi di browser**

```bash
bun dev
```

Buka DevTools → Elements → `<html>`. Harapan: ketiga kelas `__variable_*` terpasang. Di Computed, `--bg` bernilai `#2A1D12`, bukan nilai boilerplate.

- [ ] **Step 4: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/app
git commit -m "feat(prada-melati): muat Marcellus/Lora/Inter dan token statik"
```

---

### Task 5: Sumber aset

**Files:**
- Create: `invitation/themes/adat/kenangan/prada-melati/src/lib/assets.ts`

**Interfaces:**
- Produces: `ASSET_BASE`, `asset(file)`, `hideOnError` — dipakai Task 6 dan 7.

- [ ] **Step 1: Tulis `src/lib/assets.ts`**

```ts
// src/lib/assets.ts
// Sumber aset gambar (.webp) — SATU tempat untuk base URL.
//
// - Produksi: NEXT_PUBLIC_THEMES_CDN di-set saat build, aset diambil dari R2:
//   <CDN>/adat/kenangan/prada-melati/<file>
// - Dev tanpa env: fallback ke /images (public/images).

import type { SyntheticEvent } from "react";

export const THEMES_CDN_ORIGIN = process.env.NEXT_PUBLIC_THEMES_CDN;

export const ASSET_BASE = THEMES_CDN_ORIGIN
  ? `${THEMES_CDN_ORIGIN}/adat/kenangan/prada-melati`
  : "/images";

export const asset = (file: string) => `${ASSET_BASE}/${file}`;

/** Sembunyikan ornamen yang 404 alih-alih menampilkan ikon broken image.
 *  Hanya untuk CLIENT component. */
export function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}
```

- [ ] **Step 2: Verifikasi tipe**

```bash
bun run typecheck
```

Harapan: keluar tanpa error.

- [ ] **Step 3: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/lib/assets.ts
git commit -m "feat(prada-melati): sumber aset R2"
```

---

### Task 6: `RonceanMelati` — benang merah

Sakura **jatuh**; melati **menjuntai**. Perbedaan gerak inilah yang menjaga tema ini tidak terasa bersaudara dengan warm-narrative, jadi jangan menyalin `FallingFlowers` lalu mengganti asetnya.

**Files:**
- Create: `invitation/themes/adat/kenangan/prada-melati/src/components/shared/RonceanMelati.tsx`
- Modify: `invitation/themes/adat/kenangan/prada-melati/src/app/globals.css`

**Interfaces:**
- Consumes: `ASSET_BASE`, `hideOnError` dari Task 5.
- Produces: `<RonceanMelati zIndex?: number />` — dipakai Task 7 sebagai layer global.

- [ ] **Step 1: Tulis komponennya**

```tsx
"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

import { ASSET_BASE as BASE, hideOnError } from "@/lib/assets";

const STRANDS = [
  { src: `${BASE}/RonceanMelatiL.webp`, side: "left" as const },
  { src: `${BASE}/RonceanMelatiR.webp`, side: "right" as const },
];

export default function RonceanMelati({ zIndex = 3 }: { zIndex?: number }) {
  // Hentikan sway saat section pemiliknya di luar viewport — loop infinite
  // tidak perlu membakar frame setelah user scroll melewatinya.
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "20% 0px 20% 0px" });

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      {STRANDS.map((s) => (
        <img
          key={s.side}
          src={s.src}
          alt=""
          onError={hideOnError}
          className={`ronce ${inView ? "" : "ronce-paused"}`}
          style={{
            position: "absolute",
            top: 0,
            [s.side]: 0,
            height: "58vh",
            transformOrigin: "top center",
            animationDelay: s.side === "right" ? "-2.4s" : "0s",
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Tulis keyframes sway di `globals.css`**

Amplitudo kecil, periode lambat. Untaian tergantung dari atas, jadi ia berayun di sekitar titik gantungnya — bukan bergeser.

```css
@keyframes ronce-sway {
  0%, 100% { transform: rotate(-1.1deg); }
  50%      { transform: rotate(1.1deg); }
}

.ronce {
  animation: ronce-sway 7.5s ease-in-out infinite;
}

.ronce-paused {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .ronce {
    animation: none;
  }
}
```

- [ ] **Step 3: Verifikasi reduced-motion**

```bash
bun dev
```

DevTools → Rendering → *Emulate CSS media feature prefers-reduced-motion* → `reduce`. Harapan: untaian melati berhenti total, tetapi **tetap terlihat**. `DESIGN_SYSTEM.md` §9 menuntut konten tetap terlihat bila motion mati.

- [ ] **Step 4: Verifikasi tipe dan lint**

```bash
bun run typecheck && bun run lint
```

Harapan: keduanya bersih.

- [ ] **Step 5: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src
git commit -m "feat(prada-melati): RonceanMelati, untaian melati yang menjuntai"
```

---

### Task 7: Scene `cover` berlapis

Scene hero pertama, tiga layer. Ini yang membuktikan bahwa emas pipih **terbaca sebagai ruang** ketika ia bergerak — janji yang dibuat spec §2.2.

**Files:**
- Create: `invitation/themes/adat/kenangan/prada-melati/src/components/shared/PradaScene.tsx`
- Create: `invitation/themes/adat/kenangan/prada-melati/src/components/sections/CoverSection.tsx`
- Modify: `invitation/themes/adat/kenangan/prada-melati/src/app/page.tsx`

**Aset dev.** Task 1 hanya menghasilkan tiga gambar. Fase 1 memakai apa adanya, tanpa menunggu suite lengkap:

| Berkas di `public/images/` | Sumber |
|---|---|
| `CoverGunungan.webp` | hasil Prompt A |
| `RonceanMelatiL.webp` | hasil Prompt C |
| `RonceanMelatiR.webp` | salinan Prompt C yang di-flip horizontal, **hanya untuk dev** |

L0 (`CoverBg.webp`) belum ada. Fase 1 memakai latar sogan rata dari `--bg`
sebagai pengganti — parallax tetap terbukti karena gunungan bergerak terhadap
latar yang diam. Aset L0 sungguhan lahir di Fase 2.

Di produksi, `RonceanMelatiR` **wajib** digenerate terpisah, bukan di-flip. Sakura
suite §4a mencatat alasannya: hasil flip terbaca tidak natural.

**Interfaces:**
- Consumes: `asset()` dari Task 5; `<RonceanMelati />` dari Task 6.
- Produces: `<PradaScene layers={...} />` — dipakai sepuluh section sisanya di Fase 2.

- [ ] **Step 1: Tulis `PradaScene.tsx`**

`depth` = fraksi tinggi viewport yang ditempuh layer sepanjang section masuk→keluar. Nilainya mengikuti spec §4: L0 `0.04`, L1 `0.12`, L2 `0.22`.

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export type SceneLayer = {
  src: string;
  depth: number;
  alt?: string;
};

export default function PradaScene({ layers, children }: { layers: SceneLayer[]; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {layers.map((layer, i) => (
        <Layer key={layer.src} layer={layer} progress={scrollYProgress} frozen={!!reduced} z={i} />
      ))}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function Layer({
  layer,
  progress,
  frozen,
  z,
}: {
  layer: SceneLayer;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  frozen: boolean;
  z: number;
}) {
  // Hook harus dipanggil tanpa syarat; reduced-motion mematikan hasilnya,
  // bukan pemanggilannya.
  const shift = useTransform(progress, [0, 1], [`${layer.depth * 50}vh`, `${layer.depth * -50}vh`]);
  return (
    <motion.img
      src={layer.src}
      alt={layer.alt ?? ""}
      aria-hidden={layer.alt ? undefined : "true"}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      style={{ y: frozen ? 0 : shift, zIndex: z }}
    />
  );
}
```

- [ ] **Step 2: Tulis `CoverSection.tsx`**

```tsx
import PradaScene from "@/components/shared/PradaScene";
import RonceanMelati from "@/components/shared/RonceanMelati";
import { asset } from "@/lib/assets";

export default function CoverSection() {
  return (
    <section className="relative h-dvh bg-[var(--bg)]">
      <PradaScene
        layers={[
          // L0 menyusul di Fase 2; latar sogan rata sudah cukup untuk
          // membuktikan gunungan bergerak terhadap sesuatu yang diam.
          { src: asset("CoverGunungan.webp"), depth: 0.12 },
        ]}
      >
        <RonceanMelati zIndex={3} />
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--text-dim)]">
            Undangan Pernikahan
          </p>
          <h1 className="font-display mt-6 text-5xl text-[var(--text)]">Prada &amp; Melati</h1>
          <p className="font-body mt-4 text-[var(--text-muted)]">Sabtu, 12 September 2026</p>
        </div>
      </PradaScene>
    </section>
  );
}
```

- [ ] **Step 3: Pasang di `page.tsx`**

```tsx
import CoverSection from "@/components/sections/CoverSection";

export default function Page() {
  return (
    <main className="h-dvh overflow-y-auto">
      <CoverSection />
    </main>
  );
}
```

- [ ] **Step 4: Jalankan dan nilai dengan mata**

```bash
bun dev
```

Harapan, dan ini kriteria terima Fase 1:

1. Gunungan bergerak lebih cepat daripada latar saat scroll — **emas pipih terbaca sebagai ruang**.
2. Untaian melati bergoyang pelan di depan keduanya.
3. Teks di tengah terbaca; tidak ada ornamen yang menabraknya.
4. `prefers-reduced-motion: reduce` → parallax dan sway mati, seluruh scene tetap terlihat.

Kalau butir 1 gagal dan scene tetap terasa datar, naikkan `depth` L1 dari `0.12` ke `0.18`. **Jangan tambahkan `box-shadow` atau `drop-shadow`** — itu mengingkari mediumnya sendiri, dan spec §2.2 melarangnya.

- [ ] **Step 5: Verifikasi tipe dan lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 6: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati
git commit -m "feat(prada-melati): PradaScene berlapis dan scene cover"
```

---

## Bukan Cakupan Fase 1

Fase 2, plan tersendiri, setelah kriteria terima di atas terpenuhi:

- generate dua puluh empat aset penuh (9 kit + 11 L0 + 4 L1) dan unggah ke R2;
- sepuluh section sisanya beserta `RenderSection.tsx`;
- `DESIGN_SPEC.md` tema dan baris baru di `adat/kenangan/README.md`;
- pendaftaran tema di lima tempat (spec §10): `sync-shared.ts`, `router/src/index.ts`, `router/wrangler.jsonc`, `reservedSlugs` di `invitation.go`, `TemplateSelector.tsx`;
- deploy Worker `rimba-prada-melati` dan custom domain `prada-melati.rimba.io`.

Pendaftaran sengaja ditaruh paling akhir. Router memakai service binding; menambahkan binding ke Worker yang belum di-deploy akan menggagalkan `wrangler deploy` router.
