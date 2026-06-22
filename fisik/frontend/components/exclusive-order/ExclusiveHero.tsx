"use client";

// ─── Exclusive Order · Hero ───────────────────────────────────────────────────
// Distinct deep-green band with a split layout: copy + CTAs + proof on the left,
// the subject photo bleeding from the bottom-right (Hers-style) on the right.

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";
import {
  EASE_OUT_STRONG,
  HERO_PHOTO,
  HERO_STATS,
  waLink,
} from "@/components/exclusive-order/constants";

export default function ExclusiveHero() {
  const t = useTranslations("ExclusiveOrder");

  return (
    <section className="relative overflow-hidden bg-[#003c33] text-white min-h-screen lg:h-screen rounded-b-[32px] md:rounded-b-[48px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55% 70% at 85% 0%, rgba(52,103,57,0.55), transparent 60%), radial-gradient(45% 55% at 0% 100%, rgba(237,252,233,0.10), transparent 60%)",
        }}
      />
      {/* Subject image — bleeds from the bottom-right of the band (Hers-style) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_STRONG }}
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-[2%] lg:right-[8%] z-[5] h-[52%] w-[94%] sm:h-[66%] sm:w-[70%] lg:h-[100%] lg:w-[62%]"
      >
        <Image
          src={HERO_PHOTO}
          alt={t("heroPhotoAlt")}
          fill
          // Highlight-start: Increased viewport allocations
          sizes="(min-width: 1200px) 120vw, 120vw"
          // Highlight-end
          className="object-contain object-bottom sm:object-right-bottom"
          priority
        />
      </motion.div>

      <div className="relative z-10 h-full max-w-[1200px] mx-auto px-6 py-16 md:py-24 flex items-center">
        {/* Left: copy + CTAs + proof */}
        <div className="flex flex-col max-w-[560px] pb-[42vh] lg:pb-0">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT_STRONG }}
            className="mt-5 font-medium leading-[1.02] tracking-[-0.02em] text-[2.75rem] md:text-[4.25rem]"
          >
            {t("heroTitle").split(" ")[0]}{" "}
            <span className="text-[#bfe3b4]">
              {t("heroTitle").split(" ").slice(1).join(" ")}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT_STRONG }}
            className="mt-5 max-w-[520px] text-[15px] md:text-base leading-relaxed text-white/80"
          >
            {t("heroIntro")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT_STRONG }}
            className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-fit"
          >
            <a href={waLink(t("waGeneric"))} target="_blank" rel="noopener noreferrer">
              <TextureButton variant="primary" size="lg" className="w-full font-medium">
                <IconBrandWhatsapp className="w-5 h-5" />
                {t("heroCtaPrimary")}
              </TextureButton>
            </a>
            <a href="#priority">
              <TextureButton variant="outline" size="lg" className="w-full font-medium">
                {t("heroCtaSecondary")}
              </TextureButton>
            </a>
          </motion.div>
          {/* Proof row (derived from the real Priority tiers) */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease: EASE_OUT_STRONG }}
            className="mt-10 grid grid-cols-3 gap-4 max-w-[460px] border-t border-white/10 pt-6"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.valueKey} className="flex flex-col">
                <dt className="order-2 text-[12px] text-white/55 leading-tight mt-1">
                  {t(stat.labelKey)}
                </dt>
                <dd className="order-1 text-[1.5rem] font-medium tracking-[-0.02em] text-white">
                  {t(stat.valueKey)}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
