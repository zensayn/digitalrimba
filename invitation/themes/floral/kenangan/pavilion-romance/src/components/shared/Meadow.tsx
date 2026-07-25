"use client";

// Padang bunga di tepi bawah: tangkai-tangkai kecil bergoyang dari pangkalnya
// (efek tertiup angin). Komponen ini lapisan GERAK-nya saja — pita lantai
// statis dipasang terpisah oleh section (MeadowBloomBand di Cover,
// BottomGardenCluster di Closing) dengan sprig ini menari di depannya.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

const SPRIGS = ["SwayRoseCluster.webp", "SwayLeafBranch.webp"];
const ANIMS = ["sway", "swayAlt", "swaySoft"];

function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Meadow({
  sprigs = 7,
  zIndex = 1,
}: {
  sprigs?: number;
  zIndex?: number;
}) {
  const items = Array.from({ length: sprigs }, (_, i) => ({
    id: i,
    src: asset(SPRIGS[i % SPRIGS.length]),
    left: `${(i / (sprigs - 1)) * 92 + 4 - sr(i * 3 + 1) * 3}%`,
    // SwayRoseCluster hanya ~42% lebar kanvasnya yang terisi → boks dibuat
    // lebih besar supaya bunga yang terlihat tetap proporsional.
    width: Math.round(44 + sr(i * 13 + 2) * 52),
    dur: (3.6 + sr(i * 17 + 3) * 2.8).toFixed(1),
    delay: (-(sr(i * 7 + 5) * 3)).toFixed(1),
    anim: ANIMS[i % ANIMS.length],
    drop: Math.round(sr(i * 11 + 4) * 12),
  }));

  return (
    <div aria-hidden="true" data-enter="bottom" style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 0 }}>
        {items.map((s) => (
          <img
            key={s.id}
            src={s.src}
            alt=""
            onError={hideBrokenImage}
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
