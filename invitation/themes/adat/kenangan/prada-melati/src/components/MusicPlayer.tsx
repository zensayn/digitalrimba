"use client";

// src/components/MusicPlayer.tsx
// ─── Vinyl music player mini (floating pojok kanan-bawah) ─────────────────────
// Hanya piringan hitam (tanpa tonearm), ukuran 52px menyamai warm-narrative.
// Berputar saat lagu diputar. Autoplay saat event "invitation-open" (dari
// EnvelopeOverlay). Loop aktif. Data lagu dari config.
// Engine playback menyamai soft-bloom: Audio() imperatif (bukan <audio> DOM),
// preload "metadata" + gerbang `ready` di toggle, autoplay murni lewat event
// invitation-open (tanpa jaring pengaman pointerdown/keydown tambahan).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { MusicConfig } from "@/lib/config-types";

interface MusicPlayerProps {
  music: MusicConfig;
}

export default function MusicPlayer({ music }: MusicPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady]     = useState(false);
  const audioRef              = useRef<HTMLAudioElement | null>(null);
  const shouldReduceMotion    = useReducedMotion();
  const motionTransition      = shouldReduceMotion ? { duration: 0 } : undefined;

  useEffect(() => {
    const audio = new Audio(music.src);
    audio.loop = true;
    // "metadata" saja: mp3 katalog bisa beberapa MB — kalau preload "auto" ia
    // berebut bandwidth dengan gambar cover/LCP di detik-detik pertama.
    audio.preload = "metadata";
    audio.oncanplaythrough = () => setReady(true);
    audio.onerror = () => console.warn("[MusicPlayer] gagal memuat audio:", music.src);
    audioRef.current = audio;

    // Tampilkan player setelah 2 detik
    const showTimer = setTimeout(() => setVisible(true), 2000);

    // Autoplay saat EnvelopeOverlay dispatch event "invitation-open".
    const onOpen = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    document.addEventListener("invitation-open", onOpen);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener("invitation-open", onOpen);
      audio.pause();
      audio.src = "";
      setPlaying(false);
      setReady(false);
    };
  }, [music.src]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={motionTransition ?? { duration: 0.5, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: "calc(24px + env(safe-area-inset-bottom))",
            right: 20,
            zIndex: 100,
          }}
        >
          {/* Piringan hitam — klik untuk play/pause (tanpa tonearm) */}
          <button
            type="button"
            aria-label={playing ? "Jeda musik" : "Putar musik"}
            aria-pressed={playing}
            title={playing ? "Jeda" : "Putar"}
            disabled={!ready}
            onClick={toggle}
            className={shouldReduceMotion ? undefined : "animate-spin"}
            style={{
              width: 52,
              height: 52,
              padding: 0,
              border: "none",
              borderRadius: "50%",
              cursor: ready ? "pointer" : "default",
              opacity: ready || playing ? 1 : 0.45,
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
              {/* Foto sebagai muka piringan (picture disc). Kalau coverArt
                  kosong/404, layer ini transparan → gradient vinyl tampil. */}
              {music.coverArt && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundImage: `url(${music.coverArt})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {/* Alur & vignette tepi supaya tetap terbaca sebagai piringan */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  pointerEvents: "none",
                  background:
                    "radial-gradient(closest-side circle at center, transparent 60%, rgba(0,0,0,0.28) 78%, transparent 80%)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 2px 6px rgba(0,0,0,0.35)",
                }}
              />
              {/* Hub label tengah */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "var(--surface-2)",
                  border: "1px solid var(--gold-dim)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
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
            </button>
          </motion.div>
        )}
    </AnimatePresence>
  );
}
