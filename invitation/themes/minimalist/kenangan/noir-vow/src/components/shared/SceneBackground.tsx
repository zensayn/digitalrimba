"use client";

// Scrim gelap per-section di atas video global (satu <video>, lihat
// VideoBackdrop.tsx yang dipasang sekali di InvitationExperience) — makin
// tebal di atas (area teks), menipis ke bawah. Tiap section bisa beda
// kegelapan (prop scrim) tanpa perlu video sendiri-sendiri.

export default function SceneBackground({
  scrim = 0.5,
  edgeFade = false,
}: {
  scrim?: number;
  // Larutkan tepi atas & bawah ke warna latar → section di tengah dokumen
  // tetap menyambung dengan section tetangga (tak ada potongan garis).
  edgeFade?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom,
            rgba(10,10,10,${Math.min(scrim + 0.18, 0.92)}) 0%,
            rgba(10,10,10,${scrim}) 42%,
            rgba(10,10,10,${Math.max(scrim - 0.18, 0)}) 100%)`,
        }}
      />
      {edgeFade && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom,
              var(--bg) 0%, var(--paper-clear) 16%,
              var(--paper-clear) 84%, var(--bg) 100%)`,
          }}
        />
      )}
    </div>
  );
}
