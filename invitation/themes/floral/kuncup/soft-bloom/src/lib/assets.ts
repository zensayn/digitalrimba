// src/lib/assets.ts
// Sumber aset gambar (ornamen wildflower .webp transparan).
//
// - Produksi: set NEXT_PUBLIC_THEMES_CDN (mis. https://<bucket>.r2.dev) saat build,
//   aset diambil dari R2: <CDN>/floral/kuncup/soft-bloom/<file>.
// - Dev lokal: jika env tidak diset, fallback ke /images (public/images) supaya
//   `bun dev` langsung menampilkan gambar tanpa akses jaringan ke R2.

const CDN = process.env.NEXT_PUBLIC_THEMES_CDN;

export const ASSET_BASE = CDN
  ? `${CDN}/floral/kuncup/soft-bloom`
  : "/images";

export const asset = (file: string) => `${ASSET_BASE}/${file}`;
