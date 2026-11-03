"use client";

// Kartu: panel `.botanical-card` (gradasi surface + border tipis). Elegant
// minimalist — tanpa aksen menggantung di sudut (dulu CardVines).

export default function BotanicalCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      {/* Panel: gradasi surface + border tipis (overflow-hidden untuk sudut membulat) */}
      <div className="botanical-card" style={{ position: "relative", overflow: "hidden", borderRadius: 16 }}>
        <div style={{ position: "relative", zIndex: 1, padding: "clamp(34px, 12%, 60px) clamp(32px, 14%, 58px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
