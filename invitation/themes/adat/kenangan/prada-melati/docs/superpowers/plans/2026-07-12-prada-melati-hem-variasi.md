# Prada Melati — Hem Bervariasi per Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hem bawah tiap section berganti motif sesuai motif aktornya (hero→tumpal, sulur→HemSulur, melati→HemMelati, kawung→HemKawung), alih-alih `TumpalBand` identik di semua section.

**Architecture:** Field opsional `hem?: string` di `KelirPreset`; `KelirScene` merender `asset(preset.hem ?? "TumpalBand")` di hem. Data murni di `sceneKelir.ts`, satu baris berubah di `KelirScene.tsx`. Test mengikuti pola repo: `node --test` dengan assertion regex terhadap teks sumber (lihat `scene-kelir.test.mjs`).

**Tech Stack:** Next.js 16 (React 19), TypeScript, `node:test`.

## Global Constraints

- **Bahasa komentar & pesan commit:** Indonesia. **JANGAN** tambahkan atribusi Claude / Co-Authored-By AI.
- **`asset(name)`** menerima basename tanpa ekstensi; dev memakai `public/images/<name>.png`. Aset `HemSulur.png`, `HemMelati.png`, `HemKawung.png` **sudah ada** di `public/images/`.
- **Hem tetap statis** — tesis "kain" spec induk §4; tidak ada gerak baru.
- **Pemetaan (spec hem §2):** cover→TumpalBand, greeting→HemSulur, couple→HemMelati, lovestory→HemKawung, akad→TumpalBand, resepsi→TumpalBand, dresscode→HemKawung, gallery→HemMelati, rsvp→HemSulur, gift→HemMelati, closing→TumpalBand. Hero (cover/akad/resepsi/closing) mengosongkan `hem` → default `TumpalBand`.
- **Commit hanya berkas yang disebut tiap task** (`git add <paths>`), jangan `git add -A`.

---

## File Structure

| Berkas | Tanggung jawab |
|---|---|
| `src/components/shared/sceneKelir.ts` | tambah `hem?` ke `KelirPreset`; set `hem` pada 7 preset konten |
| `src/components/shared/KelirScene.tsx` | hem src dari `preset.hem ?? "TumpalBand"` |
| `scripts/__tests__/scene-kelir.test.mjs` | assert field `hem`, pemetaan 7 section, hero tanpa hem, KelirScene memakai `preset.hem` |
| `docs/superpowers/specs/2026-07-10-prada-melati-design.md` | rujukan silang di §6c |

---

## Task 1: Field `hem` + pemetaan + render

**Files:**
- Modify: `src/components/shared/sceneKelir.ts`
- Modify: `src/components/shared/KelirScene.tsx`
- Modify: `scripts/__tests__/scene-kelir.test.mjs`

**Interfaces:**
- Produces: `KelirPreset.hem?: string` — konsumen (`KelirScene`) membaca `preset.hem ?? "TumpalBand"`.

- [ ] **Step 1: Tulis test yang gagal**

Tambahkan di akhir `scripts/__tests__/scene-kelir.test.mjs`:

```js
// ─── Hem bervariasi per section (spec hem-variasi) ──────────────────────────
// `readFileSync` & `src` sudah didefinisikan di puncak berkas ini.
const kelirScene = readFileSync(new URL("../../src/components/shared/KelirScene.tsx", import.meta.url), "utf8");

test("KelirPreset punya field hem opsional (spec hem §3)", () => {
  assert.match(src, /hem\?:\s*string/, "interface harus punya hem?: string");
});

const HEM = {
  greeting: "HemSulur",
  couple: "HemMelati",
  lovestory: "HemKawung",
  dresscode: "HemKawung",
  gallery: "HemMelati",
  rsvp: "HemSulur",
  gift: "HemMelati",
};

for (const [id, hem] of Object.entries(HEM)) {
  test(`${id} memakai hem ${hem} (spec hem §2)`, () => {
    assert.match(
      src,
      new RegExp(`${id}:[^\\n]*hem:\\s*"${hem}"`),
      `preset ${id} harus menyetel hem: "${hem}"`,
    );
  });
}

test("section hero tak menyetel hem → default TumpalBand", () => {
  for (const id of ["cover", "akad", "resepsi", "closing"]) {
    const line = src.split("\n").find((l) => l.trimStart().startsWith(`${id}:`));
    assert.ok(line, `baris preset ${id} harus ada`);
    assert.doesNotMatch(line, /hem:/, `${id} tak boleh menyetel hem`);
  }
});

test("KelirScene merender hem dari preset (spec hem §3)", () => {
  assert.match(
    kelirScene,
    /asset\(preset\.hem \?\? "TumpalBand"\)/,
    "KelirScene harus memakai preset.hem ?? \"TumpalBand\"",
  );
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `cd invitation/themes/adat/kenangan/prada-melati && node --test scripts/__tests__/scene-kelir.test.mjs`
Expected: FAIL — `hem?: string` belum ada, preset belum menyetel hem, KelirScene masih hardcode `asset("TumpalBand")`.

- [ ] **Step 3: Tambah field `hem` ke interface**

Di `src/components/shared/sceneKelir.ts`, di dalam `interface KelirPreset`, setelah field `frame`:

```ts
  /** Basename bingkai foto opsional, mis. "BingkaiGebyok". */
  frame?: string;
  /** Basename hem band di tepi bawah, mis. "HemSulur". Kosong → "TumpalBand". */
  hem?: string;
