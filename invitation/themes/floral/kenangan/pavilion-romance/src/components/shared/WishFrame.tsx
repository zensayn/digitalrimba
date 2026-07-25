"use client";

// Bingkai panel (WeddingWishFrame.webp): garis gold tipis dengan buket bunga di
// sudut kiri-atas & kanan-bawah. Kanvas 1122×1402 (±4:5); garis bingkainya
// duduk nyaris di tepi kanvas (x 1,2–99%, y 0,4–98,9%) sehingga overlay cukup
// dipeluk sedikit keluar tepi panel. objectFit "fill" disengaja: pada konten
// yang lebih tinggi dari 4:5 (form RSVP) buket sudut ikut memanjang halus —
// trade-off yang dipilih agar bingkai selalu memeluk tepi panel apa pun tinggi
// kontennya. pointerEvents none supaya form di bawahnya tetap bisa disentuh.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function WishFrame({
  opacity = 0.9,
  outset = "2%",
  zIndex = 2,
}: {
  opacity?: number;
  outset?: string;
  zIndex?: number;
}) {
  return (
    <img
      src={asset("WeddingWishFrame.webp")}
      alt=""
      aria-hidden="true"
      onError={hideBrokenImage}
      style={{
        position: "absolute",
        left: `calc(0px - ${outset})`,
        top: `calc(0px - ${outset})`,
        width: `calc(100% + 2 * ${outset})`,
        height: `calc(100% + 2 * ${outset})`,
        objectFit: "fill",
        opacity,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}
