"use client";

// ─── ConsultationIntro ────────────────────────────────────────────────────────
// Editorial intro for the /consultation page: an eyebrow, a display headline, a
// short subtitle, then a three-step "what to expect" row that sets context before
// the Cal.com booking desk (<ConsultationBooking />) below it. Booking IS a real
// sequence (pick a time → meet → get your concept), so numbered markers earn
// their place here rather than decorating.
//
// Design tokens: cohere/DESIGN.md — white canvas, Poppins, weight ≤ Medium,
// tracking 0 (subtle negative only on the display headline), ink #212121,
// primary #346739, body-muted #616161, hairline rules. Motion: emil-design-eng —
// ease-out cubic-bezier(0.23, 1, 0.32, 1), reveal once on viewport entry,
// transform + opacity only, reduced-motion respected.

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function ConsultationIntro() {
  const t = useTranslations("Consultation");
  const reduce = useReducedMotion();

  const steps = [
    { n: "01", title: t("step1Title"), desc: t("step1Desc") },
    { n: "02", title: t("step2Title"), desc: t("step2Desc") },
    { n: "03", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <section className="w-full bg-white px-6 md:px-10 pt-16 pb-12  md:pt-24 md:pb-20 flex flex-col items-center">
      <div className="w-full max-w-[1200px]">
        {/* ── Heading ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <motion.h1
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT }}
            className="mt-3 max-w-4xl font-poppins font-medium text-[#212121]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT }}
            className="mt-4 max-w-2xl font-poppins text-[15px] md:text-base text-[#616161] leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </header>

        {/* ── What to expect — a real three-step sequence ──────────────────── */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-[18px] border border-[#ececea] bg-[#ececea]">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.2), ease: EASE_OUT }}
              className="flex flex-col gap-2 bg-white p-6 md:p-8"
            >
              <span className="font-poppins text-[13px] font-medium text-[#346739]">{step.n}</span>
              <h3 className="font-poppins text-[17px] font-medium text-[#212121]">{step.title}</h3>
              <p className="font-poppins text-[13.5px] leading-relaxed text-[#616161]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
