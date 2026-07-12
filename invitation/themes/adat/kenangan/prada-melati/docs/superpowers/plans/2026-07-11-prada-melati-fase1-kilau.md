# Prada Melati — Implementation Plan (Fase 1, model Kilau/Kelir)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Menggantikan** `invitation/docs/superpowers/plans/2026-07-10-prada-melati.md` — plan itu ditulis untuk model **parallax** (`PradaScene`, tabel `depth 0.04/0.12/0.22`, "kedalaman dari parallax berlapis") yang **sudah dibuang** oleh revisi spec 2026-07-10 (§1.3, §4, §5, §9). Task 1–5 di plan lama sudah selesai dan tetap berlaku; Task 6–7 di plan lama membangun komponen yang salah dan digantikan oleh plan ini.

**Goal:** Mendirikan `adat/kenangan/prada-melati` sampai hidup di `bun dev` dengan token terkunci, tipografi benar, `RonceanMelati` menjuntai-bergoyang, dan **satu scene `cover` model Kelir** — kain diam, blencong bernapas, satu aktor emas yang **menancap** lalu **berkilau** saat scroll — setelah medium prada gold-leaf terbukti tidak terlihat murah.

**Architecture:** App Next.js mandiri (sudah di-scaffold, lineage server-first warisan `_boilerplate`/warm-narrative: `page.tsx` registry → `SnapContainer` → section). Gerak inti **bukan** parallax melainkan **kilau** — satu div gradien di-`mask` oleh piksel emas aset (`mix-blend-mode: overlay`), digeser oleh `scrollYProgress` section. Latar satu helai `KainBadan` yang diam; suasana per-section datang dari **blencong** (CSS radial-gradient, nol byte). Aset `.webp` tinggal di R2, dirujuk lewat `src/lib/assets.ts`; yang belum ada disembunyikan `hideOnError` sehingga skeleton berdiri sebelum aset lengkap.

**Tech Stack:** Next.js 16.2.5, React 19.2.4, framer-motion ^12.38.0 (pakai `motion` penuh, **tanpa** LazyMotion di Fase 1), Tailwind v4, TypeScript, bun, `node --test`.

## Global Constraints

- Spec sumber: `themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-10-prada-melati-design.md`. Setiap keputusan berasal dari sana; angka §-nya adalah §-spec revisi (prompt aset di **§6c/§6d/§6e**, bukan "§5d").
- Donor struktur: **warm-narrative** (`adat/kenangan/warm-narrative`). Komponen prada adalah transformasi: `parallax-context`→`scroll-context`, `SnapContainer` (nyaris sama), `ParallaxScene`→`KelirScene`, `sceneFrame`→`sceneKelir`, `FallingFlowers`→`RonceanMelati`. **Jangan** menyalin `ParallaxScene`/`sceneFrame` apa adanya (spec §9) — keduanya meng-encode "tata bahasa taman" yang justru dibuang.
- Gerak terkunci (spec §5): **kilau** (respons scroll), **menancap** (masuk), **bernapas** (idle blencong), **roncean bergoyang** (global). **Tidak ada parallax.** Kedalaman **tidak** boleh datang dari bayangan — dilarang `box-shadow`/`drop-shadow` pada aset emas.
- Kilau (spec §5.1): sumber `scrollYProgress` section, `offset: ["start end","end start"]`; sapuan gradien geser `-120%`→`220%`; sudut `105deg` tetap; blend `overlay`; kena kilau: pinggiran, tumpal, aktor — **tidak** `KainBadan`, **tidak** roncean.
- Reduced motion (spec §5.5): kilau membeku di `45%` sapuan; menancap → fade `300ms`; bernapas mati (blencong diam di terang penuh); roncean diam. Semua konten **tetap terlihat** (`DESIGN_SYSTEM.md` §9).
- Kontras: token teks ≥ 4.5:1, `--gold-dim` ≥ 3:1 — dijaga `scripts/__tests__/contrast-contract.test.mjs` (sudah ada, Task 3 lama). Jangan menurunkan ambangnya.
- Font: Marcellus (display), Lora (body), Inter (label). Playfair Display & Cormorant Garamond **dilarang**.
- Path R2: bucket `rimba-themes`, prefix `adat/kenangan/prada-melati/`, disajikan lewat `https://assets-themes.rimba.io`. Dev tanpa env → `assets.ts` fallback ke `/images` (`public/images/`).
- Budget aset: `KainBadan` opaque < 180KB; aktor < 120KB; ceplok < 70KB; roncean < 90KB; pinggiran < 20KB; tumpal < 60KB.
- Branch kerja `feat/prada-melati-impl`. Jangan commit ke branch design yang beku.
- Pendaftaran tema (router, sync-shared, backend, TemplateSelector) = **Fase 2**, bukan di sini.

