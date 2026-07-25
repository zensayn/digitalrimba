"use client";

// Ornamen sudut yang bergoyang halus terus-menerus (ambient).
// Tiap sudut memakai asset yang sesuai gravitasi bentuknya: sudut atas diisi
// juntaian tangkai (SwayVineSprig, menggantung dari atas), sudut bawah diisi
// kluster mawar (SwayRoseCluster, tumbuh dari bawah) — sisi kanan di-mirror.
// Membuat tiap section terbingkai & "hidup", bukan sekadar kolom teks.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

type Corner = "tl" | "tr" | "bl" | "br";

const FILES: Record<Corner, string> = {
  tl: "SwayVineSprig.webp",
  tr: "SwayVineSprig.webp",
  bl: "SwayRoseCluster.webp",
  br: "SwayRoseCluster.webp",
};

// Mirror horizontal saja — asset sudah berorientasi benar secara vertikal.
const MIRROR: Record<Corner, string> = {
  tl: "none",
  tr: "scaleX(-1)",
  bl: "none",
  br: "scaleX(-1)",
};

const POS: Record<Corner, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
};

// Pivot goyangan: juntaian berayun dari gantungannya di atas,
// kluster berayun dari pangkal batangnya di bawah.
const SWAY_ORIGIN: Record<Corner, string> = {
  tl: "50% 0%",
  tr: "50% 0%",
  bl: "50% 100%",
  br: "50% 100%",
};

// Konten kedua asset duduk di tengah kanvas (x ±30–70%) → dorong boks sebagian
// keluar tepi supaya flora yang terlihat benar-benar menempel sudut.
const NUDGE: Record<Corner, React.CSSProperties> = {
  tl: { marginLeft: "-9%", marginTop: "-2%" },
  tr: { marginRight: "-9%", marginTop: "-2%" },
  bl: { marginLeft: "-9%", marginBottom: "-6%" },
  br: { marginRight: "-9%", marginBottom: "-6%" },
};

// Durasi bervariasi (4–6 dtk) supaya tiap sudut bergoyang tak serempak — organik.
const DUR = [6, 4.4, 5.4, 4.8];

export default function SectionDecor({
  corners = ["bl", "br"],
  size = "clamp(120px, 34vw, 230px)",
  opacity = 1,
  zIndex = 1,
}: {
  corners?: Corner[];
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
            ...NUDGE[c],
            width: size,
            transform: MIRROR[c],
            pointerEvents: "none",
            zIndex,
          }}
        >
          <img
            src={asset(FILES[c])}
            alt=""
            onError={hideBrokenImage}
            className="ambient-anim"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              opacity,
              transformOrigin: SWAY_ORIGIN[c],
              animation: `${i % 2 ? "swayAlt" : "sway"} ${DUR[i % DUR.length]}s ease-in-out ${(i * 0.5).toFixed(1)}s infinite alternate`,
            }}
          />
        </div>
      ))}
    </>
  );
}
