"use client";

// src/components/MusicPlayer.tsx
// ─── FIXED: Floating music player bar ────────────────────────────────────────
// Cara pakai:
//   1. Ganti konstanta MUSIC_SRC, SONG_TITLE, SONG_ARTIST di bawah.
//   2. Taruh file MP3 di public/music/
//   3. Komponen ini sudah handle autoplay saat event "invitation-open" di-dispatch.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── GANTI SESUAI TEMA ─────────────────────────────────────────────────────────
const MUSIC_SRC   = "/music/NAMA_FILE.mp3";
const SONG_TITLE  = "Judul Lagu";
const SONG_ARTIST = "Nama Artis";
// ─────────────────────────────────────────────────────────────────────────────

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady]     = useState(false);
  const audioRef              = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio    = new Audio(MUSIC_SRC);
    audio.loop     = true;
    audio.preload  = "auto";
    audio.oncanplaythrough = () => setReady(true);
    audioRef.current = audio;

    // Tampilkan player setelah 2 detik
    const showTimer = setTimeout(() => setVisible(true), 2000);

    // Autoplay saat CoverSection dispatch event "invitation-open"
    const onOpen = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    document.addEventListener("invitation-open", onOpen);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener("invitation-open", onOpen);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="music-player-bar"
            style={{ position: "fixed", bottom: 24, right: 20, left: "auto" }}
          >
            {/* Animated waveform */}
            <div className="flex items-end gap-0.5" style={{ height: 16 }}>
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={
                    playing
                      ? {
                          height: ["3px", `${5 + i * 4}px`, "3px"],
                          transition: {
                            duration: 0.5 + i * 0.1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.1,
                          },
                        }
                      : { height: "3px" }
                  }
                  style={{
                    width: 2,
                    background: playing ? "var(--gold)" : "var(--gold-dim)",
                    borderRadius: 2,
                    height: 3,
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Song info */}
            <div className="flex flex-col leading-tight">
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "10px",
                  letterSpacing: "0.04em",
                  fontFamily: "var(--font-body)",
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {SONG_TITLE}
              </span>
              <span
                style={{
                  color: "var(--text-dim)",
                  fontSize: "9px",
                  letterSpacing: "0.08em",
                  fontFamily: "var(--font-body)",
                }}
              >
                {SONG_ARTIST}
              </span>
            </div>

            {/* Play/Pause button */}
            <button
              id="music-toggle-btn"
              onClick={toggle}
              disabled={!ready}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: playing ? "var(--gold)" : "transparent",
                border: "1px solid var(--gold)",
                cursor: ready ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: playing ? "var(--bg)" : "var(--gold)",
                transition: "all 0.3s ease",
                flexShrink: 0,
                opacity: ready ? 1 : 0.5,
              }}
            >
              {playing ? (
                <Pause size={11} strokeWidth={2} />
              ) : (
                <Play size={11} strokeWidth={2} style={{ marginLeft: 1 }} />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
