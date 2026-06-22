"use client";

// ─── About → Hero split editorial ───────────────────────────────────────────
// Left: custom flower keepsake image. Right: narrative copy + headline.
// Mounted by app/[locale]/about/page.tsx alongside the other About sections.

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

// Emil Kowalski's signature ease-out curve
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function AboutHero() {
  const t = useTranslations("About");

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 md:px-0 flex flex-col py-8 border-b border-neutral-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center w-full mb-12">

        {/* Left Column: Custom Flower Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE_OUT_STRONG, delay: 0.1 }}
          className="flex items-center justify-center shrink-0"
        >
          <img
            src="/rimba-flower.webp"
            alt="Rimba Flower Keepsake"
            className="w-[260px] sm:w-[300px] md:w-[360px] lg:w-[400px] h-auto object-contain select-none"
            style={{ imageRendering: "pixelated" }}
          />
        </motion.div>

        {/* Right Column: Narrative Copy */}
        <div className="flex flex-col gap-8 md:gap-14">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_STRONG, delay: 0.2 }}
            className="flex flex-col gap-4 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed max-w-[460px] text-left"
          >
            <p>{t("para1")}</p>
            <p>{t("para2")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_STRONG, delay: 0.3 }}
            className="flex flex-col text-left"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-neutral-900 tracking-[-0.02em] leading-[1.12] font-normal max-w-[620px]">
              {t("headline")}
            </h2>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
