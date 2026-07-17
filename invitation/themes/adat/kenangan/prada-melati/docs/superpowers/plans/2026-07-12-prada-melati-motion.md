# Prada Melati — Gerak "Prada Hidup" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambah tiga gerak ambient berbasis cahaya ke tema `prada-melati` — debu emas naik, blencong berkedip, dan kilau idle — agar setara "hidup" dengan `warm-narrative`/`soft-bloom` tanpa meminjam parallax/kelopak jatuh.

**Architecture:** Satu komponen client baru (`GoldDust`) dipasang global sekali di `page.tsx`, plus dua penyuntingan in-place pada komponen shared yang sudah ada (`KelirScene` blencong, `GiltSweep` kilau). Semua gerak murni `transform`/`opacity` (ramah compositor); keyframe global di `globals.css`, keyframe per-serpih diinjeksi lewat `<style dangerouslySetInnerHTML>` seperti `FallingFlowers` di `warm-narrative`. Test mengikuti pola repo: `node --test` dengan assertion regex terhadap teks sumber (konformansi spec), bukan render runtime.

**Tech Stack:** Next.js 16 (React 19), framer-motion 12, Tailwind v4, `node:test`.

## Global Constraints

- **Bahasa komentar & pesan commit:** Indonesia (ikuti gaya repo).
- **Pesan commit:** JANGAN tambahkan atribusi Claude / Co-Authored-By AI.
- **Tesis gerak (spec induk §5):** cahaya, bukan lintasan. DILARANG menambah parallax atau kelopak jatuh.
- **`scaleX(-1)`/rotasi:** boleh untuk `SerpihEmas` (serpih tak berarah); tetap DILARANG untuk parang/sulur.
- **Reduced-motion:** `prefers-reduced-motion: reduce` → debu `display:none`, idle shimmer mati, blencong beku terang penuh.
- **Warna emas:** `--gold #C9A227`, `--gold-light #E3C766`.
- **`asset(name)`** menerima basename tanpa ekstensi: `asset("SerpihEmas")`. TIDAK ada registry di `assets.ts` — jangan sunting `assets.ts` (spec §4 keliru pada baris ini).
- **Aset `SerpihEmas.webp`** digenerate & diunggah terpisah (bukan cakupan plan); `hideOnError`/`onError` menyembunyikan bila 404, jadi kode aman tanpa aset.

---

## File Structure

| Berkas | Tanggung jawab |
|---|---|
| `src/components/shared/GoldDust.tsx` | **baru** — lapis global serpih emas naik; generator mote deterministik + injeksi keyframe |
| `src/app/page.tsx` | **ubah** — pasang `<GoldDust />` sejajar `<MusicPlayer />` |
| `src/components/shared/KelirScene.tsx` | **ubah** — blencong napas → flicker |
| `src/components/shared/GiltSweep.tsx` | **ubah** — tambah idle shimmer + guard reduced-motion |
| `src/app/globals.css` | **ubah** — `.gold-dust`/`.gold-dust-mote`, `@keyframes giltIdle`, `.gilt-idle`, blok reduced-motion |
| `scripts/__tests__/motion.test.mjs` | **baru** — konformansi ketiga gerak |
| `package.json` | **ubah** — skrip `test:motion` |

---

## Task 1: `GoldDust` — debu emas global

**Files:**
- Create: `src/components/shared/GoldDust.tsx`
- Create: `scripts/__tests__/motion.test.mjs`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css` (tambah blok `.gold-dust` + reduced-motion)
- Modify: `package.json` (skrip `test:motion`)

**Interfaces:**
- Produces: `GoldDust` — default export, komponen React tanpa prop wajib (`{ zIndex?: number }`, default 40). Dipasang sekali, global.

- [ ] **Step 1: Tulis test yang gagal**

Buat `scripts/__tests__/motion.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

const goldDust = read("../../src/components/shared/GoldDust.tsx");
const page = read("../../src/app/page.tsx");
const globals = read("../../src/app/globals.css");

