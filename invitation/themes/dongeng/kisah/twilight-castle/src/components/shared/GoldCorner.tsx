import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// Ornamen sudut emas. SudutEmas.webp digambar untuk sudut kiri-atas; sudut
// lain di-mirror via scaleX/scaleY. Fallback aman bila aset belum ada.
const TRANSFORMS: Record<string, string> = {
  tl: "none",
  tr: "scaleX(-1)",
  bl: "scaleY(-1)",
  br: "scale(-1, -1)",
};
const POS: Record<string, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },
  bl: { bottom: 0, left: 0 },
  br: { bottom: 0, right: 0 },
};

export default function GoldCorner({
  corner = "tl",
  size = "clamp(90px, 26vw, 170px)",
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  size?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("SudutEmas.webp")}
      alt=""
      aria-hidden
      onError={hideBrokenImage}
      style={{ position: "absolute", width: size, transform: TRANSFORMS[corner], pointerEvents: "none", zIndex: 1, ...POS[corner] }}
    />
  );
}
