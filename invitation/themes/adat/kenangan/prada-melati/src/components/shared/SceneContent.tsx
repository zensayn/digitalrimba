import type { ReactNode } from "react";

/**
 * Kolom konten section di dalam KelirScene (spec tata-letak §1). Padding
 * membebaskan teks dari ornamen: atas dari aktor (via --kelir-safe-top yang
 * diset KelirScene per preset), samping dari pinggiran, bawah dari tumpal.
 * Lebar teks diatur `maxWidth`, BUKAN padding samping tebal — itu yang dulu
 * membuat konten sesak (§0 cacat #1).
 *
 * - align "center" (default): center di sisa ruang bawah zona aman atas.
 * - align "top": konten menempel tepat di bawah zona aman atas (cocok untuk
 *   konten pendek di bawah medallion, tanpa gap mengambang — mis. greeting).
 * - align "bottom": konten tenggelam ke bawah (cover).
 * - align "lower": ke bawah dengan padding bawah lebih tebal (gift/dresscode).
 * - scrim: default MATI. Legibility datang dari .kelir-plate/.text-halo lokal
 *   (§4), bukan blob gelap menyeluruh. Section terang boleh nyalakan (lembut).
 */
export default function SceneContent({
  children,
  align = "center",
  scroll = false,
  maxWidth = 360,
  scrim = false,
}: {
  children: ReactNode;
  align?: "center" | "top" | "bottom" | "lower";
  scroll?: boolean;
  maxWidth?: number;
  scrim?: boolean;
}) {
  const justifyContent =
    align === "bottom" || align === "lower" ? "flex-end" : align === "top" ? "flex-start" : "center";

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
        justifyContent,
        alignItems: "center",
        textAlign: "center",
        // Konten mengalir & menumbuhkan section — tak ada scroll di dalam section.
        overflowY: "visible",
        // Atas: zona aman aktor dari KelirScene. Samping: ciut (26–44px) — lebar
        // nyata dipatok maxWidth. Bawah: bebaskan hem, lebih tebal untuk "lower".
        paddingTop: "var(--kelir-safe-top, clamp(20px, 5svh, 40px))",
        paddingLeft: "clamp(26px, 7vw, 44px)",
        paddingRight: "clamp(26px, 7vw, 44px)",
        paddingBottom: align === "lower" ? "clamp(96px, 16svh, 148px)" : "clamp(72px, 12svh, 120px)",
      }}
    >
      {scrim && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(72% 58% at 50% 52%, rgba(20,12,6,0.5) 0%, rgba(20,12,6,0.22) 60%, transparent 82%)",
          }}
        />
      )}
      <div className="scene-reveal relative w-full" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
