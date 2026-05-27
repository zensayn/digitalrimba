"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { loveStory } from "@/data/invitation";

const ROMAN = ["I", "II", "III", "IV", "V"];
const INTERVAL_MS = 5000;

export default function LoveStorySection() {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const isPausedRef = useRef(false);

  // Mouse drag-to-scroll refs
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setActive(idx);
    activeRef.current = idx;
  };

  const scrollTo = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * (scrollRef.current.clientWidth || 0), behavior: "smooth" });
  };

  // Auto-advance every 5 s; pause while user is touching/dragging
  useEffect(() => {
    const id = setInterval(() => {
      if (isPausedRef.current) return;
      const next = (activeRef.current + 1) % loveStory.length;
      scrollRef.current?.scrollTo({ left: next * (scrollRef.current.clientWidth || 0), behavior: "smooth" });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isPausedRef.current = true;
    if (e.pointerType !== "mouse") return;
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.scrollBehavior = "auto";
    scrollRef.current.style.scrollSnapType = "none"; // Disable snapping during manual dragging
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    if (e.pointerType !== "mouse") return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.25;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    isPausedRef.current = false;
    if (!isDragging.current || !scrollRef.current) return;
    if (e.pointerType !== "mouse") return;
    isDragging.current = false;
    scrollRef.current.style.cursor = "grab";
    scrollRef.current.style.scrollBehavior = "smooth";
    scrollRef.current.style.scrollSnapType = "x mandatory"; // Re-enable snapping upon release

    const clientWidth = scrollRef.current.clientWidth;
    const currentScroll = scrollRef.current.scrollLeft;
    const nearestIndex = Math.round(currentScroll / clientWidth);
    scrollTo(nearestIndex);
    activeRef.current = nearestIndex;
    setActive(nearestIndex);
  };

  return (
    <section id="lovestory" className="snap-section" style={{ background: "var(--surface)" }}>
      <div className="noise-overlay" />

      {/* Decorative bg text */}
      <div
        className="absolute font-display select-none pointer-events-none z-0"
        style={{
          fontSize: "clamp(56px, 18vw, 100px)",
          fontWeight: 300,
          color: "rgba(201,168,76,0.025)",
          bottom: "8%",
          right: "-2%",
          letterSpacing: "0.1em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        OUR STORY
      </div>

      {/* Header — absolute so the carousel can fill full height */}
      <div
        ref={ref}
        className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center"
        style={{ paddingTop: "clamp(28px, 6vh, 48px)" }}
      >
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: "var(--gold-dim)" }}
        >
          Kisah Kami
        </motion.p>
      </div>

      {/* Horizontal snap carousel */}
      <div
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
            className="flex-shrink-0 w-full h-full flex flex-col items-center justify-center relative select-none"
            style={{
              scrollSnapAlign: "start",
              minWidth: "100%",
              paddingTop: "clamp(60px, 12vh, 90px)",
              paddingBottom: "clamp(52px, 10vh, 72px)",
              paddingLeft: "clamp(24px, 8vw, 48px)",
              paddingRight: "clamp(24px, 8vw, 48px)",
              gap: "clamp(10px, 2.5vh, 20px)",
            }}
          >
            {/* Roman numeral + year row */}
            <div className="flex items-center gap-3 self-start">
              <span
                className="font-display"
                style={{
                  fontSize: "clamp(10px, 2.5vw, 13px)",
                  fontWeight: 300,
                  color: "var(--gold)",
                  letterSpacing: "0.25em",
                }}
              >
                {ROMAN[i] ?? String(i + 1)}
              </span>
              <div style={{ width: 32, height: 1, background: "rgba(201,168,76,0.4)" }} />
              <span
                style={{
                  fontSize: "clamp(10px, 2.5vw, 12px)",
                  color: "var(--text-dim)",
                  letterSpacing: "0.2em",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 300,
                }}
              >
                {chapter.year}
              </span>
            </div>

            {/* Chapter title */}
            <h2
              className="font-display self-start"
              style={{
                fontSize: "clamp(28px, 8vw, 44px)",
                fontWeight: 300,
                color: "var(--gold-light)",
                lineHeight: 1.1,
              }}
            >
              {chapter.chapter}
            </h2>

            {/* Photo frame */}
            <div
              style={{
                width: "100%",
                maxWidth: "clamp(220px, 70vw, 300px)",
                aspectRatio: "4/3",
                border: "1px solid var(--border)",
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
                flexShrink: 0,
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
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
                  filter: "grayscale(30%) contrast(1.05)",
                  display: "block",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              />
              {/* Gold overlay tint */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(201,168,76,0.04)",
                  mixBlendMode: "screen",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Description */}
            <p
              className="font-display italic self-start"
              style={{
                color: "var(--text-muted)",
                fontSize: "clamp(13px, 3.5vw, 15px)",
                fontWeight: 300,
                lineHeight: 1.8,
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
        {/* Dots */}
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
                opacity: active === i ? 1 : 0.4,
                padding: 0,
                pointerEvents: "auto",
              }}
            />
          ))}
        </div>

        {/* 5-second countdown bar — resets on each slide change */}
        <div style={{ width: 48, height: 1, background: "rgba(201,168,76,0.15)", borderRadius: 1, overflow: "hidden" }}>
          <motion.div
            key={active}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
            style={{
              height: "100%",
              background: "var(--gold)",
              transformOrigin: "left",
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* Swipe hint — only on first slide */}
      {active === 0 && (
        <div
          className="absolute z-20 flex items-center gap-1"
          style={{
            bottom: "clamp(20px, 4vh, 32px)",
            right: "clamp(16px, 5vw, 32px)",
            color: "var(--text-dim)",
            fontSize: "8px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
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