**Catatan verifikasi.** Komponen scene ini visual/motion; tidak ada yang berpura-pura punya unit test bermakna untuk efek GPU. Satu-satunya modul murni — `sceneKelir.ts` — mendapat unit test TDD sungguhan (Task 3). Sisanya diverifikasi lewat `typecheck` + `lint` + penilaian mata di `bun dev`, persis pola yang dipakai warm-narrative.

---

## Sudah selesai (plan lama Task 2–5, tetap berlaku)

Jangan ulangi. Terverifikasi dari git log & isi berkas:

- **Scaffold** dari boilerplate: `package.json` (`name: prada-melati`), `next.config.ts`, `open-next.config.ts`, `wrangler.jsonc`, `tsconfig.json`. `bun dev` menyala.
- **Token & kontras** (commit `1b13527`): palet sogan di `invitation.config.json`, `scripts/__tests__/contrast-contract.test.mjs` lulus, fallback `:root` di `globals.css`.
- **Tipografi & token statik** (commit `05a730f`): Marcellus/Lora/Inter di `layout.tsx`, kelas `.font-display/.font-body/.font-label`, `--border`/`--fabric-grain` di `globals.css`.
- **Sumber aset** (commit `67c41ad`): `src/lib/assets.ts` — `ASSET_BASE`, `asset(file)`, `hideOnError`.

`globals.css` sudah punya `.snap-container` dan `.snap-section` (100dvh, relative, overflow hidden, flex center) — Fase 1 memakainya apa adanya.

---

### Task G (Gerbang): buktikan medium prada gold-leaf

Kalau siluet emas pipih ternyata terlihat seperti stiker murah, seluruh art direction gugur dan tidak ada gunanya scaffold scene apa pun. Tiga gambar percobaan jauh lebih murah daripada dua puluh.

**Ini satu-satunya task yang butuh manusia.** Claude tidak dapat menggenerate gambar; ia hanya menilainya lewat `Read`. Task 1–6 hanya berjalan bila putusan **LULUS**.

**Files:**
- Create: `themes/adat/kenangan/prada-melati/docs/superpowers/specs/2026-07-11-prada-medium-trial.md`
- Scratch (jangan di-commit): `<scratchpad>/prada-trial/`

**Interfaces:**
- Consumes: style bible & prompt dari spec **§3, §6c, §6d, §6e**.
- Produces: keputusan `LULUS`/`GAGAL` + tiga aset percobaan yang, bila lulus, dipakai kembali oleh Task 6 di `public/images/`.

- [ ] **Step 1: Generate tiga gambar percobaan**

Prompt tinggal di spec, bukan di sini — menyalinnya melahirkan dua versi yang menyimpang. Buka spec, salin **tiga** prompt ini apa adanya ke image model pilihanmu (tiap prompt sudah berdiri sendiri, style bible §3 tertanam):

| Aset | Prompt di spec | Kenapa ini yang diuji |
|---|---|---|
| `AktorGunungan.webp` | §6d | Bentuk emas paling rumit. Menguji **kepipihan** + **crackle daun emas** + risiko "stiker" (spec §2.2) |
| `PinggiranTile.webp` | §6c | Menguji **seamless vertikal** & lereng parang konstan (risiko terbuka spec §13) |
| `RonceanMelatiL.webp` | §6e | Menguji melati tetap **gading `#F3E9D2`**, tidak ikut keemasan |

Simpan hasilnya sebagai WebP/PNG di `<scratchpad>/prada-trial/`. Tiga cukup: bila ketiganya lulus, sisa suite memakai fondasi gaya yang sama.

- [ ] **Step 2: Minta Claude menilai ketiganya**

`Read` menampilkan gambar. Nilai satu per satu:

| Kriteria | Lulus bila | Diuji oleh |
|---|---|---|
| Kepipihan | Tak ada bayangan jatuh, tak ada gradasi peniru volume | AktorGunungan |
| Tekstur | Retak daun emas + serat kain **terlihat**; emas tidak rata seperti vektor | AktorGunungan |
| Seamless | Bilah parang yang keluar dari tepi atas menyambung mulus di tepi bawah; lereng konstan | PinggiranTile |
| Gading bukan emas | Warna gading `#F3E9D2`; melati **tidak** keemasan | RonceanMelatiL |
| Bukan stiker | Ornamen terbaca sebagai emas di atas kain, bukan tempelan bertepi keras | ketiganya |

Gagal **Kepipihan** atau **Tekstur** = medium gugur. Gagal **Seamless** atau **Gading** = prompt yang diperbaiki, bukan medium.

- [ ] **Step 3: Catat putusan**

