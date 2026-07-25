"use client";

// Bunga tangkai tinggi berdiri dari tepi bawah section. Aset dirancang dengan
// batang tipis tepat di bawah-tengah kanvas dan massa bunga di sepertiga atas,
// sehingga rotasi swaySoft dengan pivot di pangkal (origin 50% 100%) membuat
// hanya mahkota bunganya yang tampak bergoyang — batang bawah nyaris diam.
//
// Kanvas TallSwayBloom1/2 1024×1536 (2:3); batang di pita x ±27–70% (hampir
// tengah). Dua varian dipakai selang-seling kiri/kanan dengan durasi berbeda
// supaya tidak serempak. Fallback aman via hideBrokenImage.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Side = "left" | "right";

const CONF: Record<Side, { file: string; anim: string; dur: number; delay: number; flip: boolean }> = {
  left: { file: "TallSwayBloom1.webp", anim: "swaySoft", dur: 7.6, delay: 0, flip: false },
  right: { file: "TallSwayBloom2.webp", anim: "sway", dur: 8.8, delay: 1.1, flip: true },
};

export default function TallBlooms({
  sides = ["left", "right"],
  width = "clamp(76px, 21vw, 112px)",
  opacity = 0.95,
  zIndex = 1,
}: {
  sides?: Side[];
  width?: string;
  opacity?: number;
  zIndex?: number;
}) {
  return (
    <>
      {sides.map((s) => {
        const c = CONF[s];
        return (
          <div
            key={s}
            aria-hidden="true"
            data-enter="bottom"
            style={{
              position: "absolute",
              bottom: -6,
              [s]: 0,
              width,
              aspectRatio: "2 / 3",
              pointerEvents: "none",
              zIndex,
              // Batang duduk hampir di tengah kanvas → geser sedikit keluar
              // supaya rumpun menempel tepi tanpa terpotong banyak.
              transform: `translateX(${s === "right" ? "14%" : "-14%"})${c.flip ? " scaleX(-1)" : ""}`,
            }}
          >
            <img
              src={asset(c.file)}
              alt=""
              onError={hideBrokenImage}
              loading="lazy"
              decoding="async"
              className="ambient-anim"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity,
                transformOrigin: "50% 100%",
                animation: `${c.anim} ${c.dur}s ease-in-out ${c.delay}s infinite alternate`,
              }}
            />
          </div>
        );
      })}
    </>
  );
}
