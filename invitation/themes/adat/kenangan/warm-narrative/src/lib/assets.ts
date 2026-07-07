// src/lib/assets.ts
// Sumber aset gambar (.webp) — SATU tempat untuk base URL, jangan duplikasi
// `process.env.NEXT_PUBLIC_THEMES_CDN` di tiap komponen.
//
// - Produksi: set NEXT_PUBLIC_THEMES_CDN saat build (mis. https://assets-themes.rimba.io),
//   aset diambil dari R2: <CDN>/adat/kenangan/warm-narrative/<file>.
// - Dev tanpa env: fallback ke /images (public/images). Catatan: aset lokal
//   dipindah ke asset-archive/ — salin kembali ke public/images bila perlu
//   dev offline tanpa akses R2.

import type { SyntheticEvent } from "react";

const CDN = process.env.NEXT_PUBLIC_THEMES_CDN;

export const ASSET_BASE = CDN
  ? `${CDN}/adat/kenangan/warm-narrative`
  : "/images";

export const asset = (file: string) => `${ASSET_BASE}/${file}`;

/**
 * Fallback aman untuk gambar ornamen: kalau file tidak ada di R2 (404),
 * sembunyikan elemennya alih-alih menampilkan ikon broken image.
 * Hanya untuk CLIENT component — server component tidak boleh memasang
 * event handler pada elemen DOM.
 */
export function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}
