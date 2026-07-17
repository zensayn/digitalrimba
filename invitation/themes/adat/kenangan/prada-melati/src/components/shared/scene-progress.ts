"use client";

import { createContext, useContext } from "react";
import type { MotionValue } from "framer-motion";

/**
 * Progres scroll section (0..1) yang diukur KelirScene lewat useScroll. Dibagikan
 * ke konten section sehingga ornamen emas di dalam konten (GiltDivider, GiltTitle,
 * PojokKelir) ikut kilau dengan sapuan yang SAMA seperti aktor — satu mekanisme
 * kilau, bukan dua (spec pengayaan §12). Null bila komponen dipakai di luar
 * KelirScene → konsumen jatuh ke MotionValue diam (kilau membeku, tetap aman).
 */
export const SceneProgressContext = createContext<MotionValue<number> | null>(null);

export function useSceneProgress() {
  return useContext(SceneProgressContext);
}
