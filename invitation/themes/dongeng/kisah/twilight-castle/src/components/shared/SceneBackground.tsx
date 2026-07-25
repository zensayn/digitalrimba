"use client";

// Latar "dunia" per-section: gradien twilight sebagai dasar (selalu ada), foto
// senja opsional di atasnya (sembunyi otomatis bila file belum ada), lalu scrim
// gelap agar teks terbaca. API dipertahankan (file/scrim/edgeFade) supaya
// pemanggilan section tetap kompatibel.

import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

export default function SceneBackground({
  file,
  scrim = 0.4,
  edgeFade = false,
}: {
  file?: string;
  scrim?: number;
  // Larutkan tepi atas & bawah ke warna latar → section di tengah dokumen tetap
  // menyambung dengan tetangganya (tak ada potongan garis).
  edgeFade?: boolean;
}) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Dasar gradien twilight — selalu ada, jadi tetap bernuansa walau foto belum ada */}
      <div className="twilight-sky" style={{ position: "absolute", inset: 0 }} />
      {file && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(file)}
          alt=""
          onError={hideBrokenImage}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {/* Scrim gelap: lebih tebal di atas (area teks), menipis ke bawah */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom,
            rgba(20,16,36,${Math.min(scrim + 0.18, 0.92)}) 0%,
            rgba(20,16,36,${scrim}) 42%,
            rgba(20,16,36,${Math.max(scrim - 0.18, 0)}) 100%)`,
        }}
      />
      {edgeFade && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom,
              var(--bg) 0%, rgba(20,16,36,0) 16%,
              rgba(20,16,36,0) 84%, var(--bg) 100%)`,
          }}
        />
      )}
    </div>
  );
}
