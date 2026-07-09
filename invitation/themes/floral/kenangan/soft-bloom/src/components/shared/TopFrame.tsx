"use client";

// Bingkai lengkung botani (BingkaiAtas) di puncak section — seperti gerbang taman.
// Bergoyang sangat halus dari puncak. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function TopFrame({
  file = "BingkaiAtas.webp",
  opacity = 1,
  maxWidth = 560,
  zIndex = 2,
}: {
  file?: string;
  opacity?: number;
  maxWidth?: number;
  zIndex?: number;
}) {
  return (
    <div
      aria-hidden="true"
      data-enter="top"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "100%",
        maxWidth,
        pointerEvents: "none",
        zIndex,
      }}
    >
      <img
        src={asset(file)}
        alt=""
        onError={hideBrokenImage}
        className="ambient-anim"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          opacity,
          transformOrigin: "50% 0",
          animation: "swayFrame 9s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
