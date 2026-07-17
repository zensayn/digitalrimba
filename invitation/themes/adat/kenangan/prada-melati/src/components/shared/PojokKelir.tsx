"use client";

import { motion, useReducedMotion, type MotionValue } from "framer-motion";

import { asset } from "@/lib/assets";
import GiltSweep from "./GiltSweep";

// Ornamen sudut ambient — satu aset sudut (kiri-atas) dicermin ke empat sudut
// lewat CSS scaleX/scaleY (spec pengayaan §5), bergoyang halus. Emas → ikut
// kilau via GiltSweep + progres scene. Duduk di zIndex 3: di atas aktor, di
// bawah pinggiran/hem/konten, jadi flourish menyelinap di bawah selvedge.
export type PojokVariant = "sulur" | "praba";

const CORNERS = [
  { pos: { top: 0, left: 0 }, flip: undefined },
  { pos: { top: 0, right: 0 }, flip: "scaleX(-1)" },
  { pos: { bottom: 0, right: 0 }, flip: "scaleX(-1) scaleY(-1)" },
  { pos: { bottom: 0, left: 0 }, flip: "scaleY(-1)" },
] as const;

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
      {CORNERS.map((c, i) => (
        <div key={i} style={{ position: "absolute", ...c.pos, width: size, aspectRatio: "1 / 1", transform: c.flip }}>
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
