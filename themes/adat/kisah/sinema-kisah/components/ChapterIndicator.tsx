"use client";

import { motion } from "framer-motion";

interface Chapter {
  numeral: string;
  title: string;
  slides: number[];
}

interface ChapterIndicatorProps {
  chapters: Chapter[];
  currentSlide: number;
}

export default function ChapterIndicator({ chapters, currentSlide }: ChapterIndicatorProps) {
  const activeChapterIdx = chapters.findIndex((ch) => ch.slides.includes(currentSlide));

  return (
    <div
      className="font-label"
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom) + 20px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <motion.span
        key={activeChapterIdx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          color: "var(--text-dim)",
          fontSize: 8,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        {activeChapterIdx >= 0 ? chapters[activeChapterIdx].title : ""}
      </motion.span>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {chapters.map((_, i) => {
          const isActive = i === activeChapterIdx;
          return (
            <motion.div
              key={i}
              animate={{
                width: isActive ? 56 : 32,
                background: isActive ? "var(--gold)" : "rgba(200,145,90,0.25)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: 2, borderRadius: 1 }}
            />
          );
        })}
      </div>
    </div>
  );
}
