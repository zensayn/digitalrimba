"use client";

import { asset } from "@/lib/assets";

const FLOWERS = [
  asset("BungaJatuh1.webp"),
  asset("BungaJatuh2.webp"),
  asset("BungaJatuh3.webp"),
];

function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function FallingFlowers({ count = 14, zIndex = 3 }: { count?: number; zIndex?: number }) {
  const petals = Array.from({ length: count }, (_, i) => {
    const sway = Math.round(18 + sr(i * 23 + 6) * 42);
    const rotStart = Math.round(sr(i * 11 + 5) * 360);
    const animName = `pf_${i}`;
    return {
      id: i,
      src: FLOWERS[i % FLOWERS.length],
      left: `${(sr(i * 7 + 1) * 92 + 2).toFixed(2)}%`,
      width: Math.round(22 + sr(i * 13 + 2) * 30),
      duration: `${(7 + sr(i * 17 + 3) * 9).toFixed(1)}s`,
      delay: `${-(sr(i * 19 + 4) * 14).toFixed(1)}s`,
      animName,
      keyframes: `@keyframes ${animName}{0%{transform:translateY(-80px) translateX(0) rotate(${rotStart}deg);opacity:0}8%{opacity:.78}30%{transform:translateY(28vh) translateX(${sway}px) rotate(${rotStart + 110}deg)}60%{transform:translateY(60vh) translateX(${Math.round(-sway * 0.55)}px) rotate(${rotStart + 235}deg)}92%{opacity:.6}100%{transform:translateY(112vh) translateX(${Math.round(sway * 0.3)}px) rotate(${rotStart + 360}deg);opacity:0}}`,
    };
  });

  const css = petals.map((p) => p.keyframes).join("");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {petals.map((p) => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: p.left,
            width: p.width,
            height: "auto",
            zIndex,
            pointerEvents: "none",
            opacity: 0,
            animationName: p.animName,
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}
    </>
  );
}
