"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * LazyMotion memuat hanya fitur animasi DOM (~17 KB) alih-alih runtime
 * framer-motion penuh (~34 KB+). Seluruh komponen memakai `m` (di-alias
 * sebagai `motion` di tiap file) yang mengambil fiturnya dari provider ini —
 * pastikan semua elemen motion dirender di dalam wrapper ini, karena `m`
 * tidak beranimasi tanpa konteks LazyMotion.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
