# Twilight Castle Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun tema undangan `twilight-castle` (kategori `dongeng/`, tier `kisah`) — istana dongeng senja dengan efek "gerbang zoom" dua-lapis foto — dengan mengklon plumbing `soft-bloom` lalu mengganti lapisan visualnya.

**Architecture:** Klon penuh folder `soft-bloom` → `dongeng/kisah/twilight-castle`, pertahankan seluruh plumbing (config longgar `order/enabled` + `KNOWN_SECTIONS` seam-safe, `resolveConfig`+slug+`/preview`, `EnvelopeOverlay`, `MusicPlayer`, RSVP tampilan-saja). Ganti identitas (nama paket/worker/CDN), palet & tipografi ke twilight royal, tambah komponen baru `RoyalGate` (dual-layer scale via Framer `useScroll`/`useTransform`) sebagai section `cover`, `Stardust` (partikel), `SceneBackground` (latar foto), dan ornamen emas; lalu restyle 11 section ke bahasa visual twilight.

**Tech Stack:** Next.js 16.2.5 (App Router) · React 19 · Framer Motion 12 · OpenNext Cloudflare 1.20 · Tailwind 4 · TypeScript strict · Bun · deploy Cloudflare Workers.

## Global Constraints

- Build **wajib** `next build --webpack` (Turbopack + OpenNext + Windows = `ChunkLoadError`). Jangan ubah.
- Package manager **bun** (`bun install`/`bun dev`/`bun run lint`/`bun run preview`/`bun run deploy`). Jangan `npm`/`npx` untuk app (kecuali `npx wrangler r2 …` upload aset).
- Animasi **hanya Framer Motion** — TANPA GSAP atau dependency baru.
- TypeScript strict, hindari `any`. Komentar kode & dokumen **berbahasa Indonesia**.
- Semua gambar via `invitation.config.json`/CDN — tanpa path hardcoded; tiap aset webp **fallback aman** (sembunyikan bila belum ada, tak pernah error).
- Hormati `prefers-reduced-motion` (gerbang & partikel).
- Aset CDN via `assets-themes.rimba.io` — **JANGAN** URL `pub-*.r2.dev` (diblok Kominfo).
- RSVP **tampilan-saja, TANPA D1** (`/api/rsvp`, `lib/rsvp.ts`, binding `DB` tidak ada).
- Tooling Windows: `./node_modules/.bin/tsc.exe`, `./node_modules/.bin/eslint` (bukan `npx tsc`).
- **prada-melati tidak disentuh.** Warning `@next/next/no-img-element` = pola rumah, boleh.
- **JANGAN COMMIT** apa pun untuk project ini sampai user memintanya. Setiap langkah "Commit"
  di task-task bawah **DITAHAN**: kerjakan perubahan file & verifikasi saja, jangan `git commit`,
  lalu lapor. Commit hanya setelah user memberi izin eksplisit.
- Verifikasi tema ini **bukan** unit test (repo tak punya) — pakai `tsc --noEmit`, `bun run lint`, render `bun dev`, dan `bun run preview` (worker lokal). Itu "test" tiap task.
- Path kerja tema: `invitation/themes/dongeng/kisah/twilight-castle/` (disebut `<theme>/` di bawah).

---

### Task 1: Scaffold — klon soft-bloom & ganti identitas

**Files:**
- Create: `invitation/themes/dongeng/README.md`
- Create (copy tree): `invitation/themes/dongeng/kisah/twilight-castle/**` (dari `floral/kenangan/soft-bloom`)
- Modify: `<theme>/package.json`, `<theme>/wrangler.jsonc`, `<theme>/src/lib/assets.ts`, `<theme>/src/app/layout.tsx` (metadata copy), `<theme>/README.md`
- Move: dua file referensi (`<theme>/*main home.webp`, `<theme>/photo-*.jpg`) → `<theme>/references/`

**Interfaces:**
- Produces: paket bernama `dongeng-kisah-twilight-castle`, worker `rimba-twilight-castle` route `twilight-castle.rimba.io`, `ASSET_BASE` = `${NEXT_PUBLIC_THEMES_CDN}/dongeng/kisah/twilight-castle`. Semua task berikut menganggap folder `<theme>/` sudah ada & build.

- [ ] **Step 1: Klon folder soft-bloom (tanpa artefak build & deps)**

