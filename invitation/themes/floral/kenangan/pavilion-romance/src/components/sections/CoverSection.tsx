"use client";

// src/components/sections/CoverSection.tsx
// ─── Cover — Pavilion Romance ─────────────────────────────────────────────────
// Latar taman paviliun, canopy botani, monogram dalam frame, dan countdown.

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import FallingFlowers from "@/components/shared/FallingFlowers";
import FloralTitle from "@/components/shared/FloralTitle";
import SceneBackground from "@/components/shared/SceneBackground";
import TopFrame from "@/components/shared/TopFrame";
import Meadow from "@/components/shared/Meadow";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import { invitationPhoto } from "@/lib/invitation-media";
import type { InvitationConfig } from "@/lib/config-types";

// ── Countdown ──────────────────────────────────────────────────────────────────
// Angka di-update langsung via textContent (bukan setState): setState 1 dtk sekali
// membuat SELURUH CoverSection (banyak elemen framer-motion) render ulang tiap
// detik → main thread macet ±100-200ms berkala → scroll terasa "melekat"/magnet
// di semua section. Dengan DOM langsung, tiap detak cuma menulis 4 string.
function Countdown({ targetDateString }: { targetDateString: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cells: Record<string, HTMLElement | null> = {
      d: root.querySelector("[data-cd=d]"),
      h: root.querySelector("[data-cd=h]"),
      m: root.querySelector("[data-cd=m]"),
      s: root.querySelector("[data-cd=s]"),
    };
    const end = new Date(targetDateString).getTime();
    const tick = () => {
      const gap = Math.max(0, end - Date.now());
      const v = {
        d: Math.floor(gap / 86_400_000),
        h: Math.floor((gap % 86_400_000) / 3_600_000),
        m: Math.floor((gap % 3_600_000) / 60_000),
        s: Math.floor((gap % 60_000) / 1_000),
      };
      for (const k of ["d", "h", "m", "s"] as const) {
        const el = cells[k];
        if (el) el.textContent = String(v[k]).padStart(2, "0");
      }
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDateString]);

  return (
    <motion.div
      ref={rootRef}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.2 }}
      style={{ display: "flex", gap: "12px" }}
    >
      {[
        { key: "d", label: "Hari" },
        { key: "h", label: "Jam" },
        { key: "m", label: "Menit" },
        { key: "s", label: "Detik" },
      ].map(({ key, label }) => (
        <div
          key={key}
          className="specimen-card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            minWidth: 52,
            padding: "12px 8px",
          }}
        >
          <span data-cd={key} className="font-display" style={{ fontSize: "clamp(22px, 6vw, 32px)", fontWeight: 500, color: "var(--accent)", lineHeight: 1 }}>
            00
          </span>
          <span className="type-label" style={{ letterSpacing: "0.16em" }}>
            {label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

export default function CoverSection({
  couple,
  weddingDate: weddingDateString,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const { groom, bride } = couple;
  const weddingDate = new Date(weddingDateString);
  const sectionRef = useRef<HTMLElement>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dateStr = weddingDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleOpen = () => {
    document.dispatchEvent(new CustomEvent("invitation-open"));
  };
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onTouch = () => handleOpen();
    el.addEventListener("touchstart", onTouch, { once: true });
    el.addEventListener("click", handleOpen, { once: true });
    return () => {
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("click", handleOpen);
    };
  }, []);

  return (
    <section id="cover" className="snap-section reveal-scope" ref={sectionRef} style={{ background: "var(--bg)", justifyContent: "flex-start" }}>
      {/* Latar lukisan padang bunga + scrim. edgeFade: tepi bawah larut ke kertas
          → tak ada garis potong lurus ke section berikutnya (jahitan menyambung). */}
      <SceneBackground file="LatarPavilionGarden.webp" scrim={0.5} edgeFade priority />
      {/* Kanopi botani di puncak */}
      <TopFrame maxWidth={640} zIndex={2} />

      {/* Dekorasi berat di-defer setelah first paint (LCP). Lapisan kedalaman:
          hamparan MeadowBloomBand statis di belakang (kanvas 1536×1024, bunga
          di 8–97% bagian bawah), sprig Meadow bergoyang di depannya. */}
      {bgLoaded && (
        <>
          <img
            src={asset("MeadowBloomBand.webp")}
            alt=""
            aria-hidden="true"
            onError={hideBrokenImage}
            loading="lazy"
            decoding="async"
            data-enter="bottom"
            style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: "auto", zIndex: 1, pointerEvents: "none" }}
          />
          <Meadow sprigs={5} zIndex={1} />
        </>
      )}

      {/* Bunga liar berjatuhan */}
      <FallingFlowers count={12} zIndex={3} />

      {/* Larutkan tepi bawah (padang + tangkai meadow) ke warna kertas.
          Diletakkan DI ATAS semua flora (zIndex 5) supaya band bunga tak terpotong
          garis lurus di batas section — menyambung mulus ke section berikutnya. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "clamp(120px, 22vh, 210px)",
          background: "linear-gradient(to bottom, rgba(253,252,250,0) 0%, rgba(253,252,250,0.7) 55%, var(--bg) 92%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Konten utama. Tidak di-center vertikal: bingkai atas melebar mengikuti
          viewport (persegi, dense ±30% lebarnya), jadi pada layar lebar konten
          yang di-center akan naik menabrak bunga (monogram tenggelam — temuan
          QA). paddingTop berskala dengan lebar bingkai → monogram selalu mulai
          di bawah lengkung bunga, di semua ukuran layar. */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "min(30vw, 200px) 32px clamp(28px, 5vh, 52px)",
          width: "100%",
        }}
      >
        {/* HeroPavilionFrame memang dibuat sebagai jendela portrait. Foto kedua
            mempelai ditempatkan di bukaan arch, bukan mengecilkannya menjadi
            ornamen monogram. */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          style={{
            position: "relative",
            width: "clamp(212px, 58vw, 276px)",
            aspectRatio: "2 / 3",
            marginBottom: "14px",
            // TANPA overflow:hidden di sini. Foto sudah di-clip oleh div-dalam
            // (punya overflow+borderRadius sendiri). Dulu overflow:hidden di sini
            // memotong PILAR HeroPavilionFrame tiap animasi `breathe` membesar —
            // frame (PNG transparan) tak perlu di-clip, jadi dibiarkan bernapas.
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "17% 15% 12%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              overflow: "hidden",
              borderRadius: "50% 50% 3% 3% / 30% 30% 3% 3%",
              background: "var(--surface-2)",
            }}
          >
            <img
              src={invitationPhoto(groom.photo)}
              alt=""
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
            <img
              src={invitationPhoto(bride.photo)}
              alt=""
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
          </div>
          <img
            src={asset("HeroPavilionFrame.webp")}
            alt=""
            fetchPriority="high"
            className="ambient-anim"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              animation: "breathe 6s ease-in-out infinite",
            }}
          />
        </motion.div>

        {/* Label undangan — di bawah monogram, di bukaan lengkung yang lapang
            (di puncak ia terjepit & tertimpa kluster bunga kiri-kanan) */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{ marginBottom: "14px" }}
        >
          <FloralTitle as="p" glow size="clamp(21px, 6vw, 27px)" flowerSize="clamp(15px, 4vw, 20px)">
            Undangan Pernikahan
          </FloralTitle>
        </motion.div>

        {/* Nama mempelai */}
        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="font-display"
          style={{
            fontSize: "clamp(40px, 12vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.05,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {groom.name}
          <span
            className="font-script"
            style={{ display: "block", fontSize: "0.62em", color: "var(--accent)", margin: "-2px 0", fontWeight: 400 }}
          >
            &amp;
          </span>
          {bride.name}
        </motion.h1>

        <motion.div
          initial={false}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="leaf-divider"
          style={{ marginTop: "20px", marginBottom: "18px" }}
        />

        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="font-body"
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            marginBottom: "30px",
            textShadow: "0 1px 3px rgba(253,252,250,0.95), 0 0 14px rgba(253,252,250,0.9)",
          }}
        >
          {dateStr}
        </motion.p>

        {/* Countdown — kartu specimen crisp */}
        <Countdown targetDateString={weddingDateString} />

        {/* Scroll hint */}
        <motion.div
          initial={false}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0, 0.6, 0] }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 2.5, delay: 2.0, repeat: Infinity, ease: "easeInOut" }}
          style={{ marginTop: "34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <div style={{ width: 1, height: 30, background: "linear-gradient(to bottom, var(--leaf), transparent)" }} />
          <span className="type-label" style={{ letterSpacing: "0.25em", textShadow: "0 1px 3px rgba(253,252,250,0.95), 0 0 12px rgba(253,252,250,0.9)" }}>
            Gulir
          </span>
        </motion.div>
      </div>
    </section>
  );
}
