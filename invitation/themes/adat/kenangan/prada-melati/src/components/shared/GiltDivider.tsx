"use client";

import { useMotionValue } from "framer-motion";
import type { CSSProperties } from "react";

import { asset } from "@/lib/assets";
import { useSceneProgress } from "./scene-progress";
import GiltSweep from "./GiltSweep";

// Pembatas bergambar — pengganti `.gold-divider` garis polos. Tiga varian
// dirotasi per MAKNA section (spec pengayaan §2), bukan satu motif berulang:
//   lung    → sulur netral (default: greeting, gallery, gift, rsvp, cover…)
//   truntum → "cinta tumbuh kembali" (couple, lovestory)
//   modang  → lidah-api paling hierat (akad/resepsi, rundown)
// Emas → ikut kilau lewat GiltSweep + progres scene dari context. Di luar
// KelirScene context null → sapuan membeku (aman). 404 disembunyikan GiltSweep.
const PEMBATAS = {
  lung: "PembatasLung",
  truntum: "PembatasTruntum",
  modang: "PembatasModang",
} as const;

export type GiltDividerVariant = keyof typeof PEMBATAS;

export default function GiltDivider({
  variant = "lung",
  width = 168,
  className,
  style,
}: {
  variant?: GiltDividerVariant;
  /** Lebar render px; tinggi mengikuti rasio 6:1 aset (1200×200). */
  width?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ctx = useSceneProgress();
  const idle = useMotionValue(0.5);
  const progress = ctx ?? idle;

  return (
    <GiltSweep
      src={asset(PEMBATAS[variant])}
      progress={progress}
      className={className}
      // marginLeft/Right (bukan shorthand) agar margin vertikal dari className
      // caller — mis. `my-4` — tak ikut ter-reset.
      style={{ width, aspectRatio: "6 / 1", marginLeft: "auto", marginRight: "auto", ...style }}
      // Selaras dengan aktor: redam sedikit ke sogan-emas (lihat KelirScene).
      imgStyle={{ filter: "saturate(0.82) brightness(0.92)" }}
    />
  );
}
