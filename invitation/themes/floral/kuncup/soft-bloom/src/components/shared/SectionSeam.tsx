"use client";

// Jahitan antar-section: karangan bunga (GarlandBunga) yang menumpuk di batas dua
// section — separuh di bawah section atas, separuh di atas section berikutnya —
// jadi bunga seolah tumbuh menyambung, tidak terpotong garis lurus.
// Tiga lapis supaya batas tertutup SELEBAR kolom (bukan hanya tengah):
//   1. Pita feather CSS full-width → melarutkan beda warna latar tepat di garis batas.
//   2. Kluster bunga sudut di tepi kiri & kanan (SudutBunga/SudutBunga2) → menutup
//      ujung garis yang dulu masih terlihat di luar jangkauan garland tengah.
//   3. Garland tengah (seperti semula).
// Dirender DI ANTARA section (di luar overflow:hidden) supaya tidak terklip.
// Fallback aman: kalau file tak ada, gambar disembunyikan (tanpa error).

import { asset } from "@/lib/assets";

function hide(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

// Tiap jahitan bergiliran ganti komposisi supaya batas antar-section tidak seragam.
const VARIANTS = [
  {
    center: { file: "GarlandBunga.webp", maxWidth: 620, flip: false, anim: "swayFrame", dur: 8.5 },
    left:   { file: "SudutBunga.webp",  flip: false, anim: "swayAlt",  dur: 7 },
    right:  { file: "SudutBunga2.webp", flip: true,  anim: "swaySoft", dur: 8 },
  },
  {
    center: { file: "GarlandBunga.webp", maxWidth: 560, flip: true, anim: "sway", dur: 9.5 },
    left:   { file: "SudutBunga2.webp", flip: false, anim: "swaySoft", dur: 7.5 },
    right:  { file: "SudutBunga.webp",  flip: true,  anim: "swayAlt",  dur: 8.5 },
  },
  {
    center: { file: "PembatasBunga.webp", maxWidth: 520, flip: false, anim: "swayFrame", dur: 7.5 },
    left:   { file: "SudutBunga.webp",  flip: false, anim: "sway",     dur: 8 },
    right:  { file: "SudutBunga2.webp", flip: true,  anim: "swayAlt",  dur: 7 },
  },
];

const EDGE_WIDTH = "clamp(96px, 30vw, 150px)";

export default function SectionSeam({ index = 0, zIndex = 6 }: { index?: number; zIndex?: number }) {
  const v = VARIANTS[index % VARIANTS.length];
  return (
    <div
      aria-hidden="true"
      className="reveal-scope"
      style={{ position: "relative", height: 0, zIndex, pointerEvents: "none" }}
    >
      {/* Pita feather: sapuan kertas lembut selebar kolom, pekat tepat di garis
          batas lalu memudar ke dua arah → beda warna latar section larut duluan,
          bunga di atasnya tinggal mempermanis. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 96,
          transform: "translateY(-50%)",
          background: `linear-gradient(to bottom,
            rgba(253,252,250,0) 0%,
            rgba(253,252,250,0.85) 40%,
            rgba(253,252,250,0.85) 60%,
            rgba(253,252,250,0) 100%)`,
        }}
      />

      {/* Kluster tepi kiri — pangkal menempel tepi, goyang dari pangkalnya */}
      <div
        data-enter="left"
        style={{
          position: "absolute",
          left: "-6%",
          top: 0,
          transform: "translateY(-52%)",
          width: EDGE_WIDTH,
        }}
      >
        <img
          src={asset(v.left.file)}
          alt=""
          onError={hide}
          className="ambient-anim"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            transform: v.left.flip ? "scaleX(-1)" : "none",
            transformOrigin: "0% 50%",
            animation: `${v.left.anim} ${v.left.dur}s ease-in-out infinite alternate`,
            filter: "drop-shadow(0 6px 14px rgba(58,58,54,0.06))",
          }}
        />
      </div>

      {/* Kluster tepi kanan — cermin dari kiri */}
      <div
        data-enter="right"
        style={{
          position: "absolute",
          right: "-6%",
          top: 0,
          transform: "translateY(-52%)",
          width: EDGE_WIDTH,
        }}
      >
        <img
          src={asset(v.right.file)}
          alt=""
          onError={hide}
          className="ambient-anim"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            transform: v.right.flip ? "scaleX(-1)" : "none",
            transformOrigin: "100% 50%",
            animation: `${v.right.anim} ${v.right.dur}s ease-in-out infinite alternate`,
            filter: "drop-shadow(0 6px 14px rgba(58,58,54,0.06))",
          }}
        />
      </div>

      {/* Garland tengah */}
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
          maxWidth: v.center.maxWidth,
        }}
      >
        <img
          src={asset(v.center.file)}
          alt=""
          onError={hide}
          className="ambient-anim"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            transform: v.center.flip ? "scaleX(-1)" : "none",
            transformOrigin: "50% 50%",
            animation: `${v.center.anim} ${v.center.dur}s ease-in-out infinite alternate`,
            filter: "drop-shadow(0 6px 14px rgba(58,58,54,0.06))",
          }}
        />
      </div>
    </div>
  );
}
