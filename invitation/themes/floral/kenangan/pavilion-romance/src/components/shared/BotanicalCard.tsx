"use client";

// Kartu botani: panel kertas halus `.botanical-card` + juntaian bunga menggantung
// di sudut atas yang bergoyang loop → kartu terasa hidup. Opsi `frame` memasang
// WishFrame (WeddingWishFrame.webp hasil regenerate Jul 2026 — kini garis gold
// simetris + buket sudut, bukan pilar asimetris yang dulu penyok bila
// diregangkan); saat frame aktif, vines sebaiknya dimatikan agar sudut atas
// tidak berebut ornamen dengan buket frame.

import CardVines from "./CardVines";
import WishFrame from "./WishFrame";

export default function BotanicalCard({
  children,
  style,
  vines = true,
  vineWidth,
  frame = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  vines?: boolean;
  vineWidth?: string;
  frame?: boolean;
}) {
  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      {/* Panel kertas (overflow-hidden untuk sudut membulat) */}
      <div className="botanical-card" style={{ position: "relative", overflow: "hidden", borderRadius: 16 }}>
        <div style={{ position: "relative", zIndex: 1, padding: "clamp(30px, 11%, 54px) clamp(30px, 13%, 52px)" }}>
          {children}
        </div>
      </div>

      {/* Bingkai gold + buket sudut — di luar overflow panel agar buket boleh
          menjuntai sedikit melewati tepi kartu */}
      {frame && <WishFrame />}

      {/* Juntaian bunga menggantung di sudut atas — di luar overflow panel */}
      {vines && <CardVines width={vineWidth} />}
    </div>
  );
}
