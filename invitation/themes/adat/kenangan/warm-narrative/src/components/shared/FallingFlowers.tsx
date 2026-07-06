"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;
const FLOWERS = [
  `${BASE}/BungaJatuh1.webp`,
  `${BASE}/BungaJatuh2.webp`,
  `${BASE}/BungaJatuh3.webp`,
  `${BASE}/BungaJatuh4.webp`,
  `${BASE}/BungaJatuh5.webp`,
  `${BASE}/BungaJatuh6.webp`,
];

function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function FallingFlowers({ count = 20, zIndex = 3 }: { count?: number; zIndex?: number }) {
  // Jeda 20 animasi kelopak saat section pemiliknya di luar viewport — sama
  // seperti .scene-paused di ParallaxScene, loop infinite tak perlu terus
  // membakar frame setelah user scroll melewatinya.
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "20% 0px 20% 0px" });

  const petals = Array.from({ length: count }, (_, i) => {
    const sway = Math.round(18 + sr(i * 23 + 6) * 42);
    const rotStart = Math.round(sr(i * 11 + 5) * 360);
    const animName = `pf_${i}`;
    return {
      id: i,
      src: FLOWERS[i % FLOWERS.length],
      left: `${(sr(i * 7 + 1) * 92 + 2).toFixed(2)}%`,
      width: Math.round(26 + sr(i * 13 + 2) * 38),
      duration: `${(6 + sr(i * 17 + 3) * 9).toFixed(1)}s`,
      delay: `${-(sr(i * 19 + 4) * 14).toFixed(1)}s`,
      animName,
      keyframes: `@keyframes ${animName}{0%{transform:translateY(-80px) translateX(0) rotate(${rotStart}deg);opacity:0}8%{opacity:.82}30%{transform:translateY(28vh) translateX(${sway}px) rotate(${rotStart + 110}deg)}60%{transform:translateY(60vh) translateX(${Math.round(-sway * 0.55)}px) rotate(${rotStart + 235}deg)}92%{opacity:.65}100%{transform:translateY(112vh) translateX(${Math.round(sway * 0.3)}px) rotate(${rotStart + 360}deg);opacity:0}}`,
    };
  });

  const css = petals.map((p) => p.keyframes).join("");

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex, pointerEvents: "none" }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {petals.map((p) => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: p.left,
            width: p.width,
            height: "auto",
            opacity: 0,
            animationName: p.animName,
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            animationPlayState: inView ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}
