# Prada Melati — Layout Desktop 2-Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Di layar ≥1024px, undangan tampil sebagai layout 2-panel — panel cover kelir dekoratif di kiri, kolom undangan selebar HP di kanan — seperti warm-narrative/soft-bloom. Di bawah 1024px tak ada perubahan.

**Architecture:** `page.tsx` membungkus `DesktopCover` + `SnapContainer` dalam `.app-shell`. `DesktopCover` me-reuse `KelirScene` (preset cover) + `RonceanMelati` + `SceneContent` + `GuestName` (dalam Suspense). Split kiri/kanan murni CSS `@media (min-width: 1024px)`. Test source-conformance `node --test`.

**Tech Stack:** Next.js 16 (React 19), framer-motion, Tailwind v4, `node:test`.

## Global Constraints

- **Bahasa komentar & pesan commit:** Indonesia. **JANGAN** tambahkan atribusi Claude / Co-Authored-By AI.
- **Breakpoint 1024px.** Di bawahnya `.desktop-cover { display: none }`; mobile tak berubah.
- **Nol aset baru** — `DesktopCover` memakai aset cover yang sudah ada (KainBadan, PinggiranTile, TumpalBand, AktorGunungan, RonceanMelati).
- **`GuestName`** (`@/components/GuestName`) memakai `useSearchParams()` → **wajib** dibungkus `<Suspense>`, kalau tidak `npm run build` gagal (CSR bailout).
- **Panel `<aside>` memakai `aria-hidden="true"`** — panel dekoratif; undangan asli ada di kolom kanan.
- **Commit hanya berkas yang disebut** (`git add <paths>`), jangan `git add -A`.

---

## File Structure

| Berkas | Tanggung jawab |
|---|---|
| `src/components/shared/DesktopCover.tsx` | **baru** — panel cover kelir + blok GuestName |
| `src/app/page.tsx` | bungkus `.app-shell`, pasang `DesktopCover` |
| `src/app/globals.css` | `.app-shell` / `.desktop-cover` + split `@media (min-width: 1024px)` |
| `scripts/__tests__/desktop.test.mjs` | **baru** — konformansi struktur & CSS |
| `package.json` | skrip `test:desktop` |

---

## Task 1: `DesktopCover` + shell + CSS

**Files:**
- Create: `src/components/shared/DesktopCover.tsx`
- Create: `scripts/__tests__/desktop.test.mjs`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json`

**Interfaces:**
- Produces: `DesktopCover` — default export, props `{ couple: InvitationConfig["couple"]; weddingDate: string }`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `scripts/__tests__/desktop.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const page = read("../../src/app/page.tsx");
const desktop = read("../../src/components/shared/DesktopCover.tsx");
const globals = read("../../src/app/globals.css");

test("page.tsx membungkus DesktopCover dalam .app-shell (spec §4)", () => {
  assert.match(page, /import DesktopCover from "@\/components\/shared\/DesktopCover"/);
  assert.match(page, /className="app-shell"/, ".app-shell wrapper harus ada");
  assert.match(page, /<DesktopCover\b/, "DesktopCover harus dirender");
});

test("DesktopCover reuse KelirScene cover + GuestName dalam Suspense (spec §2)", () => {
  assert.match(desktop, /kelirFor\("cover"\)/, "harus pakai preset cover");
  assert.match(desktop, /<KelirScene\b/, "harus reuse KelirScene");
  assert.match(desktop, /<Suspense[\s\S]*<GuestName\s*\/>[\s\S]*<\/Suspense>/, "GuestName wajib dalam Suspense");
  assert.match(desktop, /aria-hidden="true"/, "aside dekoratif harus aria-hidden");
});

test("DesktopCover meneruskan wheel ke .snap-container (spec §2)", () => {
  assert.match(desktop, /\.snap-container/);
  assert.match(desktop, /scrollBy/);
});