Tulis `2026-07-11-prada-medium-trial.md`: ketiga prompt, putusan per kriteria, satu paragraf kesimpulan. Bila `GAGAL` pada kepipihan/tekstur → tulis medium pengganti yang diusulkan dan **berhenti**; spec §2.1 dibuka ulang lewat brainstorming, bukan ditambal di plan.

- [ ] **Step 4: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/docs
git commit -m "docs(prada-melati): putusan uji medium prada gold-leaf"
```

---

### Task 1: Konteks scroll — `scroll-context.ts` + `SnapContainer.tsx`

Kilau butuh tahu progres scroll section terhadap kontainer scroll yang sebenarnya (`.snap-container`), bukan window. Ini plumbing yang dipinjam dari warm-narrative, cuma di-rename dari "parallax" ke "scroll" karena tema ini tidak ber-parallax.

**Files:**
- Create: `themes/adat/kenangan/prada-melati/src/components/shared/scroll-context.ts`
- Create: `themes/adat/kenangan/prada-melati/src/components/shared/SnapContainer.tsx`

**Interfaces:**
- Produces:
  - `ScrollContext: React.Context<RefObject<HTMLDivElement | null> | null>`
  - `useScrollContainer(): RefObject<HTMLDivElement | null> | null`
  - `SnapContainer({ children }: { children: ReactNode })` — memasang `ref` pada `.snap-container` dan menyediakannya lewat `ScrollContext`.

- [ ] **Step 1: Tulis `scroll-context.ts`**

```ts
"use client";

import { createContext, useContext, type RefObject } from "react";

/**
 * Ref ke elemen yang benar-benar men-scroll (`.snap-container`), supaya tiap
 * KelirScene mengukur progres scroll terhadap kontainer itu, bukan window.
 */
export const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useScrollContainer() {
  return useContext(ScrollContext);
}
```

- [ ] **Step 2: Tulis `SnapContainer.tsx`**

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import { ScrollContext } from "./scroll-context";

/**
 * Pembungkus klien untuk kontainer scroll utama. Ia memegang scrollRef dan
 * menyebarkannya lewat ScrollContext. Section (server component) diteruskan
 * apa adanya sebagai `children`.
 */
export default function SnapContainer({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContext.Provider value={scrollRef}>
      <div ref={scrollRef} className="snap-container">
        {children}
      </div>
    </ScrollContext.Provider>
  );
}
```

- [ ] **Step 3: Verifikasi tipe & lint**

```bash
cd invitation/themes/adat/kenangan/prada-melati
bun run typecheck && bun run lint
```

Harapan: keduanya bersih.

- [ ] **Step 4: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/components/shared/scroll-context.ts \
        invitation/themes/adat/kenangan/prada-melati/src/components/shared/SnapContainer.tsx
git commit -m "feat(prada-melati): ScrollContext dan SnapContainer"
```

---

### Task 2: `RonceanMelati` — benang merah

Sakura **jatuh**; melati **menjuntai**. Perbedaan gerak inilah yang menjaga tema ini tak terasa bersaudara dengan warm-narrative — jangan menyalin `FallingFlowers` lalu tukar aset. Untaian tergantung dari tepi atas dan berayun `±1.1deg` di sekitar titik gantungnya (spec §5.4). Tak bergantung aset scene, jadi bisa berdiri lebih dulu.

**Files:**
- Create: `themes/adat/kenangan/prada-melati/src/components/shared/RonceanMelati.tsx`
- Modify: `themes/adat/kenangan/prada-melati/src/app/globals.css`

**Interfaces:**
- Consumes: `ASSET_BASE`, `hideOnError` dari `src/lib/assets.ts`.
- Produces: `RonceanMelati({ zIndex? }: { zIndex?: number })` — layer global, `pointer-events: none`. Membaca `RonceanMelatiL.webp` & `RonceanMelatiR.webp`.

- [ ] **Step 1: Tulis komponennya**

```tsx
"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

import { ASSET_BASE as BASE, hideOnError } from "@/lib/assets";

const STRANDS = [
  { src: `${BASE}/RonceanMelatiL.webp`, side: "left" as const, delay: "0s" },
  { src: `${BASE}/RonceanMelatiR.webp`, side: "right" as const, delay: "-2.4s" },
];

