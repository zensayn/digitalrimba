# Alur Deploy Tema → Cloudflare Workers — Design Doc

> Tanggal: 2026-06-28
> Status: Disetujui — fokus kategori floral

## Tujuan

Menetapkan **alur baku deploy** tiap template undangan (Next.js) ke **Cloudflare
Workers** via OpenNext, supaya setiap tema baru — termasuk subtema floral yang
akan dibangun — tinggal mengikuti pola yang sama seperti `warm-narrative` yang
sudah live di `warm-narrative.rimba.io`.

Masalah saat ini: warm-narrative sudah jalan sebagai Worker, tapi **config
deploy-nya tidak ada di repo** (tidak ke-commit, tidak di-gitignore, tidak di
disk). Alur ini membuat config tersebut **ke-commit di `_boilerplate`** sehingga
terwariskan ke semua tema.

## Keputusan

| Topik | Keputusan |
|-------|-----------|
| Platform | Cloudflare **Workers** (bukan Pages), via OpenNext `@opennextjs/cloudflare` |
| Unit deploy | **1 theme instance = 1 Worker = 1 subdomain** |
| Nama Worker | `rimba-<nama-template>` — diambil dari nama tema yang dibuat di tiap subtema (mis. `rimba-warm-narrative`) |
| Subdomain | `<nama-tema>.rimba.io` (diambil dari nama template, mis. `warm-narrative.rimba.io`) |
| Akses R2 | **Tanpa R2 binding.** Tetap pakai URL publik via env `NEXT_PUBLIC_THEMES_CDN` / `NEXT_PUBLIC_PHOTOS_CDN` sesuai `docs/r2-image-storage.md` |
| Lokasi config | Ditaruh di `_boilerplate` agar terwariskan ke tiap tema baru |

## Verifikasi Kompatibilitas

OpenNext Cloudflare adapter **mendukung Next.js 16** (semua minor & patch),
selain Next.js 14 & 15. Sumber: https://opennext.js.org/cloudflare. Tema repo ini
memakai `next@16.2.5`, jadi kompatibel.

## Perubahan pada `_boilerplate`

### 1. File baru: `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "rimba-NAMA-TEMA",
  "compatibility_date": "2026-06-28",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

Tiap tema cukup mengganti `NAMA-TEMA`. Tidak ada `vars` R2 di sini — CDN dibaca
dari `NEXT_PUBLIC_*` (lihat catatan env di bawah).

### 2. File baru: `open-next.config.ts`

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Cache & queue default (incremental cache bisa ditambah nanti jika perlu)
});
```

### 3. `package.json` — tambah devDeps & scripts

```jsonc
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
},
"devDependencies": {
  "@opennextjs/cloudflare": "^1",
  "wrangler": "^4",
  ...
}
```

### 4. `next.config.ts` — inisialisasi binding lokal (opsional tapi disarankan)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};
export default nextConfig;

// Mengaktifkan akses binding Cloudflare saat `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
```

### 5. `.gitignore` — tambah artefak build

```
.open-next/
.wrangler/
cloudflare-env.d.ts
```

## Catatan Env (penting)

`NEXT_PUBLIC_THEMES_CDN` & `NEXT_PUBLIC_PHOTOS_CDN` adalah variabel **build-time**
(di-inline saat `next build`). Jadi nilainya harus ada di `.env.local` (atau
`.env.production`) **saat menjalankan `bun run deploy`** — bukan di `wrangler.jsonc`.
Ini konsisten dengan `docs/r2-image-storage.md` yang sudah mewajibkan tiap tema
punya `.env.local`.

## Alur Kerja per Tema

```
cd themes/floral/<tier>/<nama-tema>
bun install
# pastikan .env.local berisi NEXT_PUBLIC_THEMES_CDN & NEXT_PUBLIC_PHOTOS_CDN
bun run preview        # uji lokal di Workers runtime (opsional)
bun run deploy         # build OpenNext + deploy → Worker `rimba-<nama-tema>`
```

Lalu, **sekali per tema** di dashboard Cloudflare:
- Workers & Pages → `rimba-<nama-tema>` → Settings → Domains & Routes →
  Add Custom Domain → `<nama-tema>.rimba.io`

Prasyarat: zona `rimba.io` berada di akun Cloudflare yang sama
(`developers.storages@gmail.com`).

## Dokumentasi

Buat panduan developer `docs/cloudflare-deploy.md` (gaya seperti
`docs/r2-image-storage.md`): ringkasan alur, prasyarat, langkah deploy,
binding custom domain, dan quick reference perintah.

## Di Luar Scope

- Tidak membangun template/komponen floral (tahap berikutnya).
- Tidak memakai R2 binding, KV, D1, atau routing multi-tenant satu-Worker.
- Tidak menyiapkan CI/CD otomatis (deploy manual dulu).
- Tidak menyentuh `themes/adat` — kategori itu sudah memakai pola ini dan berjalan. Fokus alur ini adalah kategori **floral**.
