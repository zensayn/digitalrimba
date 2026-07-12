// src/lib/assets.ts
// Sumber aset gambar — SATU tempat untuk base URL dan ekstensi.
//
// - Produksi: NEXT_PUBLIC_THEMES_CDN di-set saat build (mis. https://assets-themes.rimba.io),
//   aset diambil dari R2 sebagai WebP: <CDN>/adat/kenangan/prada-melati/<file>.webp
// - Dev tanpa env: fallback ke /images (public/images) sebagai PNG — mudah di-crop.
//
// Filename disimpan tanpa ekstensi; asset() menambahkan ekstensi yang benar.
// Ganti dev↔prod cukup lewat NEXT_PUBLIC_THEMES_CDN, tak perlu menyunting tiap referensi.

import type { SyntheticEvent } from "react";

export const THEMES_CDN_ORIGIN = process.env.NEXT_PUBLIC_THEMES_CDN;

export const ASSET_BASE = THEMES_CDN_ORIGIN
  ? `${THEMES_CDN_ORIGIN}/adat/kenangan/prada-melati`
  : "/images";

/** Dev lokal → PNG (croppable); produksi (R2/CDN) → WebP. */
export const ASSET_EXT = THEMES_CDN_ORIGIN ? "webp" : "png";

/**
 * Bangun URL aset dari basename (mis. "AktorGunungan").
 * Kalau `name` sudah memuat ekstensi, dipakai apa adanya.
 */
export const asset = (name: string) =>
  /\.[a-z0-9]+$/i.test(name) ? `${ASSET_BASE}/${name}` : `${ASSET_BASE}/${name}.${ASSET_EXT}`;

/**
 * Fallback aman untuk gambar ornamen: kalau file tidak ada (404), sembunyikan
 * elemennya alih-alih menampilkan ikon broken image. Hanya untuk CLIENT component.
 */
export function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}
