"use client";

// Kartu botani: panel kertas `KartuBunga` (bunga membingkai tepi) + juntaian bunga
// menggantung di sudut atas yang bergoyang loop → kartu terasa hidup. Bila aset
// panel belum ada, jatuh ke gaya kertas halus `.botanical-card` (tanpa error).

import { asset } from "@/lib/assets";
import CardVines from "./CardVines";

function hide(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function BotanicalCard({
  children,
  style,
  vines = true,
  vineWidth,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  vines?: boolean;
  vineWidth?: string;
}) {
  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      {/* Panel bunga (overflow-hidden untuk sudut membulat) */}
      <div className="botanical-card" style={{ position: "relative", overflow: "hidden", borderRadius: 16 }}>
        <img
          src={asset("KartuBunga.webp")}
          alt=""
          aria-hidden="true"
          onError={hide}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", zIndex: 0, pointerEvents: "none" }}
        />
        <div style={{ position: "relative", zIndex: 1, padding: "clamp(30px, 11%, 54px) clamp(30px, 13%, 52px)" }}>
          {children}
        </div>
      </div>

      {/* Juntaian bunga menggantung di sudut atas — di luar overflow panel */}
      {vines && <CardVines width={vineWidth} />}
    </div>
  );
}
