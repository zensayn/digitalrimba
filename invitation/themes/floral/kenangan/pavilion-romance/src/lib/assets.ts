// src/lib/assets.ts
// Asset tema Pavilion Romance hidup di R2 agar template lokal tidak bergantung
// pada salinan gambar besar. Nama file lama (…Kisah.webp) tetap dipakai walau
// template kini tier Kenangan — rename berarti regenerate/re-upload tanpa
// manfaat visual.

const THEME_CDN = process.env.NEXT_PUBLIC_THEMES_CDN ?? "https://assets-themes.rimba.io";

export const THEME_ASSET_BASE = `${THEME_CDN}/floral/kenangan/pavilion-romance`;

export const themeAsset = (file: string) => `${THEME_ASSET_BASE}/${file}`;

// Backwards-compatible alias untuk komponen yang sudah memakai asset(...).
export const asset = themeAsset;
