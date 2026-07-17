"use client";

// Kupu emas tunggal (spec pengayaan §8) — melintas lambat sekali tiap putaran,
// muncul lalu lenyap (opacity di ujung), sayap mengepak halus. Satu lapis global
// seperti GoldDust; nol pause tapi hadir sesekali. Reduced-motion → disembunyikan
// (lihat globals.css .kupu-layer). Div luar melayang (translate), img dalam
// mengepak (scaleX) → dua transform tak bentrok.

import { asset, hideOnError } from "@/lib/assets";

export default function KupuAmbient({ zIndex = 39 }: { zIndex?: number }) {
  return (
    <div className="kupu-layer" aria-hidden="true" style={{ zIndex }}>
      <div className="kupu-drift">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("KupuEmas")}
          alt=""
          onError={hideOnError}
          className="kupu-flap"
          draggable={false}
          decoding="async"
          style={{ width: 34, height: 34, objectFit: "contain", filter: "saturate(0.82) brightness(0.95)" }}
        />
      </div>
    </div>
  );
}
