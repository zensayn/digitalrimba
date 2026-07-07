import type { ParallaxLayer } from "./ParallaxScene";

/**
 * Builds the standard dense painterly frame for a section (spec §5g).
 *
 * Centralising the layer stack here keeps every section framed identically,
 * which is what makes the flow read as continuous from one section to the next.
 * The array order is also the "assembled one-by-one" build order — structure
 * first (columns → top corners → bottom corners → base), scattered detail last
 * — and each piece is given an explicit `enterDelay` so the choreography is
 * deterministic instead of relying on incidental array position.
 *
 * NOTE: the Scatter & Base assets (§5f) may not exist yet; ParallaxScene hides
 * any layer whose image 404s, so passing them before upload degrades gracefully.
 */

export interface SceneFrameOptions {
  /** CDN prefix, e.g. `${CDN}/adat/kenangan/warm-narrative`. */
  base: string;
  /** Full src of the opaque L0 background (required). */
  bg: string;
  /** Full src of an optional L1 focus layer (Arch / Canopy). */
  arch?: string;
  /** Alternate between v1 / v2 kit pieces to avoid a copy-paste look. */
  variant?: 0 | 1;
  /** "full" = event/hero sections; "light" = text-heavy sections (Gift/RSVP). */
  density?: "full" | "light";
  /** Ground the scene with the low base clusters. Default true. */
  base_clusters?: boolean;
  /** Add a full-width top drape (for sections that carry the signature drape). */
  drape?: boolean;
  /**
   * How the bottom band meets the next section. "overhang" lifts the bottom
   * corners + base clusters out of the scene's clipping and hangs them over
   * the seam, so one garland lies across the boundary instead of two clipped
   * strips butting together. "contained" (default) keeps the current clipped
   * behaviour — use it for the last section, where nothing follows.
   */
  seam?: "overhang" | "contained";
  /**
   * Render the top corner pieces (and drape). Turn off for sections that sit
   * directly below an overhang seam — the garland hanging from the section
   * above already owns that zone, and doubling it up reads as clutter.
   * Default true.
   */
  topFrame?: boolean;
  /**
   * Opacity multiplier (0–1) applied to all bottom ornaments:
   * bottom corners, base center, base clusters, and scatter pieces.
   * 1 = full opacity (default). Lower values make the bottom band more subtle.
   */
  bottomOpacity?: number;
}

/**
 * Deterministic scatter placements — no randomness, so SSR and client match.
 * `depth: 0` → no scroll parallax (perf); ambient wind still animates them.
 * First 4 are used at "full" density, first 3 at "light".
 */
const SCATTER: ReadonlyArray<{
  asset: "SakuraFloretA" | "SakuraFloretB" | "SakuraBudTwig" | "SakuraLeafSprig";
  box: NonNullable<ParallaxLayer["box"]>;
  opacity: number;
}> = [
  { asset: "SakuraFloretA", opacity: 0.8, box: { top: "22%", left: "2%", width: "13%" } },
  { asset: "SakuraLeafSprig", opacity: 0.7, box: { top: "34%", right: "3%", width: "12%", flipX: true } },
  { asset: "SakuraFloretB", opacity: 0.82, box: { bottom: "32%", right: "4%", width: "14%" } },
  { asset: "SakuraBudTwig", opacity: 0.75, box: { bottom: "26%", left: "4%", width: "11%", flipX: true } },
];

/**
 * Skala global untuk semua enterDelay koreografi frame. 1 = timeline asli
 * (piece terakhir masuk ~1.66s); makin kecil makin cepat semua piece muncul
 * begitu user tiba di section-nya. Durasi animasinya sendiri tidak berubah.
 * Ubah SATU angka ini untuk mengatur cepat/lambatnya kemunculan bunga.
 */
const DELAY_SCALE = 0.55;
const d = (s: number) => Math.round(s * DELAY_SCALE * 100) / 100;

