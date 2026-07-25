"use client";

// Pembatas bunga horizontal (FloralDividerKisah.webp). Kanvas 1536×1024;
// sejak regenerate Jul 2026 komposisinya simetris di tengah dan full-width:
// band bunga di x 0,7–99,2%, y 35,8–60,8%; sisanya transparan. Tanpa crop,
// gambar ini menyuntik ruang kosong hantu besar di atas & bawah garis bunga.
// Wrapper ini meng-crop ke band terlihat + margin lunak 2% (crop y 33,8–62,8%
// → aspect 1536/297; lebar img 100%; offset atas 22,5% = 33,8% × tinggi img
// yang 66,67% dari lebar) → spacing dikendalikan layout lagi tanpa memenggal
// kelopak paling tepi.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function FloralDivider({
  width = "60vw",
  maxWidth = 280,
  flip = false,
  style,
}: {
  width?: string;
  maxWidth?: number;
  flip?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        maxWidth,
        aspectRatio: "1536 / 297",
        overflow: "hidden",
        // Flip di wrapper (bukan img) supaya region crop tidak ikut berpindah.
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <img
        src={asset("FloralDividerKisah.webp")}
        alt=""
        onError={hideBrokenImage}
        style={{ display: "block", width: "100%", height: "auto", marginTop: "-22.5%" }}
      />
    </div>
  );
}