```

- [ ] **Step 4: Set `hem` pada 7 preset konten**

Ganti seluruh objek `KELIR` di `sceneKelir.ts` dengan (hero tetap tanpa `hem`):

```ts
export const KELIR: Record<string, KelirPreset> = {
  cover:     { actor: "AktorGunungan",    actorScale: 1.0,                 blencongY: "38%", blencongBright: 0.9 },
  greeting:  { actor: "CeplokSulur",      actorScale: 0.55, actorY: "26%", blencongY: "30%", blencongBright: 0.35, hem: "HemSulur" },
  couple:    { actor: "CeplokMelati",     actorScale: 0.42, actorY: "4%",  blencongY: "28%", blencongBright: 0.50, frame: "BingkaiGebyok", hem: "HemMelati" },
  lovestory: { actor: "CeplokKawung",     actorScale: 0.50, actorY: "18%", blencongY: "24%", blencongBright: 0.40, frame: "BingkaiTumpal", hem: "HemKawung" },
  akad:      { actor: "AktorCandiBentar", actorScale: 1.0,                 blencongY: "44%", blencongBright: 0.75 },
  resepsi:   { actor: "AktorPaduraksa",   actorScale: 1.0,                 blencongY: "42%", blencongBright: 0.75 },
  dresscode: { actor: "CeplokKawung",     actorScale: 0.62, actorY: "30%", blencongY: "32%", blencongBright: 0.40, hem: "HemKawung" },
  gallery:   { actor: "MelatiSprig",      actorScale: 0.40, actorCorners: true, blencongY: "30%", blencongBright: 0.35, frame: "BingkaiTumpal", hem: "HemMelati" },
  rsvp:      { actor: "CeplokSulur",      actorScale: 0.66, actorY: "24%", blencongY: "28%", blencongBright: 0.40, hem: "HemSulur" },
  gift:      { actor: "CeplokMelati",     actorScale: 0.58, actorY: "28%", blencongY: "30%", blencongBright: 0.40, hem: "HemMelati" },
  closing:   { actor: "AktorKayon",       actorScale: 1.0,                 blencongY: "88%", blencongBright: 1.0 },
};
```

- [ ] **Step 5: Render hem dari preset di `KelirScene.tsx`**

Cari blok hem (komentar diawali `{/* 5 — Tumpal`). Ganti komentar dan `src`:

```tsx
      {/* 5 — Hem (tumpal/sulur/melati/kawung per preset, diam). 404 tersembunyi. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(preset.hem ?? "TumpalBand")}
        alt=""
        aria-hidden="true"
        onError={hide}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", zIndex: 4, pointerEvents: "none" }}
      />
```

(Hanya baris komentar dan `src` yang berubah; `style` dan sisanya tetap.)

- [ ] **Step 6: Jalankan test, pastikan LULUS**

Run: `node --test scripts/__tests__/scene-kelir.test.mjs`
Expected: PASS — test lama + 10 test hem baru hijau.

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/components/shared/sceneKelir.ts src/components/shared/KelirScene.tsx scripts/__tests__/scene-kelir.test.mjs
git commit -m "feat(prada-melati): hem bervariasi per section (berima dengan aktor)"
```

---

## Task 2: Rujukan silang & verifikasi penuh

**Files:**
- Modify: `docs/superpowers/specs/2026-07-10-prada-melati-design.md`

- [ ] **Step 1: Tambah rujukan silang di spec induk**

Di `docs/superpowers/specs/2026-07-10-prada-melati-design.md`, di akhir sub-bagian aset `TumpalBand` pada §6c (setelah blok prompt `TumpalBand`), tambahkan:

```markdown
> **Perluasan 2026-07-12:** hem tak lagi selalu `TumpalBand`. Tiga hem alternatif
> (`HemSulur`, `HemMelati`, `HemKawung`) berima dengan motif aktor per section —
> lihat `2026-07-12-prada-melati-hem-variasi-design.md`.
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: exit 0, tanpa error/warning baru pada berkas yang disentuh.

- [ ] **Step 3: Jalankan seluruh test tema**

Run: `node --test scripts/__tests__/contrast-contract.test.mjs scripts/__tests__/scene-kelir.test.mjs scripts/__tests__/motion.test.mjs`
Expected: PASS — tak ada regresi.

- [ ] **Step 4: Build produksi**

Run: `npm run build`
Expected: build sukses, tanpa error.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-07-10-prada-melati-design.md
git commit -m "docs(prada-melati): rujuk spec hem bervariasi dari §6c"
```

---

## Catatan verifikasi visual (di luar test statik)

Setelah Task 2, verifikasi manual dengan `.claude/skills/theme-screenshot` (dev server + `shot.mjs`), baca ulang beberapa section:
- greeting/rsvp menampilkan hem sulur; couple/gift/gallery hem melati; lovestory/dresscode hem kawung; cover/akad/resepsi/closing tetap tumpal.
- tiap hem seamless kiri-kanan, tumbuh dari tepi bawah, tidak menabrak safe-zone teks.
- tak ada ikon broken (aset `Hem*.png` sudah ada di `public/images/`).
