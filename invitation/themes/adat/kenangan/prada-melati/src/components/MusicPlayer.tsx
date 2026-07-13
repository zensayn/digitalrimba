"use client";

// src/components/MusicPlayer.tsx
// ─── Vinyl music player mini (floating pojok kanan-bawah) ─────────────────────
// Piringan hitam berputar saat lagu diputar, tonearm mengayun. Data dari config.
// Autoplay saat CoverSection dispatch event "invitation-open". Loop aktif.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    // Autoplay saat CoverSection dispatch event "invitation-open"
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
        preload="auto"
        onCanPlayThrough={() => setReady(true)}
        className="hidden"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "fixed",
              bottom: "calc(20px + env(safe-area-inset-bottom))",
              right: 20,
              zIndex: 100,
            }}
          >
            <div
              className="relative cursor-pointer select-none h-[72px] w-[72px] md:h-20 md:w-20"
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={playing ? "Jeda musik" : "Putar musik"}
              title={playing ? "Jeda" : "Putar"}
            >
              {/* Tonearm */}
              <motion.div
                className="absolute z-20 top-[-4%] right-[-8%] origin-top-right w-[55%] h-[18%] pointer-events-none"
                initial={{ rotate: 10 }}
                animate={{ rotate: playing ? -20 : 10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Tonearm base */}
                <div
                  className="absolute top-0 right-0 w-3 h-3 rounded-full shadow-md transform translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ background: "var(--gold-dim)", border: "2px solid var(--surface-2)" }}
                />
                {/* Tonearm stick & needle */}
                <div
                  className="absolute top-0 right-[6px] w-[90%] h-1 rounded-full origin-right -rotate-12 shadow-sm flex items-center justify-start"
                  style={{ background: "var(--gold-dim)" }}
                >
                  <div
                    className="w-2 h-2 rounded-full shadow-md transform -translate-x-1/2"
                    style={{ background: "var(--gold)" }}
                  />
                </div>
              </motion.div>

              {/* Record disc */}
              <div
                className="relative w-full h-full rounded-full border-2 shadow-lg overflow-hidden bg-black animate-spin"
                style={{
                  borderColor: "rgba(0,0,0,0.4)",
                  animationDuration: "4s",
                  animationPlayState: playing ? "running" : "paused",
                }}
              >
                {/* Album cover background */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `url(${music.coverArt})` }}
                />
                {/* Grooves */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 21%, transparent 22%, transparent 40%, rgba(0,0,0,0.5) 41%, transparent 42%, transparent 62%, rgba(0,0,0,0.4) 63%, transparent 64%, transparent 82%, rgba(0,0,0,0.5) 83%, transparent 84%)",
                  }}
                />
                {/* Glare */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.15) 100%)",
                  }}
                />
                {/* Center label + hole */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full shadow-inner flex items-center justify-center"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--gold)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--gold)", border: "1px solid rgba(0,0,0,0.4)" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