Dari `invitation/themes/` (Bash):
```bash
cd /c/rimba-main/invitation/themes
mkdir -p dongeng/kisah
cp -r floral/kenangan/soft-bloom dongeng/kisah/twilight-castle
# ASSET_PROMPTS.md sudah ada di tujuan — jangan tertimpa; cp di atas akan menimpanya,
# jadi pulihkan dari git bila perlu:
git checkout -- dongeng/kisah/twilight-castle/ASSET_PROMPTS.md 2>/dev/null || true
# Buang artefak yang tak boleh ikut:
rm -rf dongeng/kisah/twilight-castle/node_modules \
       dongeng/kisah/twilight-castle/.open-next \
       dongeng/kisah/twilight-castle/.next \
       dongeng/kisah/twilight-castle/bun.lock
```

> Catatan: `ASSET_PROMPTS.md` twilight sudah ditulis di folder tujuan sebelum task ini.
> Bila `cp` menimpanya dengan versi soft-bloom, kembalikan versi twilight (git/manual).

- [ ] **Step 2: Pindahkan file referensi keluar dari yang akan di-ship**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
mkdir -p references
mv *"main home.webp" references/ 2>/dev/null || true
mv photo-*.jpg references/ 2>/dev/null || true
```

- [ ] **Step 3: Ganti identitas paket** — `<theme>/package.json`, ubah baris `"name"`:

```json
  "name": "dongeng-kisah-twilight-castle",
```

- [ ] **Step 4: Ganti `<theme>/wrangler.jsonc`** (nama worker + route; tetap tanpa D1):

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "rimba-twilight-castle",
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
      "pattern": "twilight-castle.rimba.io",
      "custom_domain": true
    }
  ],
  "vars": {
    "NEXT_PUBLIC_THEMES_CDN": "https://assets-themes.rimba.io",
    // API Go tempat tema mengambil konten undangan saat router wildcard
    // meneruskan request ber-header x-rimba-slug.
    "API_URL": "https://api.rimba.io"
  }
}
```

- [ ] **Step 5: Ganti path CDN aset** — `<theme>/src/lib/assets.ts`, baris `ASSET_BASE`:

```ts
export const ASSET_BASE = CDN
  ? `${CDN}/dongeng/kisah/twilight-castle`
  : "/images";
```

- [ ] **Step 6: Sesuaikan salinan metadata `page.tsx` host-guard** — `<theme>/src/app/page.tsx`, ganti host demo:

```tsx
  const slug = host === "twilight-castle.rimba.io" ? null : h.get("x-rimba-slug");
```

- [ ] **Step 7: Perbarui metadata OG copy** — `<theme>/src/app/layout.tsx`, ganti deskripsi floral:

```tsx
    description: `Undangan pernikahan bertema istana dongeng senja yang megah.`,
```

- [ ] **Step 8: Buat kategori `dongeng/README.md`** (tiru `floral/README.md`):

```markdown
# Kategori Dongeng

> Undangan digital bertema **dunia dongeng** (istana, gerbang kerajaan, langit
> senja berbintang). Pembeda tier = kekayaan komponen + animasi.

Setiap subfolder adalah **tier**. Di dalamnya ada tema mandiri (app Next.js sendiri).

## Tier yang Tersedia

| Folder | Tier | Harga | Level komponen & animasi |
|--------|------|-------|--------------------------|
| `kisah/` | 2 · Standard | Rp300rb | Efek gerbang zoom sinematik, animasi sedang |

## Tema

| Tema | Tier | Estetika |
|------|------|----------|
| `kisah/twilight-castle` | Standard | Twilight Royal — istana dongeng senja, gerbang zoom |

## Cara Menjalankan

```bash
cd <tier>/<nama-tema>
bun dev   # → http://localhost:3000
```
```

- [ ] **Step 9: Perbarui `<theme>/README.md`** — ganti judul/estetika soft-bloom → twilight (minimal: baris judul & deskripsi section). Sunting baris pertama menjadi:

```markdown
# Twilight Castle — dongeng · kisah (Tier 2 Standard)
```

- [ ] **Step 10: Install & verifikasi build dasar (masih visual soft-bloom)**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
bun install
./node_modules/.bin/tsc.exe --noEmit
bun run lint
```
Expected: `tsc` 0 error; `lint` 0 error (boleh warning `no-img-element`).

- [ ] **Step 11: Verifikasi dev render**

```bash
bun dev
```
Buka `http://localhost:3000` → undangan tampil (masih gaya floral, nama soft-bloom). Hentikan server (Ctrl+C).

