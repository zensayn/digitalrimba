"use client";

// Kartu twilight: panel gelap `.botanical-card` (indigo + border emas). Tanpa
// aset gambar — sudut membulat, cocok untuk blok teks (kartu Salam).

export default function BotanicalCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  // vines/vineWidth dipertahankan opsional agar pemanggilan lama tak error,
  // tapi tak dipakai lagi (twilight tanpa juntaian bunga).
  vines?: boolean;
  vineWidth?: string;
}) {
  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      <div className="botanical-card" style={{ position: "relative", overflow: "hidden", borderRadius: 16 }}>
        <div style={{ position: "relative", zIndex: 1, padding: "clamp(34px, 12%, 60px) clamp(32px, 14%, 58px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
