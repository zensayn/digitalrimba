"use client";

// Pemutar musik gaya piringan hitam — adaptasi music-player componentry.dev
// (seragam dengan pavilion-romance): piringan berputar dengan foto dari
// config.music.cover sebagai label. Tanpa tonearm dan berdiameter 52px
// mengikuti prada-melati (revisi owner) — tangkai bikin sudut kanan-bawah
// ramai. Lagu dari katalog bersama R2 `rimba-invitations/music/catalog/` via
// invitationMusic(); config.music.file kosong = fallback /music/theme.mp3.
// Autoplay tetap lewat event `invitation-open` (gesture tombol Buka Undangan).

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { invitationMusic, invitationPhoto } from "@/lib/invitation-media";
import type { InvitationConfig } from "@/lib/config-types";

const DISC = 52; // diameter piringan (px) — seukuran prada-melati

export default function MusicPlayer({ music }: { music: InvitationConfig["music"] }) {
  // `src` overlay studio menang atas `file` katalog; keduanya kosong = fallback lokal.
  const src = music.src || (music.file ? invitationMusic(music.file) : "/music/theme.mp3");
  const cover = music.cover ? invitationPhoto(music.cover) : undefined;

  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const motionTransition = shouldReduceMotion ? { duration: 0 } : undefined;
  // Studio trim window: playback starts at `startSec` and loops back there
  // after `endSec`. Without a trim the native loop plays the whole file.
  const trimStart = music.startSec ?? 0;
  const end = music.endSec;
  const hasTrim = trimStart > 0 || end != null;

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = !hasTrim;
    // "metadata" saja: mp3 katalog bisa beberapa MB — kalau preload "auto" ia
    // berebut bandwidth dengan gambar cover/LCP di detik-detik pertama.
    audio.preload = "metadata";
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
  }, [src, trimStart, end, hasTrim]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      if (hasTrim && audio.currentTime < trimStart) audio.currentTime = trimStart;
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
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Tooltip judul lagu — hover desktop */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={motionTransition ?? { duration: 0.2 }}
                className="font-label"
                style={{
                  marginRight: 12,
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
                {music.title || "Musik"} · {music.artist || "Instrumental"}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="music-toggle-btn"
            type="button"
            aria-label={playing ? "Jeda musik" : "Putar musik"}
            aria-pressed={playing}
            disabled={!ready}
            onClick={toggle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="music-toggle-vinyl"
            style={{
              position: "relative",
              width: DISC,
              height: DISC,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: ready ? "pointer" : "default",
              opacity: ready ? 1 : 0.6,
            }}
          >
            {/* Piringan — berputar saat lagu main (keyframes disc-spin lama) */}
            <div
              aria-hidden="true"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#1a1720",
                border: "2px solid rgba(126,105,150,0.3)",
                boxShadow: "0 3px 14px rgba(58,58,54,0.35)",
                animation: shouldReduceMotion ? "none" : "disc-spin 5s linear infinite",
                animationPlayState: playing ? "running" : "paused",
              }}
            >
              {/* Foto label — cover art memenuhi piringan (overlay studio bisa tanpa cover) */}
              {cover && (
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }}
                />
              )}
              {/* Alur piringan (cincin gelap konsentris) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.35) 21%, transparent 22%, transparent 35%, rgba(0,0,0,0.4) 36%, transparent 37%, transparent 50%, rgba(0,0,0,0.3) 51%, transparent 52%, transparent 65%, rgba(0,0,0,0.45) 66%, transparent 67%, transparent 80%, rgba(0,0,0,0.35) 81%, transparent 82%)",
                }}
              />
              {/* Kilau */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.18) 100%)",
                }}
              />
              {/* Lubang poros tengah */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#EFEBE4",
                  border: "1px solid rgba(0,0,0,0.5)",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
