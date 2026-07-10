"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music } from "lucide-react";
import { asset } from "@/lib/assets";
import { hideBrokenImage } from "@/lib/image-fallback";

// ── GANTI SESUAI TEMA ─────────────────────────────────────────────────────────
const MUSIC_SRC   = "/music/theme.mp3";
const SONG_TITLE  = "Wildflower";
const SONG_ARTIST = "Instrumental";
// ─────────────────────────────────────────────────────────────────────────────

export default function MusicPlayer({
  src,
  title,
  artist,
  start,
  end,
}: {
  src?: string;
  title?: string;
  artist?: string;
  start?: number;
  end?: number;
}) {
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
    // "metadata" saja: mp3 katalog bisa beberapa MB — kalau preload "auto" ia
    // berebut bandwidth dengan gambar cover/LCP di detik-detik pertama.
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
      // The studio live-preview re-runs this effect on every trim edit; the
      // replacement Audio starts paused and unbuffered, so stale
      // playing/ready would leave the UI claiming music that isn't there.
      setPlaying(false);
      setReady(false);
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="font-label"
                style={{
                  marginRight: 10,
                  padding: "5px 14px",
                  background: "rgba(253,252,250,0.92)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid var(--border)",
                  borderRadius: 100,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {title || SONG_TITLE} · {artist || SONG_ARTIST}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disc pastel flat + wreath bunga yang berputar saat musik main */}
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
              opacity: ready ? 1 : 0.5,
              position: "relative",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "color-mix(in srgb, var(--accent-soft) 22%, white)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              boxShadow: "var(--shadow-soft)",
              color: "var(--accent)",
            }}
          >
            {/* Wreath melingkari disc — hanya berputar saat playing */}
            <img
              src={asset("WreathInisial.webp")}
              alt=""
              aria-hidden="true"
              onError={hideBrokenImage}
              className="ambient-anim"
              style={{
                position: "absolute",
                inset: -15,
                width: 82,
                height: 82,
                maxWidth: "none",
                pointerEvents: "none",
                animation: "disc-spin 18s linear infinite",
                animationPlayState: playing ? "running" : "paused",
              }}
            />
            <Music size={18} strokeWidth={1.5} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
