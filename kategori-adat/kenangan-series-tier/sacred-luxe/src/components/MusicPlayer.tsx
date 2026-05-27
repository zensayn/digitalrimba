"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MUSIC_SRC = "/music/I_love_you_3000_-_Stephanie_Poetri_lofi_version_by_hyuu_KLICKAUD.mp3";
const SONG_TITLE = "I Love You 3000 (lofi)";
const SONG_ARTIST = "Stephanie Poetri";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.oncanplaythrough = () => setReady(true);
    audioRef.current = audio;

    const showTimer = setTimeout(() => setVisible(true), 2000);

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
                  fontFamily: "Inter, sans-serif",
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
                  fontFamily: "Inter, sans-serif",
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
