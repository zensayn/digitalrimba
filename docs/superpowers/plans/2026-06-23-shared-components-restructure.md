# Shared Components & Folder Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename folder structure menjadi lebih pendek dan buat `_shared/` sebagai sumber kanonik komponen yang dipakai oleh semua themes, disertai sync script agar tiap theme tetap standalone (bisa dicopy ke client tanpa dependency eksternal).

**Architecture:** Root repo memiliki `_shared/` berisi file kanonik (MusicPlayer, InfiniteMenu, RimbaConfigProvider, config-types, css-vars). Sebuah script `scripts/sync-shared.ts` (dijalankan via `bun sync`) menyalin file-file tersebut ke lokasi yang tepat di setiap theme. Tiap theme menyimpan copy lokal di `src/components/shared/` (atau `components/shared/` untuk theme tanpa wrapper `src/`) sehingga tetap 100% standalone.

**Tech Stack:** Bun (runtime + script runner), Next.js App Router, TypeScript, git mv (untuk preserve history saat rename folder)

## Global Constraints

- Jangan install dependency baru — gunakan Bun built-in file API (`Bun.file`, `Bun.write`, atau Node.js `fs` yang tersedia di Bun)
- Setiap theme harus tetap bisa `bun dev` secara standalone setelah setiap task
- Gunakan `git mv` untuk rename folder agar git history terjaga
- Tidak ada perubahan ke `tsconfig.json`, `next.config.ts`, atau `package.json` masing-masing theme
- Canonical source untuk RimbaConfigProvider: versi sacred-luxe (simple, tanpa Rimba Studio integration — Studio integration dihapus)
- Canonical source untuk MusicPlayer: versi sinema-kisah (paling up-to-date, ada komentar GANTI SESUAI TEMA)
- Canonical source untuk InfiniteMenu: sacred-luxe (satu-satunya yang ada CSS-nya, identik dengan warm-narrative)
- Canonical source untuk config-types + css-vars: sacred-luxe (sinema-kisah identik secara logika)

---

## Struktur File

### Yang akan DIBUAT:

```
_shared/
  components/
    InfiniteMenu.tsx          ← copy dari sacred-luxe (identik di semua kenangan themes)
    InfiniteMenu.css          ← copy dari sacred-luxe
    MusicPlayer.tsx           ← copy dari sinema-kisah (paling update)
    RimbaConfigProvider.tsx   ← copy dari sacred-luxe (simple, tanpa Studio)
  lib/
    config-types.ts           ← copy dari sacred-luxe (identik di semua themes)
    css-vars.ts               ← copy dari sacred-luxe

scripts/
  sync-shared.ts              ← script utama

package.json                  ← root-level, hanya untuk "bun sync" command
```

### Yang akan DIUBAH:

Setelah rename, tiap theme mendapat folder `shared/` di dalam components:

```
themes/adat/kenangan/sacred-luxe/src/components/
  shared/                     ← BARU (hasil sync)
    InfiniteMenu.tsx
    InfiniteMenu.css
    MusicPlayer.tsx
    RimbaConfigProvider.tsx   ← versi simple (tanpa Studio integration)
  sections/                   ← tidak berubah

themes/adat/kenangan/warm-narrative/src/components/
  shared/                     ← BARU (hasil sync)
    ... (sama)

themes/adat/kisah/sinema-kisah/components/
  shared/                     ← BARU (hasil sync)
    MusicPlayer.tsx
    RimbaConfigProvider.tsx   ← simple version (Studio integration dihapus), path JSON diupdate
```

### Import yang akan DIUPDATE (setelah sync):

| Theme | File | Import lama | Import baru |
|-------|------|-------------|-------------|
| sacred-luxe | `src/app/page.tsx` | `@/components/MusicPlayer` | `@/components/shared/MusicPlayer` |
| sacred-luxe | `src/app/layout.tsx` | `@/components/RimbaConfigProvider` | `@/components/shared/RimbaConfigProvider` |
| sacred-luxe | `src/app/page.tsx` | `@/components/RimbaConfigProvider` | `@/components/shared/RimbaConfigProvider` |
| sacred-luxe | `src/components/sections/GallerySection.tsx` | `@/components/InfiniteMenu` | `@/components/shared/InfiniteMenu` |
| sacred-luxe | semua `sections/*.tsx` | `@/components/RimbaConfigProvider` | `@/components/shared/RimbaConfigProvider` |
| warm-narrative | (sama seperti sacred-luxe) | | |
| sinema-kisah | `app/layout.tsx` | `@/components/RimbaConfigProvider` | `@/components/shared/RimbaConfigProvider` |
| sinema-kisah | `app/page.tsx` | `@/components/MusicPlayer` | `@/components/shared/MusicPlayer` (verify) |

