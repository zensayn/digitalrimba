"use client";

// Dinding bunga rimbun (LushSideGarden) sepanjang tinggi penuh tepi section —
// versi padat dari SideVines yang hanya menjuntai dari atas. Kanvas 1024×1536
// dengan flora menempel tepi kiri sampai x 73%; objectFit "cover" +
// objectPosition sisi tepi menjaga bunga tidak terdistorsi pada section yang
// tingginya berubah-ubah (yang terpotong hanya sisi transparan). Goyangan
// swayFrame ±1° dengan pivot di tepi — massa besar cukup bergoyang sangat
// halus supaya tidak memabukkan. Fallback aman via hideBrokenImage.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Side = "left" | "right";

export default function EdgeGarden({
  sides = ["left", "right"],
  width = "clamp(88px, 24vw, 148px)",
  opacity = 0.55,
  zIndex = 1,
}: {
  sides?: Side[];
  width?: string;
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
            bottom: 0,
            [s]: 0,
            width,
            pointerEvents: "none",
            zIndex,
            overflow: "hidden",
            transform: s === "right" ? "scaleX(-1)" : undefined,
            // Jendela crop memotong flora di tengah kelopak → tepi dalam
            // di-feather dengan mask supaya melebur ke kertas, bukan garis lurus.
            WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to right, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)",
          }}
        >
          <img
            src={asset("LushSideGarden.webp")}
            alt=""
            onError={hideBrokenImage}
            loading="lazy"
            decoding="async"
            className="ambient-anim"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "left center",
              opacity,
              transformOrigin: "0% 50%",
              animation: `swayFrame ${(9 + i * 1.5).toFixed(1)}s ease-in-out ${(i * 0.7).toFixed(1)}s infinite alternate`,
            }}
          />
        </div>
      ))}
    </>
  );
}
