"use client";

// Ornamen sudut bunga liar yang bergoyang halus terus-menerus (ambient).
// Membuat tiap section terbingkai & "hidup", bukan sekadar kolom teks.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Corner = "tl" | "tr" | "bl" | "br";

const MIRROR: Record<Corner, string> = {
  tl: "none",
  tr: "scaleX(-1)",
  bl: "scaleY(-1)",
  br: "scale(-1, -1)",
};

const ORIGIN: Record<Corner, string> = {
  tl: "top left",
  tr: "top right",
  bl: "bottom left",
  br: "bottom right",
};

const POS: Record<Corner, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
};

// Durasi bervariasi (3–6 dtk) supaya tiap sudut bergoyang tak serempak — organik.
const DUR = [6, 4.4, 5.4, 4.8];

// Sama seperti TopFrame: kisi Corak Insang emas jauh lebih "padat" secara
// visual daripada sulur pastel Soft Bloom pada opacity yang sama, dan sudut
// ini (segitiga sudut bl/br) dilaporkan bersaing dengan teks di dekatnya
// (audit pemilik 2026-08-06). Diredupkan proporsional, bukan per-section.
const DAMPEN = 0.72;

export default function SectionDecor({
  corners = ["tl", "br"],
  file = "SudutBunga.webp",
  size = "clamp(138px, 38vw, 260px)",
  opacity = 1,
  zIndex = 1,
}: {
  corners?: Corner[];
  file?: string;
  size?: string;
  opacity?: number;
  zIndex?: number;
}) {
  return (
    <>
      {corners.map((c, i) => (
        <div
          key={c}
          aria-hidden="true"
          data-enter={c}
          style={{
            position: "absolute",
            ...POS[c],
            width: size,
            transform: MIRROR[c],
            transformOrigin: ORIGIN[c],
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
              // Pivot di pangkal (sudut tempat rangkaian menempel) → ujung bunga
              // bergoyang seperti tertiup angin, pangkalnya diam.
              transformOrigin: ORIGIN[c],
              animation: `${i % 2 ? "swayAlt" : "sway"} ${DUR[i % DUR.length]}s ease-in-out ${(i * 0.5).toFixed(1)}s infinite alternate`,
            }}
          />
        </div>
      ))}
    </>
  );
}
