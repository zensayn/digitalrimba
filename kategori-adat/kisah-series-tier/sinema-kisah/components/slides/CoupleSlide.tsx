"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";

export default function CoupleSlide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-5%" });
  const { couple } = useInvitationConfig();

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.2, duration: 0.8 } }),
  };

  return (
    <div
      ref={ref}
      className="slide-page"
      style={{ flexDirection: "row", alignItems: "stretch", justifyContent: "stretch" }}
    >
      {/* Groom half */}
      <motion.div
        custom={0}
        variants={fadeIn}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ position: "relative", width: "50%", flexShrink: 0, overflow: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={couple.groom.photo}
          alt={couple.groom.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(15%) contrast(1.05) brightness(0.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(14,12,10,0.85) 0%, rgba(200,145,90,0.08) 50%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "clamp(24px,5vh,40px)",
            left: "clamp(16px,4vw,24px)",
            right: 8,
          }}
        >
          <p
            className="font-display"
            style={{ fontSize: "clamp(32px, 9vw, 48px)", color: "var(--text)", lineHeight: 1.1 }}
          >
            {couple.groom.name}
          </p>
          <p
            className="font-label"
            style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginTop: 6, lineHeight: 1.6 }}
          >
            {couple.groom.fullName}
          </p>
          <p
            className="font-label"
            style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.05em", lineHeight: 1.6 }}
          >
            {couple.groom.parents}
          </p>
        </div>
      </motion.div>

      {/* Center & divider */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          zIndex: 10,
          width: 1,
        }}
      >
        <div className="amber-divider-vertical" style={{ height: "100%" }} />
        <motion.span
          custom={1}
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="font-display"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(48px, 14vw, 80px)",
            fontStyle: "italic",
            color: "var(--gold)",
            mixBlendMode: "overlay",
            userSelect: "none",
          }}
        >
          &amp;
        </motion.span>
      </div>

      {/* Bride half */}
      <motion.div
        custom={2}
        variants={fadeIn}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ position: "relative", width: "50%", flexShrink: 0, overflow: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={couple.bride.photo}
          alt={couple.bride.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(15%) contrast(1.05) brightness(0.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(14,12,10,0.85) 0%, rgba(200,145,90,0.08) 50%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "clamp(24px,5vh,40px)",
            right: "clamp(16px,4vw,24px)",
            left: 8,
            textAlign: "right",
          }}
        >
          <p
            className="font-display"
            style={{ fontSize: "clamp(32px, 9vw, 48px)", color: "var(--text)", lineHeight: 1.1 }}
          >
            {couple.bride.name}
          </p>
          <p
            className="font-label"
            style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginTop: 6, lineHeight: 1.6 }}
          >
            {couple.bride.fullName}
          </p>
          <p
            className="font-label"
            style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.05em", lineHeight: 1.6 }}
          >
            {couple.bride.parents}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