- [ ] **Step 12: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng
git commit -m "feat(twilight-castle): scaffold klon soft-bloom + identitas dongeng/kisah"
```

---

### Task 2: Palet & tipografi Twilight Royal

**Files:**
- Modify: `<theme>/invitation.config.json` (blok `theme.colors`)
- Modify: `<theme>/src/data/invitation.ts` (blok `theme.colors` yang sama, dipakai layout)
- Modify: `<theme>/src/app/globals.css` (tambah token ekstra + utility twilight)

**Interfaces:**
- Consumes: `buildCssVars(theme)` (sudah ada) memetakan `theme.colors.{bg,surface,surface2,accent,accentSoft,leaf,text,textMuted,textDim}` → CSS vars.
- Produces: CSS vars twilight + kelas `.twilight-sky`, `.readability-scrim`, dan var ekstra `--gold-light`, `--glow`, `--star` untuk dipakai task berikut.

- [ ] **Step 1: Set `theme.colors` twilight** di `<theme>/invitation.config.json` (dan salin identik ke `src/data/invitation.ts`). Petakan palet ke token yang sudah ada:

```jsonc
"colors": {
  "bg": "#141024",
  "surface": "#1f1838",
  "surface2": "#241c42",
  "accent": "#d4af37",
  "accentSoft": "#8a6d3a",
  "leaf": "#c97b84",
  "text": "#f4ead8",
  "textMuted": "#b6a9c9",
  "textDim": "#7a6e8f"
}
```

- [ ] **Step 2: Tambah var ekstra + utility twilight** di `<theme>/src/app/globals.css` — sisipkan setelah blok `:root` yang ada (atau di awal file, setelah import Tailwind):

```css
/* ─── Twilight Royal — token & utility tambahan ─────────────────────────── */
:root {
  --gold-light: #e8c874; /* candlelight — highlight emas */
  --glow: #c97b84;       /* rose horizon */
  --star: #f0ead6;       /* starlight */
}

