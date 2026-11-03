"use client";

// Video latar untuk SATU kolom. Dipasang di dua tempat berbeda (DesktopCover
// & content-scroll) — masing-masing dapat instance video sendiri, terkurung
// ke lebar kolomnya sendiri. BUKAN position:fixed (itu meregang ke seluruh
// viewport, menyambungkan panel kiri & kolom kanan jadi satu gambar yang
// salah — bug feedback owner 2026-08-01).
//
// Wrapper luar: position:sticky + height:0 (tak mendorong tata letak),
// jangkar itu "menempel" di top:0 viewport saat window discroll — tapi
// horizontalnya tetap tunduk pada lebar parent tempat komponen ini dipasang
// (content-scroll sempit di desktop, penuh di HP; desktop-cover sendiri).
// Child di dalamnya position:absolute 100vh mengisi dari jangkar itu ke
// bawah. Hasilnya: video terasa "diam di tempat" sepanjang scroll section
// (tak pernah restart — video-nya cuma SATU elemen), tapi tak pernah
// meluber ke kolom sebelah.
//
// `video` (opsional) adalah cuplikan pelanggan sendiri (mis. prewedding) dari
// config.coverVideo — src overlay studio menang atas file katalog; keduanya
// kosong = fallback aset tema `file` (AmbientLoop.mp4). Video pelanggan HAMPIR
// PASTI tidak monokrom seperti aset tema — filter grayscale+contrast di bawah
// memaksa apa pun yang diputar tetap ikut palet hitam-putih tema ini, tanpa
// pelanggan perlu mengedit videonya sendiri.

import { asset } from "@/lib/assets";
import { invitationVideo } from "@/lib/invitation-media";
import type { InvitationConfig } from "@/lib/config-types";

export default function VideoBackdrop({
  file = "AmbientLoop.mp4",
  video,
}: {
  file?: string;
  video?: InvitationConfig["coverVideo"];
}) {
  const src = video?.src || (video?.file ? invitationVideo(video.file) : asset(file));

  return (
    <div aria-hidden="true" style={{ position: "sticky", top: 0, height: 0, zIndex: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "var(--bg)",
        }}
      >
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // Paksa monokrom hitam-putih apa pun sumbernya — lihat catatan di atas.
            filter: "grayscale(1) contrast(1.15) brightness(0.65)",
          }}
        />
      </div>
    </div>
  );
}
