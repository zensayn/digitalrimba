"use client";

import { useMotionValue } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

import { asset, hideOnError } from "@/lib/assets";
import GiltSweep from "./GiltSweep";

type GebyokVariant = "gebyok" | "praba" | "tumpal" | "none";
type FramedVariant = Exclude<GebyokVariant, "none">;

const FRAMES: Record<FramedVariant, string> = {
  gebyok: "BingkaiGebyok",
  praba: "BingkaiPraba",
  tumpal: "BingkaiTumpal",
};

// Bukaan tiap bingkai dalam % dari kartu (top/right/bottom/left). Foto di-inset
// ke sini supaya duduk DI DALAM bukaan bingkai, bukan menyembul ke margin
// transparan aset. Nilai diukur dari tiap PNG bingkai (objectFit:fill menjaga
// posisi relatif fitur, jadi % tetap valid walau rasio aset ≠ rasio kartu):
//   gebyok  → gerbang: kolom ~26/74%, puncak lengkung ~30%, terbuka di bawah.
//   praba   → halo lonjong: oval ~x28–72%, y30–88%, mahkota api di atas.
//   tumpal  → persegi dengan tumpal: inset ~14% keliling.
//   none    → tanpa bingkai gerbang, foto penuh + tepi tipis (spec revisi: foto
//             mempelai dinilai terlalu ramai dibingkai gerbang besar).
const OPENINGS: Record<GebyokVariant, { top: number; right: number; bottom: number; left: number }> = {
  gebyok: { top: 20, right: 20, bottom: 9, left: 20 },
  praba: { top: 29, right: 27, bottom: 11, left: 27 },
  tumpal: { top: 13, right: 14, bottom: 13, left: 14 },
  none: { top: 0, right: 0, bottom: 0, left: 0 },
};

export default function GebyokCard({
  variant = "gebyok",
  photo,
  alt = "",
  aspectRatio = "3 / 4",
  corners = false,
  children,
  className,
  style,
}: {
  variant?: GebyokVariant;
  photo: string;
  alt?: string;
  aspectRatio?: string;
  corners?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const idle = useMotionValue(0.5);
  const opening = OPENINGS[variant];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        // Latar dihapus (transparan): bingkai gebyok "mengambang" di atas scene,
        // bukan duduk di kotak --surface. Foto sudah di-inset ke bukaan bingkai.
        background: "transparent",
        // "none": tepi tipis sendiri (bukan PNG gerbang) supaya foto tetap
        // terbaca sebagai kartu, tak mengambang lepas di atas kain.
        border: variant === "none" ? "1px solid var(--border)" : undefined,
        boxShadow: variant === "none" ? "0 6px 20px rgba(20,12,6,0.4)" : undefined,
        ...style,
      }}
    >
      <div
        role="img"
        aria-label={alt || undefined}
        style={{
          position: "absolute",
          top: `${opening.top}%`,
          right: `${opening.right}%`,
          bottom: `${opening.bottom}%`,
          left: `${opening.left}%`,
          backgroundImage: `url("${photo}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {variant !== "none" && (
        <GiltSweep
          src={asset(FRAMES[variant])}
          progress={idle}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          imgStyle={{ objectFit: "fill", filter: "saturate(0.82) brightness(0.92)" }}
        />
      )}
      {corners && (
        <img
          src={asset("RonceanSudut")}
          alt=""
          aria-hidden="true"
          onError={hideOnError}
          draggable={false}
          decoding="async"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "28%",
            height: "auto",
            pointerEvents: "none",
          }}
        />
      )}
      {children && (
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}