/* Gradien langit senja — dasar/fallback sebelum foto latar ada */
.twilight-sky {
  background:
    radial-gradient(70% 40% at 50% 100%, rgba(201, 123, 132, 0.28), transparent 72%),
    linear-gradient(to bottom, #141024 0%, #1f1838 60%, #241c42 100%);
}

/* Scrim keterbacaan di atas foto latar */
.readability-scrim {
  background: linear-gradient(to bottom, rgba(20, 16, 36, 0.15), rgba(20, 16, 36, 0.55));
}
```

- [ ] **Step 3: Ganti wash pastel soft-bloom → twilight** — di `globals.css`, cari kelas `.soft-wash` (radial-gradient pastel lilac/butter/sky) dan ganti isi `background`-nya dengan gradien twilight tipis:

```css
.soft-wash {
  background:
    radial-gradient(45% 40% at 50% 0%, rgba(36, 28, 66, 0.55), transparent 70%),
    radial-gradient(60% 45% at 50% 100%, rgba(201, 123, 132, 0.18), transparent 72%);
}
```

- [ ] **Step 4: Verifikasi warna**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
bun dev
```
Buka `http://localhost:3000` → latar kini gelap twilight, teks krem, aksen emas (ornamen masih floral — normal, diganti task berikut). Hentikan server.

- [ ] **Step 5: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle
git commit -m "feat(twilight-castle): palet & utility Twilight Royal"
```

---

### Task 3: Komponen `Stardust` — fairy dust / bintang berkelip

**Files:**
- Create: `<theme>/src/components/shared/Stardust.tsx`
- Test: render manual di dev (dipasang di Task 5/7)

**Interfaces:**
- Produces: `export default function Stardust(props: { count?: number; zIndex?: number; className?: string })` — overlay absolut berisi titik emas berkelip; statis saat `prefers-reduced-motion`.

- [ ] **Step 1: Tulis komponen**

```tsx
"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Taburan "fairy dust" — titik emas kecil yang berkelip & mengapung lambat.
// Murni CSS/Framer (tanpa gambar). Posisi acak deterministik per-mount.
export default function Stardust({
  count = 28,
  zIndex = 2,
  className,
}: {
  count?: number;
  zIndex?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        delay: Math.random() * 4,
        dur: 3 + Math.random() * 4,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex }}
    >
      {dots.map((d) => (
        <motion.span
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "var(--gold-light)",
            boxShadow: "0 0 6px var(--gold-light)",
          }}
          initial={{ opacity: reduce ? 0.5 : 0.15 }}
          animate={
            reduce
              ? { opacity: 0.5 }
              : { opacity: [0.15, 0.9, 0.15], y: [0, -8, 0] }
          }
          transition={reduce ? undefined : { duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi tipe & lint**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
```
Expected: 0 error.

- [ ] **Step 3: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/shared/Stardust.tsx
git commit -m "feat(twilight-castle): komponen Stardust (fairy dust)"
```

---

### Task 4: Komponen `SceneBackground` — latar foto senja + scrim

**Files:**
- Create: `<theme>/src/components/shared/SceneBackground.tsx`

**Interfaces:**
- Consumes: `asset(file)` dari `@/lib/assets`.
- Produces: `export default function SceneBackground(props: { file?: string; className?: string })` — latar full-bleed: `.twilight-sky` sebagai dasar, di atasnya `<img>` foto (bila `file` diberikan) dengan fallback aman `onError`, lalu `.readability-scrim`.

- [ ] **Step 1: Tulis komponen**

```tsx
"use client";

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Latar "dunia" per-section: gradien twilight sebagai dasar (selalu ada),
// foto senja opsional di atasnya (sembunyi otomatis bila file belum ada),
// lalu scrim gelap agar teks terbaca.
export default function SceneBackground({
  file,
  className,
}: {
  file?: string;
  className?: string;
}) {
  return (
    <div aria-hidden className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div className="twilight-sky" style={{ position: "absolute", inset: 0 }} />
      {file && (
        <img
          src={asset(file)}
          alt=""
          onError={hideBrokenImage}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <div className="readability-scrim" style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
```

> Verifikasi `hideBrokenImage` ada di `@/lib/image-fallback` (ikut terklon dari soft-bloom). Bila nama beda, sesuaikan import.

- [ ] **Step 2: Verifikasi**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
```
Expected: 0 error.

- [ ] **Step 3: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/shared/SceneBackground.tsx
git commit -m "feat(twilight-castle): komponen SceneBackground (latar foto senja)"
```

---

### Task 5: Komponen `RoyalGate` — efek gerbang dua-lapis (INTI)

**Files:**
- Create: `<theme>/src/components/shared/RoyalGate.tsx`
- Modify: `<theme>/src/components/shared/InvitationExperience.tsx` (impor + case `cover`)

**Interfaces:**
- Consumes: `asset("GerbangDepan.webp")`, `asset("DuniaIstana.webp")`; `config.couple`, `config.weddingDate`.
- Produces: `export default function RoyalGate(props: { couple: InvitationConfig["couple"]; weddingDate: string })` — section `cover` dengan spacer ~220vh + hero sticky; lapisan belakang & depan animasi scale via `useScroll`. `prefers-reduced-motion` → state "sudah masuk".

- [ ] **Step 1: Tulis komponen**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

// Gerbang kerajaan: dua lapis foto. Saat scroll, lapisan DEPAN (ruang gelap
// berjendela bulat berlubang) mem-scale lebih cepat dari lapisan BELAKANG
// (dunia istana) lalu memudar → ilusi "terbang menembus jendela masuk ke
// kerajaan". Meniru mekanisme referensi (GSAP) tapi dengan Framer Motion.
export default function RoyalGate({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const reduce = useReducedMotion();
  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start start", "end start"],
  });

  // Lapisan belakang: mendekat perlahan. Depan: melesat keluar lalu lenyap.
  const worldScale = useTransform(scrollYProgress, [0, 1], [1, 2.4]);
  const frontScale = useTransform(scrollYProgress, [0, 1], [1, 4.5]);
  const frontOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Reduced-motion: langsung state "sudah masuk" (depan hilang, dunia penuh),
  // spacer dipendekkan agar tak ada runway scroll kosong.
  const spacerHeight = reduce ? "100dvh" : "220vh";

  return (
    <section id="cover" ref={spacerRef} style={{ position: "relative", height: spacerHeight }}>
      <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>
        {/* Lapisan belakang: dunia istana */}
        <motion.div
          style={{ position: "absolute", inset: 0, scale: reduce ? 1 : worldScale }}
        >
          <img
            src={asset("DuniaIstana.webp")}
            alt=""
            onError={hideBrokenImage}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Fallback dasar bila foto belum ada */}
          <div className="twilight-sky" style={{ position: "absolute", inset: 0, zIndex: -1 }} />
        </motion.div>

        {/* Lapisan depan: ruang gelap + jendela bulat berlubang */}
        {!reduce && (
          <motion.div
            style={{ position: "absolute", inset: 0, scale: frontScale, opacity: frontOpacity }}
          >
            <img
              src={asset("GerbangDepan.webp")}
              alt=""
              onError={hideBrokenImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        )}

        {/* Nama mempelai + isyarat scroll */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            opacity: reduce ? 1 : textOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 3,
            pointerEvents: "none",
            padding: "0 24px",
          }}
        >
          <p className="font-body" style={{ color: "var(--star)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 12 }}>
            The Wedding Of
          </p>
          <h1
            className="font-display"
            style={{ color: "var(--gold-light)", fontSize: "clamp(40px, 12vw, 84px)", fontWeight: 500, lineHeight: 1.05, margin: "12px 0" }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </h1>
          <p className="font-body" style={{ color: "var(--text-muted)", fontSize: 14 }}>{weddingDate}</p>
          {!reduce && (
            <motion.p
              className="font-body"
              style={{ color: "var(--text-muted)", fontSize: 11, letterSpacing: "0.2em", marginTop: 28 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              gulir untuk masuk ↓
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Pasang di `InvitationExperience.tsx`** — ganti impor & case `cover`.

Ganti baris impor `CoverSection`:
```tsx
import RoyalGate from "@/components/shared/RoyalGate";
```
Ganti `case "cover"`:
```tsx
      case "cover":
        return <RoyalGate key="cover" couple={config.couple} weddingDate={config.weddingDate} />;
```
Hapus impor `CoverSection` yang lama bila tak dipakai lagi.

- [ ] **Step 3: Verifikasi tipe & lint**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
```
Expected: 0 error.

- [ ] **Step 4: Verifikasi efek gerbang di dev**

```bash
bun dev
```
Buka `http://localhost:3000`, buka amplop → gerbang tampil (foto belum ada → dasar `twilight-sky` + nama mempelai). Scroll: nama memudar, lapisan membesar; tak ada gap/nyangkut; section `greeting` mengalir setelahnya. Uji `prefers-reduced-motion` (DevTools → Rendering → Emulate CSS prefers-reduced-motion) → langsung state masuk, tanpa runway. Hentikan server.

> ⚠️ **Risiko container scroll:** `useScroll({ target })` default melacak scroll
> **window/dokumen**, sedangkan soft-bloom kadang menggulir di dalam `<main className="content-scroll">`
> (overflow di desktop). Bila progress gerbang tak bergerak saat scroll: (a) cek elemen mana
> yang benar-benar menggulir, lalu (b) beri opsi `container` ke `useScroll` menunjuk ref
> kontainer scroll tsb, atau pastikan halaman menggulir di window (hapus overflow pada wrapper
> untuk region gerbang). Uji di viewport HP (primary) DAN lebar.

- [ ] **Step 5: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/shared/RoyalGate.tsx \
        themes/dongeng/kisah/twilight-castle/src/components/shared/InvitationExperience.tsx
git commit -m "feat(twilight-castle): RoyalGate — efek gerbang dua-lapis (Framer)"
```

---

### Task 6: Ornamen emas & pembatas twilight

**Files:**
- Create: `<theme>/src/components/shared/GoldCorner.tsx`, `<theme>/src/components/shared/TwilightTitle.tsx`
- Modify: `<theme>/src/components/shared/SectionSeam.tsx` (pembatas → ornamen emas)

**Interfaces:**
- Produces:
  - `GoldCorner(props: { corner?: "tl"|"tr"|"bl"|"br"; size?: string })` — `<img>` `SudutEmas.webp` di sudut, fallback aman, di-mirror per sudut.
  - `TwilightTitle(props: { children: React.ReactNode; serif?: boolean })` — judul serif emas (pengganti `FloralTitle`, API sama: menerima `children` + opsi `serif`).
  - `SectionSeam` menampilkan `PembatasEmas.webp` (fallback: garis emas tipis CSS).

- [ ] **Step 1: Tulis `GoldCorner.tsx`**

```tsx
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Ornamen sudut emas. SudutEmas.webp digambar untuk sudut kiri-atas; sudut
// lain di-mirror via scaleX/scaleY. Fallback aman bila aset belum ada.
const TRANSFORMS: Record<string, string> = {
  tl: "none",
  tr: "scaleX(-1)",
  bl: "scaleY(-1)",
  br: "scale(-1, -1)",
};
const POS: Record<string, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
};

export default function GoldCorner({
  corner = "tl",
  size = "clamp(90px, 26vw, 170px)",
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  size?: string;
}) {
  return (
    <img
      src={asset("SudutEmas.webp")}
      alt=""
      aria-hidden
      onError={hideBrokenImage}
      style={{ position: "absolute", width: size, transform: TRANSFORMS[corner], pointerEvents: "none", zIndex: 1, ...POS[corner] }}
    />
  );
}
```

- [ ] **Step 2: Tulis `TwilightTitle.tsx`** (API sama seperti `FloralTitle` agar section mudah menukar)

```tsx
export default function TwilightTitle({
  children,
  serif = true,
}: {
  children: React.ReactNode;
  serif?: boolean;
}) {
  return (
    <h2
      className={serif ? "font-display" : "font-body"}
      style={{
        color: "var(--gold-light)",
        fontSize: "clamp(30px, 8vw, 46px)",
        fontWeight: 500,
        lineHeight: 1.1,
        margin: 0,
        textAlign: "center",
      }}
    >
      {children}
    </h2>
  );
}
```

- [ ] **Step 3: Ubah `SectionSeam.tsx`** — ganti isi render pembatas floral dengan gambar emas + fallback garis CSS. Ganti elemen gambar/SVG pembatas menjadi:

```tsx
      <img
        src={asset("PembatasEmas.webp")}
        alt=""
        aria-hidden
        onError={hideBrokenImage}
        style={{ width: "min(60%, 260px)", height: "auto", opacity: 0.9 }}
      />
```
Pastikan `asset` & `hideBrokenImage` diimpor di file itu. Bila `SectionSeam` punya container/warna dari palet, biarkan (sudah twilight via token).

- [ ] **Step 4: Verifikasi**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
```
Expected: 0 error.

- [ ] **Step 5: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/shared
git commit -m "feat(twilight-castle): ornamen emas (GoldCorner, TwilightTitle, SectionSeam)"
```

---

### Task 7: Restyle section — kelompok A (Greeting, Couple, LoveStory)

**Files:**
- Modify: `<theme>/src/components/sections/GreetingSection.tsx`, `CoupleSection.tsx`, `LoveStorySection.tsx`

**Interfaces:**
- Consumes: `TwilightTitle`, `GoldCorner`, `SceneBackground`, `Stardust` dari Task 3–6. Props section TIDAK berubah (dipanggil sama oleh `InvitationExperience`).

Pola transformasi (berlaku semua section, kelompok A–C):
1. Ganti impor ornamen floral (`FloralTitle`, `SideVines`, `Meadow`, `Butterflies`, `CardVines`, `FallingFlowers`, `Bird`, dsb.) → twilight (`TwilightTitle`, `GoldCorner`, `Stardust`, `SceneBackground`). Hapus impor floral yang tak dipakai.
2. Ganti komponen judul `<FloralTitle …>` → `<TwilightTitle …>` (API sama).
3. Ganti latar/ornamen floral (`SideVines`, `soft-wash` pastel, `Meadow`) dengan `SceneBackground` (latar foto) + `GoldCorner` + `Stardust` secukupnya.
4. Warna literal apa pun (mis. `rgba(126,105,150,…)`) → var token twilight (`--accent`, `--gold-light`, `--glow`, `--border`).
5. Kelas mood floral (`mood-mist`, `mood-blush`, `mood-butter`, `mood-meadow`) boleh dibiarkan (hanya tint) atau diganti `twilight-sky`.

- [ ] **Step 1: `GreetingSection.tsx`** — terapkan pola di atas. Struktur: salam pembuka + nama tamu (`GuestName`, biarkan). Bungkus latar dengan `<SceneBackground />`, tambah `<GoldCorner corner="tl" />` & `<GoldCorner corner="tr" />`, judul via `TwilightTitle`.

- [ ] **Step 2: `CoupleSection.tsx`** — foto mempelai dibingkai cincin emas: bungkus tiap foto bulat dengan `BingkaiFoto.webp` via `<img>` overlay (fallback aman), atau `GoldCorner` bila lebih sesuai. Nama & orang tua pakai token twilight. `SceneBackground` sebagai latar.

- [ ] **Step 3: `LoveStorySection.tsx`** — kronologi bab. Timeline/garis pakai `--accent`; foto `invitationPhoto(ch.image)` (biarkan util). Latar `SceneBackground` + `Stardust`.

- [ ] **Step 4: Verifikasi**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
bun dev   # cek Greeting/Couple/LoveStory tampil twilight; hentikan setelah cek
```
Expected: 0 error; ketiga section bernuansa twilight, tanpa sisa ornamen bunga.

- [ ] **Step 5: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/sections
git commit -m "feat(twilight-castle): restyle Greeting/Couple/LoveStory ke twilight"
```

---

### Task 8: Restyle section — kelompok B (Event akad/resepsi, DressCode, Gallery)

**Files:**
- Modify: `<theme>/src/components/sections/EventSection.tsx`, `DressCodeSection.tsx`, `GallerySection.tsx`

**Interfaces:**
- Consumes: sama seperti Task 7. `EventSection` dipanggil untuk akad & resepsi (props `event`, `index`, `sectionId`).

- [ ] **Step 1: `EventSection.tsx`** — kartu acara: border/aksen `--accent`, ikon `lucide-react` (biarkan) diwarnai `--gold-light`. Latar `SceneBackground` (mis. `LatarSenja.webp`). Peta embed dibiarkan.

- [ ] **Step 2: `DressCodeSection.tsx`** — swatch warna dibiarkan (data), teks/label token twilight, latar `SceneBackground` + `GoldCorner`.

- [ ] **Step 3: `GallerySection.tsx`** — grid foto: border foto `1px solid var(--border)`, latar `SceneBackground`, judul `TwilightTitle`.

- [ ] **Step 4: Verifikasi**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
bun dev   # cek Akad/Resepsi/DressCode/Gallery; hentikan
```
Expected: 0 error; section twilight konsisten.

- [ ] **Step 5: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/sections
git commit -m "feat(twilight-castle): restyle Event/DressCode/Gallery ke twilight"
```

---

### Task 9: Restyle section — kelompok C (RSVP, Gift, Rundown, Turut, Closing)

**Files:**
- Modify: `<theme>/src/components/sections/RSVPSection.tsx`, `GiftSection.tsx`, `RundownSection.tsx`, `TurutMengundangSection.tsx`, `ClosingSection.tsx`

**Interfaces:**
- Consumes: sama seperti Task 7. **RSVP tetap tampilan-saja** (jangan tambah fetch/D1).

- [ ] **Step 1: `RSVPSection.tsx`** — pertahankan logika form lokal + `handleSubmit` setTimeout (TANPA D1). Restyle: `input-bloom`/`btn-bloom`/`bloom-panel` → warna token twilight (border `--border`, fokus `--accent`, tombol terpilih `background: var(--accent); color: var(--bg)`). Ganti `SideVines`/`soft-wash` → `SceneBackground` + `GoldCorner`. Judul `TwilightTitle`.

- [ ] **Step 2: `GiftSection.tsx`** — kartu rekening: `background: var(--surface)`, border `--border`, teks token; ikon `Gift` `--gold-light`. Latar `SceneBackground`.

- [ ] **Step 3: `RundownSection.tsx`** — timeline: konektor/garis `--accent`, kartu `--surface`/`--border`. Latar twilight.

- [ ] **Step 4: `TurutMengundangSection.tsx`** — daftar nama: token twilight, pembatas `PembatasEmas`/garis emas. Latar twilight.

- [ ] **Step 5: `ClosingSection.tsx`** — penutup: nama `--gold-light`, `SiluetIstana.webp` di kaki (via `<img>` fallback aman) sebagai skyline, `Stardust`. **Watermark bilah penuh** (`.closing-brand-footer`) dibiarkan/diselaraskan warna (background `--accent`, monogram di-invert) — pola terbaru sudah ada di soft-bloom hasil klon.

- [ ] **Step 6: Verifikasi**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
bun dev   # cek RSVP/Gift/Rundown/Turut/Closing; RSVP submit → "Terima Kasih"; hentikan
```
Expected: 0 error; RSVP submit lokal jalan tanpa network.

- [ ] **Step 7: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/src/components/sections
git commit -m "feat(twilight-castle): restyle RSVP/Gift/Rundown/Turut/Closing ke twilight"
```

---

### Task 10: Data demo & pemasangan latar per-section

**Files:**
- Modify: `<theme>/invitation.config.json`, `<theme>/src/data/invitation.ts`
- Modify: section terkait untuk menyetel `file=` `SceneBackground` per-section (mis. akad `LatarSenja.webp`)

**Interfaces:**
- Consumes: tipe `InvitationConfig` (sudah ada, 13 section).
- Produces: config demo lengkap twilight (couple, events, weddingDate, gallery, bankAccounts, loveStory, rundown, turutMengundang, dressCode, music, theme, sections).

- [ ] **Step 1: Isi data demo twilight** di `invitation.config.json` — pasangan & konten bertema (boleh nama fiktif kerajaan-dongeng), `sections.order` = `["cover","greeting","couple","lovestory","akad","resepsi","dresscode","gallery","rsvp","gift","rundown","turut","closing"]`, semua `enabled` true. Foto boleh URL absolut sementara (dilewatkan `invitationPhoto`). `theme.colors` = nilai Task 2. Pastikan `loveStory`/`rundown`/`turutMengundang` terisi (≥1 item) agar tak tersaring `hasContent`.

- [ ] **Step 2: Selaraskan `src/data/invitation.ts`** — `couple`, `weddingDate`, `theme`, `music` konsisten dengan JSON (dipakai `layout.tsx` untuk metadata & CSS vars).

- [ ] **Step 3: Setel latar variasi per-section** — pada section kelompok B/C, isi `file` `SceneBackground` (mis. Akad/Resepsi `LatarSenja.webp`, Gallery `LatarSenja2.webp` bila ada). Section tanpa aset → biarkan `file` kosong (dasar `twilight-sky`).

- [ ] **Step 4: Verifikasi render penuh**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
bun dev
```
Buka `http://localhost:3000` → 13 section tampil berurutan, seam antar-section tunggal (tak dobel), gerbang → greeting mulus. Hentikan.

- [ ] **Step 5: Commit**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng/kisah/twilight-castle/invitation.config.json \
        themes/dongeng/kisah/twilight-castle/src/data/invitation.ts \
        themes/dongeng/kisah/twilight-castle/src/components/sections
git commit -m "feat(twilight-castle): data demo twilight + latar per-section"
```

---

### Task 11: Verifikasi worker lokal & siap deploy

**Files:**
- Modify (bila perlu): `<theme>/README.md` (daftar 13 section), `dongeng/README.md`

**Interfaces:**
- Consumes: seluruh tema dari Task 1–10.
- Produces: bundle `.open-next` yang lolos smoke test worker lokal; catatan Version ID setelah deploy.

- [ ] **Step 1: Lint final + typecheck**

```bash
cd /c/rimba-main/invitation/themes/dongeng/kisah/twilight-castle
./node_modules/.bin/tsc.exe --noEmit && bun run lint
```
Expected: 0 error (warning `no-img-element` boleh).

- [ ] **Step 2: Build & preview worker lokal (wajib per CLOUDFLARE_DEPLOYMENT.md)**

```bash
bun run preview
```
Expected: build sukses (webpack), worker jalan lokal. Di URL preview: HTTP 200, ke-13 section + gerbang muncul, **0 `ChunkLoadError`** di console, rute `/preview` → 200. Hentikan (Ctrl+C).

- [ ] **Step 3: (Manual/paralel) Generate & upload aset**

Ikuti `<theme>/ASSET_PROMPTS.md`: generate minimal `GerbangDepan.webp` + `DuniaIstana.webp`, taruh di `public/images/` untuk dev, upload ke R2:
```bash
npx wrangler r2 object put rimba-themes/dongeng/kisah/twilight-castle/GerbangDepan.webp \
  --file ./public/images/GerbangDepan.webp --content-type image/webp --remote
```
(Tema tetap tayang tanpa aset karena fallback aman — langkah ini boleh menyusul.)

- [ ] **Step 4: Deploy (mengikuti dokumen; simpan Version ID)**

```bash
bun run deploy
```
Simpan **Version ID** di deskripsi commit/PR. Setelah deploy, ingat: URL polos bisa sempat menit menyajikan cache edge lama (`s-maxage`) — hard refresh bila perlu.

- [ ] **Step 5: Commit catatan akhir (README + Version ID)**

```bash
cd /c/rimba-main/invitation
git add themes/dongeng
git commit -m "docs(twilight-castle): finalisasi README + catatan deploy (Version ID: <isi>)"
```

---

## Catatan verifikasi lintas-task

- Tiap task **berdiri sendiri**: diakhiri `tsc --noEmit` + `bun run lint` 0 error, dan (untuk task visual) render `bun dev`.
- Aset webp belum wajib ada saat Task 1–10 — semua ber-fallback aman; efek gerbang tampil pakai dasar `twilight-sky` sampai `GerbangDepan`/`DuniaIstana` di-upload.
- Jangan mengubah plumbing seam-safe (`KNOWN_SECTIONS` + `hasContent`) — section tanpa data harus tersaring di `sectionIds`, bukan `null` di `renderSection`.
