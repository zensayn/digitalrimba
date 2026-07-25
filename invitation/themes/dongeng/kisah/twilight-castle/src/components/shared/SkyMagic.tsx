"use client";

// Elemen langit magis untuk section berlangit (RoyalGate world & Closing):
// lentera terbang melayang NAIK dan bintang jatuh melesat diagonal — loop.
// Framer Motion (mulus) + fallback aman + reduced-motion (statis/sembunyi).

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// PRNG deterministik (pure) — bukan Math.random (impure & mismatch SSR).
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function SkyMagic({
  lanterns = 5,
  stars = 3,
  zIndex = 2,
}: {
  lanterns?: number;
  stars?: number;
  zIndex?: number;
}) {
  const reduce = useReducedMotion();

  const lanternList = useMemo(
    () =>
      Array.from({ length: lanterns }, (_, i) => ({
        id: i,
        left: 6 + seeded(i + 1) * 84,
        size: 26 + seeded(i + 11) * 26,
        dur: 14 + seeded(i + 21) * 10,
        delay: seeded(i + 31) * 12,
        drift: (seeded(i + 41) - 0.5) * 40,
      })),
    [lanterns],
  );

  const starList = useMemo(
    () =>
      Array.from({ length: stars }, (_, i) => ({
        id: i,
        top: 4 + seeded(i + 51) * 30,
        left: 30 + seeded(i + 61) * 60,
        size: 60 + seeded(i + 71) * 60,
        dur: 1.1 + seeded(i + 81) * 0.7,
        repeatDelay: 6 + seeded(i + 91) * 10,
        delay: seeded(i + 101) * 8,
      })),
    [stars],
  );

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex }}>
      {/* Lentera terbang — melayang naik */}
      {lanternList.map((l) => (
        <motion.div
          key={`lan-${l.id}`}
          style={{ position: "absolute", left: `${l.left}%`, bottom: 0, width: l.size }}
          initial={reduce ? { y: "-30vh", opacity: 0.85 } : { y: "12vh", opacity: 0 }}
          animate={
            reduce
              ? { y: "-30vh", opacity: 0.85 }
              : { y: "-120vh", x: [0, l.drift, 0], opacity: [0, 0.9, 0.9, 0] }
          }
          transition={
            reduce
              ? undefined
              : { duration: l.dur, delay: l.delay, repeat: Infinity, ease: "linear", times: [0, 0.12, 0.85, 1] }
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("LenteraTerbang.webp")}
            alt=""
            onError={hideBrokenImage}
            style={{ display: "block", width: "100%", height: "auto", filter: "drop-shadow(0 0 10px rgba(232,200,116,0.5))" }}
          />
        </motion.div>
      ))}

      {/* Bintang jatuh — melesat diagonal (sesekali) */}
      {!reduce &&
        starList.map((s) => (
          <motion.div
            key={`star-${s.id}`}
            style={{ position: "absolute", top: `${s.top}%`, left: `${s.left}%`, width: s.size }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: [-10, -160], y: [-6, 96], opacity: [0, 1, 0] }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, repeatDelay: s.repeatDelay, ease: "easeIn" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("BintangJatuh.webp")}
              alt=""
              onError={hideBrokenImage}
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </motion.div>
        ))}
    </div>
  );
}
