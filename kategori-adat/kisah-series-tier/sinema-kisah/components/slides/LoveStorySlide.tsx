"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

const ROMAN = ["I", "II", "III", "IV", "V"];

export default function LoveStorySlide() {
  const { loveStory } = useInvitationConfig();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });

  return (
    <div className="slide-page" style={{ justifyContent: "flex-start" }}>
      <div
        ref={ref}
        data-prevent-snap="true"
        className="overflow-y-auto"
        style={{ width: "100%", height: "100dvh", paddingBottom: "clamp(80px, 15vh, 120px)" }}
      >
        {/* Header */}
        <div style={{ padding: "clamp(40px,8vh,64px) 24px clamp(20px,4vh,32px)" }}>
          <motion.p
            className="font-label"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginBottom: 8,
            }}
          >
            Perjalanan Kami
          </motion.p>
          <motion.h2
            className="font-display"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: "clamp(28px, 8vw, 40px)",
              fontStyle: "italic",
              color: "var(--gold)",
            }}
          >
            Kisah Kami
          </motion.h2>
        </div>

        {/* Story entries */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {loveStory.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              style={{
                display: "flex",
                position: "relative",
                paddingLeft: 24,
                paddingRight: 24,
                paddingBottom: 40,
              }}
            >
              {/* Timeline line */}
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "linear-gradient(to bottom, var(--gold-dim), transparent)",
                }}
              />

              {/* Content */}
              <div style={{ paddingLeft: 20, width: "100%" }}>
                {/* Image with numeral watermark */}
                <div style={{ position: "relative", marginBottom: 16, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.image}
                    alt={entry.chapter}
                    style={{
                      width: "100%",
                      display: "block",
                      filter: "sepia(25%) contrast(1.08) brightness(0.9)",
                    }}
                  />
                  <div
                    className="font-display"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: 8,
                      transform: "translateY(-50%)",
                      fontSize: "clamp(80px, 25vw, 140px)",
                      fontStyle: "italic",
                      color: "var(--gold)",
                      opacity: 0.12,
                      lineHeight: 1,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {ROMAN[i] ?? String(i + 1)}
                  </div>
                </div>

                <p
                  className="font-label"
                  style={{ fontSize: 10, letterSpacing: "0.25em", color: "var(--gold-dim)", marginBottom: 6 }}
                >
                  {entry.year}
                </p>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(18px, 5vw, 22px)",
                    fontStyle: "italic",
                    color: "var(--text)",
                    marginBottom: 8,
                  }}
                >
                  {entry.chapter}
                </h3>
                <p
                  className="font-body"
                  style={{ fontStyle: "italic", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.9 }}
                >
                  {entry.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
