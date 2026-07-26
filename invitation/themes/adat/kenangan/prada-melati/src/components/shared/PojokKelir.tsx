"use client";

import { motion, useReducedMotion, type MotionValue } from "framer-motion";

import { asset } from "@/lib/assets";
import GiltSweep from "./GiltSweep";

// Ornamen sudut ambient — satu aset sudut (kiri-atas) dicermin ke empat sudut
// lewat CSS scaleX/scaleY (spec pengayaan §5), bergoyang halus. Emas → ikut
// kilau via GiltSweep + progres scene. Duduk di zIndex 3: di atas aktor, di
// bawah pinggiran/hem/konten, jadi flourish menyelinap di bawah selvedge.
export type PojokVariant = "sulur" | "praba";

// Nilai angka = px (React menambah "px" untuk properti non-unitless). Dua sudut
// BAWAH tidak lagi diukur dari dasar scene melainkan dari garis atas hem — lihat
// bottomFor(): kalau tetap -3.5px dari dasar, badan pojok (tinggi ≈125px) jatuh
// utuh di dalam pita hem (130px) dan habis terpotong.
const POS = [
  { top: -3.5, left: -15 },
  { top: -3.5, right: -15 },
  { right: -15 },
  { left: -15 },
] as const;

/** Sudut bawah duduk 3.5px "tenggelam" di bawah garis atas hem — nudge yang sama
 *  seperti versi lama, hanya titik acuannya pindah dari dasar scene ke atas hem. */
const bottomFor = (hemH: string) => `calc(${hemH} - 3.5px)`;

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
  skipTop = false,
  bottomInset = "0px",
}: {
  variant: PojokVariant;
  progress: MotionValue<number>;
  /** Lebar tiap sudut relatif lebar scene. */
  size?: string;
  /** Lewati dua sudut atas (indeks 0 & 1) — mis. closing yang zona atasnya
   *  ingin dibiarkan lengang. Sudut bawah tetap tampil. */
  skipTop?: boolean;
  /** Panjang CSS berisi TINGGI PITA HEM (diisi KelirScene). Dipakai dua kali:
   *  (1) garis dasar sudut bawah — mereka duduk di atas hem, bukan di dasar
   *      scene, supaya tak tenggelam di dalam pita; dan
   *  (2) batas clip container sebagai jaring pengaman, kalau-kalau ornamen
   *      sudut lebih tinggi dari ruang yang tersisa di atas hem. */
  bottomInset?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const src = asset(variant === "praba" ? "PojokPraba" : "PojokSulur");

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        clipPath: `inset(0 0 ${bottomInset} 0)`,
      }}
    >
      {POS.map((pos, i) => (
        skipTop && (i === 0 || i === 1) ? null : (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            // Sudut bawah (indeks 2 & 3) diangkat ke garis atas hem.
            ...(i >= 2 ? { bottom: bottomFor(bottomInset) } : null),
            width: size,
            aspectRatio: "1 / 1",
            transform: TRANSFORMS[variant][i],
          }}
        >
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
        )
      ))}
    </div>
  );
}
