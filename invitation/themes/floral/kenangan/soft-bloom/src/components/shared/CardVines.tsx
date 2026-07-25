"use client";

// Juntaian bunga yang menggantung di sudut atas kartu & bergoyang terus (loop)
// dari titik gantungnya di atas — seperti tertiup angin, bikin kartu "hidup".
// Wrapper melakukan mirror (kanan), <img> di dalamnya yang beranimasi rotate
// supaya mirror + goyang tidak saling menimpa. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

const CONF = {
  left: { anim: "sway", dur: 5.6, flip: false },
  right: { anim: "swayAlt", dur: 6.4, flip: true },
} as const;

export default function CardVines({
  file = "RantingSamping.webp",
  width = "clamp(62px, 17vw, 96px)",
  top = -24,
  inset = -16,
  zIndex = 4,
  dropShadow = "drop-shadow(0 5px 10px rgba(58,58,54,0.06))",
  sides = ["left", "right"] as ("left" | "right")[],
}: {
  file?: string;
  width?: string;
  top?: number;
  inset?: number;
  zIndex?: number;
  dropShadow?: string;
  sides?: ("left" | "right")[];
}) {
  return (
    <>
      {sides.map((s) => {
        const c = CONF[s];
        return (
          <div
            key={s}
            aria-hidden="true"
            data-enter="drop"
            style={{
              position: "absolute",
              top,
              [s]: inset,
              width,
              zIndex,
              pointerEvents: "none",
              transform: c.flip ? "scaleX(-1)" : "none",
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
                transformOrigin: "50% 0",
                animation: `${c.anim} ${c.dur}s ease-in-out infinite alternate`,
                filter: dropShadow,
              }}
            />
          </div>
        );
      })}
    </>
  );
}
