"use client";

// Pembatas bunga horizontal (PembatasBunga.webp). File aslinya 1536×1024 tapi
// band bunga yang terlihat hanya baris 391–617 (~22% tinggi); sisanya transparan,
// sehingga bila dipakai langsung ia menyuntik ruang kosong hantu ±50% dari lebar
// render di atas & bawah garis bunga. Wrapper ini meng-crop tepat ke band
// terlihat (aspect 1536/227, offset -25.4% = 391/1536) → spacing di sekitarnya
// kembali dikendalikan layout, bukan padding gambar.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function FloralDivider({
  width = "60vw",
  maxWidth = 280,
  style,
}: {
  width?: string;
  maxWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ width, maxWidth, aspectRatio: "1536 / 227", overflow: "hidden", ...style }}
    >
      <img
        src={asset("PembatasBunga.webp")}
        alt=""
        onError={hideBrokenImage}
        style={{ display: "block", width: "100%", height: "auto", marginTop: "-25.4%" }}
      />
    </div>
  );
}
