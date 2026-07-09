"use client";

// Bingkai taman penuh (BingkaiPenuh) mengelilingi seluruh section — jendela taman.
// Bernapas sangat halus. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function FullFrame({
  file = "BingkaiPenuh.webp",
  opacity = 1,
  zIndex = 2,
}: {
  file?: string;
  opacity?: number;
  zIndex?: number;
}) {
  // Wrapper memegang entrance (scale+fade "frame"); <img> tetap punya opacity &
  // napas breathe sendiri → keduanya tak saling menimpa.
  return (
    <div
      aria-hidden="true"
      data-enter="frame"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex, transformOrigin: "50% 50%" }}
    >
      <img
        src={asset(file)}
        alt=""
        onError={hideBrokenImage}
        className="ambient-anim"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          opacity,
          transformOrigin: "50% 50%",
          animation: "breathe 10s ease-in-out infinite",
        }}
      />
    </div>
  );
}
