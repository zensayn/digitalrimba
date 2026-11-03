"use client";

// Judul section: font script (seperti monogram R & K di cover) diapit sepasang
// garis tipis — pengganti pil "eyebrow-chip" yang dirasa terlalu kaku
// (feedback owner 2026-07-06), lalu disederhanakan dari tangkai/pin jadi garis
// polos (feedback owner 2026-08-01: elemen "pin" terasa mengganggu, referensi
// cuma pakai garis lurus). Varian `serif` dipakai untuk judul display yang
// sudah ada (RSVP, Tanda Kasih, Kenangan Kami).

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
  // Lebar garis kiri-kanan (nama lama dipertahankan untuk kompatibilitas prop)
  flowerSize?: string;
  style?: React.CSSProperties;
}) {
  const glowShadow =
    "0 1px 3px var(--paper-strong), 0 0 18px var(--paper-strong), 0 0 34px var(--paper)";

  return (
    <div className="flex items-center justify-center" style={{ gap: "clamp(8px, 2.5vw, 13px)", ...style }}>
      <div className="rule-fade" style={{ flex: "0 1 auto", width: flowerSize }} />
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
      <div className="rule-fade rule-fade-flip" style={{ flex: "0 1 auto", width: flowerSize }} />
    </div>
  );
}
