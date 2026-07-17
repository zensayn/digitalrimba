"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * LazyMotion memuat hanya fitur animasi DOM (~17 KB) alih-alih runtime
 * framer-motion penuh. EnvelopeOverlay memakai `m` (di-alias sebagai `motion`)
 * yang mengambil fiturnya dari provider ini — `m` tidak beranimasi tanpa
 * konteks LazyMotion. Mode non-strict, jadi komponen `motion` penuh lain
 * (MusicPlayer, KelirScene, GiltSweep) tetap bekerja normal di dalamnya.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