---

## Task 1: Rename Folder Structure

**Files:**
- Rename: `kategori-adat/kenangan-series-tier/` → `themes/adat/kenangan/`
- Rename: `kategori-adat/kisah-series-tier/` → `themes/adat/kisah/`
- Rename: `kategori-adat/warisan-series-tier/` → `themes/adat/warisan/`
- Remove: empty `themes/adat/kenangan/src/` dan `themes/adat/kisah/src/` (tier-level src placeholder yang kosong)

**Interfaces:**
- Produces: `themes/` folder dengan struktur baru — semua task berikutnya merujuk path baru ini

- [ ] **Step 1: Buat parent folder dan pindahkan via git mv**

```bash
mkdir themes
mkdir themes/adat
git mv kategori-adat/kenangan-series-tier themes/adat/kenangan
git mv kategori-adat/kisah-series-tier themes/adat/kisah
git mv kategori-adat/warisan-series-tier themes/adat/warisan
```

- [ ] **Step 2: Hapus folder kategori-adat yang sudah kosong**

```bash
# Cek isi sisa kategori-adat (harus kosong kecuali DESIGN_SPEC.md jika ada)
ls kategori-adat/
# Jika ada DESIGN_SPEC.md di dalamnya, pindahkan dulu:
# git mv kategori-adat/DESIGN_SPEC.md themes/adat/DESIGN_SPEC.md
rmdir kategori-adat
```

- [ ] **Step 3: Hapus empty tier-level src placeholders**

```bash
# Cek apakah benar kosong
ls themes/adat/kenangan/src/
ls themes/adat/kisah/src/
# Jika kosong:
git rm -r themes/adat/kenangan/src
git rm -r themes/adat/kisah/src
```

- [ ] **Step 4: Verifikasi struktur baru**

```bash
find themes -maxdepth 4 -not -path "*/node_modules/*" -not -path "*/.next/*" -type d | sort
```

Expected output minimal:
```
themes
themes/adat
themes/adat/kenangan
themes/adat/kenangan/sacred-luxe
themes/adat/kenangan/sacred-luxe/src
themes/adat/kenangan/warm-narrative
themes/adat/kenangan/warm-narrative/src
themes/adat/kisah
themes/adat/kisah/sinema-kisah
themes/adat/warisan
```

- [ ] **Step 5: Verifikasi theme masih bisa dev**

```bash
cd themes/adat/kenangan/sacred-luxe && bun dev
# Tunggu sampai "Ready in ...ms", lalu Ctrl+C
cd ../../../..
```

- [ ] **Step 6: Commit**

```bash
git add themes/
git commit -m "refactor: rename kategori-adat → themes/adat with shorter tier names"
```

---

## Task 2: Buat Root package.json dan scripts/ Folder

**Files:**
- Create: `package.json` (root)
- Create: `scripts/` (folder, kosong dulu — diisi Task 4)

**Interfaces:**
- Produces: `bun sync` bisa dijalankan dari root setelah Task 4

- [ ] **Step 1: Buat root package.json**

Buat file `package.json` di root project (`C:\Users\Andri\Project\rimba_invitation\package.json`):

```json
{
  "name": "rimba-invitation",
  "private": true,
  "scripts": {
    "sync": "bun scripts/sync-shared.ts"
  }
}
```

