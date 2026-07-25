"use client";

// Jahitan antar-section: pembatas ornamen emas (PembatasEmas) yang menumpuk di
// batas dua section — separuh di bawah section atas, separuh di atas berikutnya —
// jadi terasa menyambung, bukan terpotong garis lurus. Dua lapis:
//   1. Pita feather CSS gelap → melarutkan beda warna latar tepat di garis batas.
//   2. Pembatas emas selebar sebagian kolom di atasnya.
// Dirender DI ANTARA section (di luar overflow:hidden) supaya tidak terklip.
// Fallback aman: kalau file tak ada, pembatas disembunyikan (tanpa error).

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Tiap jahitan bergiliran arah/durasi supaya batas antar-section tidak seragam.
const VARIANTS = [
  { flip: false, anim: "swayFrame", dur: 8.5 },
  { flip: true, anim: "sway", dur: 9.5 },
  { flip: false, anim: "swayFrame", dur: 7.5 },
];

export default function SectionSeam({ index = 0, zIndex = 6 }: { index?: number; zIndex?: number }) {
  const v = VARIANTS[index % VARIANTS.length];
  return (
    <div
      aria-hidden="true"
      className="reveal-scope"
      style={{ position: "relative", height: 0, zIndex, pointerEvents: "none" }}
    >
      {/* Pita feather gelap: pekat tepat di garis batas lalu memudar ke dua arah
          → beda warna latar section larut duluan, ornamen di atasnya mempermanis. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 96,
          transform: "translateY(-50%)",
          background: `linear-gradient(to bottom,
            rgba(20,16,36,0) 0%,
            rgba(20,16,36,0.7) 40%,
            rgba(20,16,36,0.7) 60%,
            rgba(20,16,36,0) 100%)`,
        }}
      />

      {/* Pembatas emas — di tengah kolom */}
      <div
        data-enter="soft"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("PembatasEmas.webp")}
          alt=""
          onError={hideBrokenImage}
          className="ambient-anim"
          style={{
            display: "block",
            width: "min(60%, 260px)",
            height: "auto",
            transform: v.flip ? "scaleX(-1)" : "none",
            transformOrigin: "50% 50%",
            animation: `${v.anim} ${v.dur}s ease-in-out infinite alternate`,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
}
