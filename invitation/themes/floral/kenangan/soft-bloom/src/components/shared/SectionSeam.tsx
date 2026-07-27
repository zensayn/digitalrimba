"use client";

// Jahitan antar-section: karangan bunga (GarlandBunga) yang menumpuk di batas dua
// section — separuh di bawah section atas, separuh di atas section berikutnya —
// jadi bunga seolah tumbuh menyambung, tidak terpotong garis lurus.
// Dua lapis supaya batas tertutup SELEBAR kolom (bukan hanya tengah):
//   1. Pita feather CSS full-width → melarutkan beda warna latar tepat di garis batas.
//   2. Garland selebar kolom penuh di atasnya.
// Dulu ada kluster SudutBunga di tepi kiri/kanan, tapi asset itu komposisi sudut
// KIRI-ATAS — dipakai di kanan jadi mirror yang terlihat janggal, dan offset
// negatifnya meluber keluar kolom di desktop (feedback owner 2026-07-06) → dihapus.
// Dirender DI ANTARA section (di luar overflow:hidden) supaya tidak terklip.
// Fallback aman: kalau file tak ada, garland disembunyikan (tanpa error).

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Tiap jahitan bergiliran ganti komposisi supaya batas antar-section tidak seragam.
const VARIANTS = [
  { file: "GarlandBunga.webp", flip: false, anim: "swayFrame", dur: 8.5 },
  { file: "GarlandBunga.webp", flip: true, anim: "sway", dur: 9.5 },
  { file: "PembatasBunga.webp", flip: false, anim: "swayFrame", dur: 7.5 },
];

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
          garland di atasnya tinggal mempermanis. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 96,
          transform: "translateY(-50%)",
          background: `linear-gradient(to bottom,
            var(--paper-clear) 0%,
            var(--paper) 40%,
            var(--paper) 60%,
            var(--paper-clear) 100%)`,
        }}
      />

      {/* Garland selebar kolom — menyentuh kedua tepi tanpa meluber keluar */}
      <div
        data-enter="soft"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          transform: "translateY(-50%)",
          width: "100%",
        }}
      >
        <img
          src={asset(v.file)}
          alt=""
          onError={hideBrokenImage}
          className="ambient-anim"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            transform: v.flip ? "scaleX(-1)" : "none",
            transformOrigin: "50% 50%",
            animation: `${v.anim} ${v.dur}s ease-in-out infinite alternate`,
            filter: "var(--drop-md)",
          }}
        />
      </div>
    </div>
  );
}
