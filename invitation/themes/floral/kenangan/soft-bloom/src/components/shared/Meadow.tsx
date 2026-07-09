"use client";

// Padang bunga di tepi bawah: pita "MeadowStrip" sebagai lantai statis, lalu
// tangkai-tangkai kecil bergoyang dari pangkalnya di atasnya (efek tertiup angin).
// Semua pakai fallback aman.

import { asset } from "@/lib/assets";

const SPRIGS = ["Sprig1.webp", "TangkaiKuncup.webp", "BungaJatuh1.webp", "BungaJatuh2.webp", "BungaJatuh3.webp"];
const ANIMS = ["sway", "swayAlt", "swaySoft"];

function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hide(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function Meadow({
  sprigs = 7,
  strip = true,
  zIndex = 1,
}: {
  sprigs?: number;
  strip?: boolean;
  zIndex?: number;
}) {
  const items = Array.from({ length: sprigs }, (_, i) => ({
    id: i,
    src: asset(SPRIGS[i % SPRIGS.length]),
    left: `${(i / (sprigs - 1)) * 92 + 4 - sr(i * 3 + 1) * 3}%`,
    width: Math.round(30 + sr(i * 13 + 2) * 40),
    dur: (3.6 + sr(i * 17 + 3) * 2.8).toFixed(1),
    delay: (-(sr(i * 7 + 5) * 3)).toFixed(1),
    anim: ANIMS[i % ANIMS.length],
    drop: Math.round(sr(i * 11 + 4) * 12),
  }));

  return (
    <div aria-hidden="true" data-enter="bottom" style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex, pointerEvents: "none" }}>
      {strip && (
        <img
          src={asset("MeadowStrip.webp")}
          alt=""
          onError={hide}
          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "auto", display: "block" }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 0 }}>
        {items.map((s) => (
          <img
            key={s.id}
            src={s.src}
            alt=""
            onError={hide}
            className="ambient-anim"
            style={{
              position: "absolute",
              left: s.left,
              bottom: -6 - s.drop,
              width: s.width,
              height: "auto",
              transformOrigin: "50% 100%",
              animation: `${s.anim} ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
