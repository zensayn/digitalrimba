"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface ChapterCoverSlideProps {
  numeral: "I" | "II" | "III" | "IV" | "V";
  title: string;
  coverImage: string | null;
  isActive: boolean;
}

export default function ChapterCoverSlide({ numeral, title, coverImage, isActive }: ChapterCoverSlideProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.set("hidden");
      controls.start("visible");
    }
  }, [isActive, controls]);

  const bgStyle: React.CSSProperties = coverImage
    ? {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "sepia(20%) contrast(1.1) brightness(0.75)",
      }
    : { background: "linear-gradient(135deg, var(--surface-2) 0%, var(--bg) 100%)" };

  return (
    <div className="slide-page" style={{ ...bgStyle }}>
      {/* Gradient overlay — sits above the filtered photo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(14,12,10,0.92) 0%, rgba(14,12,10,0.3) 50%, rgba(14,12,10,0.05) 100%)",
        }}
      />

      {/* Top label */}
      <motion.p
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5, delay: 1.0 } },
        }}
        className="font-label"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 36px)",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--gold-dim)",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        KISAH · BAB {numeral}
      </motion.p>

      {/* Center block: numeral + divider + title */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "min(340px, 60vh)",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Bleeding numeral */}
        <motion.div
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
          }}
          className="font-display"
          style={{
            fontSize: "clamp(120px, 38vw, 200px)",
            fontStyle: "italic",
            color: "var(--gold)",
            lineHeight: 0.85,
            userSelect: "none",
            textAlign: "center",
          }}
        >
          {numeral}
        </motion.div>

        {/* Divider */}
        <motion.div
          animate={controls}
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 0.4, delay: 0.6 } },
          }}
          className="amber-divider"
          style={{ marginTop: 16, marginBottom: 12 }}
        />

        {/* Chapter title */}
        <motion.p
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.4, delay: 0.8 } },
          }}
          className="font-display"
          style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            fontStyle: "italic",
            color: "var(--text)",
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          {title}
        </motion.p>
      </div>

      {/* Bottom hint */}
      <motion.p
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 0.5, transition: { duration: 0.3, delay: 1.2 } },
        }}
        className="font-label"
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 80px)",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "var(--text-dim)",
          whiteSpace: "nowrap",
          animation: "pulse-hint 3s ease-in-out infinite",
          zIndex: 10,
        }}
      >
        geser →
      </motion.p>
    </div>
  );
}
