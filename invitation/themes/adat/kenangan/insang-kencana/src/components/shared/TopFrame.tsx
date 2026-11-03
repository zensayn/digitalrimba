"use client";

// Bingkai lengkung botani (BingkaiAtas) di puncak section — seperti gerbang taman.
// Bergoyang sangat halus dari puncak. Fallback aman.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Nilai opacity per-section (0.85–0.95) diwarisi apa adanya dari Soft Bloom,
// disetel untuk sulur pastel lembut di atas kertas terang. Garis emas Corak
// Insang yang presisi/geometris jauh lebih "solid" secara visual pada bobot
// yang sama di atas hijau tua — bersaing dengan judul di bawahnya (audit
// pemilik 2026-08-06). Diredupkan proporsional di sini (bukan ditulis ulang
// di tiap section) supaya baris "opacity={0.85}" dkk tetap sebagai relatif
// "seberapa tebal dibanding sudut lain", cukup levelnya yang turun.
const DAMPEN = 0.72;

export default function TopFrame({
  file = "BingkaiAtas.webp",
  opacity = 1,
  maxWidth = "var(--frame-max)",
  zIndex = 2,
}: {
  file?: string;
  opacity?: number;
  /** Bawaan: token --frame-max yang disuntik rhythmVars() di <section>. Rumus
   *  zona aman atas (--section-pad-top) membaca token yang SAMA, jadi lebar
   *  bingkai dan ruang yang disediakan untuknya tak bisa lagi melenceng
   *  sendiri-sendiri. Isi manual hanya bila memang ingin memutus ikatan itu. */
  maxWidth?: number | string;
  zIndex?: number;
}) {
  return (
    <div
      aria-hidden="true"
      data-enter="top"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "100%",
        maxWidth,
        pointerEvents: "none",
        zIndex,
      }}
    >
      <img
        src={asset(file)}
        alt=""
        onError={hideBrokenImage}
        className="ambient-anim"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          opacity: opacity * DAMPEN,
          transformOrigin: "50% 0",
          animation: "swayFrame 9s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
