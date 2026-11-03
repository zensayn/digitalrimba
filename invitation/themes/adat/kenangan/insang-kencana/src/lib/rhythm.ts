// src/lib/rhythm.ts
// Tabel ritme per section — data murni, tanpa React. Sepupu sceneKelir.ts di
// prada-melati.
//
// Angka jaraknya TIDAK di sini: semuanya token di globals.css (--section-pad-*,
// --gutter, --content-max, --space-*). Tabel ini hanya memberi MASUKAN yang
// dibutuhkan rumus --section-pad-top, plus dua pengecualian yang punya kendala
// struktural sendiri (cover & closing) — dan pengecualian itu wajib punya alasan
// tertulis, bukan angka yang kebetulan terasa pas.

import type { CSSProperties } from "react";

export interface SectionRhythm {
  /** Lebar maksimum BingkaiAtas (TopFrame) dalam px. 0 → section tak punya
   *  bingkai atas; ruang atasnya jatuh ke --pad-block. Dibaca DUA pihak dari
   *  satu tempat ini: <TopFrame> (lewat var(--frame-max)) dan rumus zona aman
   *  --section-pad-top. Kalau salah satunya disetel manual, keduanya bisa
   *  melenceng diam-diam — itulah cacat lama yang dicegah tabel ini. */
  frameMax: number;
  /** Lebar kolom konten. "text" (default) | "wide" untuk grid galeri. */
  width?: "text" | "wide";
  /** Napas antara puncak lengkung bingkai dan elemen pertama. Kosong →
   *  --space-group. Ini MASUKAN untuk rumus zona aman, bukan penggantinya:
   *  ruang atas tetap berskala dengan lebar bingkai. */
  frameBreath?: string;
  /** Override ruang bawah. Hanya cover & closing. */
  padBottom?: string;
}

export const RITME: Record<string, SectionRhythm> = {
  // Cover: elemen pertamanya wreath monogram — bundar dan tepinya transparan,
  // jadi ia boleh duduk langsung di bawah lengkung tanpa napas tambahan.
  // Bawahnya juga tipis: tak ada jahitan garland yang menjulur ke atas dari
  // section berikutnya di titik ini, dan tepi bawah cover sudah dilarutkan
  // gradien sendiri.
  cover: {
    frameMax: 640,
    frameBreath: "0px",
    padBottom: "clamp(34px, 6vh, 64px)",
  },
  // Greeting satu-satunya section yang elemen pertamanya judul script
  // LEBAR-PENUH, bukan eyebrow sempit. Bukaan lengkung melebar makin ke bawah,
  // jadi eyebrow tetangganya muat di bagian sempit sementara judul greeting
  // menggesek kluster samping di ketinggian yang sama. Napasnya digandakan
  // supaya judul turun ke bagian bukaan yang selebar dirinya.
  greeting: { frameMax: 560, frameBreath: "calc(var(--space-group) * 2)" },
  couple: { frameMax: 560 },
  lovestory: { frameMax: 560 },
  akad: { frameMax: 560 },
  resepsi: { frameMax: 560 },
  dresscode: { frameMax: 560 },
  gallery: { frameMax: 560, width: "wide" },
  // RSVP sengaja tanpa BingkaiAtas: kolomnya sudah diisi panel kertas penuh
  // (.panel) yang akan bertabrakan dengan lengkung bunga.
  rsvp: { frameMax: 0 },
  gift: { frameMax: 560 },
  rundown: { frameMax: 560 },
  turut: { frameMax: 560 },
  // Closing dibingkai BingkaiPenuh (bukan bingkai atas) → zona atasnya
  // ditentukan tepi bingkai, bukan lengkung. Bawahnya harus melewati
  // .closing-brand-footer yang duduk absolut di dasar section.
  closing: {
    frameMax: 0,
    padBottom: "calc(166px + env(safe-area-inset-bottom))",
  },
};

export function ritmeFor(id: string): SectionRhythm {
  const preset = RITME[id];
  if (!preset) throw new Error(`ritmeFor: preset ritme tidak dikenal "${id}"`);
  return preset;
}

/** Variabel ritme untuk atribut style <section>. Disuntik di section (bukan di
 *  .section-shell) supaya --frame-max juga terbaca <TopFrame> yang jadi
 *  saudaranya, sehingga lebar bingkai & zona aman tak mungkin berbeda. */
export function rhythmVars(id: string): CSSProperties {
  const r = ritmeFor(id);
  const vars: Record<string, string> = {
    "--frame-max": `${r.frameMax}px`,
  };
  if (r.width === "wide") vars["--shell-max"] = "var(--content-max-wide)";
  if (r.frameBreath) vars["--frame-breath"] = r.frameBreath;
  if (r.padBottom) vars["--section-pad-bottom"] = r.padBottom;
  return vars as CSSProperties;
}
