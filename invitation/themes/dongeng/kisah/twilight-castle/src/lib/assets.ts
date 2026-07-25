// src/lib/assets.ts
// Sumber aset gambar (foto gerbang/dunia + ornamen emas .webp).
//
// Aset tema hidup PENUH di R2 (bucket rimba-themes) agar template tidak
// menyimpan salinan gambar besar. Tidak ada lagi fallback /images lokal —
// baik produksi maupun dev menarik dari R2: <CDN>/dongeng/kisah/twilight-castle/<file>.
// NEXT_PUBLIC_THEMES_CDN boleh dioverride via env; default ke custom domain
// (BUKAN pub-*.r2.dev — diblokir Kominfo).

const THEME_CDN = process.env.NEXT_PUBLIC_THEMES_CDN ?? "https://assets-themes.rimba.io";

export const ASSET_BASE = `${THEME_CDN}/dongeng/kisah/twilight-castle`;

export const asset = (file: string) => `${ASSET_BASE}/${file}`;
