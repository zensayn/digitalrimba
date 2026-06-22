"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

export default function CoverSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loaded, setLoaded] = useState(false);
  const { couple, weddingDate: weddingDateStr } = useInvitationConfig();

  useEffect(() => {
    setLoaded(true);
    const tick = () => {
      const now = new Date();
      const diff = new Date(weddingDateStr).getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [weddingDateStr]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="cover" className="snap-section" style={{ background: "var(--bg)" }}>
      <div className="noise-overlay" />
      <div className="vignette" />

      {/* Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="rounded-full border opacity-5" style={{ width: "min(600px,90vw)", height: "min(600px,90vw)", borderColor: "var(--gold)" }} />
        <div className="absolute rounded-full border opacity-10" style={{ width: "min(400px,60vw)", height: "min(400px,60vw)", borderColor: "var(--gold)" }} />
      </div>

      {/* Corner ornaments */}
      {[["top-4 left-4","M1 1 L1 28","M1 1 L28 1",1,1],["top-4 right-4","M59 1 L59 28","M59 1 L32 1",59,1],["bottom-4 left-4","M1 59 L1 32","M1 59 L28 59",1,59],["bottom-4 right-4","M59 59 L59 32","M59 59 L32 59",59,59]].map(([pos,p1,p2,cx,cy],i) => (
        <svg key={i} className={`absolute ${pos} opacity-20 z-10`} width="50" height="50" viewBox="0 0 60 60" fill="none">
          <path d={p1 as string} stroke="#C9A84C" strokeWidth="0.8"/>
          <path d={p2 as string} stroke="#C9A84C" strokeWidth="0.8"/>
          <circle cx={cx as number} cy={cy as number} r="2" fill="#C9A84C"/>
        </svg>
      ))}

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm mx-auto">
        {/* Brand */}
        <motion.p
          initial={{ opacity: 0, y: -10 }} animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs font-light tracking-[0.25em] uppercase mb-6"
          style={{ color: "var(--text-dim)", fontSize: "9px" }}
        >
          Rimba Digital · Kenangan
        </motion.p>

        {/* Names */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }} animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
          className="font-display text-gold-shimmer leading-none"
          style={{ fontSize: "clamp(56px, 18vw, 96px)", fontWeight: 300, paddingBottom: "0.15em" }}
        >
          {couple.groom.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="flex items-center gap-4 my-1"
        >
          <div className="gold-divider" />
          <span className="font-display italic text-lg" style={{ color: "var(--gold-dim)", fontWeight: 300 }}>&amp;</span>
          <div className="gold-divider" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }} animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.1, duration: 1.2, ease: "easeOut" }}
          className="font-display text-gold-shimmer leading-none"
          style={{ fontSize: "clamp(56px, 18vw, 96px)", fontWeight: 300, paddingBottom: "0.15em" }}
        >
          {couple.bride.name}
        </motion.h1>

        {/* Date */}
        <motion.p
          initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="font-display italic mt-4 mb-6"
          style={{ color: "var(--text-muted)", letterSpacing: "0.1em", fontSize: "clamp(12px, 3.5vw, 15px)" }}
        >
          14 · VI · 2026
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="flex gap-5 mb-8"
        >
          {[{ label: "Hari", value: timeLeft.days },{ label: "Jam", value: timeLeft.hours },{ label: "Menit", value: timeLeft.minutes },{ label: "Detik", value: timeLeft.seconds }].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="font-display" style={{ color: "var(--gold)", fontWeight: 300, fontSize: "clamp(22px, 7vw, 36px)", minWidth: "2ch", display: "block", textAlign: "center" }}>
                {pad(value)}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          id="open-invitation-btn"
          href="#greeting"
          initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 2.1, duration: 0.8 }}
          className="btn-gold"
          onClick={(e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent("invitation-open"));
            document.getElementById("greeting")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Buka Undangan
        </motion.a>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span style={{ color: "var(--text-dim)", fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Gulir</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-6" style={{ background: "linear-gradient(to bottom, var(--gold), transparent)" }} />
      </motion.div>
    </section>
  );
}
