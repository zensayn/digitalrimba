"use client";

// ─── CraftProcess ─────────────────────────────────────────────────────────────
// "How it's made" band — FREITAG-inspired. A left-aligned heading with a CTA, then
// three image cards with an overlaid uppercase label + caption. Two cards show the
// process (printing, foil), the third is a provenance card (made in Indonesia).
// Emphasises craft and origin over individual materials.
//
// Design tokens: cohere/DESIGN.md (Poppins, ink #212121, primary #346739,
// 22px media radius, pill CTA, weight ≤ Medium, tracking 0, white canvas).
// Motion: Emil — ease-out cubic-bezier(0.23, 1, 0.32, 1), ~70ms stagger,
// translateY+opacity (never scale(0)), play once on viewport entry.
//
// PHOTOS: swap the `image` values for your own workshop/process shots. Placeholders
// are licensed Unsplash images; any host in next.config `images.remotePatterns` works.

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import Image from "next/image";
import { ArrowRight } from "@solar-icons/react";
import { Link } from "@/i18n/routing";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Card = { labelKey: string; bodyKey: string; image: string; alt: string };

const CARDS: Card[] = [
  {
    labelKey: "c1Label",
    bodyKey: "c1Body",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&q=80",
    alt: "Printing press running invitation stock",
  },
  {
    labelKey: "c2Label",
    bodyKey: "c2Body",
    image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=1000&q=80",
    alt: "Gold foil and emboss detail",
  },
  {
    labelKey: "c3Label",
    bodyKey: "c3Body",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1000&q=80",
    alt: "Our workshop in Indonesia",
  },
];

export default function CraftProcess() {
  const t = useTranslations("CraftProcess");

  return (
    <section className="w-full flex justify-center bg-white" style={{ padding: "96px 20px" }}>
      <div className="w-full max-w-[1100px]">
        {/* ── Header row — heading left, CTA right ─────────────────────── */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div className="max-w-[620px]">
            <h2
              className="font-poppins font-medium text-[#212121] mt-3 whitespace-pre-line"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
            >
              {t("title")}
            </h2>
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 self-start md:self-auto shrink-0 rounded-full border border-[#212121] px-5 py-2.5 font-poppins text-[14px] font-medium text-[#212121] transition-colors duration-200 hover:bg-[#212121] hover:text-white active:scale-[0.97]"
          >
            {t("cta")}
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* ── Three image cards with overlaid label + caption ──────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              className="group relative aspect-[3/4] rounded-[22px] overflow-hidden bg-[#eeece7]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: EASE_OUT }}
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(min-width: 768px) 340px, 90vw"
                className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
              />
              {/* Legibility scrim — bottom-weighted */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="font-poppins text-[12px] font-medium text-white uppercase">
                  {t(card.labelKey)}
                </span>
                <p className="font-poppins text-[14px] text-white/85 mt-1.5" style={{ lineHeight: 1.45 }}>
                  {t(card.bodyKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
