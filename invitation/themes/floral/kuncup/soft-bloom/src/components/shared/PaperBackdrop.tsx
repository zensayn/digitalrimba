"use client";

// Latar kertas menerus di belakang SEMUA section (satu dunia yang sama) supaya
// perpindahan antar-section terasa nyambung, bukan blok warna yang terputus.
// Tekstur LatarKertas di-tile + sapuan pastel halus. Fallback aman (kalau file
// tak ada, hanya warna dasar --bg yang tampil).

import { asset } from "@/lib/assets";

export default function PaperBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="paper-backdrop"
      style={{
        backgroundColor: "var(--bg)",
        backgroundImage: `url(${asset("LatarKertas.webp")})`,
        backgroundRepeat: "repeat",
        backgroundSize: "460px",
      }}
    />
  );
}
