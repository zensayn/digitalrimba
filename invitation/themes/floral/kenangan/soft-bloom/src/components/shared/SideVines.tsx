"use client";

// Ranting menjuntai (RantingSamping) di tepi kiri/kanan, menggantung dari atas &
// bergoyang halus dari pangkal atasnya. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Side = "left" | "right";

export default function SideVines({
  sides = ["left", "right"],
  file = "RantingSamping.webp",
  height = "min(76vh, 640px)",
  opacity = 0.95,
  zIndex = 2,
}: {
  sides?: Side[];
  file?: string;
  height?: string;
  opacity?: number;
  zIndex?: number;
}) {
  return (
    <>
      {sides.map((s, i) => (
        <div
          key={s}
          aria-hidden="true"
          data-enter={s}
          style={{
            position: "absolute",
            top: 0,
            [s]: 0,
            height,
            pointerEvents: "none",
            zIndex,
            transform: s === "right" ? "scaleX(-1)" : "none",
          }}
        >
          <img
            src={asset(file)}
            alt=""
            onError={hideBrokenImage}
            className="ambient-anim"
            style={{
              display: "block",
              height: "100%",
              width: "auto",
              opacity,
              transformOrigin: "50% 0",
              animation: `${i % 2 ? "swayAlt" : "sway"} ${(6 + i).toFixed(1)}s ease-in-out ${(i * 0.6).toFixed(1)}s infinite alternate`,
            }}
          />
        </div>
      ))}
    </>
  );
}