- [ ] **Step 2: Buat folder scripts/**

```bash
mkdir scripts
```

- [ ] **Step 3: Commit**

```bash
git add package.json scripts/
git commit -m "chore: add root package.json with sync script entry"
```

---

## Task 3: Buat `_shared/` dengan File Kanonik

**Files:**
- Create: `_shared/components/InfiniteMenu.tsx` — copy dari sacred-luxe
- Create: `_shared/components/InfiniteMenu.css` — copy dari sacred-luxe
- Create: `_shared/components/MusicPlayer.tsx` — copy dari sinema-kisah
- Create: `_shared/components/RimbaConfigProvider.tsx` — copy dari sacred-luxe (simple, tanpa Studio)
- Create: `_shared/lib/config-types.ts` — copy dari sacred-luxe
- Create: `_shared/lib/css-vars.ts` — copy dari sacred-luxe

**Interfaces:**
- Produces: `_shared/` sebagai single source of truth untuk semua file yang dikelola sync

- [ ] **Step 1: Buat folder struktur _shared/**

```bash
mkdir _shared
mkdir _shared/components
mkdir _shared/lib
```

- [ ] **Step 2: Copy InfiniteMenu dari sacred-luxe**

```bash
cp themes/adat/kenangan/sacred-luxe/src/components/InfiniteMenu.tsx _shared/components/InfiniteMenu.tsx
cp themes/adat/kenangan/sacred-luxe/src/components/InfiniteMenu.css _shared/components/InfiniteMenu.css
```

- [ ] **Step 3: Copy MusicPlayer dari sinema-kisah**

```bash
cp themes/adat/kisah/sinema-kisah/components/MusicPlayer.tsx _shared/components/MusicPlayer.tsx
```

- [ ] **Step 4: Copy RimbaConfigProvider dari sacred-luxe (versi simple, tanpa Studio)**

```bash
cp themes/adat/kenangan/sacred-luxe/src/components/RimbaConfigProvider.tsx _shared/components/RimbaConfigProvider.tsx
```

Catatan: sinema-kisah sebelumnya punya versi dengan Rimba Studio integration — versi itu akan diganti dengan versi simple ini saat `bun sync` dijalankan (Task 4).

- [ ] **Step 5: Copy lib files dari sacred-luxe**

```bash
cp themes/adat/kenangan/sacred-luxe/src/lib/config-types.ts _shared/lib/config-types.ts
cp themes/adat/kenangan/sacred-luxe/src/lib/css-vars.ts _shared/lib/css-vars.ts
```

- [ ] **Step 6: Verifikasi isi _shared/**

```bash
find _shared -type f | sort
```

Expected:
```
_shared/components/InfiniteMenu.css
_shared/components/InfiniteMenu.tsx
_shared/components/MusicPlayer.tsx
_shared/components/RimbaConfigProvider.tsx
_shared/lib/config-types.ts
_shared/lib/css-vars.ts
```

- [ ] **Step 7: Commit**

```bash
git add _shared/
git commit -m "feat: add _shared/ canonical source for shared components"
```

---

## Task 4: Buat Sync Script

**Files:**
- Create: `scripts/sync-shared.ts`

**Interfaces:**
- Consumes: `_shared/` folder (dari Task 3)
- Consumes: `themes/` folder (dari Task 1)
- Produces: File-file shared di tiap theme di-create/update pada path yang benar

Script ini menangani dua perbedaan utama antar themes:
1. Theme dengan `src/` (kenangan themes) vs tanpa `src/` (sinema-kisah)
2. Path relatif ke `invitation.config.json` berbeda tergantung posisi file setelah sync

**Kalkulasi path `invitation.config.json` di RimbaConfigProvider:**
- sinema-kisah (hasSrc=false): file ada di `components/shared/RimbaConfigProvider.tsx` → `../../invitation.config.json`
- sacred-luxe/warm-narrative (hasSrc=true): file ada di `src/components/shared/RimbaConfigProvider.tsx` → `../../../invitation.config.json`

- [ ] **Step 1: Tulis sync script**

Buat file `scripts/sync-shared.ts`:

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from "fs";
import { join, dirname } from "path";

const ROOT = join(import.meta.dir, "..");
const SHARED = join(ROOT, "_shared");

type ThemeConfig = {
  name: string;
  path: string;        // relatif dari ROOT
  hasSrc: boolean;     // true → components ada di src/components/
  hasInfiniteMenu: boolean;
};

const THEMES: ThemeConfig[] = [
  {
    name: "sacred-luxe",
    path: "themes/adat/kenangan/sacred-luxe",
    hasSrc: true,
    hasInfiniteMenu: true,
  },
  {
    name: "warm-narrative",
    path: "themes/adat/kenangan/warm-narrative",
    hasSrc: true,
    hasInfiniteMenu: true,
  },
  {
    name: "sinema-kisah",
    path: "themes/adat/kisah/sinema-kisah",
    hasSrc: false,
    hasInfiniteMenu: false,
  },
];

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyFile(from: string, to: string, transform?: (src: string) => string) {
  const content = readFileSync(from, "utf-8");
  ensureDir(to);
  writeFileSync(to, transform ? transform(content) : content, "utf-8");
  console.log(`  ✓ ${to.replace(ROOT + "/", "")}`);
}

function componentsDir(theme: ThemeConfig): string {
  return join(ROOT, theme.path, theme.hasSrc ? "src/components" : "components");
}

function libDir(theme: ThemeConfig): string {
  return join(ROOT, theme.path, theme.hasSrc ? "src/lib" : "lib");
}

function configJsonRelativePath(theme: ThemeConfig): string {
  // Dari posisi: components/shared/RimbaConfigProvider.tsx
  // hasSrc=false → ../../invitation.config.json
  // hasSrc=true  → ../../../invitation.config.json
  return theme.hasSrc
    ? "../../../invitation.config.json"
    : "../../invitation.config.json";
}

function syncTheme(theme: ThemeConfig) {
  console.log(`\n→ ${theme.name}`);

  const compShared = join(componentsDir(theme), "shared");
  const lib = libDir(theme);

  // lib files — di-sync ke lokasi yang sama (tidak ke shared/)
  copyFile(
    join(SHARED, "lib/config-types.ts"),
    join(lib, "config-types.ts")
  );
  copyFile(
    join(SHARED, "lib/css-vars.ts"),
    join(lib, "css-vars.ts")
  );

  // MusicPlayer
  copyFile(
    join(SHARED, "components/MusicPlayer.tsx"),
    join(compShared, "MusicPlayer.tsx")
  );

  // RimbaConfigProvider — transform path JSON import
  const jsonPath = configJsonRelativePath(theme);
  copyFile(
    join(SHARED, "components/RimbaConfigProvider.tsx"),
    join(compShared, "RimbaConfigProvider.tsx"),
    (src) =>
      src.replace(
        /import staticConfig from ".*?invitation\.config\.json"/,
        `import staticConfig from "${jsonPath}"`
      )
  );

  // InfiniteMenu — hanya untuk theme yang pakai globe gallery
  if (theme.hasInfiniteMenu) {
    copyFile(
      join(SHARED, "components/InfiniteMenu.tsx"),
      join(compShared, "InfiniteMenu.tsx")
    );
    copyFile(
      join(SHARED, "components/InfiniteMenu.css"),
      join(compShared, "InfiniteMenu.css")
    );
  }
}

console.log("🔄 Rimba sync-shared\n");
for (const theme of THEMES) {
  syncTheme(theme);
}
console.log("\n✅ Sync selesai.");
```

- [ ] **Step 2: Test jalankan script (belum ada shared/ di themes, tapi script harus jalan tanpa error)**

```bash
bun sync
```

Expected output:
```
🔄 Rimba sync-shared

→ sacred-luxe
  ✓ themes/adat/kenangan/sacred-luxe/src/lib/config-types.ts
  ✓ themes/adat/kenangan/sacred-luxe/src/lib/css-vars.ts
  ✓ themes/adat/kenangan/sacred-luxe/src/components/shared/MusicPlayer.tsx
  ✓ themes/adat/kenangan/sacred-luxe/src/components/shared/RimbaConfigProvider.tsx
  ✓ themes/adat/kenangan/sacred-luxe/src/components/shared/InfiniteMenu.tsx
  ✓ themes/adat/kenangan/sacred-luxe/src/components/shared/InfiniteMenu.css

→ warm-narrative
  ✓ themes/adat/kenangan/warm-narrative/src/lib/config-types.ts
  ...

→ sinema-kisah
  ✓ themes/adat/kisah/sinema-kisah/lib/config-types.ts
  ...

✅ Sync selesai.
```

- [ ] **Step 3: Verifikasi file sync benar (spot-check RimbaConfigProvider)**

```bash
# Cek path JSON import di sacred-luxe sudah benar
grep "invitation.config.json" themes/adat/kenangan/sacred-luxe/src/components/shared/RimbaConfigProvider.tsx
```

Expected: `import staticConfig from "../../../invitation.config.json"`

```bash
# Cek path JSON import di sinema-kisah sudah benar
grep "invitation.config.json" themes/adat/kisah/sinema-kisah/components/shared/RimbaConfigProvider.tsx
```

Expected: `import staticConfig from "../../invitation.config.json"`

- [ ] **Step 4: Commit script + hasil sync pertama**

```bash
git add scripts/sync-shared.ts
git add themes/adat/kenangan/sacred-luxe/src/components/shared/
git add themes/adat/kenangan/warm-narrative/src/components/shared/
git add themes/adat/kisah/sinema-kisah/components/shared/
# Juga update lib files yang ter-sync
git add themes/adat/kenangan/sacred-luxe/src/lib/
git add themes/adat/kenangan/warm-narrative/src/lib/
git add themes/adat/kisah/sinema-kisah/lib/
git commit -m "feat: add sync-shared script and run initial sync to all themes"
```

---

## Task 5: Update Imports di Semua Themes

File yang diubah adalah file TypeScript/TSX milik theme sendiri (bukan file yang di-sync). Perubahan ini mengalihkan import dari path lama ke path `shared/`.

**Files:**
- Modify: `themes/adat/kenangan/sacred-luxe/src/app/layout.tsx`
- Modify: `themes/adat/kenangan/sacred-luxe/src/app/page.tsx`
- Modify: `themes/adat/kenangan/sacred-luxe/src/components/sections/*.tsx` (semua yang import RimbaConfigProvider)
- Modify: `themes/adat/kenangan/sacred-luxe/src/components/sections/GallerySection.tsx` (import InfiniteMenu)
- Modify: `themes/adat/kenangan/warm-narrative/src/app/layout.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/app/page.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/*.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/GallerySection.tsx`
- Modify: `themes/adat/kisah/sinema-kisah/app/layout.tsx`
- Modify: `themes/adat/kisah/sinema-kisah/app/page.tsx` (jika ada import MusicPlayer/RimbaConfigProvider)
- Delete: file shared lama yang tidak lagi dipakai

**Interfaces:**
- Consumes: `shared/` folder di tiap theme (dari Task 4)
- Produces: Semua theme import dari `shared/` path yang benar

### 5A — sacred-luxe

- [ ] **Step 1: Update `src/app/layout.tsx`**

Buka `themes/adat/kenangan/sacred-luxe/src/app/layout.tsx`. Cari:
```tsx
import { RimbaConfigProvider } from "@/components/RimbaConfigProvider";
```
Ganti dengan:
```tsx
import { RimbaConfigProvider } from "@/components/shared/RimbaConfigProvider";
```

- [ ] **Step 2: Update `src/app/page.tsx`**

Buka `themes/adat/kenangan/sacred-luxe/src/app/page.tsx`. Ganti semua import berikut:
```tsx
import { useInvitationConfig } from "@/components/RimbaConfigProvider";
import MusicPlayer from "@/components/MusicPlayer";
```
Menjadi:
```tsx
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";
import MusicPlayer from "@/components/shared/MusicPlayer";
```

- [ ] **Step 3: Update semua sections yang import RimbaConfigProvider**

Jalankan perintah ini untuk melihat semua file yang perlu diubah:
```bash
grep -rl "@/components/RimbaConfigProvider\|@/components/InfiniteMenu\|@/components/MusicPlayer" \
  themes/adat/kenangan/sacred-luxe/src/components/sections/
```

Untuk tiap file yang muncul, ganti:
- `"@/components/RimbaConfigProvider"` → `"@/components/shared/RimbaConfigProvider"`
- `"@/components/InfiniteMenu"` → `"@/components/shared/InfiniteMenu"`
- `"@/components/MusicPlayer"` → `"@/components/shared/MusicPlayer"`

Menggunakan sed (jalankan dari root):
```bash
find themes/adat/kenangan/sacred-luxe/src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's|"@/components/RimbaConfigProvider"|"@/components/shared/RimbaConfigProvider"|g'

find themes/adat/kenangan/sacred-luxe/src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's|"@/components/InfiniteMenu"|"@/components/shared/InfiniteMenu"|g'

find themes/adat/kenangan/sacred-luxe/src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's|"@/components/MusicPlayer"|"@/components/shared/MusicPlayer"|g'
```

- [ ] **Step 4: Hapus file lama yang sudah digantikan shared/**

```bash
rm themes/adat/kenangan/sacred-luxe/src/components/InfiniteMenu.tsx
rm themes/adat/kenangan/sacred-luxe/src/components/InfiniteMenu.css
rm themes/adat/kenangan/sacred-luxe/src/components/MusicPlayer.tsx
rm themes/adat/kenangan/sacred-luxe/src/components/RimbaConfigProvider.tsx
```

- [ ] **Step 5: Verifikasi tidak ada import lama yang tersisa**

```bash
grep -r "@/components/RimbaConfigProvider\b\|@/components/InfiniteMenu\b\|@/components/MusicPlayer\b" \
  themes/adat/kenangan/sacred-luxe/src/
```

Expected: tidak ada output (kosong)

- [ ] **Step 6: Test build sacred-luxe**

```bash
cd themes/adat/kenangan/sacred-luxe && bun dev
```

Expected: server berjalan tanpa error TypeScript. Buka browser ke `localhost:3000`. Ctrl+C selesai.

```bash
cd ../../../..
```

### 5B — warm-narrative

- [ ] **Step 7: Update imports warm-narrative (sama dengan sacred-luxe)**

```bash
find themes/adat/kenangan/warm-narrative/src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's|"@/components/RimbaConfigProvider"|"@/components/shared/RimbaConfigProvider"|g'

find themes/adat/kenangan/warm-narrative/src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's|"@/components/InfiniteMenu"|"@/components/shared/InfiniteMenu"|g'

find themes/adat/kenangan/warm-narrative/src -name "*.tsx" -o -name "*.ts" | \
  xargs sed -i 's|"@/components/MusicPlayer"|"@/components/shared/MusicPlayer"|g'
```

- [ ] **Step 8: Hapus file lama warm-narrative**

```bash
rm themes/adat/kenangan/warm-narrative/src/components/InfiniteMenu.tsx
rm themes/adat/kenangan/warm-narrative/src/components/MusicPlayer.tsx
rm themes/adat/kenangan/warm-narrative/src/components/RimbaConfigProvider.tsx
```

Catatan: warm-narrative mungkin tidak punya `InfiniteMenu.css` terpisah — cek dulu:
```bash
ls themes/adat/kenangan/warm-narrative/src/components/
```

- [ ] **Step 9: Test build warm-narrative**

```bash
cd themes/adat/kenangan/warm-narrative && bun dev
```

Expected: server jalan tanpa error. Ctrl+C, kembali ke root.

```bash
cd ../../../..
```

### 5C — sinema-kisah

- [ ] **Step 10: Cek import apa saja yang ada di sinema-kisah**

```bash
grep -rn "@/components/RimbaConfigProvider\|@/components/MusicPlayer" \
  themes/adat/kisah/sinema-kisah/app/ \
  themes/adat/kisah/sinema-kisah/components/slides/
```

- [ ] **Step 11: Update imports sinema-kisah**

```bash
find themes/adat/kisah/sinema-kisah -name "*.tsx" -o -name "*.ts" | \
  grep -v node_modules | grep -v .next | \
  xargs sed -i 's|"@/components/RimbaConfigProvider"|"@/components/shared/RimbaConfigProvider"|g'

find themes/adat/kisah/sinema-kisah -name "*.tsx" -o -name "*.ts" | \
  grep -v node_modules | grep -v .next | \
  xargs sed -i 's|"@/components/MusicPlayer"|"@/components/shared/MusicPlayer"|g'
```

- [ ] **Step 12: Hapus file lama sinema-kisah**

```bash
rm themes/adat/kisah/sinema-kisah/components/RimbaConfigProvider.tsx
rm themes/adat/kisah/sinema-kisah/components/MusicPlayer.tsx
```

- [ ] **Step 13: Test build sinema-kisah**

```bash
cd themes/adat/kisah/sinema-kisah && bun dev
```

Expected: server jalan tanpa error. Ctrl+C, kembali ke root.

```bash
cd ../../../..
```

- [ ] **Step 14: Commit semua perubahan Task 5**

```bash
git add -u
git commit -m "refactor: update all themes to import from components/shared/ and remove old duplicates"
```

---

## Task 6: Update `_boilerplate`

`_boilerplate` adalah template starter untuk theme baru. Perlu disesuaikan dengan konvensi baru agar theme baru langsung pakai struktur `shared/`.

**Files:**
- Modify/Create: `_boilerplate/src/components/shared/` — tambah file placeholder
- Modify: `_boilerplate` agar mencerminkan struktur baru

**Interfaces:**
- Produces: `_boilerplate` siap jadi basis theme baru yang mengikuti konvensi shared

- [ ] **Step 1: Cek isi _boilerplate saat ini**

```bash
find _boilerplate -not -path "*/node_modules/*" -not -path "*/.next/*" -type f | sort
```

- [ ] **Step 2: Tambahkan folder shared/ ke _boilerplate**

```bash
mkdir -p _boilerplate/src/components/shared
```

- [ ] **Step 3: Buat .gitkeep agar folder terlacak git**

```bash
touch _boilerplate/src/components/shared/.gitkeep
```

- [ ] **Step 4: Update script entry di _boilerplate/package.json jika ada instruksi sync**

Buka `_boilerplate/package.json`. Jika tidak ada comment atau README tentang cara setup, tambahkan ke bagian `scripts`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  }
}
```

Tidak ada perubahan ke package.json _boilerplate — sync dijalankan dari root, bukan dari theme.

- [ ] **Step 5: Commit**

```bash
git add _boilerplate/
git commit -m "chore: update _boilerplate to reflect shared/ components convention"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Jalankan bun sync ulang dan pastikan idempotent**

```bash
bun sync
```

Expected: output sama seperti sebelumnya, tidak ada error. File yang sudah ada akan ditimpa dengan konten yang sama (tidak merusak apapun).

- [ ] **Step 2: Verifikasi tidak ada import lama di seluruh themes**

```bash
grep -rn "@/components/RimbaConfigProvider\b\|@/components/InfiniteMenu\b\|@/components/MusicPlayer\b" \
  themes/ --include="*.tsx" --include="*.ts"
```

Expected: tidak ada output.

- [ ] **Step 3: Verifikasi semua shared/ folder terisi**

```bash
find themes -path "*/components/shared/*.tsx" | sort
```

Expected minimal:
```
themes/adat/kenangan/sacred-luxe/src/components/shared/InfiniteMenu.tsx
themes/adat/kenangan/sacred-luxe/src/components/shared/MusicPlayer.tsx
themes/adat/kenangan/sacred-luxe/src/components/shared/RimbaConfigProvider.tsx
themes/adat/kenangan/warm-narrative/src/components/shared/InfiniteMenu.tsx
themes/adat/kenangan/warm-narrative/src/components/shared/MusicPlayer.tsx
themes/adat/kenangan/warm-narrative/src/components/shared/RimbaConfigProvider.tsx
themes/adat/kisah/sinema-kisah/components/shared/MusicPlayer.tsx
themes/adat/kisah/sinema-kisah/components/shared/RimbaConfigProvider.tsx
```

- [ ] **Step 4: TypeScript check tiap theme**

```bash
cd themes/adat/kenangan/sacred-luxe && bunx tsc --noEmit && cd ../../../..
cd themes/adat/kenangan/warm-narrative && bunx tsc --noEmit && cd ../../../..
cd themes/adat/kisah/sinema-kisah && bunx tsc --noEmit && cd ../../../..
```

Expected: tidak ada output error dari TypeScript.

- [ ] **Step 5: Final commit**

```bash
git add -A
git status  # cek tidak ada file sensitif ter-include
git commit -m "chore: final verification pass — all themes import from shared/, sync is idempotent"
```

---

## Workflow Harian Setelah Ini

Kapanpun ada perubahan di komponen shared:

```bash
# 1. Edit file kanonik
code _shared/components/MusicPlayer.tsx

# 2. Sync ke semua themes
bun sync

# 3. Commit hasilnya
git add _shared/ themes/
git commit -m "feat: update MusicPlayer — ..."
```

Kapanpun ada theme baru:
1. Copy struktur dari `_boilerplate/`
2. Tambahkan entry ke `THEMES` array di `scripts/sync-shared.ts`
3. Jalankan `bun sync`
4. Update imports di theme baru ke `shared/`

---

## Self-Review Checklist

- [x] Folder rename: semua 3 tier di-rename dengan git mv
- [x] `_shared/` dibuat dengan 6 file kanonik (InfiniteMenu+css, MusicPlayer, RimbaConfigProvider, config-types, css-vars)
- [x] Sync script menangani `hasSrc` perbedaan path
- [x] Sync script menangani transform `invitation.config.json` path yang berbeda per theme structure
- [x] InfiniteMenu hanya di-sync ke theme yang `hasInfiniteMenu: true`
- [x] Semua import di 3 themes diupdate ke `shared/`
- [x] File lama (duplikat) di-delete setelah import diupdate
- [x] `_boilerplate` diupdate
- [x] TypeScript check di tiap theme sebagai verifikasi akhir
- [x] Setiap task diakhiri dengan commit
- [x] Setiap theme tetap standalone (copy folder = bisa jalan sendiri)
