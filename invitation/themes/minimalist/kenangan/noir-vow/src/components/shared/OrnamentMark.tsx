"use client";

// Aksen geometris satu warna (var(--accent-line)) — pengganti ilustrasi bunga
// Soft Bloom. Elegant minimalist: cuma garis tipis (hairline), lingkaran,
// titik. Digambar SVG inline (bukan gambar raster) supaya tajam di semua
// ukuran layar dan warnanya otomatis ikut token tema. Semua kind digambar
// dalam orientasi kanonis (mis. "corner" selalu untuk sudut kiri-atas) —
// pemanggil yang menangani mirror/rotate lewat transform CSS.

type Kind =
  | "corner"    // ornamen sudut foto Gallery (dulu SudutBunga.webp)
  | "corner2"   // ornamen sudut varian (dulu SudutBunga2.webp)
  | "ringOpen"; // ring terbuka untuk monogram (dulu WreathInisial.webp)

const VIEWBOX: Record<Kind, string> = {
  corner: "0 0 100 100",
  corner2: "0 0 100 100",
  ringOpen: "0 0 100 100",
};

export default function OrnamentMark({
  kind,
  className,
  style,
}: {
  kind: Kind;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Hairline: garis & titik pakai --accent-line (38% opacity), bukan --accent
  // solid — referensi minimalis pakai garis sangat tipis & halus, bukan tebal.
  const line = { fill: "none", stroke: "var(--accent-line)", strokeWidth: 1, strokeLinecap: "round" as const };
  const dot = { fill: "var(--accent-line)" };

  return (
    <svg
      viewBox={VIEWBOX[kind]}
      aria-hidden="true"
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {kind === "corner" && (
        <>
          <path d="M6 58 Q6 6 58 6" {...line} />
          <line x1="58" y1="6" x2="80" y2="6" {...line} />
          <circle cx="90" cy="6" r="2.2" {...dot} />
        </>
      )}
      {kind === "corner2" && (
        <>
          <line x1="6" y1="6" x2="72" y2="72" {...line} />
          <line x1="52" y1="52" x2="70" y2="40" {...line} />
          <circle cx="80" cy="80" r="2.2" {...dot} />
        </>
      )}
      {kind === "ringOpen" && (
        <circle
          cx="50"
          cy="50"
          r="46"
          {...line}
          strokeWidth={1}
          strokeDasharray="278 10"
          strokeDashoffset="72"
          transform="rotate(-90 50 50)"
        />
      )}
    </svg>
  );
}
