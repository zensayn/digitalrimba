// src/components/shared/sceneKelir.ts
// Tabel preset Kelir per section (spec §6f). Data murni — tanpa React.
// `y` blencong diukur dari tepi atas viewport; `actorY` adalah posisi puncak aktor.
// Filename dirujuk lewat asset() di KelirScene; yang belum ada disembunyikan
// hideOnError, jadi preset boleh menyebut aset yang lahir di Fase 2.

export interface KelirPreset {
  /** Basename aktor emas tanpa ekstensi, mis. "AktorGunungan". */
  actor?: string;
  /** Skala aktor 0..1 (hero = 1.0, ceplok < 1). */
  actorScale?: number;
  /** Posisi puncak aktor dari tepi atas, mis. "26%". Kosong untuk hero (tancap dari bawah). */
  actorY?: string;
  /** gallery: sprig kecil di empat sudut, bukan satu aktor tengah. */
  actorCorners?: boolean;
  /** Pusat vertikal blencong dari tepi atas, mis. "38%". */
  blencongY: string;
  /** Terang blencong 0..1. */
  blencongBright: number;
  /** Basename bingkai foto opsional, mis. "BingkaiGebyok". */
  frame?: string;
}

export const KELIR: Record<string, KelirPreset> = {
  cover:     { actor: "AktorGunungan",    actorScale: 1.0,                 blencongY: "38%", blencongBright: 0.9 },
  greeting:  { actor: "CeplokSulur",      actorScale: 0.55, actorY: "26%", blencongY: "30%", blencongBright: 0.35 },
  couple:    { actor: "CeplokMelati",     actorScale: 0.42, actorY: "4%",  blencongY: "28%", blencongBright: 0.50, frame: "BingkaiGebyok" },
  lovestory: { actor: "CeplokKawung",     actorScale: 0.50, actorY: "18%", blencongY: "24%", blencongBright: 0.40, frame: "BingkaiTumpal" },
  akad:      { actor: "AktorCandiBentar", actorScale: 1.0,                 blencongY: "44%", blencongBright: 0.75 },
  resepsi:   { actor: "AktorPaduraksa",   actorScale: 1.0,                 blencongY: "42%", blencongBright: 0.75 },
  dresscode: { actor: "CeplokKawung",     actorScale: 0.62, actorY: "30%", blencongY: "32%", blencongBright: 0.40 },
  gallery:   { actor: "MelatiSprig",      actorScale: 0.40, actorCorners: true, blencongY: "30%", blencongBright: 0.35, frame: "BingkaiTumpal" },
  rsvp:      { actor: "CeplokSulur",      actorScale: 0.66, actorY: "24%", blencongY: "28%", blencongBright: 0.40 },
  gift:      { actor: "CeplokMelati",     actorScale: 0.58, actorY: "28%", blencongY: "30%", blencongBright: 0.40 },
  closing:   { actor: "AktorKayon",       actorScale: 1.0,                 blencongY: "88%", blencongBright: 1.0 },
};

export function kelirFor(id: string): KelirPreset | undefined {
  return KELIR[id];
}
