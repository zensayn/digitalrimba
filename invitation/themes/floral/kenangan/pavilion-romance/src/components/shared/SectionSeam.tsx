"use client";

// Jahitan antar-section (port pola soft-bloom): dua lapis menumpuk tepat di
// garis batas dua section — separuh di bawah section atas, separuh di atas
// section berikutnya — supaya batas tidak terbaca sebagai potongan lurus:
//   1. "Awan" CSS selebar kolom: pita feather warna kertas + dua sapuan radial
//      offset kiri/kanan supaya tepinya berombak seperti kabut, bukan pita lurus.
//      Melarutkan beda latar painterly antar-section tanpa asset baru.
//   2. Band bunga FloralDividerKisah selebar kolom penuh di atasnya, memakai
//      teknik crop FloralDivider.tsx (band terlihat + margin lunak 2%).
// Dirender DI ANTARA section (sibling, di luar overflow:hidden) supaya tidak
// terklip; .snap-section ber-z-index:1 → seam zIndex 6 menumpuk di atas kedua
// tetangga di sekitar garis. Fallback aman: kalau file tak ada, band bunga
// disembunyikan (hideBrokenImage) dan pita awan tetap melarutkan batas.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Tiap jahitan bergiliran mirror + beda durasi supaya batas tidak seragam.
// Hanya swayFrame (±1°): rotasi lebih besar menggeser band keluar region crop.
const VARIANTS = [
  { flip: false, dur: 8.5 },
  { flip: true, dur: 9.5 },
  { flip: false, dur: 7.5 },
];

// zIndex 0: seam duduk DI BAWAH semua aset/komponen section (z-index 1) tapi DI
// ATAS PaperBackdrop (z0, DOM lebih awal). Tepi section dilarutkan transparan via
// mask (.snap-section di globals) → aset section memudar & menimpa seam secara
// natural; garland bunga seam mengintip dari baliknya di garis batas.
export default function SectionSeam({ index = 0, zIndex = 0 }: { index?: number; zIndex?: number }) {
  const v = VARIANTS[index % VARIANTS.length];
  return (
    <div
      aria-hidden="true"
      className="reveal-scope"
      style={{ position: "relative", height: 0, zIndex, pointerEvents: "none" }}
    >
      {/* Band bunga selebar kolom — menyentuh kedua tepi tanpa meluber keluar */}
      <div
        data-enter="soft"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          transform: "translateY(-50%)",
        }}
      >
        {/* Crop ala FloralDivider: band bunga di tengah kanvas 1536×1024,
            sisanya ruang transparan hantu. Flip di wrapper crop (bukan img)
            supaya region crop tidak ikut berpindah. */}
        <div
          style={{
            width: "100%",
            aspectRatio: "1536 / 297",
            overflow: "hidden",
            transform: v.flip ? "scaleX(-1)" : undefined,
          }}
        >
          <img
            src={asset("FloralDividerKisah.webp")}
            alt=""
            onError={hideBrokenImage}
            className="ambient-anim"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              marginTop: "-22.5%",
              transformOrigin: "50% 50%",
              animation: `swayFrame ${v.dur}s ease-in-out infinite alternate`,
              filter: "drop-shadow(0 6px 14px rgba(58,58,54,0.06))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
