# Kontrak Template Soft Bloom — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan `soft-bloom` template yang aman disalin — identitas tema terkumpul di satu berkas, palet punya satu sumber kebenaran di config, dan setiap aturan itu dijaga tes otomatis.

**Architecture:** Pendekatan (a) — tiap tema tetap mandiri penuh (copy-paste), tidak ada package bersama. Yang berubah: nilai yang selama ini tersebar dipusatkan (`src/lib/theme-meta.ts` untuk identitas, `invitation.config.json` untuk seluruh token visual), lalu dikunci oleh suite `node --test` yang meniru pola `prada-melati/scripts/__tests__/`. Kontrak yang tidak dijaga tes akan bocor lagi pada tema berikutnya — itu sebabnya tiap task menutup dengan tes, bukan dengan dokumentasi.

**Tech Stack:** Next.js 16.2.5 (App Router, webpack build), React 19, Tailwind v4, `@opennextjs/cloudflare`, runner tes bawaan Node (`node --test`, berkas `.mjs`, tanpa dependency baru), bun sebagai package manager.

## Global Constraints

- **Direktori kerja:** SEMUA perubahan di worktree `C:\Users\Andri\Project\rimba-main\.claude\worktrees\perfecting-soft-bloom`, branch `perfecting-soft-bloom`. Jangan menyentuh checkout utama (`C:\Users\Andri\Project\rimba-main`) — di sana branch `feat/prada-melati-impl`.
- **Cakupan:** hanya `invitation/themes/floral/kenangan/soft-bloom/`. Tema lain (`prada-melati`, `pavilion-romance`, `twilight-castle`, `warm-narrative`) TIDAK disentuh dalam plan ini.
- **Bahasa:** komentar kode dan pesan commit dalam Bahasa Indonesia, mengikuti gaya berkas sekitarnya.
- **Commit HANYA SEKALI di akhir** (Task 6). Tiap task berhenti di checkpoint untuk diperiksa mata, tanpa commit. Jangan menjalankan `git commit` di tengah jalan.
- **Pesan commit:** TANPA trailer `Co-Authored-By: Claude` dan TANPA footer "Generated with Claude Code".
- **Format commit:** `<tipe>(soft-bloom): <ringkasan>` — tipe `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- **Task 3 mengubah tampilan; task lain TIDAK.** Setelah Task 1, 2, 4, 5 tampilan wajib identik dengan kondisi awal — pergeseran visual sekecil apa pun berarti ada yang salah dan harus ditelusuri, bukan diterima.
- **Tanpa dependency baru.** Tes memakai `node:test` + `node:assert/strict` + `node:fs` saja.
- **Sumber kebenaran palet = `invitation.config.json`.** Preseden sudah ditetapkan di `prada-melati/scripts/__tests__/contrast-contract.test.mjs`; plan ini menegakkannya untuk soft-bloom.
- **Nama kelas ornamen tidak diubah.** `.soft-wash`, `.mood-*`, `.botanical-card` adalah identitas tema dan sengaja dibiarkan.
- **Baseline browser:** `color-mix(in srgb, …)` boleh dipakai — tema ini sudah mengandalkan `backdrop-filter`, `100svh`, `inert`, dan `overscroll-behavior` yang setara barunya.
- **Perintah dijalankan dari** `invitation/themes/floral/kenangan/soft-bloom/` kecuali disebut lain.

---

## Struktur Berkas

**Dibuat:**

| Berkas | Tanggung jawab |
|---|---|
| `src/lib/theme-meta.ts` | Satu-satunya tempat nama/slug/host/path-CDN tema ditulis di dalam `src/` |
| `scripts/__tests__/theme-contract.test.mjs` | Menjaga identitas tema konsisten lintas `theme-meta.ts`, `wrangler.jsonc`, `package.json`, `layout.tsx` |
| `scripts/__tests__/token-contract.test.mjs` | Menjaga config sebagai satu-satunya sumber token; melarang `:root` menduplikasi; melarang `var(--x)` yatim |
| `scripts/__tests__/contrast-contract.test.mjs` | Menjaga palet memenuhi WCAG di atas ketiga permukaan |
| `scripts/__tests__/class-contract.test.mjs` | Melarang nama kelas lama bernuansa tema muncul kembali |
| `TEMPLATE.md` | Checklist salin-tema: apa yang wajib diganti, apa yang haram disentuh |

**Diubah:**

| Berkas | Perubahan |
|---|---|
| `package.json` | Tambah script `typecheck` + `test` |
| `src/lib/assets.ts` | Baca `THEME_CDN_PATH`, bukan literal |
| `src/app/page.tsx:13` | Baca `THEME_HOST`, bukan literal |
| `invitation.config.json` | Tambah `border`, `wash1`–`wash5` ke `theme.colors`; tambah `theme.shadows.card`; koreksi 4 nilai palet |
| `src/lib/config-types.ts` | Perluas `ThemeColors`, tambah `ThemeShadows` |
| `src/lib/css-vars.ts` | Pancarkan token baru |
| `src/app/globals.css` | Kosongkan `:root` dari token milik config; `.mood-*`/`.soft-wash` pakai `color-mix`; rename kelas struktural; buang kode mati |
| `src/components/sections/RSVPSection.tsx` | Rename kelas |
| `src/components/sections/CoverSection.tsx` | Rename kelas |
| `src/components/shared/DesktopCover.tsx` | Rename kelas |
| `src/components/shared/MusicPlayer.tsx` | Ganti 2 hex hardcode |

**Catatan penyimpangan dari arahan awal:** `shadowSoft` tidak diangkat ke config karena ternyata **kode mati** — didefinisikan di `globals.css:26` tapi tidak dipakai satu kali pun. Hanya `shadowCard` yang diangkat, dan karena box-shadow bukan warna, ia ditempatkan di `theme.shadows.card`, bukan di dalam `theme.colors`.

---

### Task 1: Identitas tema terpusat + perkakas tes

**Files:**
- Create: `scripts/__tests__/theme-contract.test.mjs`
- Create: `src/lib/theme-meta.ts`
- Modify: `package.json` (blok `scripts`)
- Modify: `src/lib/assets.ts` (seluruh berkas)
- Modify: `src/app/page.tsx:13`

**Interfaces:**
- Consumes: —
- Produces: `THEME_SLUG: string`, `THEME_HOST: string`, `THEME_CDN_PATH: string` dari `@/lib/theme-meta`. Task 5 mengacu ketiga nama ini di `TEMPLATE.md`.

- [ ] **Step 1: Tambah script tes ke `package.json`**

Di dalam blok `"scripts"`, sisipkan dua baris setelah `"lint": "eslint",`:

```json
    "typecheck": "tsc --noEmit",
    "test": "node --test \"scripts/__tests__/*.test.mjs\"",