export function sceneFrame({
  base,
  bg,
  arch,
  variant = 0,
  density = "full",
  base_clusters = true,
  drape = false,
  seam = "contained",
  topFrame = true,
  bottomOpacity = 0.71,
}: SceneFrameOptions): ParallaxLayer[] {
  /** Clamp helper so callers can't accidentally pass values outside [0, 1]. */
  const bo = Math.min(1, Math.max(0, bottomOpacity));
  const src = (name: string) => `${base}/${name}.webp`;
  const light = density === "light";
  const cornerL = variant === 1 ? "SakuraCornerL2" : "SakuraCornerL";
  const cornerR = variant === 1 ? "SakuraCornerR2" : "SakuraCornerR";
  const scatterCount = light ? 3 : 4;
  // Overhang: the bottom band escapes the scene's clipping and straddles the
  // seam — pushed further past the edge so a real chunk hangs into the next
  // section, reading as one garland lying over the boundary. Offsets use svh,
  // not %, so the hang distance stays constant on tall (multi-viewport)
  // sections where a % of section height would swing the band way off target.
  const over = seam === "overhang";

  const layers: ParallaxLayer[] = [
    // 1 — atmosphere + focus
    { src: bg, depth: 0.03, zIndex: 0 },
    ...(arch ? [{ src: arch, depth: 0.07, opacity: 0.96, zIndex: 1 } as ParallaxLayer] : []),
    ...(drape && topFrame
      ? [{ src: src("SakuraDrapeTop"), depth: 0.07, opacity: 0.88, zIndex: 1, enterDuration: 1.6, enterDelay: d(0.35), overhang: true, box: { top: "-1svh", left: "0", width: "100%", enterX: 0, enterY: -80 } } as ParallaxLayer]
      : []),

    // 2 — side columns (flank the content)
    { src: src("SakuraColumnL"), depth: 0.08, opacity: light ? 0.6 : 0.8, zIndex: 1, enterDelay: d(0.15), box: { top: "-1%", left: "-14%", height: "102svh", enterY: 0 } },
    { src: src("SakuraColumnR"), depth: 0.08, opacity: light ? 0.6 : 0.8, zIndex: 1, enterDelay: d(0.25), box: { top: "-1%", right: "-14%", height: "102svh", enterY: 0 } },

    // 3 — top corners (drape inward; skipped under an overhang seam from above).
    // Overhang like the bottom band: they cross the top boundary, so keeping
    // them clipped would chop them flat against the previous section.
    ...(topFrame
      ? [
          { src: src("SakuraTopL"), depth: 0.10, opacity: 0.8, zIndex: 2, enterDelay: d(0.4), overhang: true, box: { top: "-3svh", left: "-5%", width: "33%" } } as ParallaxLayer,
          { src: src("SakuraTopR"), depth: 0.11, opacity: 0.8, zIndex: 2, enterDelay: d(0.5), overhang: true, box: { top: "-3svh", right: "-5%", width: "33%" } } as ParallaxLayer,
        ]
      : []),

    // 4 — bottom corners (grow upward; hang over the seam when overhanging)
    { src: src(cornerL), depth: 0.11, opacity: 0.85 * bo, zIndex: 2, enterDelay: d(0.65), overhang: over, box: { bottom: over ? "-2svh" : "0%", left: "-7%", width: "42%" } },
    { src: src(cornerR), depth: 0.12, opacity: 0.85 * bo, zIndex: 2, enterDelay: d(0.78), overhang: over, box: { bottom: over ? "-2svh" : "0%", right: "-7%", width: "42%" } },
  ];

  // 5 — grounding base band (static + vertical bob; large images, no parallax)
  if (base_clusters) {
    layers.push(
      { src: src("SakuraBaseCenter"), depth: 0, opacity: 0.85 * bo, zIndex: 2, enterDelay: d(0.95), wind: { motion: "float" }, overhang: over, box: { bottom: over ? "-4svh" : "0%", left: "18%", width: "64%", enterY: 40 } },
    );
    if (!light) {
      layers.push(
        { src: src("SakuraBaseClusterL"), depth: 0, opacity: 0.9 * bo, zIndex: 3, enterDelay: d(1.05), wind: { motion: "float" }, overhang: over, box: { bottom: over ? "-5svh" : "0%", left: "-8%", width: "60%", enterY: 40 } },
        { src: src("SakuraBaseClusterR"), depth: 0, opacity: 0.9 * bo, zIndex: 3, enterDelay: d(1.15), wind: { motion: "float" }, overhang: over, box: { bottom: over ? "-5svh" : "0%", right: "-8%", width: "60%", enterY: 40 } },
      );
    }
  }

  // 6 — scattered small pieces (lock in the density, revealed last; static + ambient)
  for (let i = 0; i < scatterCount; i++) {
    const s = SCATTER[i];
    layers.push({
      src: src(s.asset),
      depth: 0,
      opacity: (light ? s.opacity * 0.7 : s.opacity) * bo,
      zIndex: 2,
      enterDelay: d(1.3 + i * 0.12),
      box: s.box,
    });
  }

  return layers;
}
