"use client";

import { motion, useReducedMotion, type MotionValue } from "framer-motion";

import { asset } from "@/lib/assets";
import GiltSweep from "./GiltSweep";

// Ornamen sudut ambient — satu aset sudut (kiri-atas) dicermin ke empat sudut
// lewat CSS scaleX/scaleY (spec pengayaan §5), bergoyang halus. Emas → ikut
// kilau via GiltSweep + progres scene. Duduk di zIndex 3: di atas aktor, di
// bawah pinggiran/hem/konten, jadi flourish menyelinap di bawah selvedge.
export type PojokVariant = "sulur" | "praba";

const POS = [
  { top: -3, left: -7 },
  { top: -3, right: -7 },
  { bottom: 0, right: -7 },
  { bottom: 0, left: -7 },
] as const;

// Orientasi per varian, urut kiri-atas → kanan-atas → kanan-bawah → kiri-bawah.
// - sulur: dicermin dari aset kiri-atas.
// - praba: base kiri-atas diputar 90° (terbukti pas), lalu DICERMIN ke sudut lain
//   — kanan = flip horizontal (scaleX), bawah = flip vertikal (scaleY). scale di
//   depan rotate: mencermin hasil-akhir kiri-atas, bukan asetnya.
const TRANSFORMS: Record<PojokVariant, readonly (string | undefined)[]> = {
  sulur: [undefined, "scaleX(-1)", "scaleX(-1) scaleY(-1)", "scaleY(-1)"],
  praba: [
    "rotate(90deg)",                       // kiri-atas (base)
    "scaleX(-1) rotate(90deg)",            // kanan-atas  = flip H dari kiri-atas
    "scaleX(-1) scaleY(-1) rotate(90deg)", // kanan-bawah = flip H dari kiri-bawah
    "scaleY(-1) rotate(90deg)",            // kiri-bawah  = flip V dari kiri-atas
  ],
};

export default function PojokKelir({
  variant,
  progress,
  size = "32%",
}: {
  variant: PojokVariant;
  progress: MotionValue<number>;
  /** Lebar tiap sudut relatif lebar scene. */
  size?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const src = asset(variant === "praba" ? "PojokPraba" : "PojokSulur");

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
      {POS.map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos, width: size, aspectRatio: "1 / 1", transform: TRANSFORMS[variant][i] }}>
          {/* Mirror di div luar; sway (rotate) di div dalam → transform tak bentrok. */}
          <motion.div
            style={{ width: "100%", height: "100%" }}
            animate={reduced ? undefined : { rotate: [-0.6, 0.6, -0.6] }}
            transition={reduced ? undefined : { duration: 9, ease: "easeInOut", repeat: Infinity, delay: i * 0.5 }}
          >
            <GiltSweep
              src={src}
              progress={progress}
              style={{ width: "100%", height: "100%" }}
              imgStyle={{ filter: "saturate(0.82) brightness(0.92)", opacity: 0.9 }}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
