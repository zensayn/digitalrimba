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
  /** Basename hem band di tepi bawah, mis. "HemSulur". Kosong → "TumpalBand". */
  hem?: string;
  /** Aktor hero menggantung dari tepi atas (Kayon terbalik) → anchor top:0, bukan 5%. */
  actorFromTop?: boolean;
  /** Ornamen sudut ambient (PojokKelir): "sulur" | "praba", dicermin 4 sudut.
   *  Kosong → tak ada. Dilewati di section hero & yang sudah ramai sudutnya. */
  pojok?: "sulur" | "praba";
  /** Tinggi zona aman atas (svh) yang harus dilewati konten agar tak menimpa
   *  aktor solid (spec tata-letak §2.1). Diisi hanya untuk ceplok/medallion
   *  yang menutupi tengah-atas. Hero-arch (akad/resepsi) & section bottom-align
   *  (cover/greeting/closing) dibiarkan kosong → fallback padding kecil
   *  SceneContent + align yang menegakkan zonanya. Rumus: actorY + tinggi ceplok. */
  safeTopSvh?: number;
}

export const KELIR: Record<string, KelirPreset> = {
  cover:     { actor: "AktorGunungan",    actorScale: 1.0,                 blencongY: "38%", blencongBright: 0.9 },
  greeting:  { actor: "CeplokSulur",      actorScale: 0.44, actorY: "10%", blencongY: "30%", blencongBright: 0.35, hem: "HemSulur", pojok: "praba", safeTopSvh: 36 },
  couple:    { actor: "CeplokMelati",     actorScale: 0.34, actorY: "3%",  blencongY: "28%", blencongBright: 0.50, frame: "BingkaiGebyok", hem: "HemMelati", pojok: "sulur", safeTopSvh: 20 },
  lovestory: { actor: "CeplokKawung",     actorScale: 0.42, actorY: "9%",  blencongY: "24%", blencongBright: 0.40, frame: "BingkaiTumpal", hem: "HemKawung", pojok: "praba", safeTopSvh: 34 },
  akad:      { actor: "AktorCandiBentar", actorScale: 1.0,                 blencongY: "44%", blencongBright: 0.75 },
  resepsi:   { actor: "AktorPaduraksa",   actorScale: 1.0,                 blencongY: "42%", blencongBright: 0.75 },
  dresscode: { actor: "CeplokKawung",     actorScale: 0.44, actorY: "10%", blencongY: "32%", blencongBright: 0.40, hem: "HemKawung", pojok: "sulur", safeTopSvh: 36 },
  gallery:   { actor: "MelatiSprig",      actorScale: 0.40, actorCorners: true, blencongY: "30%", blencongBright: 0.35, frame: "BingkaiTumpal", hem: "HemMelati" },
  rsvp:      { actor: "CeplokSulur",      actorScale: 0.44, actorY: "10%", blencongY: "28%", blencongBright: 0.40, hem: "HemSulur", pojok: "sulur", safeTopSvh: 36 },
  gift:      { actor: "CeplokMelati",     actorScale: 0.44, actorY: "10%", blencongY: "30%", blencongBright: 0.40, hem: "HemMelati", pojok: "praba", safeTopSvh: 36 },
  rundown:   { actor: "CeplokKawung",     actorScale: 0.44, actorY: "10%", blencongY: "30%", blencongBright: 0.42, hem: "HemKawung", pojok: "praba", safeTopSvh: 36 },
  turut:     { actor: "CeplokSulur",      actorScale: 0.44, actorY: "10%", blencongY: "30%", blencongBright: 0.40, hem: "HemSulur", pojok: "sulur", safeTopSvh: 36 },
  // AktorKayon hero menggantung dari atas (top:0, height 56svh). safeTopSvh 56
  // mendorong konten ke bawah tip-nya supaya nama/quote/hashtag tak tertimpa &
  // terbaca (spec tata-letak §2). Section tumbuh menampung; scroll tipis di akhir.
  closing:   { actor: "AktorKayon",       actorScale: 1.0, actorFromTop: true, blencongY: "88%", blencongBright: 1.0, pojok: "praba", safeTopSvh: 56 },
};

export function kelirFor(id: string): KelirPreset {
  const preset = KELIR[id];
  if (!preset) throw new Error(`kelirFor: preset Kelir tidak dikenal "${id}"`);
  return preset;
}
