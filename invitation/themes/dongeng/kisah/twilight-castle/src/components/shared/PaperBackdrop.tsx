"use client";

// Latar menerus di belakang SEMUA section (satu dunia yang sama) supaya
// perpindahan antar-section terasa nyambung, bukan blok warna yang terputus.
// Twilight: warna dasar --bg + veil gelap dari `.paper-backdrop::after` (CSS).

export default function PaperBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="paper-backdrop"
      style={{ backgroundColor: "var(--bg)" }}
    />
  );
}
