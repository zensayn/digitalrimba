"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import GuestName from "./GuestName";

// ── Envelope gate — layar pembuka sebelum undangan ────────────────────────────
// Amplop tertutup dibangun dari SATU aset flap (WarmAmplopFlapLeft) yang
// dipakai 4× dengan rotasi 90/180/-90 untuk sisi atas/kanan/bawah — ukuran
// render keempatnya identik, hanya posisi & rotasi yang berbeda. Stempel lilin
// di tengah adalah tombolnya: sekali diketuk ia melepas keempat flap ke arah
// masing-masing, men-dispatch "invitation-open" (MusicPlayer mulai memutar
// lagu), lalu seluruh overlay memudar ke Cover.

const FLAP = "/images/WarmAmplopFlapLeft.png";
const SEAL = "/images/StempelWarm.png";
const EASE = [0.22, 1, 0.36, 1] as const;

// Halo krem standar tema untuk teks di atas latar bertekstur.
const HALO = "0 1px 5px rgba(250,247,242,0.95), 0 0 10px rgba(250,247,242,0.85)";

export default function EnvelopeGate({
  groomName,
  brideName,
}: {
  groomName: string;
  brideName: string;
}) {
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);

  const openInvitation = () => {
    if (opened) return;
    setOpened(true);
    // Satu gestur user yang sama dipakai sebagai izin autoplay musik.
    document.dispatchEvent(new CustomEvent("invitation-open"));
    window.setTimeout(() => setGone(true), 1700);
  };

  if (gone) return null;

  // Susunan amplop asli: sisi datar tiap flap membentang PENUH di sisinya
  // (base = 1 sisi amplop, ujung melewati titik tengah), jadi keempat flap
  // menutup seluruh badan amplop termasuk pojok — flap kiri/kanan terlipat
  // dulu, lalu bawah, lalu atas paling depan, persis lipatan amplop sungguhan.
  // Semua flap memakai boks layout yang sama (0.58×env lebar, env tinggi,
  // objectFit fill); flap atas/bawah dirotasi 90/-90 di sekitar pusatnya,
  // offset 0.21×env menempatkan hasil rotasi tepat rata dengan tepi.
  // x/y framer bekerja di ruang layar (diterapkan sebelum rotate), jadi arah
  // "lepas" tiap flap tetap lurus menjauhi tepinya sendiri.
  const flaps = [
    { key: "left",   style: { left: 0, top: 0, zIndex: 1 },                                              rest: { rotate: 0 },    exit: { x: "-140%", rotate: 0 } },
    { key: "right",  style: { right: 0, top: 0, zIndex: 1 },                                             rest: { rotate: 180 },  exit: { x: "140%", rotate: 180 } },
    { key: "bottom", style: { left: "calc(var(--env) * 0.21)", top: "calc(var(--env) * 0.21)", zIndex: 2 },  rest: { rotate: -90 }, exit: { y: "140%", rotate: -90 } },
    { key: "top",    style: { left: "calc(var(--env) * 0.21)", top: "calc(var(--env) * -0.21)", zIndex: 3 }, rest: { rotate: 90 },  exit: { y: "-140%", rotate: 90 } },
  ] as const;

  return (
    <motion.div
      aria-hidden={opened}
      initial={false}
      animate={opened ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.9, ease: "easeInOut" }}
      className="gate-overlay"
      style={{
        pointerEvents: opened ? "none" : "auto",
      }}
    >
      <div className="paper-overlay" />

      {/* Glow hangat di belakang amplop */}
      <div
        className="absolute pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(120vw, 560px)", height: "min(120vw, 560px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(192,120,48,0.10) 0%, transparent 65%)" }}
      />

      {/* Header — untuk siapa undangan ini */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        className="relative flex flex-col items-center text-center"
        style={{ gap: 10 }}
      >
        <p className="font-label" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-deep)", textShadow: HALO }}>
          Undangan Pernikahan
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(26px, 7.5vw, 38px)", fontWeight: 400, color: "var(--text)", lineHeight: 1.2 }}>
          {groomName} <span className="font-garamond" style={{ fontStyle: "italic", color: "var(--gold)" }}>&amp;</span> {brideName}
        </h1>
        <div className="copper-divider" />
        <p className="font-label" style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-dim)", marginTop: 2 }}>
          Kepada Yth.
        </p>
        <p className="font-display" style={{ fontSize: "clamp(15px, 4.2vw, 19px)", fontStyle: "italic", color: "var(--gold-deep)", lineHeight: 1.25, marginTop: -4 }}>
          <Suspense fallback="Tamu Undangan">
            <GuestName />
          </Suspense>
        </p>
      </motion.div>

      {/* Amplop — 4 flap dari satu aset + stempel di tengah */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, delay: 0.45, ease: EASE }}
        className="relative"
        style={{ ["--env" as string]: "min(86vw, 340px, 46svh)", width: "var(--env)", height: "var(--env)" }}
      >
        {/* Badan amplop (di balik flap) */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, var(--surface) 0%, var(--surface-2) 100%)" }}
        >
          {flaps.map((f) => (
            <motion.div
              key={f.key}
              initial={f.rest}
              animate={opened ? { ...f.exit, opacity: 0 } : f.rest}
              transition={{ duration: 0.85, ease: EASE, delay: opened ? 0.12 : 0 }}
              className="absolute"
              style={{ ...f.style, width: "calc(var(--env) * 0.58)", height: "var(--env)" }}
            >
              <img src={FLAP} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "fill", filter: "drop-shadow(0 1px 6px rgba(42,34,24,0.12))" }} />
            </motion.div>
          ))}
        </div>

        {/* Stempel — tombol buka */}
        <motion.button
          type="button"
          aria-label="Buka undangan"
          onClick={openInvitation}
          initial={{ x: "-50%", y: "-50%" }}
          animate={
            opened
              ? { x: "-50%", y: "-50%", scale: 1.25, opacity: 0 }
              : { x: "-50%", y: "-50%", scale: [1, 1.045, 1] }
          }
          transition={
            opened
              ? { duration: 0.5, ease: "easeOut" }
              : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
          whileTap={{ scale: 0.92 }}
          className="absolute"
          style={{ top: "50%", left: "50%", width: "42%", zIndex: 4, background: "none", border: "none", padding: 0, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
        >
          <img src={SEAL} alt="" draggable={false} style={{ display: "block", width: "100%", height: "auto", filter: "drop-shadow(0 6px 18px rgba(42,34,24,0.28))" }} />
        </motion.button>
      </motion.div>

      {/* Petunjuk */}
      <motion.button
        type="button"
        onClick={openInvitation}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.8, delay: 1.0, repeat: Infinity, ease: "easeInOut" }}
        className="relative font-label"
        style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold-deep)", background: "none", border: "none", padding: "8px 12px", cursor: "pointer", textShadow: HALO, WebkitTapHighlightColor: "transparent" }}
      >
        Ketuk Stempel &middot; Buka Undangan
      </motion.button>
    </motion.div>
  );
}
