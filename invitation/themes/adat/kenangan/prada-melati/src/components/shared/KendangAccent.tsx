"use client";

import { useMotionValue } from "framer-motion";
import type { CSSProperties } from "react";

import { asset } from "@/lib/assets";
import { useSceneProgress } from "./scene-progress";
import GiltSweep from "./GiltSweep";

// Kendang emas horizontal — aksen gamelan (dipakai di Rundown sebagai pembatas
// bertema di bawah judul). Ikut kilau scene lewat GiltSweep + progres (sama
// mekanisme GiltDivider). Aset 1619×971 → rasio 5:3.
export default function KendangAccent({
  width = 150,
  className,
  style,
}: {
  /** Lebar render px; tinggi ikut rasio 5:3. */
  width?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ctx = useSceneProgress();
  const idle = useMotionValue(0.5);
  const progress = ctx ?? idle;

  return (
    <GiltSweep
      src={asset("KendangPrada")}
      progress={progress}
      className={className}
      style={{ width, aspectRatio: "5 / 3", marginLeft: "auto", marginRight: "auto", ...style }}
      imgStyle={{ filter: "saturate(0.82) brightness(0.92)" }}
    />
  );
}