test("globals: desktop-cover default none + split @media 1024px (spec §3)", () => {
  assert.match(globals, /\.desktop-cover\s*\{\s*display:\s*none/, "default harus display:none");
  assert.match(globals, /@media \(min-width:\s*1024px\)/, "harus ada breakpoint 1024px");
  assert.match(globals, /\.app-shell\s*\{[^}]*display:\s*flex/, ".app-shell harus flex di desktop");
  assert.match(globals, /\.snap-container\s*\{[^}]*flex:\s*0 0 clamp\(/, "kolom kanan harus flex-basis clamp");
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `cd invitation/themes/adat/kenangan/prada-melati && node --test scripts/__tests__/desktop.test.mjs`
Expected: FAIL — `ENOENT` `DesktopCover.tsx` belum ada.

- [ ] **Step 3: Buat `DesktopCover.tsx`**

Buat `src/components/shared/DesktopCover.tsx`:

```tsx
"use client";

// Panel cover dekoratif untuk layar lebar (PC/laptop) — sisi kiri layout split.
// Tampil di >= 1024px (dikontrol CSS .desktop-cover). Gemakan CoverSection dalam
// bahasa kelir prada, plus blok "Kepada Yth. [GuestName]". Aset sama dengan
// CoverSection → nol request jaringan tambahan di desktop.

import { Suspense } from "react";
import type { WheelEvent } from "react";

import KelirScene from "./KelirScene";
import RonceanMelati from "./RonceanMelati";
import SceneContent from "./SceneContent";
import { kelirFor } from "./sceneKelir";
import GuestName from "@/components/GuestName";
import type { InvitationConfig } from "@/lib/config-types";

export default function DesktopCover({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const preset = kelirFor("cover")!;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Scroll terjadi di .snap-container (bukan window); teruskan roda mouse dari
  // panel kiri agar kolom kanan tetap tergulir (pola warm-narrative).
  const forwardWheel = (e: WheelEvent) => {
    document.querySelector<HTMLElement>(".snap-container")?.scrollBy({ top: e.deltaY });
  };

  return (
    <aside className="desktop-cover" aria-hidden="true" onWheel={forwardWheel}>
      <KelirScene preset={preset} kain="KainBadan">
        <RonceanMelati zIndex={3} />
        <SceneContent align="center" maxWidth={460}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--text-dim)]">
            Undangan Pernikahan
          </p>
          <h1
            className="font-display mt-5 text-[var(--text)]"
            style={{ fontSize: "clamp(40px, 4vw, 68px)", lineHeight: 1.08, textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </h1>
          <div className="gold-divider mx-auto my-5" />
          <p className="font-body text-[var(--text-muted)]">{dateStr}</p>

          <div className="mt-9 flex flex-col items-center gap-1.5">
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-[var(--text-dim)]">
              Kepada Yth.
            </p>
            <p className="font-display text-[var(--gold)]" style={{ fontSize: "clamp(20px, 1.9vw, 30px)" }}>
              <Suspense fallback={null}>
                <GuestName />
              </Suspense>
            </p>
          </div>
        </SceneContent>
      </KelirScene>
    </aside>
  );
}
```

- [ ] **Step 4: Bungkus `page.tsx` dengan `.app-shell`**

Ganti seluruh isi `src/app/page.tsx` dengan:

```tsx
// src/app/page.tsx
// Server-first: baca config, render section yang enabled lewat RenderSection.
// Desktop: panel cover kelir kiri + kolom undangan kanan (.app-shell).

import MusicPlayer from "@/components/MusicPlayer";
import GoldDust from "@/components/shared/GoldDust";
import DesktopCover from "@/components/shared/DesktopCover";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
import type { InvitationConfig } from "@/lib/config-types";
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <>
      <MusicPlayer />
      <GoldDust />
      <div className="app-shell">
        <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />
        <SnapContainer>
          {sectionIds.map((id) => renderSection(id, config))}
        </SnapContainer>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Tambah CSS di `globals.css`**

Sisipkan tepat SETELAH baris `.snap-container::-webkit-scrollbar-thumb { … }` (blok "Snap Scroll Container"), sebelum aturan `.snap-section`:

```css
/* ─── Layout shell (desktop 2-panel) ─────────────────────────────────────── */
.app-shell { width: 100%; }
.desktop-cover { display: none; }

@media (min-width: 1024px) {
  .app-shell {
    display: flex;
    justify-content: flex-start;
  }
  .desktop-cover {
    display: block;
    position: relative;
    flex: 1 1 auto;
    height: 100dvh;
    overflow: hidden;
    border-right: 1px solid var(--border);
  }
  .snap-container {
    flex: 0 0 clamp(360px, 46vw, 420px);
    max-width: 420px;
    box-shadow: -24px 0 48px rgba(0, 0, 0, 0.35);
  }
}
```

- [ ] **Step 6: Tambah skrip test di `package.json`**

Di blok `"scripts"`, setelah `"test:motion"`, tambahkan:

```json
    "test:desktop": "node --test scripts/__tests__/desktop.test.mjs",
```

- [ ] **Step 7: Jalankan test, pastikan LULUS**

Run: `node --test scripts/__tests__/desktop.test.mjs`
Expected: PASS — 4 test hijau.

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 9: Lint**

Run: `npm run lint`
Expected: exit 0, tanpa error/warning baru.

- [ ] **Step 10: Build produksi (verifikasi Suspense/useSearchParams)**

Run: `npm run build`
Expected: build sukses. **Jika gagal dengan pesan `useSearchParams() should be wrapped in a suspense boundary`**, berarti Suspense kurang membungkus GuestName — periksa Step 3. Peringatan pre-existing "Custom Cache-Control headers" tak terkait, abaikan.

- [ ] **Step 11: Seluruh test tema tak regresi**

Run: `node --test scripts/__tests__/contrast-contract.test.mjs scripts/__tests__/scene-kelir.test.mjs scripts/__tests__/motion.test.mjs scripts/__tests__/desktop.test.mjs`
Expected: PASS semua.

- [ ] **Step 12: Commit**

```bash
git add src/components/shared/DesktopCover.tsx scripts/__tests__/desktop.test.mjs src/app/page.tsx src/app/globals.css package.json
git commit -m "feat(prada-melati): layout desktop 2-panel (panel cover kelir + kolom undangan)"
```

---

## Catatan verifikasi visual (di luar test statik)

Setelah Task 1, verifikasi manual dengan `.claude/skills/theme-screenshot` pada viewport lebar (`PW_WIDTH=1440 PW_HEIGHT=900`, selector `.app-shell`):
- panel kiri (kelir cover + gunungan + nama + tanggal + "Kepada Yth. Tamu Undangan") proporsional; gunungan & teks tidak melar/tercecer di panel lebar — tune `SceneContent maxWidth`/`clamp` font bila perlu;
- kolom kanan terbaca sebagai frame HP mengambang (shadow) selebar ~360–420px;
- coba `?to=Nama%20Tamu` di URL — panel menampilkan nama itu;
- shoot ulang di 390×844 → tampilan mobile identik dengan sebelumnya (panel hilang).
