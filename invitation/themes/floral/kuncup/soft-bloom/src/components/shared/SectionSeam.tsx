"use client";

// Jahitan antar-section: karangan bunga (GarlandBunga) yang menumpuk di batas dua
// section — separuh di bawah section atas, separuh di atas section berikutnya —
// jadi bunga seolah tumbuh menyambung, tidak terpotong garis lurus.
// Dirender DI ANTARA section (di luar overflow:hidden) supaya tidak terklip.
// Fallback aman: kalau file tak ada, garland disembunyikan (tanpa error).

import { asset } from "@/lib/assets";

function hide(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

const VARIANTS = [
  { file: "GarlandBunga.webp", maxWidth: 620, flip: false, anim: "swayFrame", dur: 8.5 },
  { file: "GarlandBunga.webp", maxWidth: 560, flip: true, anim: "sway", dur: 9.5 },
  { file: "PembatasBunga.webp", maxWidth: 520, flip: false, anim: "swayFrame", dur: 7.5 },
];

export default function SectionSeam({ index = 0, zIndex = 6 }: { index?: number; zIndex?: number }) {
  const v = VARIANTS[index % VARIANTS.length];
  return (
    <div
      aria-hidden="true"
      className="reveal-scope"
      style={{ position: "relative", height: 0, zIndex, pointerEvents: "none" }}
    >
      <div
        data-enter="soft"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          margin: "0 auto",
          top: 0,
          transform: "translateY(-50%)",
          width: "94%",
          maxWidth: v.maxWidth,
        }}
      >
        <img
          src={asset(v.file)}
          alt=""
          onError={hide}
          className="ambient-anim"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            transform: v.flip ? "scaleX(-1)" : "none",
            transformOrigin: "50% 50%",
            animation: `${v.anim} ${v.dur}s ease-in-out infinite alternate`,
            filter: "drop-shadow(0 6px 14px rgba(58,58,54,0.06))",
          }}
        />
      </div>
    </div>
  );
}
