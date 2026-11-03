"use client";

// Judul section: font script (seperti monogram R & K di cover) diapit sepasang
// tangkai bunga — pengganti pil "eyebrow-chip" yang dirasa terlalu kaku
// (feedback owner 2026-07-06). Varian `serif` dipakai untuk judul display
// yang sudah ada (RSVP, Tanda Kasih, Kenangan Kami) agar tiap judul section
// sama-sama berhias bunga.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function FloralTitle({
  children,
  as: Tag = "h2",
  serif = false,
  size,
  glow = false,
  flowerSize = "clamp(24px, 6.2vw, 34px)",
  style,
}: {
  children: React.ReactNode;
  as?: "h2" | "p";
  serif?: boolean;
  size?: string;
  // Cahaya kertas di belakang huruf — untuk judul yang duduk di atas flora
  glow?: boolean;
  flowerSize?: string;
  style?: React.CSSProperties;
}) {
  // Dua lapis pertama (blur sangat kecil, var(--bg) PEKAT bukan tembus pandang)
  // menempel rapat ke tepi huruf seperti kontur tipis — inilah yang menahan
  // legibilitas saat teks emas kebetulan mendarat di bagian foto LatarPadang
  // yang juga terang/keemasan (audit pemilik 2026-08-06: teks nyaris hilang
  // di bagian istana yang bercahaya). Tiga lapis berikutnya tetap halo lembut
  // radius besar seperti semula, supaya efeknya tetap "cahaya", bukan stiker
  // berkontur kaku.
  const glowShadow =
    "0 0 2px var(--bg), 0 0 4px var(--bg), 0 1px 3px var(--paper-strong), 0 0 18px var(--paper-strong), 0 0 34px var(--paper)";
  const sprig = (flip: boolean) => (
    <img
      src={asset("TangkaiKuncup.webp")}
      alt=""
      aria-hidden="true"
      onError={hideBrokenImage}
      style={{
        width: flowerSize,
        height: flowerSize,
        objectFit: "contain",
        flexShrink: 0,
        transform: `${flip ? "scaleX(-1) " : ""}rotate(-8deg)`,
      }}
    />
  );

  return (
    <div className="flex items-center justify-center" style={{ gap: "clamp(8px, 2.5vw, 13px)", ...style }}>
      {sprig(true)}
      <Tag
        className={serif ? "type-title" : "font-script"}
        style={
          serif
            ? { textShadow: glow ? glowShadow : undefined }
            : {
                fontSize: size ?? "clamp(36px, 9.8vw, 52px)",
                color: "var(--accent)",
                lineHeight: 1.25,
                textAlign: "center",
                textShadow: glow ? glowShadow : undefined,
              }
        }
      >
        {children}
      </Tag>
      {sprig(false)}
    </div>
  );
}
