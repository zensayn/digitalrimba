"use client";

// Gerbang pembuka: overlay full-screen yang tampil PERTAMA sebelum undangan.
// Menyapa tamu ("Kepada Yth. <nama>") + tombol "Buka Undangan". Klik tombol =
// gesture pengguna → event `invitation-open` di-dispatch dan MusicPlayer boleh
// memutar lagu (autoplay butuh gesture di browser HP). Selama gerbang tampil,
// scroll dikunci supaya undangan tidak bisa diintip lewat gulir.

import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SceneBackground from "@/components/shared/SceneBackground";
import TopFrame from "@/components/shared/TopFrame";
import Meadow from "@/components/shared/Meadow";
import BottomClusters from "@/components/shared/BottomClusters";
import SideVines from "@/components/shared/SideVines";
import GuestName from "@/components/shared/GuestName";
import { asset } from "@/lib/assets";
import type { InvitationConfig } from "@/lib/config-types";

function hide(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export default function OpeningGate({ couple }: { couple: InvitationConfig["couple"] }) {
  const { groom, bride } = couple;
  const [opened, setOpened] = useState(false);

  // Kunci scroll dokumen selama gerbang masih menutup
  useEffect(() => {
    if (opened) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [opened]);

  const open = () => {
    // Dispatch DI DALAM handler klik (gesture) → audio.play() lolos autoplay policy
    document.dispatchEvent(new CustomEvent("invitation-open"));
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setOpened(true);
  };

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          // Dekorasi di dalam gerbang memakai [data-enter] — tandai in-view
          // langsung supaya entrance-nya jalan tanpa menunggu RevealController.
          className="reveal-scope"
          data-inview="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-6%" }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          {/* Dunia padang bunga yang sama dengan cover */}
          <SceneBackground file="LatarPadang.webp" scrim={0.55} />
          <TopFrame maxWidth={640} zIndex={2} />
          {/* Ranting menjuntai di tepi — mengisi sisi layar lebar supaya gerbang
              tidak terasa kosong mengambang di desktop */}
          <SideVines height="min(64vh, 520px)" opacity={0.9} zIndex={1} />
          <Meadow sprigs={5} zIndex={1} />
          <BottomClusters size="clamp(140px, 40vw, 260px)" zIndex={1} />

          {/* Konten sapaan */}
          <div
            style={{
              position: "relative",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "min(26vw, 170px) 32px 32px",
              width: "100%",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.15 }}
              style={{
                position: "relative",
                width: "clamp(110px, 30vw, 150px)",
                height: "clamp(110px, 30vw, 150px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <img
                src={asset("WreathInisial.webp")}
                alt=""
                onError={hide}
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
              <span className="font-script" style={{ fontSize: "clamp(26px, 7vw, 36px)", color: "var(--accent)", lineHeight: 1, paddingBottom: 6 }}>
                {groom.name[0]}&nbsp;&amp;&nbsp;{bride.name[0]}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="type-eyebrow"
              style={{ marginBottom: 14 }}
            >
              Undangan Pernikahan
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.45 }}
              className="font-display"
              style={{ fontSize: "clamp(34px, 10vw, 56px)", fontWeight: 400, lineHeight: 1.05, color: "var(--text)", letterSpacing: "-0.01em" }}
            >
              {groom.name}
              <span className="font-script" style={{ display: "block", fontSize: "0.62em", color: "var(--accent)", margin: "-2px 0", fontWeight: 400 }}>
                &amp;
              </span>
              {bride.name}
            </motion.h1>

            {/* Pembatas bunga (asset) — pengganti garis gradient polos */}
            <motion.img
              src={asset("PembatasBunga.webp")}
              alt=""
              aria-hidden="true"
              onError={hide}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ width: "clamp(150px, 40vw, 200px)", height: "auto", marginTop: 10, marginBottom: 10 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              style={{ marginBottom: 26 }}
            >
              <p className="type-label" style={{ marginBottom: 6 }}>Kepada Yth.</p>
              <p
                className="font-display"
                style={{ fontSize: "clamp(19px, 5.5vw, 24px)", fontStyle: "italic", color: "var(--text)" }}
              >
                <Suspense fallback="Tamu Undangan">
                  <GuestName />
                </Suspense>
              </p>
            </motion.div>

            {/* Tombol bersarang di karangan bunga: GarlandBunga di belakang +
                bunga kecil menyangkut di sudut — terasa dirangkai, bukan tombol polos */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05 }}
              style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <img
                src={asset("GarlandBunga.webp")}
                alt=""
                aria-hidden="true"
                onError={hide}
                className="ambient-anim"
                style={{
                  position: "absolute",
                  width: "clamp(280px, 80vw, 380px)",
                  maxWidth: "none",
                  pointerEvents: "none",
                  animation: "swayFrame 8s ease-in-out infinite alternate",
                  transformOrigin: "50% 50%",
                  filter: "drop-shadow(0 6px 14px rgba(58,58,54,0.08))",
                }}
              />
              <button
                type="button"
                onClick={open}
                className="btn-bloom"
                style={{ position: "relative", background: "var(--accent)", color: "var(--bg)", boxShadow: "var(--shadow-soft)" }}
              >
                Buka Undangan
              </button>
              {/* Bunga kecil menyangkut di sudut tombol */}
              <img
                src={asset("BungaJatuh1.webp")}
                alt=""
                aria-hidden="true"
                onError={hide}
                className="ambient-anim"
                style={{
                  position: "absolute",
                  top: -16,
                  left: "calc(50% - 92px)",
                  width: 36,
                  pointerEvents: "none",
                  animation: "swaySoft 6s ease-in-out infinite alternate",
                  filter: "drop-shadow(0 2px 5px rgba(58,58,54,0.18))",
                }}
              />
              <img
                src={asset("BungaJatuh3.webp")}
                alt=""
                aria-hidden="true"
                onError={hide}
                className="ambient-anim"
                style={{
                  position: "absolute",
                  bottom: -15,
                  right: "calc(50% - 94px)",
                  width: 30,
                  pointerEvents: "none",
                  animation: "swayAlt 7s ease-in-out infinite alternate",
                  filter: "drop-shadow(0 2px 5px rgba(58,58,54,0.18))",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
