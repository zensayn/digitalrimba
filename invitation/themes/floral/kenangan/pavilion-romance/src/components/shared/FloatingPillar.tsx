"use client";

// Pilar paviliun berdiri di tepi section dengan dua gerak berlapis: seluruh
// pilar melayang naik-turun pelan (pillarFloat), sementara buket di puncaknya
// bergoyang sendiri dari pangkalnya (sway) — ritme berbeda supaya terasa hidup,
// bukan satu gambar kaku yang digeser-geser.
//
// Angka penempatan dari pengukuran alpha asset (Jul 2026):
// - GardenPillar.webp   kanvas 1024×1536 (2:3); batang di pita x 32–69%,
//   capital (puncak datar) di y 3,6–5% dengan lebar ±35% kanvas.
// - PillarTopBouquet.webp kanvas persegi; pangkal buket menyempit tepat di
//   bawah-tengah (x≈50%, y≈97,5%) — titik pivot goyangan.
// Buket diletakkan agar pangkalnya menindih sedikit capital (menutup sambungan).
// Fallback aman: kalau file tak ada, <img> disembunyikan.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Side = "left" | "right";

export default function FloatingPillar({
  sides = ["left"],
  width = "clamp(120px, 32vw, 176px)",
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
      {sides.map((s, i) => (
        <div
          key={s}
          aria-hidden="true"
          data-enter={s}
          style={{
            position: "absolute",
            bottom: 0,
            [s]: 0,
            width,
            aspectRatio: "2 / 3",
            pointerEvents: "none",
            zIndex,
            // Batang pilar mulai di x 32% kanvas → dorong boks 24% keluar
            // supaya pilar berdiri rapat tepi, bukan melayang di tengah.
            transform: s === "right" ? "translateX(24%) scaleX(-1)" : "translateX(-24%)",
          }}
        >
          <div
            className="ambient-anim"
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              opacity,
              animation: `pillarFloat ${(8 + i * 1.6).toFixed(1)}s ease-in-out ${(i * 0.9).toFixed(1)}s infinite`,
            }}
          >
            <img
              src={asset("GardenPillar.webp")}
              alt=""
              onError={hideBrokenImage}
              loading="lazy"
              decoding="async"
              style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
            />
            {/* Buket puncak: boks persegi 110% lebar pilar → mahkota buket
                ±2,2× lebar capital. bottom 92% menaruh pangkal buket di
                y≈6% kanvas pilar — menindih tipis capital (y 3,6–5%). */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "92%",
                width: "110%",
                aspectRatio: "1 / 1",
                transform: "translateX(-50%)",
              }}
            >
              <img
                src={asset("PillarTopBouquet.webp")}
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
                  transformOrigin: "50% 100%",
                  animation: `${i % 2 ? "swayAlt" : "sway"} ${(5.4 + i).toFixed(1)}s ease-in-out ${(i * 0.5).toFixed(1)}s infinite alternate`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
