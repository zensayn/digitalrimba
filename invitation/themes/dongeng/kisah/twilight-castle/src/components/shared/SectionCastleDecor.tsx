"use client";

// Ornamen kastil yang MENYATU di dalam section (absolute, ikut menggulir — bukan
// bingkai fixed): lentera menggantung dari tepi atas (ayun), sudut emas di bawah,
// serta opsi obor dinding (api berkedip) & panji kerajaan (berkibar). Semua aset
// webp emas dengan fallback aman; reduced-motion mematikan animasi via .ambient-anim.

import GoldCorner from "./GoldCorner";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

function Ornament({
  file,
  anim,
  dur,
  flip,
  origin = "50% 0%",
  style,
}: {
  file: string;
  anim: string;
  dur: number;
  flip?: boolean;
  origin?: string;
  style: React.CSSProperties;
}) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", transform: flip ? "scaleX(-1)" : undefined, pointerEvents: "none", zIndex: 2, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(file)}
        alt=""
        onError={hideBrokenImage}
        className="ambient-anim"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          transformOrigin: origin,
          animation: `${anim} ${dur}s ease-in-out infinite alternate`,
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.4))",
        }}
      />
    </div>
  );
}

export default function SectionCastleDecor({
  torches = false,
  banners = false,
  corners = true,
}: {
  torches?: boolean;
  banners?: boolean;
  corners?: boolean;
}) {
  return (
    <>
      {/* Lentera menggantung dari tepi ATAS section — ayun dari pangkal */}
      <Ornament file="LenteraGantung.webp" anim="sway" dur={5.5}
        style={{ top: 0, left: "3%", width: "clamp(42px, 11vw, 72px)" }} />
      <Ornament file="LenteraGantung.webp" anim="swayAlt" dur={6} flip
        style={{ top: 0, right: "3%", width: "clamp(42px, 11vw, 72px)" }} />

      {/* Panji kerajaan — menggantung di sisi atas (opsional) */}
      {banners && (
        <>
          <Ornament file="PanjiKerajaan.webp" anim="flutter" dur={4.5}
            style={{ top: 0, left: "16%", width: "clamp(34px, 9vw, 58px)" }} />
          <Ornament file="PanjiKerajaan.webp" anim="flutter" dur={5.1} flip
            style={{ top: 0, right: "16%", width: "clamp(34px, 9vw, 58px)" }} />
        </>
      )}

      {/* Obor dinding — tepi sisi tengah (opsional) */}
      {torches && (
        <>
          <Ornament file="OborDinding.webp" anim="flicker" dur={2.4} origin="50% 50%"
            style={{ top: "50%", left: 0, width: "clamp(34px, 8vw, 54px)" }} />
          <Ornament file="OborDinding.webp" anim="flicker" dur={2.9} flip origin="50% 50%"
            style={{ top: "50%", right: 0, width: "clamp(34px, 8vw, 54px)" }} />
        </>
      )}

      {/* Sudut emas di bawah */}
      {corners && (
        <>
          <GoldCorner corner="bl" />
          <GoldCorner corner="br" />
        </>
      )}
    </>
  );
}
