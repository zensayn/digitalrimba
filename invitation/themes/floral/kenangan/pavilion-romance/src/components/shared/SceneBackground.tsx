"use client";

// Latar lukisan padang bunga (full-bleed) + scrim putih transparan supaya teks
// tetap terbaca. Fallback aman kalau gambar belum ada.

import { themeAsset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function SceneBackground({
  file = "LatarPavilionGarden.webp",
  scrim = 0.5,
  edgeFade = false,
  priority = false,
}: {
  file?: string;
  scrim?: number;
  // Larutkan tepi atas & bawah ke warna kertas → section painterly di tengah
  // dokumen tetap menyambung dengan section tetangga (tak ada potongan garis).
  edgeFade?: boolean;
  priority?: boolean;
}) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <img
        src={themeAsset(file)}
        alt=""
        aria-hidden="true"
        onError={hideBrokenImage}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
      />
      {/* Scrim: lebih tebal di atas (area teks), menipis ke bawah (padang terlihat) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom,
            rgba(253,252,250,${Math.min(scrim + 0.18, 0.92)}) 0%,
            rgba(253,252,250,${scrim}) 42%,
            rgba(253,252,250,${Math.max(scrim - 0.18, 0)}) 100%)`,
        }}
      />
      {edgeFade && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom,
              var(--bg) 0%, rgba(253,252,250,0) 16%,
              rgba(253,252,250,0) 84%, var(--bg) 100%)`,
          }}
        />
      )}
    </div>
  );
}
