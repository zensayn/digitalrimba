"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

const ROMAN = ["I", "II", "III", "IV", "V"];
const INTERVAL_MS = 5000;

export default function LoveStorySection() {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const isPausedRef = useRef(false);
  const { loveStory } = useInvitationConfig();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setActive(idx);
    activeRef.current = idx;
  };

  const scrollTo = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * (scrollRef.current.clientWidth || 0), behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (isPausedRef.current) return;
      const next = (activeRef.current + 1) % loveStory.length;
      scrollRef.current?.scrollTo({ left: next * (scrollRef.current.clientWidth || 0), behavior: "smooth" });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [loveStory.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isPausedRef.current = true;
    if (e.pointerType !== "mouse" || !scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.scrollBehavior = "auto";
    scrollRef.current.style.scrollSnapType = "none";
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current || e.pointerType !== "mouse") return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeftRef.current - (x - startX.current) * 1.25;
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    isPausedRef.current = false;
    if (!isDragging.current || !scrollRef.current || e.pointerType !== "mouse") return;
    isDragging.current = false;
    scrollRef.current.style.cursor = "grab";
    scrollRef.current.style.scrollBehavior = "smooth";
    scrollRef.current.style.scrollSnapType = "x mandatory";
    const nearest = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    scrollTo(nearest);
    activeRef.current = nearest;
    setActive(nearest);
  };

  return (
    <section id="lovestory" className="snap-section" style={{ background: "var(--surface)" }}>
      <div className="paper-overlay" />

      {/* Timeline background line */}
      <div
        className="absolute pointer-events-none select-none z-0"
        style={{
          left: 0,
          right: 0,
          top: "45%",
          transform: "translateY(-50%)",
          height: "clamp(120px, 30vh, 220px)",
          opacity: 0.12,
        }}
      >
        <img
          src="/images/Timeline.webp"
          alt="Timeline Backdrop"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none z-0"
        style={{
          fontSize: "clamp(56px, 18vw, 100px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(192,120,48,0.025)",
          bottom: "8%",
          right: "-2%",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        Kisah Kami
      </div>

      {/* Header */}
      <div
        ref={ref}
        className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center"
        style={{ paddingTop: "clamp(28px, 6vh, 48px)" }}
      >
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-label"
          style={{ fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Kisah Kami
        </motion.p>
      </div>

      {/* Horizontal carousel */}
      <div
        id="lovestory-carousel"
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        className="w-full h-full flex overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          cursor: "grab",
        }}
      >
        {loveStory.map((chapter, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full h-full flex flex-col justify-center relative select-none"
            style={{
              scrollSnapAlign: "start",
              minWidth: "100%",
              paddingTop: "clamp(60px, 12vh, 90px)",
              paddingBottom: "clamp(52px, 10vh, 72px)",
              paddingLeft: "clamp(28px, 8vw, 52px)",
              paddingRight: "clamp(28px, 8vw, 52px)",
              gap: "clamp(10px, 2.5vh, 18px)",
            }}
          >
            {/* Chapter number + year */}
            <div className="flex items-center gap-3">
              <span
                className="font-garamond"
                style={{ fontSize: "clamp(11px, 2.8vw, 14px)", fontStyle: "italic", color: "var(--gold)", letterSpacing: "0.15em" }}
              >
                {ROMAN[i] ?? String(i + 1)}
              </span>
              <div style={{ width: 28, height: 1, background: "rgba(192,120,48,0.35)" }} />
              <span
                className="font-label"
                style={{ fontSize: "clamp(10px, 2.5vw, 12px)", color: "var(--text-dim)", letterSpacing: "0.2em" }}
              >
                {chapter.year}
              </span>
            </div>

            {/* Chapter title */}
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(26px, 8vw, 42px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "var(--text)",
                lineHeight: 1.1,
              }}
            >
              {chapter.chapter}
            </h2>

            {/* Photo */}
            <div
              className="relative flex-shrink-0"
              style={{
                width: "100%",
                maxWidth: "clamp(220px, 70vw, 300px)",
              }}
            >
               {/* Sparkle top right */}
              <img
                src="/images/Sparkle.webp"
                alt="Sparkle"
                style={{
                  position: "absolute",
                  width: "clamp(28px, 8vw, 36px)",
                  height: "clamp(28px, 8vw, 36px)",
                  top: "-14px",
                  right: "-14px",
                  zIndex: 10,
                  opacity: 0.85,
                  pointerEvents: "none",
                }}
              />
              {/* Sparkle bottom left */}
              <img
                src="/images/Sparkle.webp"
                alt="Sparkle"
                style={{
                  position: "absolute",
                  width: "clamp(20px, 6vw, 26px)",
                  height: "clamp(20px, 6vw, 26px)",
                  bottom: "-10px",
                  left: "-10px",
                  zIndex: 10,
                  opacity: 0.7,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "var(--shadow-warm)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chapter.image}
                  alt={chapter.chapter}
                  draggable="false"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "sepia(20%) contrast(1.05) brightness(0.97)",
                    display: "block",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(192,120,48,0.04)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <p
              className="font-body"
              style={{
                color: "var(--text-muted)",
                fontSize: "clamp(13px, 3.2vw, 15px)",
                fontStyle: "italic",
                fontWeight: 300,
                lineHeight: 1.85,
                maxWidth: "34ch",
              }}
            >
              &ldquo;{chapter.description}&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* Progress dots + timer bar */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <div className="flex gap-2">
          {loveStory.map((_, i) => (
            <button
              key={i}
              onClick={() => { scrollTo(i); activeRef.current = i; }}
              style={{
                width: active === i ? 24 : 6,
                height: 2,
                borderRadius: 2,
                background: active === i ? "var(--gold)" : "var(--gold-dim)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: active === i ? 1 : 0.35,
                padding: 0,
                pointerEvents: "auto",
              }}
            />
          ))}
        </div>
        <div style={{ width: 40, height: 1, background: "rgba(192,120,48,0.15)", borderRadius: 1, overflow: "hidden" }}>
          <motion.div
            key={active}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
            style={{ height: "100%", background: "var(--gold)", transformOrigin: "left", opacity: 0.6 }}
          />
        </div>
      </div>

      {/* Swipe hint */}
      {active === 0 && (
        <div
          className="absolute z-20 flex items-center gap-1 font-label"
          style={{
            bottom: "clamp(20px, 4vh, 32px)",
            right: "clamp(16px, 5vw, 28px)",
            color: "var(--text-dim)",
            fontSize: "8px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          <span>geser</span>
          <span style={{ color: "var(--gold-dim)" }}>→</span>
        </div>
      )}
    </section>
  );
}
