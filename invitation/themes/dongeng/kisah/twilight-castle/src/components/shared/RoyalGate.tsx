"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";
import type { InvitationConfig } from "@/lib/config-types";

// Gerbang kerajaan: dua lapis foto. Saat scroll, lapisan DEPAN (ruang gelap
// berjendela bulat berlubang) mem-scale lebih cepat dari lapisan BELAKANG
// (dunia istana) lalu memudar → ilusi "terbang menembus jendela masuk ke
// kerajaan". Meniru mekanisme referensi (GSAP) tapi dengan Framer Motion.
export default function RoyalGate({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const reduce = useReducedMotion();
  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start start", "end start"],
  });

  // Lapisan belakang: mendekat perlahan. Depan: melesat keluar lalu lenyap.
  const worldScale = useTransform(scrollYProgress, [0, 1], [1, 2.4]);
  const frontScale = useTransform(scrollYProgress, [0, 1], [1, 4.5]);
  const frontOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Reduced-motion: langsung state "sudah masuk" (depan hilang, dunia penuh),
  // spacer dipendekkan agar tak ada runway scroll kosong.
  const spacerHeight = reduce ? "100dvh" : "220vh";

  // weddingDate = ISO mentah (mis. "2026-12-12T08:00:00") → format Indonesia.
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section id="cover" ref={spacerRef} style={{ position: "relative", height: spacerHeight }}>
      <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>
        {/* Lapisan belakang: dunia istana */}
        <motion.div style={{ position: "absolute", inset: 0, scale: reduce ? 1 : worldScale }}>
          {/* Fallback dasar bila foto belum ada */}
          <div className="twilight-sky" style={{ position: "absolute", inset: 0 }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("DuniaIstana.webp")}
            alt=""
            onError={hideBrokenImage}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>

        {/* Lapisan depan: ruang gelap + jendela bulat berlubang */}
        {!reduce && (
          <motion.div style={{ position: "absolute", inset: 0, scale: frontScale, opacity: frontOpacity }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("GerbangDepan.webp")}
              alt=""
              onError={hideBrokenImage}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        )}

        {/* Nama mempelai + isyarat scroll */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            opacity: reduce ? 1 : textOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 3,
            pointerEvents: "none",
            padding: "0 24px",
          }}
        >
          {/* Mahkota melayang berkilau di atas nama */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("Mahkota.webp")}
            alt=""
            aria-hidden="true"
            onError={hideBrokenImage}
            className="ambient-anim"
            style={{ width: "clamp(54px, 15vw, 88px)", height: "auto", marginBottom: 14, animation: "floatSlow 5s ease-in-out infinite" }}
          />
          <p className="font-body" style={{ color: "var(--star)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 12 }}>
            The Wedding Of
          </p>
          <h1
            className="font-display"
            style={{ color: "var(--gold-light)", fontSize: "clamp(40px, 12vw, 84px)", fontWeight: 500, lineHeight: 1.05, margin: "12px 0" }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </h1>
          <p className="font-script" style={{ color: "var(--text-muted)", fontSize: 17, fontWeight: 500, letterSpacing: "0.02em" }}>{dateStr}</p>
          {!reduce && (
            <motion.p
              className="font-body"
              style={{ color: "var(--text-muted)", fontSize: 11, letterSpacing: "0.2em", marginTop: 28 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              gulir untuk masuk ↓
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