```

- [ ] **Step 2: Tulis tes yang gagal**

Buat `scripts/__tests__/theme-contract.test.mjs`:

```js
// Identitas tema (slug, host, path CDN) dulu tersebar di 4 berkas. Sekali salah
// salin, tak ada error — cuma aset 404 diam-diam atau guard slug menunjuk domain
// tema lain. Tes ini yang menahannya: src/lib/theme-meta.ts jadi sumbernya,
// sisanya wajib ikut.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");

// wrangler.jsonc memuat komentar `//` → buang baris komentar sebelum di-parse.
// Cukup baris penuh: berkas ini tak punya komentar di ujung baris berisi nilai.
const parseJsonc = (text) =>
  JSON.parse(
    text
      .split("\n")
      .filter((line) => !line.trim().startsWith("//"))
      .join("\n"),
  );

const meta = read("../../src/lib/theme-meta.ts");
const readConst = (name) => {
  const match = meta.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`));
  assert.ok(match, `theme-meta.ts tidak mengekspor ${name}`);
  return match[1];
};

const THEME_SLUG = readConst("THEME_SLUG");
const THEME_HOST = readConst("THEME_HOST");
const THEME_CDN_PATH = readConst("THEME_CDN_PATH");

const wrangler = parseJsonc(read("../../wrangler.jsonc"));
const pkg = JSON.parse(read("../../package.json"));
const config = JSON.parse(read("../../invitation.config.json"));

test("nama worker mengikuti slug tema", () => {
  assert.equal(wrangler.name, `rimba-${THEME_SLUG}`);
});

test("custom domain di wrangler sama dengan THEME_HOST", () => {
  const patterns = (wrangler.routes ?? []).map((route) => route.pattern);
  assert.ok(
    patterns.includes(THEME_HOST),
    `routes ${JSON.stringify(patterns)} tidak memuat ${THEME_HOST}`,
  );
});

test("THEME_HOST adalah subdomain dari slug", () => {
  assert.equal(THEME_HOST, `${THEME_SLUG}.rimba.io`);
});

test("path CDN aset berakhir dengan slug tema", () => {
  assert.ok(
    THEME_CDN_PATH.endsWith(`/${THEME_SLUG}`),
    `${THEME_CDN_PATH} tidak berakhir dengan /${THEME_SLUG}`,
  );
});

test("nama package diturunkan dari path CDN", () => {
  assert.equal(pkg.name, THEME_CDN_PATH.replace(/\//g, "-"));
});

test("assets.ts dan page.tsx tidak lagi menulis nama tema secara manual", () => {
  for (const file of ["../../src/lib/assets.ts", "../../src/app/page.tsx"]) {
    assert.ok(
      !read(file).includes(THEME_SLUG),
      `${file} masih menulis "${THEME_SLUG}" — pakai konstanta dari theme-meta.ts`,
    );
  }
});

test("font di config sama dengan yang benar-benar di-import layout", () => {
  const layout = read("../../src/app/layout.tsx");
  for (const [role, name] of Object.entries(config.theme.typography)) {
    const identifier = name.replace(/ /g, "_");
    assert.ok(
      layout.includes(identifier),
      `layout.tsx tidak meng-import ${name} padahal config menyebutnya sebagai ${role}`,
    );
  }
});
```

- [ ] **Step 3: Jalankan tes, pastikan GAGAL**

Run: `bun run test`
Expected: FAIL — `ENOENT` pada `src/lib/theme-meta.ts` (berkasnya belum ada).

- [ ] **Step 4: Buat `src/lib/theme-meta.ts`**

```ts
// src/lib/theme-meta.ts
// ─── Identitas tema — SATU-SATUNYA tempat nama tema ditulis di dalam src/ ─────
// Saat menyalin tema ini menjadi tema baru, ubah tiga nilai di bawah. Untuk
// berkas di luar src/ (wrangler.jsonc, package.json, invitation.config.json,
// public/images) ikuti checklist di TEMPLATE.md — dijaga scripts/__tests__.

/** Slug tema. Menentukan nama worker (`rimba-<slug>`) dan subdomain demo. */
export const THEME_SLUG = "soft-bloom";

/** Domain demo tema. Request dari host ini TIDAK boleh dipercaya membawa
    header `x-rimba-slug` — lihat alasan lengkapnya di src/app/page.tsx. */
export const THEME_HOST = "soft-bloom.rimba.io";

/** Path aset tema di bucket R2 `assets-themes`: <kategori>/<tier>/<slug>. */
export const THEME_CDN_PATH = "floral/kenangan/soft-bloom";
```

- [ ] **Step 5: Alihkan `src/lib/assets.ts` ke konstanta**

Ganti seluruh isi berkas:

```ts
// src/lib/assets.ts
// Sumber aset gambar (ornamen wildflower .webp transparan).
//
// - Produksi: set NEXT_PUBLIC_THEMES_CDN (mis. https://<bucket>.r2.dev) saat build,
//   aset diambil dari R2: <CDN>/<THEME_CDN_PATH>/<file>.
// - Dev lokal: jika env tidak diset, fallback ke /images (public/images) supaya
//   `bun dev` langsung menampilkan gambar tanpa akses jaringan ke R2.

import { THEME_CDN_PATH } from "./theme-meta";

const CDN = process.env.NEXT_PUBLIC_THEMES_CDN;

export const ASSET_BASE = CDN ? `${CDN}/${THEME_CDN_PATH}` : "/images";

export const asset = (file: string) => `${ASSET_BASE}/${file}`;
```

- [ ] **Step 6: Alihkan `src/app/page.tsx` ke konstanta**

Tambahkan import setelah baris `import { resolveConfig } from "@/lib/resolve-config";`:

```ts
import { THEME_HOST } from "@/lib/theme-meta";
```

Lalu ganti baris 13:

```ts
  const slug = host === THEME_HOST ? null : h.get("x-rimba-slug");
```

- [ ] **Step 7: Jalankan tes, pastikan LULUS**

Run: `bun run test`
Expected: PASS — 7 tes hijau.

- [ ] **Step 8: Typecheck**

Run: `bun run typecheck`
Expected: exit 0, tanpa keluaran.

- [ ] **Step 9: Checkpoint — jangan commit**

Laporkan hasil `bun run test` dan `bun run typecheck`, lalu berhenti untuk ditinjau.
Task ini tidak mengubah tampilan sama sekali; kalau ada yang bergeser, telusuri sebelum lanjut.

---

### Task 2: Satu sumber token — config jadi otoritas

**Files:**
- Create: `scripts/__tests__/token-contract.test.mjs`
- Modify: `invitation.config.json` (blok `theme`)
- Modify: `src/lib/config-types.ts:64-85`
- Modify: `src/lib/css-vars.ts` (seluruh berkas)
- Modify: `src/app/globals.css:8-28` (`:root`), `:172-189` (`.mood-*`, `.soft-wash`)

**Interfaces:**
- Consumes: —
- Produces: CSS custom properties `--wash-1` … `--wash-5`, `--border`, `--shadow-card` yang dipancarkan `buildCssVars()`. Tipe `ThemeShadows { card: string }` dan `ThemeColors` yang diperluas. Task 3 mengubah nilai di dalam `theme.colors`; Task 4 memakai `--surface-2`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `scripts/__tests__/token-contract.test.mjs`:

```js
// Dulu warna punya DUA sumber: :root di globals.css dan theme.colors di config,
// dengan nilai yang sama persis. Siapa yang menang bergantung urutan cascade —
// perangkap klasik saat tema disalin ("sudah ganti config kok warnanya tetap").
// Tes ini menetapkan config sebagai satu-satunya sumber, dan menahan token yatim.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");

const config = JSON.parse(read("../../invitation.config.json"));
const css = read("../../src/app/globals.css");
const cssVars = read("../../src/lib/css-vars.ts");

// Token yang dimiliki config — globals.css tidak boleh mendefinisikan ulang.
const CONFIG_OWNED = [
  "--bg", "--surface", "--surface-2",
  "--accent", "--accent-soft", "--leaf",
  "--text", "--text-muted", "--text-dim",
  "--border",
  "--wash-1", "--wash-2", "--wash-3", "--wash-4", "--wash-5",
  "--shadow-card",
];

const rootBlock = () => {
  const start = css.indexOf(":root");
  assert.ok(start !== -1, "globals.css tidak punya blok :root");
  return css.slice(start, css.indexOf("}", start));
};

test("globals.css tidak mendefinisikan ulang token milik config", () => {
  const root = rootBlock();
  for (const token of CONFIG_OWNED) {
    assert.ok(
      !root.includes(`${token}:`),
      `${token} masih didefinisikan di :root globals.css — sumbernya harus invitation.config.json`,
    );
  }
});

test("buildCssVars memancarkan setiap token milik config", () => {
  for (const token of CONFIG_OWNED) {
    assert.ok(cssVars.includes(token), `css-vars.ts tidak memancarkan ${token}`);
  }
});

test("setiap kunci theme.colors terpakai di css-vars.ts", () => {
  for (const key of Object.keys(config.theme.colors)) {
    assert.ok(
      cssVars.includes(`colors.${key}`),
      `theme.colors.${key} ada di config tapi tidak pernah dipancarkan — token mati`,
    );
  }
});

test("theme.shadows.card terpakai di css-vars.ts", () => {
  assert.ok(config.theme.shadows?.card, "config tidak punya theme.shadows.card");
  assert.ok(cssVars.includes("shadows.card"), "css-vars.ts tidak memancarkan shadows.card");
});

// Kumpulkan seluruh var(--x) yang dipakai di src/, pastikan tak ada yang yatim.
// Catatan: pakai path biasa (bukan new URL) — di Windows path absolut seperti
// C:\... akan diurai new URL sebagai protokol "c:" dan gagal.
const SRC = fileURLToPath(new URL("../../src/", import.meta.url));

const sourceFiles = () =>
  readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|css)$/.test(entry.name))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));

const collectUsedVars = () => {
  const used = new Set();
  for (const file of sourceFiles()) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/var\((--[a-z0-9-]+)/g)) used.add(match[1]);
  }
  return used;
};

test("tidak ada var(--x) yang tak pernah didefinisikan", () => {
  const defined = new Set(CONFIG_OWNED);
  for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):/gm)) defined.add(match[1]);
  // Font disuntik next/font lewat className di layout.tsx, bukan lewat CSS.
  for (const token of ["--font-display", "--font-body", "--font-script"]) defined.add(token);

  for (const token of collectUsedVars()) {
    assert.ok(defined.has(token), `${token} dipakai tapi tidak pernah didefinisikan`);
  }
});
```

- [ ] **Step 2: Jalankan tes, pastikan GAGAL**

Run: `bun run test`
Expected: FAIL — `--bg masih didefinisikan di :root globals.css`, dan `config tidak punya theme.shadows.card`.

- [ ] **Step 3: Tambah token baru ke `invitation.config.json`**

Ganti blok `"theme"` (baris 116–133) menjadi:

```json
  "theme": {
    "colors": {
      "bg":         "#FDFCFA",
      "surface":    "#F7F5F1",
      "surface2":   "#EFEBE4",
      "accent":     "#7E6996",
      "accentSoft": "#C9B8DA",
      "leaf":       "#7E956E",
      "text":       "#3A3A36",
      "textMuted":  "#6F6F67",
      "textDim":    "#8C8C83",
      "border":     "rgba(126, 105, 150, 0.22)",
      "wash1":      "#C9B8DA",
      "wash2":      "#F0E2A8",
      "wash3":      "#BCD0DB",
      "wash4":      "#E9C4B4",
      "wash5":      "#9BB08A"
    },
    "shadows": {
      "card": "0 2px 14px rgba(58, 58, 54, 0.05)"
    },
    "typography": {
      "displayFont": "Cormorant Garamond",
      "bodyFont":    "Jost",
      "scriptFont":  "Imperial Script"
    }
  },
```

Peta warna wash untuk tema ini: `wash1` lilac, `wash2` butter, `wash3` sky, `wash4` peach, `wash5` sage. Sengaja dinomori, bukan dinamai bunga — tema turunan memakai warna lain.

- [ ] **Step 4: Perluas tipe di `src/lib/config-types.ts`**

Ganti blok `ThemeColors`/`InvitationTheme` (baris 64–85) menjadi:

```ts
export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  accent: string;
  accentSoft: string;
  leaf: string;
  text: string;
  textMuted: string;
  textDim: string;
  /** Garis tepi kartu/pemisah. Nilainya accent pada alpha rendah — bila accent
      diganti, nilai ini ikut disesuaikan manual (lihat TEMPLATE.md). */
  border: string;
  /** Lima warna wash dekoratif (.mood-* dan .soft-wash). Dinomori supaya tema
      turunan bebas memakai warna apa pun tanpa nama yang menyesatkan. */
  wash1: string;
  wash2: string;
  wash3: string;
  wash4: string;
  wash5: string;
}

export interface ThemeShadows {
  card: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  scriptFont?: string;
}

export interface InvitationTheme {
  colors: ThemeColors;
  shadows: ThemeShadows;
  typography: ThemeTypography;
}
```

- [ ] **Step 5: Pancarkan token baru di `src/lib/css-vars.ts`**

Ganti seluruh isi berkas:

```ts
// src/lib/css-vars.ts
import type { InvitationTheme } from "./config-types";

// SATU-SATUNYA sumber token visual: invitation.config.json. globals.css sengaja
// tidak lagi mendefinisikan token-token ini di :root — dulu keduanya memuat
// nilai yang sama dan pemenangnya bergantung urutan cascade. Dijaga
// scripts/__tests__/token-contract.test.mjs.
//
// Catatan: font (--font-display/-body/-script) dimuat & di-selfhost oleh
// next/font di layout.tsx, jadi tidak ikut dipancarkan di sini.
export function buildCssVars(theme: InvitationTheme): string {
  const { colors, shadows } = theme;
  return `
    :root {
      --bg: ${colors.bg};
      --surface: ${colors.surface};
      --surface-2: ${colors.surface2};
      --accent: ${colors.accent};
      --accent-soft: ${colors.accentSoft};
      --leaf: ${colors.leaf};
      --text: ${colors.text};
      --text-muted: ${colors.textMuted};
      --text-dim: ${colors.textDim};
      --border: ${colors.border};
      --wash-1: ${colors.wash1};
      --wash-2: ${colors.wash2};
      --wash-3: ${colors.wash3};
      --wash-4: ${colors.wash4};
      --wash-5: ${colors.wash5};
      --shadow-card: ${shadows.card};
    }
  `;
}
```

- [ ] **Step 6: Kosongkan `:root` di `globals.css` dari token milik config**

Ganti baris 7–28 (dari komentar `/* ─── Design Tokens …` sampai penutup `}`) menjadi:

```css
/* ─── Design Tokens ───────────────────────────────────────────────────────────
   Token visual (warna, border, wash, shadow) TIDAK didefinisikan di sini. Satu-
   satunya sumbernya adalah invitation.config.json → buildCssVars() menyuntiknya
   sebagai <style id="rimba-theme-vars"> di layout.tsx. Menaruh salinannya di
   sini pernah membuat "sudah ganti config tapi warna tak berubah".
   Dijaga scripts/__tests__/token-contract.test.mjs.
   Yang boleh tinggal di sini hanya warna BENDA, bukan warna tema.            */
:root {
  /* Piringan hitam pemutar musik — warna benda fisik, sama di tema mana pun. */
  --vinyl-disc: #1a1720;
}
```

`--shadow-soft` sengaja dihapus tanpa pengganti: ia didefinisikan tapi tidak dipakai satu kali pun di seluruh `src/`.

- [ ] **Step 7: Alihkan `.mood-*` dan `.soft-wash` ke token**

Ganti baris `.mood-paper` s/d `.mood-butter` (baris 172–177) menjadi:

```css
.mood-paper  { background-image: radial-gradient(120% 78% at 50% 42%, color-mix(in srgb, var(--surface) 72%, transparent), color-mix(in srgb, var(--surface) 0%, transparent) 76%); }
.mood-mist   { background-image: radial-gradient(120% 78% at 50% 42%, color-mix(in srgb, var(--wash-1) 20%, transparent), color-mix(in srgb, var(--wash-1) 0%, transparent) 74%); }
.mood-sky    { background-image: radial-gradient(120% 78% at 50% 42%, color-mix(in srgb, var(--wash-3) 22%, transparent), color-mix(in srgb, var(--wash-3) 0%, transparent) 74%); }
.mood-meadow { background-image: radial-gradient(120% 80% at 50% 60%, color-mix(in srgb, var(--wash-5) 20%, transparent), color-mix(in srgb, var(--wash-5) 0%, transparent) 74%); }
.mood-blush  { background-image: radial-gradient(120% 78% at 50% 44%, color-mix(in srgb, var(--wash-4) 20%, transparent), color-mix(in srgb, var(--wash-4) 0%, transparent) 74%); }
.mood-butter { background-image: radial-gradient(120% 78% at 50% 42%, color-mix(in srgb, var(--wash-2) 22%, transparent), color-mix(in srgb, var(--wash-2) 0%, transparent) 74%); }
```

Titik henti akhir sengaja ditulis `color-mix(… 0%, transparent)` dan bukan `transparent` polos — meniru `rgba(c, 0)` aslinya supaya gradien tidak melewati abu-abu di mesin render yang tidak melakukan interpolasi premultiplied.

Lalu ganti blok `background` di `.soft-wash` (baris 185–188) menjadi:

```css
  background:
    radial-gradient(38% 32% at 16% 10%, color-mix(in srgb, var(--wash-1) 18%, transparent), transparent 70%),
    radial-gradient(34% 28% at 84% 20%, color-mix(in srgb, var(--wash-2) 16%, transparent), transparent 70%),
    radial-gradient(46% 40% at 62% 94%, color-mix(in srgb, var(--wash-3) 16%, transparent), transparent 72%);
```

- [ ] **Step 8: Jalankan tes, pastikan LULUS**

Run: `bun run test`
Expected: PASS — suite `theme-contract` (7 tes) dan `token-contract` (5 tes) hijau.

- [ ] **Step 9: Typecheck & build**

Run: `bun run typecheck && bun run build`
Expected: keduanya exit 0, build selesai tanpa error. Catat jumlah route yang dihasilkan sebagai pembanding untuk build berikutnya.

- [ ] **Step 10: Periksa mata — warna tidak boleh bergeser**

Run: `bun dev` lalu buka `http://localhost:3000`.
Yang diperiksa: latar tiap section tetap sama seperti sebelumnya (tidak ada yang jadi abu-abu atau kehilangan wash), kartu masih punya garis tepi dan bayangan halus.
Hentikan server setelah selesai.

- [ ] **Step 11: Checkpoint — jangan commit**

Ini task paling rawan menggeser tampilan tanpa disadari. Nilai token di `:root` globals.css
dan di `theme.colors` sudah diverifikasi **identik ke-9-nya**, dan `color-mix(in srgb, X n%, transparent)`
menghasilkan warna yang sama dengan `rgba(X, 0.n)` — jadi hasilnya harus persis sama.
Kalau ada satu section pun yang warnanya berubah, hentikan dan telusuri; jangan diteruskan.

---

### Task 3: Palet yang benar-benar memenuhi WCAG

**Files:**
- Create: `scripts/__tests__/contrast-contract.test.mjs`
- Modify: `invitation.config.json` (4 nilai di `theme.colors`)
- Modify: `src/app/globals.css` (komentar yang salah klaim — sudah ikut terhapus di Task 2 Step 6; verifikasi saja)

**Interfaces:**
- Consumes: `theme.colors` dan `theme.shadows` dari Task 2.
- Produces: palet final. Task 4 dan Task 5 tidak mengubah nilai warna lagi.

**Konteks:** pengukuran pada palet saat ini (rasio terhadap `bg` / `surface` / `surface2`):

| Token | bg | surface | surface2 | Butuh |
|---|---|---|---|---|
| `text` #3A3A36 | 11.14 | 10.49 | 9.61 | 4.5 ✅ |
| `textMuted` #6F6F67 | 4.94 | 4.65 | **4.26** | 4.5 ❌ |
| `accent` #7E6996 | 4.71 | **4.44** | **4.06** | 4.5 ❌ |
| `textDim` #8C8C83 | 3.31 | 3.11 | **2.85** | 3.0 ❌ |
| `leaf` #7E956E | 3.19 | 3.01 | **2.76** | 3.0 ❌ |

`textDim` dan `leaf` diberi ambang 3.0, bukan 4.5: `textDim` hanya dipakai untuk placeholder/caption non-esensial, dan `leaf` hanya dipakai sebagai warna ikon dan garis pemisah — keduanya masuk kategori objek grafis (WCAG 1.4.11), bukan teks. Ini meniru perlakuan `goldDim` di `prada-melati/scripts/__tests__/contrast-contract.test.mjs`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `scripts/__tests__/contrast-contract.test.mjs`:

```js
// Palet terang gampang melanggar WCAG tanpa ketahuan — komentar di globals.css
// dulu mengklaim "≥4.5:1 di atas kertas putih", dan itu memang benar di atas
// --bg saja, tapi tidak di atas --surface-2. Tema ini jadi acuan tema lain,
// jadi cacat palet di sini akan diwariskan. Tes ini yang menahannya.
//
// Sumber kebenaran palet adalah invitation.config.json, sebab buildCssVars
// menyuntikkan token :root dari sana saat runtime.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(
  readFileSync(new URL("../../invitation.config.json", import.meta.url), "utf8"),
);
const c = config.theme.colors;

const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const SURFACES = { bg: c.bg, surface: c.surface, surface2: c.surface2 };

// Dipakai sebagai warna TEKS → 4.5:1.
const TEXT_TOKENS = { text: c.text, textMuted: c.textMuted, accent: c.accent };
// Objek grafis saja (placeholder, ikon, garis pemisah) → 3:1 (WCAG 1.4.11).
const GRAPHIC_TOKENS = { textDim: c.textDim, leaf: c.leaf };

test("token teks memenuhi 4.5:1 di atas SEMUA permukaan", () => {
  for (const [name, fg] of Object.entries(TEXT_TOKENS)) {
    for (const [surfaceName, bg] of Object.entries(SURFACES)) {
      const r = ratio(fg, bg);
      assert.ok(
        r >= 4.5,
        `${name} (${fg}) di atas ${surfaceName} (${bg}) hanya ${r.toFixed(2)}:1, butuh 4.5`,
      );
    }
  }
});

test("token grafis memenuhi 3:1 di atas SEMUA permukaan", () => {
  for (const [name, fg] of Object.entries(GRAPHIC_TOKENS)) {
    for (const [surfaceName, bg] of Object.entries(SURFACES)) {
      const r = ratio(fg, bg);
      assert.ok(
        r >= 3,
        `${name} (${fg}) di atas ${surfaceName} (${bg}) hanya ${r.toFixed(2)}:1, butuh 3`,
      );
    }
  }
});

test("accentSoft memang dekoratif — tidak boleh dipakai sebagai teks", () => {
  // Sengaja diuji rendah: kalau suatu saat nilainya digelapkan sampai lolos 4.5,
  // artinya perannya berubah dan pemakaiannya perlu ditinjau ulang.
  assert.ok(ratio(c.accentSoft, c.bg) < 4.5, "accentSoft kini cukup gelap untuk teks — tinjau perannya");
});
```

- [ ] **Step 2: Jalankan tes, pastikan GAGAL**

Run: `bun run test`
Expected: FAIL dengan pesan `textMuted (#6F6F67) di atas surface2 (#EFEBE4) hanya 4.26:1, butuh 4.5`.

- [ ] **Step 3: Koreksi empat nilai di `invitation.config.json`**

Di dalam `theme.colors`, ganti empat baris ini:

```json
      "accent":     "#75628C",
      "leaf":       "#788E69",
      "textMuted":  "#6B6B63",
      "textDim":    "#88887F",
```

Nilai-nilai ini diperoleh dengan menggelapkan warna asal secara proporsional (rona dipertahankan) sampai ambangnya tercapai di atas `surface2` — permukaan paling gelap. Pergeserannya beberapa persen dan praktis tidak terlihat mata.

- [ ] **Step 4: Jalankan tes, pastikan LULUS**

Run: `bun run test`
Expected: PASS — ketiga suite hijau (7 + 5 + 3 tes).

- [ ] **Step 5: Selaraskan `dressCode.colors` bila perlu**

`dressCode.colors[0]` bernilai `#C9B8DA` (Lilac) dan mengacu ke palet lama sebagai contekan warna busana. Nilai ini adalah **data undangan**, bukan token tema — biarkan apa adanya. Langkah ini hanya untuk memastikan tidak ada yang mengubahnya karena mengira token.

Run: `grep -n "C9B8DA" invitation.config.json`
Expected: tiga kecocokan — `dressCode.colors[0]`, `theme.colors.accentSoft`, dan `theme.colors.wash1`. Tidak ada yang perlu diubah.

- [ ] **Step 6: Periksa mata**

Run: `bun dev` lalu buka `http://localhost:3000`.
Yang diperiksa: teks sekunder dan tombol RSVP masih terasa lembut (bukan mendadak pekat), warna ikon peta di section Akad/Resepsi masih hijau daun.
Hentikan server setelah selesai.

- [ ] **Step 7: Checkpoint — WAJIB minta persetujuan, jangan commit**

**Ini satu-satunya task yang mengubah tampilan.** Jangan lanjut ke task berikutnya sebelum
pemilik menyetujui hasilnya dengan mata sendiri. Sajikan perbandingan sebelum/sesudah:

| Token | Sebelum | Sesudah |
|---|---|---|
| `accent` | `#7E6996` | `#75628C` |
| `leaf` | `#7E956E` | `#788E69` |
| `textMuted` | `#6F6F67` | `#6B6B63` |
| `textDim` | `#8C8C83` | `#88887F` |

Kalau pemilik menolak perubahan palet, **kembalikan keempat nilai ke asal** dan
turunkan ambang di `contrast-contract.test.mjs` menjadi pendokumentasian kondisi
saat ini (bukan penegakan), dengan komentar jelas bahwa ambang WCAG belum terpenuhi
di atas `surface2`. Jangan diam-diam menyimpan tes yang gagal.

---

### Task 4: Kelas berperan generik + tuntaskan disiplin token

**Files:**
- Create: `scripts/__tests__/class-contract.test.mjs`
- Modify: `src/app/globals.css` (definisi kelas + hapus `.leaf-divider-full`)
- Modify: `src/components/sections/RSVPSection.tsx:40,55,100,158,165`
- Modify: `src/components/sections/CoverSection.tsx:72,266`
- Modify: `src/components/shared/DesktopCover.tsx:96,101`
- Modify: `src/components/shared/MusicPlayer.tsx:174,219`

**Interfaces:**
- Consumes: `--surface-2` dan `--vinyl-disc` dari Task 2.
- Produces: kelas `.btn-primary`, `.input-field`, `.panel`, `.card`, `.divider`. Task 5 mendokumentasikannya di `TEMPLATE.md`.

**Peta rename:**

| Lama | Baru | Tempat pakai |
|---|---|---|
| `.btn-bloom` | `.btn-primary` | `RSVPSection.tsx:165` |
| `.input-bloom` | `.input-field` | `RSVPSection.tsx:100,158` |
| `.bloom-panel` | `.panel` | `RSVPSection.tsx:55`, `DesktopCover.tsx:101` |
| `.specimen-card` | `.card` | `CoverSection.tsx:72` |
| `.leaf-divider` | `.divider` | `CoverSection.tsx:266`, `DesktopCover.tsx:96` |
| `.leaf-divider-full` | **dihapus** | tidak dipakai di mana pun |

- [ ] **Step 1: Tulis tes yang gagal**

Buat `scripts/__tests__/class-contract.test.mjs`:

```js
// Kelas peran UI dulu bernama .btn-bloom / .input-bloom / .bloom-panel — kosakata
// yang tidak nyambung begitu tema disalin jadi tema keraton atau dongeng. Peran
// UI kini bernama netral; yang bernuansa tema (.soft-wash, .mood-*,
// .botanical-card) sengaja DIBIARKAN karena memang identitas visual tema.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Path biasa, bukan new URL — di Windows path absolut C:\... akan diurai
// new URL sebagai protokol "c:" dan gagal.
const SRC = fileURLToPath(new URL("../../src/", import.meta.url));

const sourceFiles = () =>
  readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|css)$/.test(entry.name))
    .map((entry) => {
      const name = join(entry.parentPath ?? entry.path, entry.name);
      return { name, text: readFileSync(name, "utf8") };
    });

const RETIRED = ["btn-bloom", "input-bloom", "bloom-panel", "specimen-card", "leaf-divider"];

test("nama kelas lama tidak muncul lagi di mana pun", () => {
  for (const file of sourceFiles()) {
    for (const name of RETIRED) {
      assert.ok(
        !file.text.includes(name),
        `${file.name} masih memuat kelas lama "${name}"`,
      );
    }
  }
});

test("setiap kelas peran baru terdefinisi di globals.css", () => {
  const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
  for (const name of ["btn-primary", "input-field", "panel", "card", "divider"]) {
    assert.ok(css.includes(`.${name} {`), `globals.css tidak mendefinisikan .${name}`);
  }
});

test("tidak ada warna hex hardcode di komponen", () => {
  // Semua warna wajib lewat token. Satu-satunya pengecualian dulu adalah
  // piringan hitam MusicPlayer — kini jadi token --vinyl-disc di globals.css.
  for (const file of sourceFiles()) {
    if (file.name.endsWith(".css")) continue;
    const found = file.text.match(/#[0-9A-Fa-f]{6}\b/g);
    assert.equal(
      found,
      null,
      `${file.name} memuat hex hardcode ${JSON.stringify(found)} — pakai var(--token)`,
    );
  }
});
```

- [ ] **Step 2: Jalankan tes, pastikan GAGAL**

Run: `bun run test`
Expected: FAIL — `globals.css masih memuat kelas lama "btn-bloom"` dan `MusicPlayer.tsx memuat hex hardcode`.

- [ ] **Step 3: Rename definisi kelas di `globals.css`**

Ganti nama di lima tempat definisi, isi aturannya tidak berubah:

- baris 99 `.bloom-panel {` → `.panel {`
- baris 194 `.specimen-card {` → `.card {`
- baris 214 `.leaf-divider {` → `.divider {`
- baris 333 `.input-bloom {` → `.input-field {`
- baris 347 `.input-bloom::placeholder` → `.input-field::placeholder`
- baris 348 `.input-bloom:focus` → `.input-field:focus`
- baris 350 `textarea.input-bloom` → `textarea.input-field`
- baris 353 `.btn-bloom {` → `.btn-primary {`
- baris 370 `.btn-bloom::before` → `.btn-primary::before`
- baris 381 `.btn-bloom:hover::before` → `.btn-primary:hover::before`
- baris 382 `.btn-bloom:hover` → `.btn-primary:hover`

Lalu HAPUS seluruh blok `.leaf-divider-full` (baris 221–226) — tidak dipakai di berkas mana pun.

Perbarui juga komentar di baris 98 dan 192–193 agar menyebut nama baru (`.panel`, `.card`).

- [ ] **Step 4: Rename pemakaian di komponen**

`src/components/sections/RSVPSection.tsx`:
- baris 40 (komentar): `kertas (bloom-panel)` → `kertas (.panel)`
- baris 55: `className="bloom-panel flex flex-col items-center text-center"` → `className="panel flex flex-col items-center text-center"`
- baris 100: `className="input-bloom"` → `className="input-field"`
- baris 158: `className="input-bloom overflow-hidden resize-none"` → `className="input-field overflow-hidden resize-none"`
- baris 165: `className="btn-bloom"` → `className="btn-primary"`

`src/components/sections/CoverSection.tsx`:
- baris 72: `className="specimen-card"` → `className="card"`
- baris 266: `className="leaf-divider"` → `className="divider"`

`src/components/shared/DesktopCover.tsx`:
- baris 96: `className="leaf-divider"` → `className="divider"`
- baris 101: `className="bloom-panel"` → `className="panel"`

- [ ] **Step 5: Hapus dua hex hardcode di `MusicPlayer.tsx`**

Baris 174 — piringan hitam, warna benda fisik, kini jadi token:

```tsx
                background: "var(--vinyl-disc)",
```

Baris 219 — lubang poros tengah; `#EFEBE4` persis sama dengan `--surface-2`:

```tsx
                  background: "var(--surface-2)",
```

- [ ] **Step 6: Jalankan tes, pastikan LULUS**

Run: `bun run test`
Expected: PASS — empat suite hijau (7 + 5 + 3 + 3 tes).

- [ ] **Step 7: Typecheck & build**

Run: `bun run typecheck && bun run build`
Expected: keduanya exit 0.

- [ ] **Step 8: Periksa mata — bagian yang paling mungkin rusak**

Run: `bun dev`, lalu periksa tiga hal:
1. `http://localhost:3000` → section Cover: kartu hitung mundur masih punya latar putih + garis tepi (kelas `.card`).
2. Gulir ke section RSVP: kolom isian masih bergaris bawah, tombol kirim masih berbingkai ungu dan berubah terisi saat disorot.
3. Lebarkan jendela ≥1024px → panel kiri desktop masih menampilkan panel kertas dan garis pemisah.

Hentikan server setelah selesai.

- [ ] **Step 9: Checkpoint — jangan commit**

Rename kelas tidak boleh mengubah tampilan apa pun. Kalau ada elemen yang mendadak
kehilangan gaya (kartu jadi polos, tombol jadi telanjang), berarti ada satu pemakaian
kelas yang terlewat di-rename — cari dengan `grep -rn "bloom\|specimen\|leaf-divider" src`.

---

### Task 5: TEMPLATE.md + verifikasi menyeluruh

**Files:**
- Create: `TEMPLATE.md`
- Modify: `scripts/__tests__/theme-contract.test.mjs` (tambah satu tes)
- Modify: `README.md` (tambah rujukan ke TEMPLATE.md)

**Interfaces:**
- Consumes: `THEME_SLUG`, `THEME_HOST`, `THEME_CDN_PATH` (Task 1); nama kelas peran (Task 4).
- Produces: —

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan di akhir `scripts/__tests__/theme-contract.test.mjs`:

```js
test("TEMPLATE.md menyebut setiap berkas yang wajib diganti saat menyalin tema", () => {
  const template = read("../../TEMPLATE.md");
  const SWAP_SURFACE = [
    "src/lib/theme-meta.ts",
    "wrangler.jsonc",
    "package.json",
    "invitation.config.json",
    "src/app/layout.tsx",
    "public/images",
    "README.md",
    "DESIGN_SPEC.md",
  ];
  for (const path of SWAP_SURFACE) {
    assert.ok(template.includes(path), `TEMPLATE.md tidak menyebut ${path}`);
  }
});
```

- [ ] **Step 2: Jalankan tes, pastikan GAGAL**

Run: `bun run test`
Expected: FAIL — `ENOENT` pada `TEMPLATE.md`.

- [ ] **Step 3: Tulis `TEMPLATE.md`**

```markdown
# Menyalin Soft Bloom Menjadi Tema Baru

Soft Bloom adalah tema acuan. Struktur, kontrak config, dan suite tesnya dibuat
untuk disalin apa adanya — yang berganti hanyalah identitas, palet, aset, dan
komponen ornamen.

```bash
cp -r invitation/themes/floral/kenangan/soft-bloom \
      invitation/themes/<kategori>/<tier>/<slug-baru>
cd invitation/themes/<kategori>/<tier>/<slug-baru>
rm -rf node_modules .next .open-next
bun install
```

---

## 1. Identitas — WAJIB, dijaga tes

Empat berkas harus sepakat. `bun run test` akan gagal kalau tidak.

| Berkas | Yang diganti |
|---|---|
| `src/lib/theme-meta.ts` | `THEME_SLUG`, `THEME_HOST`, `THEME_CDN_PATH` |
| `wrangler.jsonc` | `name` → `rimba-<slug>`, `routes[0].pattern` → `<slug>.rimba.io` |
| `package.json` | `name` → `<kategori>-<tier>-<slug>` |
| `src/app/layout.tsx` | import `next/font`, `metadata.title`, `metadata.description` |

Aturannya: `THEME_HOST` = `<slug>.rimba.io`, `THEME_CDN_PATH` = `<kategori>/<tier>/<slug>`,
`package.json#name` = `THEME_CDN_PATH` dengan `/` diganti `-`.

Di dalam `src/`, nama tema HANYA boleh ada di `theme-meta.ts`. `src/lib/assets.ts`
dan `src/app/page.tsx` membacanya dari sana — jangan menulis ulang literalnya.

## 2. Palet & tipografi — di `invitation.config.json`

Seluruh token visual ada di `theme`. `globals.css` **tidak** mendefinisikan token
apa pun kecuali `--vinyl-disc` (warna benda, bukan warna tema).

- `theme.colors.bg/surface/surface2` — tiga permukaan
- `theme.colors.accent/accentSoft/leaf` — aksen
- `theme.colors.text/textMuted/textDim` — teks
- `theme.colors.border` — garis tepi. **Turunan dari `accent`:** kalau `accent`
  diganti, setel ulang jadi warna accent baru pada alpha 0.22
- `theme.colors.wash1`–`wash5` — lima warna wash untuk `.mood-*` dan `.soft-wash`
- `theme.shadows.card` — bayangan kartu
- `theme.typography` — nama font; harus cocok dengan yang di-import `src/app/layout.tsx`

Setelah mengubah palet, jalankan `bun run test`. `contrast-contract` akan menolak
kombinasi yang melanggar WCAG di atas salah satu dari tiga permukaan — teks butuh
4.5:1, objek grafis butuh 3:1.

## 3. Aset — `public/images`

Ganti isinya dengan ornamen tema baru, lalu unggah ke R2 di
`assets-themes/<THEME_CDN_PATH>/`. Nama berkas dirujuk dari komponen lewat
`asset("NamaBerkas.webp")`.

Konversi gambar baru ke `.webp` sebelum dipakai.

## 4. Kelas CSS — mana yang boleh diikutkan

**Peran UI — pakai apa adanya, jangan di-rename:**
`.btn-primary`, `.input-field`, `.panel`, `.card`, `.divider`,
`.type-eyebrow`, `.type-label`, `.type-title`, `.type-caption`,
`.snap-section`, `.flow-section`, `.app-shell`, `.content-scroll`, `.desktop-cover`

**Sistem reveal — pakai apa adanya:**
`[data-enter="top|bottom|left|right|tl|tr|bl|br|drop|frame|soft|grow"]`
di dalam `.reveal-scope[data-inview]`

**Identitas tema — ganti gaya visualnya, boleh ganti nama:**
`.soft-wash`, `.mood-*`, `.botanical-card`

## 5. Komponen

`src/components/shared/` berisi ornamen khas Soft Bloom (`FloralTitle`,
`FloralDivider`, `Meadow`, `Butterflies`, `Bird`, `CardVines`, `SideVines`,
`FallingFlowers`, `BottomClusters`). Ganti dengan ornamen tema baru.

**Jangan diubah strukturnya** — ini kerangka yang membuat tema bisa dipakai studio:
`InvitationExperience.tsx`, `RevealController.tsx`, `src/lib/resolve-config.ts`,
`src/app/page.tsx`, `src/app/preview/page.tsx`, `src/lib/config-types.ts`,
`src/lib/css-vars.ts`, `src/lib/invitation-media.ts`, `src/lib/image-fallback.ts`.

## 6. Dokumen

Tulis ulang `README.md`, `DESIGN_SPEC.md`, dan `ASSET_PROMPTS.md` untuk tema baru.
Salin `TEMPLATE.md` ini apa adanya.

---

## Checklist akhir

```bash
bun run test        # 5 suite kontrak wajib hijau
bun run typecheck
bun run build
bun dev             # periksa mata di lebar HP dan ≥1024px
```
```

- [ ] **Step 4: Tambahkan rujukan di `README.md`**

Sisipkan setelah blok kutipan pembuka (setelah baris `(adat) yang bernuansa mawar-emas-blush. Lihat DESIGN_SPEC.md & ASSET_PROMPTS.md.`):

```markdown
> **Menyalin tema ini?** Baca `TEMPLATE.md` — daftar apa yang wajib diganti dan
> apa yang haram disentuh. Kontraknya dijaga `bun run test`.
```

- [ ] **Step 5: Jalankan tes, pastikan LULUS**

Run: `bun run test`
Expected: PASS — lima suite, 19 tes hijau.

- [ ] **Step 6: Verifikasi menyeluruh**

Run: `bun run test && bun run typecheck && bun run lint && bun run build`
Expected: keempatnya exit 0.

- [ ] **Step 7: Verifikasi tema lain tidak tersentuh**

Run: `git status --short -- ../../../..`
Expected: hanya berkas di bawah `invitation/themes/floral/kenangan/soft-bloom/` yang muncul.

- [ ] **Step 8: Checkpoint — jangan commit**

Semua task selesai. Lanjut ke Task 6 untuk commit tunggal.

---

### Task 6: Commit tunggal

**Files:** —

**Interfaces:**
- Consumes: seluruh perubahan Task 1–5.
- Produces: —

- [ ] **Step 1: Tinjau seluruh perubahan sebelum dicatat**

Run: `git status --short && git diff --stat`
Expected: perubahan hanya di bawah `invitation/themes/floral/kenangan/soft-bloom/`.
Berkas baru yang seharusnya muncul: `src/lib/theme-meta.ts`, `TEMPLATE.md`,
`scripts/__tests__/` (4 berkas), `docs/superpowers/plans/` (plan ini).

- [ ] **Step 2: Verifikasi terakhir sebelum commit**

Run: `bun run test && bun run typecheck && bun run lint && bun run build`
Expected: keempatnya exit 0. **Jangan commit kalau salah satu gagal** — laporkan apa adanya.

- [ ] **Step 3: Commit**

Kalau Task 3 DIJALANKAN (palet ikut berubah):

```bash
git add -A .
git commit -F - <<'EOF'
feat(soft-bloom): tegakkan kontrak template + suite tes penjaganya

Menyiapkan soft-bloom sebagai tema acuan yang aman disalin.

- theme-meta.ts jadi satu-satunya tempat identitas tema di dalam src/
- invitation.config.json jadi satu-satunya sumber token visual; :root di
  globals.css tak lagi menduplikasinya
- token dekoratif (border, wash1-5, shadow kartu) naik ke config
- palet dikoreksi agar memenuhi WCAG di atas ketiga permukaan
- kelas peran UI dinetralkan: .btn-primary, .input-field, .panel, .card, .divider
- buang kode mati: --shadow-soft dan .leaf-divider-full
- TEMPLATE.md sebagai checklist salin-tema
- 5 suite node --test yang mengunci semua aturan di atas
EOF
```

Kalau Task 3 DILEWATI (palet tidak diubah), buang baris "palet dikoreksi…" dari
pesan di atas dan ganti dengan:

```
- catatan: koreksi kontras palet sengaja ditunda, menunggu peninjauan visual
```

- [ ] **Step 4: Laporkan hasil**

Sebutkan jumlah tes yang lulus, hasil build, dan berkas apa saja yang berubah.
Jangan mengklaim selesai tanpa menyertakan keluaran perintah verifikasinya.

---

## Setelah plan ini selesai

Yang BELUM dikerjakan dan sengaja ditinggalkan di luar cakupan:

1. **Penyesuaian spacing/tipografi visual** yang jadi niat awal — plan ini menegakkan kontrak dulu supaya penyesuaian berikutnya tidak perlu diulang di tiap tema.
2. **Menutup drift tema lain.** `pavilion-romance` dan `prada-melati` belum punya `resolve-config.ts` maupun route `/preview`, jadi keduanya belum bisa dipakai dari studio. `warm-narrative` belum punya `image-fallback.ts` dan `invitation-media.ts`. Setelah soft-bloom jadi acuan, tiap tema itu perlu plan penyelarasan sendiri.
3. **Menurunkan kontrak ke prada-melati** — target akhir yang memicu seluruh pekerjaan ini.
