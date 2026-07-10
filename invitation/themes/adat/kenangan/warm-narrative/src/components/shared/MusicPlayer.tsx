"use client";

import { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";

// ── GANTI SESUAI TEMA ─────────────────────────────────────────────────────────
const MUSIC_SRC   = "/music/I_love_you_3000_-_Stephanie_Poetri_lofi_version_by_hyuu_KLICKAUD.mp3";
const SONG_TITLE  = "I Love You 3000";
const SONG_ARTIST = "Stephanie Poetri";
// ─────────────────────────────────────────────────────────────────────────────

export default function MusicPlayer({ src, start, end }: { src?: string; start?: number; end?: number }) {
  const [playing, setPlaying]         = useState(false);
  const [visible, setVisible]         = useState(false);
  const [ready, setReady]             = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const audioRef                      = useRef<HTMLAudioElement | null>(null);
  const musicSrc                      = src || MUSIC_SRC;
  // Studio trim window: playback starts at `start` and loops back there
  // after `end`. Without a trim the native loop plays the whole file.
  const trimStart                     = start ?? 0;
  const hasTrim                       = trimStart > 0 || end != null;

  useEffect(() => {
    const audio    = new Audio(musicSrc);
    audio.loop     = !hasTrim;
    // "metadata" saja: mp3 ±3 MB — kalau preload "auto" ia ikut berebut
    // bandwidth dengan gambar cover/LCP di detik-detik pertama. Download penuh
    // baru dimulai saat undangan dibuka (play() memicu load otomatis).
    audio.preload  = "metadata";
    audio.oncanplaythrough = () => setReady(true);
    audioRef.current = audio;

    const onTime = () => {
      if (end != null && audio.currentTime >= end) audio.currentTime = trimStart;
    };
    const onEnded = () => {
      audio.currentTime = trimStart;
      audio.play().catch(() => {});
    };
    if (hasTrim) {
      audio.addEventListener("timeupdate", onTime);
      audio.addEventListener("ended", onEnded);
    }

    const showTimer = setTimeout(() => setVisible(true), 2000);

    const onOpen = () => {
      if (hasTrim) audio.currentTime = trimStart;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };
    document.addEventListener("invitation-open", onOpen);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener("invitation-open", onOpen);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
  }, [musicSrc, trimStart, end, hasTrim]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (hasTrim && audio.currentTime < trimStart) audio.currentTime = trimStart;
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
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
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Tooltip — desktop hover only */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginRight: 10,
                  padding: "5px 14px",
                  background: "rgba(242,237,228,0.92)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid var(--border)",
                  borderRadius: 100,
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {SONG_TITLE} · {SONG_ARTIST}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vinyl disc */}
          <div
            id="music-toggle-btn"
            role="button"
            aria-label={playing ? "Pause music" : "Play music"}
            onClick={toggle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              cursor: ready ? "pointer" : "default",
              opacity: ready ? 1 : 0.45,
              position: "relative",
              flexShrink: 0,
              animation: "vinyl-spin 4s linear infinite",
              animationPlayState: playing ? "running" : "paused",
              background: `radial-gradient(closest-side circle at center,
                #1A1410 0%,
                #1A1410 76%,
                rgba(255,255,255,0.09) 79%,
                #1A1410 82%,
                #1A1410 100%
              )`,
              boxShadow: "0 3px 14px rgba(42,34,24,0.25)",
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
                background: "var(--surface)",
              }}
            />
            {/* Spindle dot — play indicator */}
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
  );
}
