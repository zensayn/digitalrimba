"use client";

// Kupu-kupu pastel yang terbang menyeberang halaman dengan kepakan sayap.
// Aset Kupu.webp opsional — jika belum ada, elemen otomatis disembunyikan.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Butterflies({ count = 2, zIndex = 2 }: { count?: number; zIndex?: number }) {
  const items = Array.from({ length: count }, (_, i) => {
    const startTop = 8 + sr(i * 5 + 1) * 56;          // %
    const dur = 15 + sr(i * 9 + 2) * 11;              // s
    const delay = -(sr(i * 3 + 4) * dur).toFixed(1);
    const rise = Math.round(28 + sr(i * 7 + 3) * 42); // px
    const name = `bf_${i}`;
    const kf =
      `@keyframes ${name}{` +
      `0%{transform:translate(-14vw,0) rotate(-6deg);opacity:0}` +
      `12%{opacity:.92}` +
      `38%{transform:translate(34vw,${-rise}px) rotate(7deg)}` +
      `62%{transform:translate(60vw,${Math.round(rise * 0.4)}px) rotate(-5deg)}` +
      `88%{opacity:.92}` +
      `100%{transform:translate(120vw,${-Math.round(rise * 0.3)}px) rotate(6deg);opacity:0}}`;
    return { i, name, kf, startTop, dur, delay, size: Math.round(24 + sr(i * 11 + 6) * 16) };
  });

  const css = items.map((x) => x.kf).join("");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {items.map((x) => (
        <div
          key={x.i}
          aria-hidden="true"
          className="ambient-anim"
          style={{
            position: "absolute",
            top: `${x.startTop}%`,
            left: 0,
            width: x.size,
            height: "auto",
            zIndex,
            pointerEvents: "none",
            opacity: 0,
            animation: `${x.name} ${x.dur.toFixed(1)}s linear ${x.delay}s infinite`,
          }}
        >
          <img
            src={asset("Kupu.webp")}
            alt=""
            onError={hideBrokenImage}
            className="ambient-anim"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              animation: "wingflap 0.35s ease-in-out infinite",
            }}
          />
        </div>
      ))}
    </>
  );
}
