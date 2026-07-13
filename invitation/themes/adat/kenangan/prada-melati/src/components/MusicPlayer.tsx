"use client";

// src/components/MusicPlayer.tsx
// ─── Vinyl music player mini (floating pojok kanan-bawah) ─────────────────────
// Hanya piringan hitam (tanpa tonearm), ukuran 52px menyamai warm-narrative.
// Berputar saat lagu diputar. Autoplay saat event "invitation-open" (dari
// EnvelopeOverlay). Loop aktif. Data lagu dari config.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import type { MusicConfig } from "@/lib/config-types";

interface MusicPlayerProps {
  music: MusicConfig;
}

export default function MusicPlayer({ music }: MusicPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady]     = useState(false);
  const audioRef              = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Tampilkan player setelah 2 detik
    const showTimer = setTimeout(() => setVisible(true), 2000);

    // Autoplay saat EnvelopeOverlay dispatch event "invitation-open"
    const onOpen = () => {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    };
    document.addEventListener("invitation-open", onOpen);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener("invitation-open", onOpen);
      audioRef.current?.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="metadata"
        onCanPlayThrough={() => setReady(true)}
        className="hidden"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: "calc(24px + env(safe-area-inset-bottom))",
              right: 20,
              zIndex: 100,
            }}
          >
            {/* Piringan hitam — klik untuk play/pause (tanpa tonearm) */}
            <div
              className="animate-spin"
              role="button"
              aria-label={playing ? "Jeda musik" : "Putar musik"}
              title={playing ? "Jeda" : "Putar"}
              tabIndex={0}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                cursor: ready ? "pointer" : "default",
                opacity: ready ? 1 : 0.45,
                position: "relative",
                animationDuration: "4s",
                animationPlayState: playing ? "running" : "paused",
                background: `radial-gradient(closest-side circle at center,
                  #150F0A 0%,
                  #150F0A 76%,
                  rgba(255,255,255,0.09) 79%,
                  #150F0A 82%,
                  #150F0A 100%
                )`,
                boxShadow: "0 3px 14px rgba(20,12,6,0.35)",
              }}
            >
              {/* Center label */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--surface-2)",
                  border: "1px solid var(--gold-dim)",
                }}
              />
              {/* Spindle dot — indikator play */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: playing ? "var(--gold)" : "var(--gold-dim)",
                  transition: "background 0.4s ease",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
