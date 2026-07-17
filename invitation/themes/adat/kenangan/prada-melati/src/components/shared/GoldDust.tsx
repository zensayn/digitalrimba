"use client";

// Debu emas: serpih daun emas melayang NAIK seperti bara/asap pelita, satu lapis
// global. Padanan "kelopak jatuh" milik prada — tapi cahaya, bukan bunga; naik,
// bukan gugur (spec gerak §2.1). Nol pause: lapis global selalu di viewport.

import { asset, hideOnError } from "@/lib/assets";

const COUNT = 14;

// Seed deterministik (pola FallingFlowers warm-narrative) — SSR & klien sama.
function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function GoldDust({ zIndex = 40 }: { zIndex?: number }) {
  const motes = Array.from({ length: COUNT }, (_, i) => {
    const size = Math.round(8 + sr(i * 13 + 2) * 8); // 8–16px — halus, bukan konfeti
    const left = (sr(i * 7 + 1) * 96 + 2).toFixed(2); // 2–98%
    const dur = (14 + sr(i * 17 + 3) * 8).toFixed(1); // 14–22s
    const delay = (-sr(i * 19 + 4) * Number(dur)).toFixed(1); // negatif → langsung ramai
    const sway = Math.round((sr(i * 23 + 6) - 0.5) * 28); // -14..14px
    const rot = Math.round(sr(i * 11 + 5) * 360); // 0–360° awal
    const flip = sr(i * 29 + 8) > 0.5 ? -1 : 1; // scaleX — serpih tak berarah
    const peak = (0.18 + sr(i * 31 + 9) * 0.16).toFixed(2); // 0.18–0.34 opacity — debu, tipis
    const name = `gd_${i}`;
    const keyframes =
      `@keyframes ${name}{` +
      `0%{transform:translate3d(0,-6vh,0) rotate(${rot}deg) scaleX(${flip});opacity:0}` +
      `12%{opacity:${peak}}` +
      `70%{opacity:${peak}}` +
      `100%{transform:translate3d(${sway}px,-108vh,0) rotate(${rot + 40}deg) scaleX(${flip});opacity:0}}`;
    return { i, size, left, dur, delay, name, keyframes };
  });

  const css = motes.map((m) => m.keyframes).join("");

  return (
    <div className="gold-dust" aria-hidden="true" style={{ zIndex }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {motes.map((m) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={m.i}
          src={asset("SerpihEmas")}
          alt=""
          onError={hideOnError}
          className="gold-dust-mote"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            animationName: m.name,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}
