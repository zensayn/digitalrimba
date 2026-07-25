"use client";

// Kluster bunga besar (SudutBawah) berakar di tepi bawah kiri & kanan, bergoyang
// dari pangkalnya seperti tertiup angin. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

const CONF: { side: "left" | "right"; flip: boolean; anim: string; dur: number }[] = [
  { side: "left", flip: false, anim: "sway", dur: 5.4 },
  { side: "right", flip: true, anim: "swayAlt", dur: 6.2 },
];

export default function BottomClusters({
  file = "SudutBawah.webp",
  size = "clamp(170px, 48vw, 340px)",
  opacity = 1,
  zIndex = 1,
}: {
  file?: string;
  size?: string;
  opacity?: number;
  zIndex?: number;
}) {
  return (
    <>
      {CONF.map((c) => (
        <div
          key={c.side}
          aria-hidden="true"
          data-enter={c.side === "left" ? "bl" : "br"}
          style={{
            position: "absolute",
            bottom: 0,
            [c.side]: 0,
            width: size,
            transform: c.flip ? "scaleX(-1)" : "none",
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
              transformOrigin: "50% 100%",
              animation: `${c.anim} ${c.dur}s ease-in-out infinite alternate`,
            }}
          />
        </div>
      ))}
    </>
  );
}
