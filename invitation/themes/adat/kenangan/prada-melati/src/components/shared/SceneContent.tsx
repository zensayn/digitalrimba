import type { ReactNode } from "react";

/**
 * Kolom konten section di dalam KelirScene. Padding-nya membebaskan teks dari
 * ornamen: atas dari aktor, samping dari pinggiran, bawah dari tumpal. Scrim
 * radial lembut menaikkan keterbacaan di atas kain & emas.
 *
 * - align "center" (default): konten di tengah safe-zone.
 * - align "bottom": konten tenggelam ke bawah (cover/greeting).
 * - scroll: section padat (rsvp, lovestory) boleh scroll di dalam viewport-nya.
 */
export default function SceneContent({
  children,
  align = "center",
  scroll = false,
  maxWidth = 340,
  scrim = true,
}: {
  children: ReactNode;
  align?: "center" | "bottom";
  scroll?: boolean;
  maxWidth?: number;
  scrim?: boolean;
}) {
  return (
    <div
      className="relative"
      data-prevent-snap={scroll ? "true" : undefined}
      style={{
        width: "100%",
        flex: "1 0 auto",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: scroll ? "center" : align === "bottom" ? "flex-end" : "center",
        alignItems: "center",
        textAlign: "center",
        // Konten mengalir & menumbuhkan section — tak ada scroll di dalam section.
        overflowY: "visible",
        padding: "clamp(84px, 15svh, 150px) clamp(46px, 13vw, 82px) clamp(96px, 16svh, 148px)",
      }}
    >
      {scrim && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(76% 62% at 50% 50%, rgba(20,12,6,0.82) 0%, rgba(20,12,6,0.44) 54%, transparent 85%)",
          }}
        />
      )}
      <div className="scene-reveal relative w-full" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
