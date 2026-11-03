// src/lib/theme-meta.ts
// ─── Identitas tema — SATU-SATUNYA tempat nama tema ditulis di dalam src/ ─────
// Saat menyalin tema ini menjadi tema baru, ubah tiga nilai di bawah. Untuk
// berkas di luar src/ (wrangler.jsonc, package.json, invitation.config.json,
// public/images) ikuti checklist di TEMPLATE.md — dijaga scripts/__tests__.

/** Slug tema. Menentukan nama worker (`rimba-<slug>`) dan subdomain demo. */
export const THEME_SLUG = "noir-vow";

/** Domain demo tema. Request dari host ini TIDAK boleh dipercaya membawa
    header `x-rimba-slug` — lihat alasan lengkapnya di src/app/page.tsx. */
export const THEME_HOST = "noir-vow.rimba.io";

/** Path aset tema di bucket R2 `assets-themes`: <kategori>/<tier>/<slug>. */
export const THEME_CDN_PATH = "minimalist/kenangan/noir-vow";
