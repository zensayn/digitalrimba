"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useInView, useReducedMotion } from "framer-motion";

import { asset, hideOnError } from "@/lib/assets";
import { useScrollContainer } from "./scroll-context";
import GiltSweep from "./GiltSweep";
import type { KelirPreset } from "./sceneKelir";

export default function KelirScene({
  preset,
  kain,
  children,
}: {
  preset: KelirPreset;
  /** Nama berkas KainBadan; kosong → latar --bg rata (Fase 1). */
  kain?: string;
  children?: ReactNode;
}) {
  const container = useScrollContainer();
  const reduced = useReducedMotion() ?? false;

  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const actorIn = useInView(actorRef, { once: false, margin: "-10% 0px -10% 0px" });

  // Progres section terhadap kontainer scroll nyata (spec §5.1).
  const { scrollYProgress } = useScroll({
    container: container ?? undefined,
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  const isHero = preset.actorScale === undefined || preset.actorScale >= 1;

  // Menancap (spec §5.2): turun ke sumbu, overshoot miring, redam. Reduced → fade.
  const rest = reduced ? { opacity: 1 } : { opacity: 1, y: "0%", rotate: 0 };
  const start = reduced ? { opacity: 0 } : { opacity: 0, y: "-8%", rotate: 3 };

  return (
    <div
      ref={sceneRef}
      className="relative w-full overflow-hidden"
      style={{ flex: "1 0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {/* 1 — KainBadan (diam, tanpa kilau). Kosong → --bg rata. */}
      {kain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(kain)}
          alt=""
          aria-hidden="true"
          onError={hideOnError}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
      ) : (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "var(--bg)", zIndex: 0 }} />
      )}

      {/* 2 — Blencong (berkedip): pendar hangat menembus tenunan. Nol byte. */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background: `radial-gradient(60% 45% at 50% ${preset.blencongY}, rgba(227,199,102,${0.22 * preset.blencongBright}) 0%, rgba(201,162,39,${0.10 * preset.blencongBright}) 35%, transparent 70%)`,
        }}
        // Kedip pelita minyak: keyframe tak simetris, bukan napas sinus (spec gerak §2.2).
        animate={reduced ? undefined : { opacity: [0.9, 1, 0.86, 0.97, 0.88, 1], scale: [1, 1.03, 1.01, 1.04, 1, 1.02] }}
        transition={
          reduced
            ? undefined
            : { duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", times: [0, 0.15, 0.4, 0.6, 0.82, 1] }
        }
      />

      {/* 3 — Aktor (menancap + kilau). gallery pakai sprig 4-sudut; sisanya satu aktor. */}
      {preset.actor && !preset.actorCorners && (
        <motion.div
          ref={actorRef}
          initial={start}
          animate={actorIn ? rest : start}
          transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 120, damping: 14 }}
          style={{
            position: "absolute",
            left: "50%",
            x: "-50%",
            zIndex: 2,
            pointerEvents: "none",
            // Aktor duduk di zona ATAS (spec §4): hero besar di sumbu, ceplok di
            // actorY. Safe-zone teks ada di bawahnya, diatur oleh section.
            // Ukuran/anchor aktor pakai svh (viewport), bukan % section — supaya
            // di section yang tumbuh panjang aktor tetap di zona atas & tak membesar.
            ...(isHero
              ? { top: preset.actorFromTop ? "0svh" : "5svh", height: "56svh", aspectRatio: "2 / 3" }
              : { top: preset.actorY, width: `${(preset.actorScale ?? 0.6) * 100}%`, aspectRatio: "1 / 1" }),
          }}
        >
          <GiltSweep
            src={asset(preset.actor)}
            progress={scrollYProgress}
            style={{ width: "100%", height: "100%" }}
            // Aset ter-generate lebih jenuh dari palet prada (#C9A227). Redam
            // sedikit ke arah sogan-emas tanpa membunuh crackle — bukan bayangan.
            imgStyle={{ filter: "saturate(0.82) brightness(0.92)" }}
          />
        </motion.div>
      )}

      {/* 3b — Aktor sudut (gallery): sprig kecil dikilau di empat sudut, bukan
             satu aktor tengah (spec §6f: MelatiSprig ×4 sudut). Tiap sudut
             diputar 90° agar sprig menjuntai ke arah dalam. 404 tersembunyi. */}
      {preset.actor && preset.actorCorners && (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          {(
            [
              { top: 0, left: 0, rotate: 0 },
              { top: 0, right: 0, rotate: 90 },
              { bottom: 0, right: 0, rotate: 180 },
              { bottom: 0, left: 0, rotate: 270 },
            ] as const
          ).map(({ rotate, ...anchor }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                ...anchor,
                width: `${(preset.actorScale ?? 0.4) * 100}%`,
                aspectRatio: "1 / 1",
                transform: `rotate(${rotate}deg)`,
                transformOrigin: "center",
              }}
            >
              <GiltSweep
                src={asset(preset.actor!)}
                progress={scrollYProgress}
                style={{ width: "100%", height: "100%" }}
                // Selaras dengan aktor tengah: redam sedikit ke sogan-emas.
                imgStyle={{ filter: "saturate(0.82) brightness(0.92)" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 4 — Pinggiran kiri & kanan (diam). Sisi kanan diputar 180°, bukan flip
             (spec §6a) — melestarikan arah lereng parang. 404 tersembunyi. */}
      {(["left", "right"] as const).map((side) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={side}
          src={asset("PinggiranTile")}
          alt=""
          aria-hidden="true"
          onError={hideOnError}
          style={{
            position: "absolute",
            top: 0,
            [side]: 0,
            width: "clamp(24px, 6vw, 56px)",
            height: "100%",
            zIndex: 4,
            pointerEvents: "none",
            objectFit: "cover",
            transform: side === "right" ? "rotate(180deg)" : undefined,
          }}
        />
      ))}

      {/* 5 — Hem (tumpal/sulur/melati/kawung per preset, diam). 404 tersembunyi. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(preset.hem ?? "TumpalBand")}
        alt=""
        aria-hidden="true"
        onError={hideOnError}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", zIndex: 4, pointerEvents: "none" }}
      />

      {/* 6 — Konten section. Flex kolom penuh: section menaruh kontennya di
             zona bawah (mis. marginTop:auto) supaya tidak menimpa aktor. */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flex: "1 0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
