"use client";

// Juntaian tangkai (SwayVineSprig) di tepi kiri/kanan, menggantung dari atas &
// bergoyang halus dari pangkal atasnya. Kanvas asset 2:3 dengan tangkai hanya di
// pita x 30–64%, jadi <img> digeser keluar (translateX) supaya tangkainya
// benar-benar menempel tepi layar, bukan melayang di tengah. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Side = "left" | "right";

export default function SideVines({
  sides = ["left", "right"],
  file = "SwayVineSprig.webp",
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
            aspectRatio: "2 / 3",
            pointerEvents: "none",
            zIndex,
            // Konten tangkai duduk di pita x 30–64% kanvas → geser boks 26%
            // keluar supaya tangkai menempel tepi. Entrance memakai properti
            // translate/scale terpisah, jadi transform statis ini aman.
            transform: s === "right" ? "translateX(26%) scaleX(-1)" : "translateX(-26%)",
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
              width: "100%",
              objectFit: "contain",
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
