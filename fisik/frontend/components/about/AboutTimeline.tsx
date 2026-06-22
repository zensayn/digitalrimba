"use client";

// ─── About → Timeline ("Our story over the years") ──────────────────────────
// Public-style hybrid: one large in-focus panel (year + title + paragraph +
// image) sitting above a horizontal tab-rail of year pills. Selecting a pill —
// or using the prev/next arrows — swaps the panel with a blurred crossfade.
//
// Design tokens follow design-template/cohere/DESIGN.md (Poppins, #346739 green,
// #212121 ink, 32px card radius, flat surfaces, pill controls, editorial
// restraint — no wide tracking, weights capped at medium). Motion follows the
// emil-design-eng principles (strong ease-out curve, blur-masked crossfade,
// scale-on-press feedback, sub-300ms UI motion, reduced-motion aware).

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

// Emil Kowalski's signature strong ease-out curve.
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface Milestone {
  year: string;
  title: string;
  desc: string;
  imageUrl: string;
}

export default function AboutTimeline() {
  const t = useTranslations("About");
  const reduceMotion = useReducedMotion();

  const milestones: Milestone[] = [
    {
      year: t("m1Year"),
      title: t("m1Title"),
      desc: t("m1Desc"),
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
    },
    {
      year: t("m2Year"),
      title: t("m2Title"),
      desc: t("m2Desc"),
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop"
    },
    {
      year: t("m3Year"),
      title: t("m3Title"),
      desc: t("m3Desc"),
      imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop"
    },
    {
      year: t("m4Year"),
      title: t("m4Title"),
      desc: t("m4Desc"),
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop"
    },
    {
      year: t("m5Year"),
      title: t("m5Title"),
      desc: t("m5Desc"),
      imageUrl: "https://images.unsplash.com/photo-1583795484071-3c453e3a7c71?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = milestones[active];
  const atStart = active === 0;
  const atEnd = active === milestones.length - 1;

  const go = (next: number) => {
    setActive(Math.min(Math.max(next, 0), milestones.length - 1));
  };

  // Keep the selected year pill scrolled into view when stepping via arrows.
  useEffect(() => {
    const chip = chipRefs.current[active];
    chip?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active, reduceMotion]);

  // Blur-masked crossfade for the focus panel. Reduced motion → opacity only.
  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 12, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -8, filter: "blur(6px)" },
        transition: { duration: 0.3, ease: EASE_OUT_STRONG },
      };

  return (
    <div className="relative w-full overflow-hidden font-poppins">

      <div className="w-full max-w-[1240px] mx-auto px-6 md:px-0 pt-16 pb-20 flex flex-col text-left">

        {/* Header Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12 md:mb-16 w-full">
          <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-[#212121]">
            {t("timelineTitle")}
          </h3>
          <p className="text-sm md:text-base text-neutral-500 font-normal leading-relaxed max-w-[600px]">
            {t("timelineDesc")}
          </p>
        </div>

        {/* ── Focus panel ──────────────────────────────────────────────── */}
        <div className="relative w-full rounded-[32px] border border-neutral-100 bg-white overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={panelMotion.initial}
              animate={panelMotion.animate}
              exit={panelMotion.exit}
              transition={panelMotion.transition}
              className="grid grid-cols-1 md:grid-cols-2"
            >
              {/* Left: narrative */}
              <div className="flex flex-col justify-between gap-8 p-8 md:p-12 md:min-h-[360px]">
                <div className="flex flex-col gap-5">
                  <span className="text-sm font-medium text-[#346739]">
                    {current.year}
                  </span>
                  <h4 className="text-2xl md:text-[32px] leading-[1.2] font-medium text-[#212121] max-w-[440px]">
                    {current.title}
                  </h4>
                  <p className="text-sm md:text-base text-neutral-500 font-normal leading-relaxed max-w-[460px]">
                    {current.desc}
                  </p>
                </div>

                {/* Position counter */}
                <span className="text-xs text-neutral-400 font-normal tabular-nums">
                  {String(active + 1).padStart(2, "0")} — {String(milestones.length).padStart(2, "0")}
                </span>
              </div>

              {/* Right: media — inset card (Public-style) with a micro zoom-in */}
              <div className="p-5 md:p-6 md:pl-0">
                <div className="relative h-[240px] md:h-full md:min-h-[320px] rounded-[24px] overflow-hidden border border-neutral-100 bg-neutral-50 group">
                  <motion.img
                    src={current.imageUrl}
                    alt={current.title}
                    initial={reduceMotion ? false : { scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.7, ease: EASE_OUT_STRONG }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Progress stepper (Public-style: label · line+node · year chip) ── */}
        <div
          ref={railRef}
          className="mt-10 md:mt-12 overflow-x-auto scrollbar-none scroll-smooth"
        >
          <div className="flex items-stretch min-w-[680px]">
            {milestones.map((item, idx) => {
              const isActive = idx === active;
              const isPassed = idx <= active;
              const lastIdx = milestones.length - 1;
              return (
                <button
                  key={item.year}
                  ref={(el) => { chipRefs.current[idx] = el; }}
                  onClick={() => go(idx)}
                  aria-current={isActive ? "true" : undefined}
                  className="group relative flex-1 flex flex-col items-center gap-5 outline-none cursor-pointer"
                >
                  {/* Top label — milestone title */}
                  <span
                    className={`px-2 text-center text-xs sm:text-sm font-medium leading-snug line-clamp-2 transition-colors duration-200 ${
                      isActive ? "text-[#212121]" : "text-neutral-400 group-hover:text-neutral-600"
                    }`}
                  >
                    {item.title}
                  </span>

                  {/* Connector line + node */}
                  <div className="relative w-full flex items-center justify-center h-3.5">
                    {/* left half-segment (skip on first) */}
                    {idx !== 0 && (
                      <span
                        className={`absolute top-1/2 left-0 right-1/2 h-px -translate-y-1/2 transition-colors duration-300 ${
                          idx <= active ? "bg-[#346739]" : "bg-neutral-200"
                        }`}
                      />
                    )}
                    {/* right half-segment (skip on last) */}
                    {idx !== lastIdx && (
                      <span
                        className={`absolute top-1/2 left-1/2 right-0 h-px -translate-y-1/2 transition-colors duration-300 ${
                          idx < active ? "bg-[#346739]" : "bg-neutral-200"
                        }`}
                      />
                    )}
                    {/* node */}
                    <span
                      className={`relative z-10 rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-3.5 h-3.5 bg-[#346739] ring-4 ring-[#346739]/15"
                          : isPassed
                          ? "w-2.5 h-2.5 bg-[#346739]"
                          : "w-2.5 h-2.5 bg-white border border-neutral-300 group-hover:border-neutral-400"
                      }`}
                    />
                  </div>

                  {/* Year chip */}
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 active:scale-[0.97] ${
                      isActive
                        ? "bg-[#346739] text-white border-transparent"
                        : "text-neutral-500 border-neutral-200 group-hover:text-[#212121] group-hover:border-neutral-300"
                    }`}
                  >
                    {item.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prev / Next — bottom-right, Public-style */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            onClick={() => go(active - 1)}
            disabled={atStart}
            className="w-10 h-10 rounded-full border border-neutral-200 enabled:hover:border-[#212121] bg-white text-neutral-800 enabled:hover:bg-neutral-50 flex items-center justify-center transition-all duration-200 cursor-pointer enabled:active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed outline-none"
            aria-label="Previous milestone"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => go(active + 1)}
            disabled={atEnd}
            className="w-10 h-10 rounded-full border border-neutral-200 enabled:hover:border-[#212121] bg-white text-neutral-800 enabled:hover:bg-neutral-50 flex items-center justify-center transition-all duration-200 cursor-pointer enabled:active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed outline-none"
            aria-label="Next milestone"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