export default function RonceanMelati({ zIndex = 3 }: { zIndex?: number }) {
  // Hentikan sway saat pemiliknya di luar viewport — loop infinite tak perlu
  // membakar frame setelah user scroll melewatinya.
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
        // eslint-disable-next-line @next/next/no-img-element
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
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Tulis keyframes sway di `globals.css`**

Tambahkan di akhir berkas. Amplitudo kecil, periode lambat; untaian berayun di sekitar titik gantung, bukan bergeser.

```css
/* ─── Roncean melati (sway) ──────────────────────────────────────────────── */
@keyframes ronce-sway {
  0%, 100% { transform: rotate(-1.1deg); }
  50%      { transform: rotate(1.1deg); }
}

.ronce { animation: ronce-sway 7.5s ease-in-out infinite; }
.ronce-paused { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .ronce { animation: none; }
}
```

- [ ] **Step 3: Verifikasi reduced-motion di browser**

```bash
bun dev
```

RonceanMelati belum dipasang di page sampai Task 6, jadi verifikasi penuh menyusul di sana. Untuk sekarang cukup pastikan `bun dev` menyala tanpa error kompilasi.

- [ ] **Step 4: Verifikasi tipe & lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 5: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/components/shared/RonceanMelati.tsx \
        invitation/themes/adat/kenangan/prada-melati/src/app/globals.css
git commit -m "feat(prada-melati): RonceanMelati, untaian melati yang menjuntai"
```

---

### Task 3: `sceneKelir.ts` — tabel preset per section (satu-satunya modul dengan unit test)

`sceneKelir.ts` memetakan tiap id section ke preset kelir (§6f). Modul murni, jadi ia **wajib** ber-TDD: tulis tes yang gagal dulu, lalu isi tabelnya. Fase 1 hanya memakai preset `cover`, tapi tabel lengkap ditulis sekarang supaya Fase 2 tinggal mengonsumsinya dan tes menjaga integritasnya.

**Files:**
- Create: `themes/adat/kenangan/prada-melati/src/components/shared/sceneKelir.ts`
- Create: `themes/adat/kenangan/prada-melati/scripts/__tests__/scene-kelir.test.mjs`
- Modify: `themes/adat/kenangan/prada-melati/package.json` (tambah script `test:scene`)

**Interfaces:**
- Produces:
  - `interface KelirPreset { actor?: string; actorScale?: number; actorY?: string; actorCorners?: boolean; blencongY: string; blencongBright: number; frame?: string; }`
  - `const KELIR: Record<string, KelirPreset>` — sebelas id spec §10.
  - `function kelirFor(id: string): KelirPreset | undefined`

- [ ] **Step 1: Tulis tes yang gagal**

`scripts/__tests__/scene-kelir.test.mjs` — berjalan lewat `node --test` seperti tes kontras. Karena `sceneKelir.ts` ber-TypeScript, tes mengimpor konstanta lewat regex-parse ringan dari sumbernya (menghindari perlu build). Untuk kesederhanaan, tabel divalidasi dengan mem-`import` versi runtime: tulis tabelnya juga sebagai JSON tercermin di sumber. **Lebih sederhana: uji lewat pemeriksaan file teks.**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../../src/components/shared/sceneKelir.ts", import.meta.url), "utf8");

const SECTION_IDS = [
  "cover", "greeting", "couple", "lovestory", "akad", "resepsi",
  "dresscode", "gallery", "rsvp", "gift", "closing",
];

test("KELIR memuat kesebelas id section (spec §10)", () => {
  for (const id of SECTION_IDS) {
    assert.match(src, new RegExp(`\\b${id}\\s*:`), `preset '${id}' hilang dari KELIR`);
  }
});

test("cover memakai AktorGunungan, blencong 38% terang 0.9 (spec §6f)", () => {
  const cover = src.slice(src.indexOf("cover:"), src.indexOf("greeting:"));
  assert.match(cover, /AktorGunungan\.webp/, "cover harus memakai AktorGunungan.webp");
  assert.match(cover, /blencongY:\s*"38%"/, "blencongY cover harus 38%");
  assert.match(cover, /blencongBright:\s*0\.9/, "blencongBright cover harus 0.9");
});

test("closing menerbitkan cahaya dari hem bawah (blencong 88%, terang 1.0)", () => {
  const closing = src.slice(src.indexOf("closing:"));
  assert.match(closing, /blencongY:\s*"88%"/, "blencongY closing harus 88%");
  assert.match(closing, /blencongBright:\s*1(\.0)?\b/, "blencongBright closing harus 1.0");
});
```

- [ ] **Step 2: Tambah script & jalankan tes, pastikan GAGAL**

Di `package.json`, tambahkan ke `scripts`:

```json
"test:scene": "node --test scripts/__tests__/scene-kelir.test.mjs"
```

```bash
bun run test:scene
```

Harapan: FAIL — `sceneKelir.ts` belum ada.

- [ ] **Step 3: Tulis `sceneKelir.ts` (tabel lengkap §6f)**

```ts
// src/components/shared/sceneKelir.ts
// Tabel preset Kelir per section (spec §6f). Data murni — tanpa React.
// `y` blencong diukur dari tepi atas viewport; `actorY` adalah posisi puncak aktor.
// Filename dirujuk lewat asset() di KelirScene; yang belum ada disembunyikan
// hideOnError, jadi preset boleh menyebut aset yang lahir di Fase 2.

export interface KelirPreset {
  /** Nama berkas aktor emas, mis. "AktorGunungan.webp". */
  actor?: string;
  /** Skala aktor 0..1 (hero = 1.0, ceplok < 1). */
  actorScale?: number;
  /** Posisi puncak aktor dari tepi atas, mis. "26%". Kosong untuk hero (tancap dari bawah). */
  actorY?: string;
  /** gallery: sprig kecil di empat sudut, bukan satu aktor tengah. */
  actorCorners?: boolean;
  /** Pusat vertikal blencong dari tepi atas, mis. "38%". */
  blencongY: string;
  /** Terang blencong 0..1. */
  blencongBright: number;
  /** Bingkai foto opsional, mis. "BingkaiGebyok.webp". */
  frame?: string;
}

export const KELIR: Record<string, KelirPreset> = {
  cover:     { actor: "AktorGunungan.webp",    actorScale: 1.0,                 blencongY: "38%", blencongBright: 0.9 },
  greeting:  { actor: "CeplokSulur.webp",      actorScale: 0.55, actorY: "26%", blencongY: "30%", blencongBright: 0.35 },
  couple:    { actor: "CeplokMelati.webp",     actorScale: 0.70, actorY: "22%", blencongY: "28%", blencongBright: 0.50, frame: "BingkaiGebyok.webp" },
  lovestory: { actor: "CeplokKawung.webp",     actorScale: 0.50, actorY: "18%", blencongY: "24%", blencongBright: 0.40, frame: "BingkaiTumpal.webp" },
  akad:      { actor: "AktorCandiBentar.webp", actorScale: 1.0,                 blencongY: "44%", blencongBright: 0.75 },
  resepsi:   { actor: "AktorPaduraksa.webp",   actorScale: 1.0,                 blencongY: "42%", blencongBright: 0.75 },
  dresscode: { actor: "CeplokKawung.webp",     actorScale: 0.62, actorY: "30%", blencongY: "32%", blencongBright: 0.40 },
  gallery:   { actor: "MelatiSprig.webp",      actorScale: 0.40, actorCorners: true, blencongY: "30%", blencongBright: 0.35, frame: "BingkaiTumpal.webp" },
  rsvp:      { actor: "CeplokSulur.webp",      actorScale: 0.66, actorY: "24%", blencongY: "28%", blencongBright: 0.40 },
  gift:      { actor: "CeplokMelati.webp",     actorScale: 0.58, actorY: "28%", blencongY: "30%", blencongBright: 0.40 },
  closing:   { actor: "AktorKayon.webp",       actorScale: 1.0,                 blencongY: "88%", blencongBright: 1.0 },
};

export function kelirFor(id: string): KelirPreset | undefined {
  return KELIR[id];
}
```

- [ ] **Step 4: Jalankan tes, pastikan LULUS**

```bash
bun run test:scene
```

Harapan: PASS, tiga tes.

- [ ] **Step 5: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/components/shared/sceneKelir.ts \
        invitation/themes/adat/kenangan/prada-melati/scripts/__tests__/scene-kelir.test.mjs \
        invitation/themes/adat/kenangan/prada-melati/package.json
git commit -m "feat(prada-melati): tabel preset sceneKelir, dijaga unit test"
```

---

### Task 4: `GiltSweep` — kilau

Inti pembeda tema. Aset emas transparan itu sendiri jadi `mask-image` di atas satu div gradien yang bergeser, `mix-blend-mode: overlay` — cahaya hanya menyentuh piksel emasnya (spec §5.1). Nol byte aset tambahan. Fase 1 memakai **mode img** (satu `<img>` aktor); mode tile untuk pinggiran/tumpal menyusul di Fase 2.

**Files:**
- Create: `themes/adat/kenangan/prada-melati/src/components/shared/GiltSweep.tsx`

**Interfaces:**
- Consumes: `MotionValue<number>` progres scroll dari `KelirScene` (Task 5).
- Produces: `GiltSweep({ src, progress, className, style, imgStyle }: GiltSweepProps)` — membungkus satu `<img src>`, menempel overlay gradien ber-mask, digeser `progress`; membeku di `45%` saat reduced-motion.

- [ ] **Step 1: Tulis `GiltSweep.tsx`**

```tsx
"use client";

import {
  motion,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import type { CSSProperties, SyntheticEvent } from "react";

const SWEEP_ANGLE = 105; // deg, tetap (spec §5.1)

export interface GiltSweepProps {
  /** Aset emas transparan (webp alpha). */
  src: string;
  /** Progres scroll section, 0..1 (dari KelirScene). */
  progress: MotionValue<number>;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}

function hide(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function GiltSweep({ src, progress, className, style, imgStyle }: GiltSweepProps) {
  const reduced = useReducedMotion() ?? false;
  // Sapuan menempuh -120% → 220% posisi horizontal gradien saat section
  // menyeberang viewport. Reduced-motion → beku di 45% agar emas tetap berkilat.
  const pos = useTransform(progress, [0, 1], ["-120% 50%", "220% 50%"]);
  const mask = `url(${src}) center / contain no-repeat`;

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        onError={hide}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", ...imgStyle }}
      />
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          background: `linear-gradient(${SWEEP_ANGLE}deg, transparent 38%, var(--gold-light) 50%, transparent 62%)`,
          backgroundSize: "280% 280%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: reduced ? "45% 50%" : pos,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi tipe & lint**

```bash
bun run typecheck && bun run lint
```

Harapan: bersih. (Uji visual kilau dilakukan di Task 6 setelah KelirScene merangkainya.)

- [ ] **Step 3: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/components/shared/GiltSweep.tsx
git commit -m "feat(prada-melati): GiltSweep, kilau emas via mask + overlay"
```

---

### Task 5: `KelirScene` — merangkai kelir

Merakit lapis kelir dalam urutan z-index (spec §4): `KainBadan` (diam) → **blencong** (bernapas) → aktor (**menancap** + kilau) → pinggiran ×2 (diam) → tumpal (diam) → `children`. Ia memegang `scrollYProgress` section satu kali dan menyalurkannya ke tiap `GiltSweep`. Di Fase 1, hanya `KainBadan` (opsional) + blencong + aktor yang punya aset; pinggiran & tumpal dirender tapi 404-nya disembunyikan sampai Fase 2 — skeleton tetap berdiri.

**Files:**
- Create: `themes/adat/kenangan/prada-melati/src/components/shared/KelirScene.tsx`

**Interfaces:**
- Consumes: `useScrollContainer` (Task 1), `GiltSweep` (Task 4), `KelirPreset` (Task 3), `asset`/`hideOnError` (`src/lib/assets.ts`).
- Produces: `KelirScene({ preset, kain?, children }: { preset: KelirPreset; kain?: string; children?: ReactNode })` — mengisi `100%` tinggi/lebar parent `.snap-section`.

- [ ] **Step 1: Tulis `KelirScene.tsx`**

```tsx
"use client";

import { useRef, type ReactNode, type SyntheticEvent } from "react";
import { motion, useScroll, useInView, useReducedMotion } from "framer-motion";

import { asset } from "@/lib/assets";
import { useScrollContainer } from "./scroll-context";
import GiltSweep from "./GiltSweep";
import type { KelirPreset } from "./sceneKelir";

function hide(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function KelirScene({
  preset,
  kain,
  children,
}: {
  preset: KelirPreset;
  /** Nama berkas KainBadan; kosong → latar --bg rata (Fase 1). */
  kain?: string;
  children?: ReactNode;
}) {
  const container = useScrollContainer();
  const reduced = useReducedMotion() ?? false;

  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const actorIn = useInView(actorRef, { once: false, margin: "-10% 0px -10% 0px" });

  // Progres section terhadap kontainer scroll nyata (spec §5.1).
  const { scrollYProgress } = useScroll({
    container: container ?? undefined,
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  const isHero = preset.actorScale === undefined || preset.actorScale >= 1;

  // Menancap (spec §5.2): turun ke sumbu, overshoot miring, redam. Reduced → fade.
  const rest = reduced ? { opacity: 1 } : { opacity: 1, y: "0%", rotate: 0 };
  const start = reduced ? { opacity: 0 } : { opacity: 0, y: "-8%", rotate: 3 };

  return (
    <div ref={sceneRef} className="absolute inset-0 overflow-hidden">
      {/* 1 — KainBadan (diam, tanpa kilau). Kosong → --bg rata. */}
      {kain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(kain)}
          alt=""
          aria-hidden="true"
          onError={hide}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
      ) : (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--bg)", zIndex: 0 }} />
      )}

      {/* 2 — Blencong (bernapas): pendar hangat menembus tenunan. Nol byte. */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background: `radial-gradient(60% 45% at 50% ${preset.blencongY}, rgba(227,199,102,${0.22 * preset.blencongBright}) 0%, rgba(201,162,39,${0.10 * preset.blencongBright}) 35%, transparent 70%)`,
        }}
        animate={reduced ? undefined : { opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
        transition={reduced ? undefined : { duration: 6, ease: "easeInOut", repeat: Infinity }}
      />

      {/* 3 — Aktor (menancap + kilau). gallery pakai sprig 4-sudut; sisanya satu aktor. */}
      {preset.actor && !preset.actorCorners && (
        <motion.div
          ref={actorRef}
          initial={start}
          animate={actorIn ? rest : start}
          transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 120, damping: 14 }}
          style={{
            position: "absolute",
            left: "50%",
            x: "-50%",
            zIndex: 2,
            pointerEvents: "none",
            ...(isHero
              ? { bottom: 0, height: "88%" }
              : { top: preset.actorY, width: `${(preset.actorScale ?? 0.6) * 100}%` }),
          }}
        >
          <GiltSweep src={asset(preset.actor)} progress={scrollYProgress} style={{ width: "100%", height: "100%" }} />
        </motion.div>
      )}

      {/* 4 — Pinggiran kiri & kanan (diam). Sisi kanan diputar 180°, bukan flip
             (spec §6a) — melestarikan arah lereng parang. 404 tersembunyi. */}
      {(["left", "right"] as const).map((side) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={side}
          src={asset("PinggiranTile.webp")}
          alt=""
          aria-hidden="true"
          onError={hide}
          style={{
            position: "absolute",
            top: 0,
            [side]: 0,
            height: "100%",
            zIndex: 4,
            pointerEvents: "none",
            objectFit: "cover",
            transform: side === "right" ? "rotate(180deg)" : undefined,
          }}
        />
      ))}

      {/* 5 — Tumpal (hem bawah, diam). 404 tersembunyi sampai Fase 2. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("TumpalBand.webp")}
        alt=""
        aria-hidden="true"
        onError={hide}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", zIndex: 4, pointerEvents: "none" }}
      />

      {/* 6 — Konten section (safe-zone tengah). */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}
```

> **Catatan Fase 1.** Kilau pada pinggiran & tumpal (mode tile / `repeat-y`) sengaja ditunda ke Fase 2 — spec §5.1 menargetkan ketiganya, tapi bukti Fase 1 (spec §2.2, "emas pipih terbaca sebagai logam") cukup dibuktikan pada aktor. Di Fase 1 pinggiran/tumpal diam & tanpa kilau; keduanya toh belum punya aset dan disembunyikan. **Jangan** menambah `box-shadow`/`drop-shadow` untuk "menghidupkan" mereka.

- [ ] **Step 2: Verifikasi tipe & lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src/components/shared/KelirScene.tsx
git commit -m "feat(prada-melati): KelirScene, merangkai kain/blencong/aktor/pinggiran/tumpal"
```

---

### Task 6: Scene `cover` + pengkabelan page

Scene hero pertama. Ini yang membuktikan janji spec §2.2: **emas pipih terbaca sebagai logam ketika cahayanya bergerak** — bukan stiker yang digeser. Kriteria terima Fase 1 ada di Step 4.

**Aset dev.** Task G menghasilkan tiga gambar. Fase 1 memakai apa adanya di `public/images/`:

| Berkas di `public/images/` | Sumber |
|---|---|
| `AktorGunungan.webp` | hasil Task G (prompt §6d) |
| `RonceanMelatiL.webp` | hasil Task G (prompt §6e) |
| `RonceanMelatiR.webp` | salinan `RonceanMelatiL` yang di-flip horizontal, **hanya untuk dev** |

`KainBadan` belum digenerate di Fase 1 → `KelirScene` dipanggil **tanpa** `kain`, memakai latar `--bg` rata. Kilau tetap terbukti karena aktor berkilau terhadap kain yang diam. Aset `KainBadan`, pinggiran, tumpal, dan `RonceanMelatiR` sungguhan lahir di Fase 2 (di produksi `RonceanMelatiR` **wajib** digenerate terpisah, bukan flip — spec §6a).

**Files:**
- Create: `themes/adat/kenangan/prada-melati/src/components/sections/CoverSection.tsx`
- Modify: `themes/adat/kenangan/prada-melati/src/app/page.tsx`

**Interfaces:**
- Consumes: `KelirScene` (Task 5), `RonceanMelati` (Task 2), `SnapContainer` (Task 1), `kelirFor` (Task 3), `MusicPlayer` (sudah ada).
- Produces: halaman `cover` yang tampil di `bun dev`.

- [ ] **Step 1: Salin aset dev ke `public/images/`**

```bash
cd invitation/themes/adat/kenangan/prada-melati
mkdir -p public/images
cp <scratchpad>/prada-trial/AktorGunungan.webp  public/images/
cp <scratchpad>/prada-trial/RonceanMelatiL.webp public/images/
# RonceanMelatiR: flip horizontal RonceanMelatiL — dev saja.
# mis. dengan ImageMagick: magick public/images/RonceanMelatiL.webp -flop public/images/RonceanMelatiR.webp
```

`public/images/` tidak di-commit sebagai aset produksi (produksi memakai R2); pastikan `.gitignore` tema tidak menahannya bila kamu ingin skeleton reproducible, atau biarkan lokal. Ikuti konvensi warm-narrative untuk `public/images/`.

- [ ] **Step 2: Tulis `CoverSection.tsx`**

```tsx
import KelirScene from "@/components/shared/KelirScene";
import RonceanMelati from "@/components/shared/RonceanMelati";
import { kelirFor } from "@/components/shared/sceneKelir";

export default function CoverSection() {
  const preset = kelirFor("cover")!;

  return (
    <section className="snap-section">
      {/* Fase 1: tanpa `kain` → latar --bg rata; aktor tetap membuktikan kilau. */}
      <KelirScene preset={preset}>
        <RonceanMelati zIndex={3} />
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--text-dim)]">
            Undangan Pernikahan
          </p>
          <h1 className="font-display mt-6 text-5xl text-[var(--text)]">Prada &amp; Melati</h1>
          <p className="font-body mt-4 text-[var(--text-muted)]">Sabtu, 12 September 2026</p>
        </div>
      </KelirScene>
    </section>
  );
}
```

- [ ] **Step 3: Kabelkan `page.tsx` lewat `SnapContainer`**

Ganti isi `src/app/page.tsx` menjadi:

```tsx
// src/app/page.tsx
// Fase 1: hanya cover. RenderSection 11-section menyusul di Fase 2.

import MusicPlayer from "@/components/MusicPlayer";
import SnapContainer from "@/components/shared/SnapContainer";
import CoverSection from "@/components/sections/CoverSection";

export default function Page() {
  return (
    <>
      <MusicPlayer />
      <SnapContainer>
        <CoverSection />
      </SnapContainer>
    </>
  );
}
```

- [ ] **Step 4: Jalankan & nilai dengan mata — kriteria terima Fase 1**

```bash
bun dev
```

Buka `http://localhost:3000`. Harapan:

1. **Kilau:** saat scroll (cover cukup tinggi 100dvh; scroll sedikit lalu balik, atau perbesar viewport), sapuan cahaya `--gold-light` menyapu **hanya piksel emas** gunungan, sisanya tembus. Emas pipih terbaca sebagai logam, bukan stiker.
2. **Menancap:** saat cover masuk viewport, gunungan turun ke sumbu dengan overshoot miring lalu diam.
3. **Bernapas:** blencong (pendar di 38%) naik-turun pelan di belakang aktor.
4. **Roncean:** untaian melati gading bergoyang pelan di depan, `pointer-events: none`.
5. **Teks tengah terbaca**, tidak ada ornamen menabraknya.
6. **Reduced-motion** (DevTools → Rendering → *Emulate prefers-reduced-motion: reduce*): kilau membeku di 45% (emas tetap berkilat), menancap jadi fade, blencong diam terang penuh, roncean diam — **seluruh scene tetap terlihat**.

Kalau kilau tak terbaca sebagai logam dan scene terasa datar: naikkan kontras sapuan (lebarkan pita terang gradien di `GiltSweep`, mis. `48%/50%/52%`), atau tambah serat kain di `KainBadan` (Fase 2). **Jangan** menambah `box-shadow`/`drop-shadow` — spec §2.2 melarangnya.

- [ ] **Step 5: Verifikasi tipe & lint**

```bash
bun run typecheck && bun run lint
```

- [ ] **Step 6: Commit**

```bash
git add invitation/themes/adat/kenangan/prada-melati/src
git commit -m "feat(prada-melati): scene cover model Kelir, kilau terbukti"
```

---

## Bukan Cakupan Fase 1

Fase 2, plan tersendiri, setelah kriteria terima Task 6 terpenuhi:

- generate lima belas aset penuh (spec §6a: 3 kain + 7 aktor + 3 melati + 2 bingkai) dan unggah ke R2;
- kilau **mode tile** untuk `PinggiranTile` (`repeat-y`) & `TumpalBand` — perluasan `GiltSweep`;
- sepuluh section sisanya + `RenderSection.tsx` (pola warm-narrative), mengonsumsi `KELIR` §6f;
- `RonceanMelatiR` digenerate terpisah (bukan flip);
- `DESIGN_SPEC.md` tema & baris baru di `adat/kenangan/README.md`;
- pendaftaran tema di lima tempat (spec §11): `sync-shared.ts`, `router/src/index.ts`, `router/wrangler.jsonc`, `reservedSlugs` di `invitation.go`, `TemplateSelector.tsx`;
- deploy Worker `rimba-prada-melati` + custom domain `prada-melati.rimba.io`.

Pendaftaran sengaja paling akhir: router memakai service binding; menambah binding ke Worker yang belum di-deploy akan menggagalkan `wrangler deploy` router.
