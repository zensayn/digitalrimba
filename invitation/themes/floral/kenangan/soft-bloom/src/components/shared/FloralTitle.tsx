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
  flowerSize = "clamp(20px, 5.5vw, 28px)",
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
  const glowShadow =
    "0 1px 3px rgba(253,252,250,0.95), 0 0 18px rgba(253,252,250,0.9), 0 0 34px rgba(253,252,250,0.8)";
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
                fontSize: size ?? "clamp(30px, 8.5vw, 40px)",
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