// ─── Task 1: GoldDust ──────────────────────────────────────────────────────
test("GoldDust: 14 serpih, generator deterministik sr() (spec gerak §2.1)", () => {
  assert.match(goldDust, /const COUNT = 14\b/, "COUNT harus 14");
  assert.match(goldDust, /function sr\(/, "harus punya seed deterministik sr()");
});

test("GoldDust: pakai aset SerpihEmas via asset(), fallback 404 aman", () => {
  assert.match(goldDust, /asset\("SerpihEmas"\)/, "harus merujuk aset SerpihEmas");
  assert.match(goldDust, /onError=\{hideOnError\}/, "harus sembunyikan bila 404");
});

test("GoldDust: dekoratif, keyframe per-serpih diinjeksi", () => {
  assert.match(goldDust, /aria-hidden/, "harus aria-hidden");
  assert.match(goldDust, /dangerouslySetInnerHTML/, "keyframe per-serpih via <style>");
});

test("page.tsx memasang GoldDust global (spec gerak §2.1)", () => {
  assert.match(page, /import GoldDust from "@\/components\/shared\/GoldDust"/);
  assert.match(page, /<GoldDust\s*\/>/);
});

test("globals: .gold-dust fixed + reduced-motion sembunyikan (spec gerak §2.1)", () => {
  assert.match(globals, /\.gold-dust\s*\{[^}]*position:\s*fixed/, ".gold-dust harus position:fixed");
  assert.match(
    globals,
    /prefers-reduced-motion:\s*reduce[\s\S]*\.gold-dust\s*\{\s*display:\s*none/,
    "reduced-motion harus display:none untuk .gold-dust",
  );
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `cd invitation/themes/adat/kenangan/prada-melati && node --test scripts/__tests__/motion.test.mjs`
Expected: FAIL — `ENOENT` `GoldDust.tsx` tidak ada.

- [ ] **Step 3: Buat komponen `GoldDust.tsx`**

Buat `src/components/shared/GoldDust.tsx`:

```tsx
"use client";

// Debu emas: serpih daun emas melayang NAIK seperti bara/asap pelita, satu lapis
// global. Padanan "kelopak jatuh" milik prada — tapi cahaya, bukan bunga; naik,
// bukan gugur (spec gerak §2.1). Nol pause: lapis global selalu di viewport.

import { asset, hideOnError } from "@/lib/assets";

const COUNT = 14;

// Seed deterministik (pola FallingFlowers warm-narrative) — SSR & klien sama.
function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function GoldDust({ zIndex = 40 }: { zIndex?: number }) {
  const motes = Array.from({ length: COUNT }, (_, i) => {
    const size = Math.round(12 + sr(i * 13 + 2) * 14); // 12–26px
    const left = (sr(i * 7 + 1) * 96 + 2).toFixed(2); // 2–98%
    const dur = (14 + sr(i * 17 + 3) * 8).toFixed(1); // 14–22s
    const delay = (-sr(i * 19 + 4) * Number(dur)).toFixed(1); // negatif → langsung ramai
    const sway = Math.round((sr(i * 23 + 6) - 0.5) * 28); // -14..14px
    const rot = Math.round(sr(i * 11 + 5) * 360); // 0–360° awal
    const flip = sr(i * 29 + 8) > 0.5 ? -1 : 1; // scaleX — serpih tak berarah
    const peak = (0.28 + sr(i * 31 + 9) * 0.22).toFixed(2); // 0.28–0.50 opacity
    const name = `gd_${i}`;
    const keyframes =
      `@keyframes ${name}{` +
      `0%{transform:translate3d(0,-6vh,0) rotate(${rot}deg) scaleX(${flip});opacity:0}` +
      `12%{opacity:${peak}}` +
      `70%{opacity:${peak}}` +
      `100%{transform:translate3d(${sway}px,-108vh,0) rotate(${rot + 40}deg) scaleX(${flip});opacity:0}}`;
    return { i, size, left, dur, delay, name, keyframes };
  });

  const css = motes.map((m) => m.keyframes).join("");

  return (
    <div className="gold-dust" aria-hidden="true" style={{ zIndex }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {motes.map((m) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={m.i}
          src={asset("SerpihEmas")}
          alt=""
          onError={hideOnError}
          className="gold-dust-mote"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            animationName: m.name,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Pasang di `page.tsx`**

Di `src/app/page.tsx`, tambah import setelah baris `import MusicPlayer` dan render `<GoldDust />` tepat setelah `<MusicPlayer />`:

```tsx
import MusicPlayer from "@/components/MusicPlayer";
import GoldDust from "@/components/shared/GoldDust";
import SnapContainer from "@/components/shared/SnapContainer";
```

```tsx
  return (
    <>
      <MusicPlayer />
      <GoldDust />
      <SnapContainer>
        {sectionIds.map((id) => renderSection(id, config))}
      </SnapContainer>
    </>
  );
```

- [ ] **Step 5: Tambah CSS di `globals.css`**

Sisipkan tepat SEBELUM blok `@media (prefers-reduced-motion: reduce)` yang ada (yang berisi `.ronce { animation: none; }`):

```css
/* ─── Debu emas (naik seperti bara pelita) ───────────────────────────────── */
.gold-dust {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.gold-dust-mote {
  position: absolute;
  top: 100%;
  opacity: 0;
  will-change: transform, opacity;
}
```

Lalu ubah blok reduced-motion yang ada agar juga menyembunyikan debu:

```css
@media (prefers-reduced-motion: reduce) {
  .ronce { animation: none; }
  .gold-dust { display: none; }
}
```

- [ ] **Step 6: Tambah skrip test di `package.json`**

Di blok `"scripts"`, setelah `"test:scene"`, tambahkan:

```json
    "test:motion": "node --test scripts/__tests__/motion.test.mjs",
```

- [ ] **Step 7: Jalankan test, pastikan LULUS**

Run: `node --test scripts/__tests__/motion.test.mjs`
Expected: PASS — 5 test Task 1 hijau.

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck`
Expected: exit 0, tanpa error.

- [ ] **Step 9: Commit**

```bash
git add src/components/shared/GoldDust.tsx src/app/page.tsx src/app/globals.css scripts/__tests__/motion.test.mjs package.json
git commit -m "feat(prada-melati): debu emas melayang (GoldDust) — lapis ambient global"
```

---

## Task 2: Blencong `flicker`

**Files:**
- Modify: `src/components/shared/KelirScene.tsx:62-73` (blok blencong)
- Modify: `scripts/__tests__/motion.test.mjs` (tambah blok test Task 2)

**Interfaces:**
- Consumes: `useReducedMotion` (sudah diimpor di `KelirScene`), variabel `reduced`.
- Produces: tak ada API baru — hanya mengubah nilai `animate`/`transition` motion.div blencong.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan di akhir `scripts/__tests__/motion.test.mjs`:

```js
// ─── Task 2: Blencong flicker ──────────────────────────────────────────────
const kelir = read("../../src/components/shared/KelirScene.tsx");

test("blencong: napas sinus lama diganti (spec gerak §2.2)", () => {
  assert.doesNotMatch(
    kelir,
    /\[0\.85,\s*1,\s*0\.85\]/,
    "opacity napas simetris lama harus hilang",
  );
});

test("blencong: kedip tak beraturan 6 langkah + times + durasi 5s", () => {
  assert.match(kelir, /opacity:\s*\[0\.9,\s*1,\s*0\.86,\s*0\.97,\s*0\.88,\s*1\]/, "opacity flicker 6 langkah");
  assert.match(kelir, /times:\s*\[/, "harus pakai times tak rata");
  assert.match(kelir, /duration:\s*5\b/, "durasi flicker 5s");
});

test("blencong: reduced-motion tetap beku (animate undefined)", () => {
  assert.match(kelir, /animate=\{reduced \? undefined :/, "reduced → animate undefined");
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `node --test scripts/__tests__/motion.test.mjs`
Expected: FAIL — test Task 2 merah (opacity flicker belum ada; napas lama masih ada).

- [ ] **Step 3: Ganti blok blencong di `KelirScene.tsx`**

Ganti `animate`/`transition` pada motion.div blencong (saat ini baris 71-72):

```tsx
        animate={reduced ? undefined : { opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
        transition={reduced ? undefined : { duration: 6, ease: "easeInOut", repeat: Infinity }}
```

menjadi:

```tsx
        // Kedip pelita minyak: keyframe tak simetris, bukan napas sinus (spec gerak §2.2).
        animate={reduced ? undefined : { opacity: [0.9, 1, 0.86, 0.97, 0.88, 1], scale: [1, 1.03, 1.01, 1.04, 1, 1.02] }}
        transition={
          reduced
            ? undefined
            : { duration: 5, ease: "easeInOut", repeat: Infinity, times: [0, 0.15, 0.4, 0.6, 0.82, 1] }
        }
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `node --test scripts/__tests__/motion.test.mjs`
Expected: PASS — semua test Task 1 + Task 2 hijau.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/KelirScene.tsx scripts/__tests__/motion.test.mjs
git commit -m "feat(prada-melati): blencong berkedip seperti pelita minyak"
```

---

## Task 3: `GiltSweep` idle shimmer

**Files:**
- Modify: `src/components/shared/GiltSweep.tsx:45-66` (motion.div sapuan)
- Modify: `src/app/globals.css` (tambah `@keyframes giltIdle`, `.gilt-idle`, dan matikan di reduced-motion)
- Modify: `scripts/__tests__/motion.test.mjs` (tambah blok test Task 3)

**Interfaces:**
- Consumes: variabel `reduced` (sudah ada di `GiltSweep`).
- Produces: tak ada API baru — sapuan scroll tetap; ditambah kelas CSS `gilt-idle` saat tidak reduced.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan di akhir `scripts/__tests__/motion.test.mjs`:

```js
// ─── Task 3: Kilau idle shimmer ────────────────────────────────────────────
const gilt = read("../../src/components/shared/GiltSweep.tsx");

test("kilau: idle shimmer menempel saat tidak reduced (spec gerak §2.3)", () => {
  assert.match(gilt, /reduced \? undefined : "gilt-idle"/, "kelas gilt-idle hanya saat tidak reduced");
});

test("globals: @keyframes giltIdle + matikan saat reduced-motion", () => {
  // `globals` (dibaca di puncak berkas) sudah mencerminkan globals.css final saat
  // seluruh test dijalankan di Task 3 — semua penyuntingan CSS sudah selesai.
  assert.match(globals, /@keyframes giltIdle/, "harus ada keyframes giltIdle");
  assert.match(globals, /\.gilt-idle\s*\{[^}]*animation:\s*giltIdle/, ".gilt-idle memakai animasi giltIdle");
  assert.match(
    globals,
    /prefers-reduced-motion:\s*reduce[\s\S]*\.gilt-idle\s*\{\s*animation:\s*none/,
    "reduced-motion harus mematikan .gilt-idle",
  );
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `node --test scripts/__tests__/motion.test.mjs`
Expected: FAIL — test Task 3 merah.

- [ ] **Step 3: Tambah kelas `gilt-idle` di `GiltSweep.tsx`**

Pada motion.div sapuan (mulai baris 45 `<motion.div aria-hidden="true"`), tambahkan `className`:

```tsx
      <motion.div
        aria-hidden="true"
        className={reduced ? undefined : "gilt-idle"}
        style={{
```

(Sisa `style` motion.div tidak berubah — `backgroundPosition` scroll tetap gerak utama.)

- [ ] **Step 4: Tambah keyframe di `globals.css`**

Sisipkan tepat SEBELUM blok `@media (prefers-reduced-motion: reduce)` (setelah blok `.gold-dust-mote` dari Task 1):

```css
/* ─── Kilau idle (logam berdenyut saat diam) ─────────────────────────────── */
@keyframes giltIdle {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
.gilt-idle { animation: giltIdle 4.5s ease-in-out infinite; }
```

Lalu tambahkan baris ke blok reduced-motion sehingga menjadi:

```css
@media (prefers-reduced-motion: reduce) {
  .ronce { animation: none; }
  .gold-dust { display: none; }
  .gilt-idle { animation: none; }
}
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `node --test scripts/__tests__/motion.test.mjs`
Expected: PASS — semua test Task 1–3 hijau.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/GiltSweep.tsx src/app/globals.css scripts/__tests__/motion.test.mjs
git commit -m "feat(prada-melati): kilau idle — logam berdenyut saat diam"
```

---

## Task 4: Rujukan silang & verifikasi penuh

**Files:**
- Modify: `docs/superpowers/specs/2026-07-10-prada-melati-design.md` (§5, rujukan silang)

- [ ] **Step 1: Tambah rujukan silang di spec induk**

Di `docs/superpowers/specs/2026-07-10-prada-melati-design.md`, di akhir bagian `## 5. Gerak — empat slot, tak satu pun sejenis` (sebelum `### 5.1 Kilau`), tambahkan satu baris:

```markdown
> **Perluasan 2026-07-12:** tiga gerak ambient tambahan (debu emas naik, blencong
> flicker, kilau idle) didefinisikan di `2026-07-12-prada-melati-motion-design.md`.
> Semua tetap "cahaya, bukan lintasan" — tak ada parallax/kelopak jatuh.
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: exit 0, tanpa error/warning baru pada berkas yang disentuh.

- [ ] **Step 3: Jalankan seluruh test tema**

Run: `node --test scripts/__tests__/contrast-contract.test.mjs scripts/__tests__/scene-kelir.test.mjs scripts/__tests__/motion.test.mjs`
Expected: PASS — tak ada regresi.

- [ ] **Step 4: Build produksi**

Run: `npm run build`
Expected: build sukses (Next 16 webpack), tanpa error.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-07-10-prada-melati-design.md
git commit -m "docs(prada-melati): rujuk spec gerak dari spec induk §5"
```

---

## Catatan verifikasi visual (di luar test statik)

Test hanya menegakkan konformansi sumber; gerak visual perlu dilihat langsung.
Setelah Task 4, verifikasi manual (mis. `.claude/skills/theme-screenshot` atau
`npm run dev`):
- Debu emas: serpih halus naik dari bawah, meredup di atas, tidak terlihat seperti konfeti (variasi rotasi/skala/opacity bekerja).
- Blencong: kedipnya tak beraturan tapi anggun, bukan strobo.
- Kilau: saat diam, sheen emas berdenyut pelan; saat scroll, sapuan tetap dominan.
- Reduced-motion (DevTools → Rendering → prefers-reduced-motion: reduce): debu hilang, kilau & blencong beku.
- Aset `SerpihEmas.webp` belum ada → debu tak tampak tapi tak ada ikon broken (fallback `hideOnError`).
