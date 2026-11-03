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
