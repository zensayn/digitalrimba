"use client";

// Latar kertas menerus di belakang SEMUA section (satu dunia yang sama) supaya
// perpindahan antar-section terasa nyambung, bukan blok warna yang terputus.
// Tekstur PaperTextureKisah di-tile; edgeFade tiap SceneBackground melarut ke
// warna kertas ini. Fallback aman (kalau file tak ada, hanya --bg yang tampil).

import { asset } from "@/lib/assets";

export default function PaperBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="paper-backdrop"
      style={{
        backgroundColor: "var(--bg)",
        backgroundImage: `url(${asset("PaperTextureKisah.webp")})`,
        backgroundRepeat: "repeat",
        backgroundSize: "512px",
      }}
    />
  );
}
