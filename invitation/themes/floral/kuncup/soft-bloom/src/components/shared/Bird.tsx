"use client";

// Burung pastel (Burung) hinggap sebagai aksen fauna, bergoyang/bergerak halus.
// Fallback aman kalau gambar belum ada.

import { asset } from "@/lib/assets";

function hide(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function Bird({
  file = "Burung.webp",
  size = "clamp(78px, 22vw, 128px)",
  flip = false,
  zIndex = 3,
  style,
}: {
  file?: string;
  size?: string;
  flip?: boolean;
  zIndex?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: size,
        pointerEvents: "none",
        zIndex,
        transform: flip ? "scaleX(-1)" : "none",
        ...style,
      }}
    >
      <img
        src={asset(file)}
        alt=""
        onError={hide}
        className="ambient-anim"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          transformOrigin: "50% 100%",
          animation: "birdBob 4.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
