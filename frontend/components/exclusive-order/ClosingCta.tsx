"use client";

// ─── Exclusive Order · Closing CTA ────────────────────────────────────────────
// Centered statement + a scattered, full-bleed photo strip that drifts
// horizontally with scroll (spring-smoothed, disabled for reduced motion).

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { useTranslations } from "next-intl";
import { IconBrandWhatsapp, IconArrowRight } from "@tabler/icons-react";
import {
  EASE_OUT_STRONG,
  CTA_GALLERY,
  unsplash,
  waLink,
} from "@/components/exclusive-order/constants";

export default function ClosingCta() {
  const t = useTranslations("ExclusiveOrder");

  // Closing headline: keep the lead clause upright, italicize the reassurance
  // that follows the "?" (works for both EN and ID, which each have one "?").
  const closingTitle = t("closingTitle");
  const qIndex = closingTitle.indexOf("?");
  const closingHead = qIndex >= 0 ? closingTitle.slice(0, qIndex + 1) : closingTitle;
  const closingRest = qIndex >= 0 ? closingTitle.slice(qIndex + 1).trim() : "";

  // Scroll-linked horizontal drift for the closing photo strip. The ×3-tiled
  // track is wider than the viewport, so `margin: auto` can't center it (auto
  // margins clamp to 0 for over-wide elements) — it sits left-aligned. We bias
  // the drift to stay negative (BASE_X ± DRIFT, always ≤ 0) so the track's left
  // edge never slides past the viewport and exposes a blank gap, while the extra
  // tiles keep it bleeding off the right. Spring-smoothed; off for reduced motion.
  const closingRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: closingRef,
    offset: ["start end", "end start"],
  });
  const BASE_X = -120;
  const DRIFT = 90;
  const stripXRaw = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [BASE_X, BASE_X] : [BASE_X - DRIFT, BASE_X + DRIFT]
  );
  const stripX = useSpring(stripXRaw, { stiffness: 80, damping: 20, mass: 0.4 });

  return (
    <section ref={closingRef} className="relative overflow-hidden pt-16 md:pt-24">
      {/* Centered statement */}
      <div className="max-w-[860px] mx-auto px-6 flex flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_STRONG }}
          className="font-medium tracking-[-0.02em] leading-[1.05] text-[2rem] md:text-[3.25rem]"
        >
          {closingHead}{" "}
          <em className="not-italic md:italic font-normal text-[#346739]">{closingRest}</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT_STRONG }}
          className="mt-6 max-w-[480px] text-[15px] md:text-base leading-relaxed text-[#616161]"
        >
          {t("heroIntro")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.16, ease: EASE_OUT_STRONG }}
          className="mt-9"
        >
          <a href={waLink(t("waGeneric"))} target="_blank" rel="noopener noreferrer">
            <span className="group inline-flex items-center gap-3 rounded-full bg-[#003c33] py-2 pl-6 pr-2 text-[15px] font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]">
              <span className="inline-flex items-center gap-2">
                <IconBrandWhatsapp className="w-[18px] h-[18px] text-[#bfe3b4]" />
                {t("closingCta")}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edfce9] text-[#003c33] transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                <IconArrowRight size={18} stroke={2.2} />
              </span>
            </span>
          </a>
        </motion.div>
      </div>

      {/* Scattered photo strip — full-bleed, bleeds off both edges */}
      <div aria-hidden="true" className="mt-12 md:mt-16 overflow-hidden">
        <motion.div
          style={{ x: stripX }}
          className="flex w-max items-start gap-3 sm:gap-4 px-4"
        >
          {/* Tiled ×3 so the left-aligned track always overfills the viewport
              plus the scroll-drift range — bleeds off the right, never gaps. */}
          {[...CTA_GALLERY, ...CTA_GALLERY, ...CTA_GALLERY].map((shot, i) => (
            <motion.div
              key={`${shot.id}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: (i % CTA_GALLERY.length) * 0.05,
                ease: EASE_OUT_STRONG,
              }}
              style={{ marginTop: shot.offset }}
              className="relative shrink-0 w-[116px] sm:w-[156px] lg:w-[184px] aspect-[3/4] overflow-hidden rounded-[16px] bg-[#eeece7]"
            >
              <Image
                src={unsplash(shot.id)}
                alt=""
                fill
                sizes="(min-width: 1024px) 184px, (min-width: 640px) 156px, 116px"
                className="object-cover"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
