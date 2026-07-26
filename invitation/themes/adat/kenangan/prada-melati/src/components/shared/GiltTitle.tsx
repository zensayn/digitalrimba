"use client";

import { useMotionValue } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

import { asset } from "@/lib/assets";
import { useSceneProgress } from "./scene-progress";
import GiltSweep from "./GiltSweep";

// Judul berhias — mengapit kicker/eyebrow section dengan sepasang sulur LungTitel
// (kiri apa adanya, kanan di-scaleX(-1)) yang blossom-nya menghadap teks. Emas →
// ikut kilau via GiltSweep + progres scene (satu mekanisme, lihat GiltDivider).
// Membungkus, tak menata teks: caller memberi <span> ber-styling sendiri sebagai
// children, jadi setiap section tetap pegang tipografi kicker-nya.
export default function GiltTitle({
  children,
  flankWidth = 34,
  gap = 8,
  className,
  style,
}: {
  children: ReactNode;
  /** Lebar tiap sulur pengapit px; tinggi ikut rasio 10:3 aset (600×180). */
  flankWidth?: number;
  gap?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ctx = useSceneProgress();
  const idle = useMotionValue(0.5);
  const progress = ctx ?? idle;

  const flank = (mirror: boolean) => (
    <GiltSweep
      src={asset("LungTitel")}
      progress={progress}
      style={{
        width: flankWidth,
        aspectRatio: "10 / 3",
        flex: "0 0 auto",
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
      imgStyle={{ filter: "saturate(0.82) brightness(0.92)" }}
    />
  );

  return (
    <div
      className={className}
      // maxWidth 100%: pengapit + teks tak pernah melebihi kolom konten. Tanpa ini,
      // judul panjang (mis. "Keluarga & Kerabat") yang disuap SectionHeader meluber
      // melewati pinggiran batik — teks jadi mepet/menembus ornamen.
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap, maxWidth: "100%", ...style }}
    >
      {flank(false)}
      {/* Kicker pendek tetap satu baris (ruang cukup); judul panjang boleh wrap
          agar muat di kolom. minWidth:0 mengizinkan flex item menyusut & membungkus
          alih-alih memaksa satu baris yang meluber. */}
      <span style={{ minWidth: 0 }}>{children}</span>
      {flank(true)}
    </div>
  );
}
