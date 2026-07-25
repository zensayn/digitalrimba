"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

// PRNG deterministik (pure) — bukan Math.random (impure, dilarang saat render &
// bikin mismatch SSR). Sebaran bintang jadi stabil antar-render & server↔klien.
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Taburan "fairy dust" — titik emas kecil yang berkelip & mengapung lambat.
// Murni CSS/Framer (tanpa gambar). Posisi deterministik dari indeks.
export default function Stardust({
  count = 28,
  zIndex = 2,
  className,
}: {
  count?: number;
  zIndex?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: seeded(i + 1) * 100,
        top: seeded(i + 101) * 100,
        size: 1.5 + seeded(i + 201) * 2.5,
        delay: seeded(i + 301) * 4,
        dur: 3 + seeded(i + 401) * 4,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex }}
    >
      {dots.map((d) => (
        <motion.span
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "var(--gold-light)",
            boxShadow: "0 0 6px var(--gold-light)",
          }}
          initial={{ opacity: reduce ? 0.5 : 0.15 }}
          animate={
            reduce
              ? { opacity: 0.5 }
              : { opacity: [0.15, 0.9, 0.15], y: [0, -8, 0] }
          }
          transition={reduce ? undefined : { duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
