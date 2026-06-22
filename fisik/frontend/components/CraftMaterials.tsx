"use client";

// ─── CraftMaterials ───────────────────────────────────────────────────────────
// "The craft" band — Rains-inspired. Alternating macro-detail rows: a large
// rounded close-up photo paired with a short bold claim + one sentence. Photo-led,
// editorial, premium — sells the tactile quality of a physical invitation.
//
// Design tokens: cohere/DESIGN.md (Poppins, ink #212121, primary #346739,
// body-muted #616161, 22px media radius, weight ≤ Medium, tracking 0, white canvas).
// Motion: Emil — ease-out cubic-bezier(0.23, 1, 0.32, 1), translateY+opacity
// (never scale(0)), play once on viewport entry.
//
// PHOTOS: swap the `image` values below for your own macro shots (foil, paper,
// edges). Any host added to next.config `images.remotePatterns` works — drop in
// `contents.rimba.app` URLs when ready. Placeholders are licensed Unsplash images.

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import Image from "next/image";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Row = { titleKey: string; bodyKey: string; image: string; alt: string };

const ROWS: Row[] = [
  {
    titleKey: "m1Title",
    bodyKey: "m1Body",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80",
    alt: "Heavyweight cotton paper invitation with soft grain",
  },
  {
    titleKey: "m2Title",
    bodyKey: "m2Body",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=80",
    alt: "Gold foil detail catching the light",
  },
  {
    titleKey: "m3Title",
    bodyKey: "m3Body",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=1200&q=80",
    alt: "Hand-painted edges and binding",
  },
];

export default function CraftMaterials() {
  const t = useTranslations("CraftMaterials");

  return (
    <section className="w-full flex justify-center bg-white" style={{ padding: "96px 20px" }}>
      <div className="w-full max-w-[1200px]">
        {/* ── Editorial header ─────────────────────────────────────────── */}
        <motion.div
          className="max-w-[560px] mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <h2
            className="font-poppins font-medium text-[#212121] mt-3 whitespace-pre-line"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            {t("title")}
          </h2>
          <p className="font-poppins text-[#616161] mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.5 }}>
            {t("subtitle")}
          </p>
        </motion.div>

        {/* ── Alternating macro-detail rows ────────────────────────────── */}
        <div className="flex flex-col gap-16 lg:gap-28">
          {ROWS.map((row, i) => {
            const imageRight = i % 2 === 1; // alternate sides on desktop
            return (
              <div key={i} className="grid lg:grid-cols-2 gap-7 lg:gap-16 items-center">
                {/* Photo — rounded media card */}
                <motion.div
                  className={`relative aspect-[4/3] rounded-[22px] overflow-hidden bg-[#eeece7] ${
                    imageRight ? "lg:order-2" : ""
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                >
                  <Image
                    src={row.image}
                    alt={row.alt}
                    fill
                    sizes="(min-width: 1024px) 520px, 90vw"
                    className="object-cover"
                  />
                </motion.div>

                {/* Copy — short bold claim + one sentence */}
                <motion.div
                  className={imageRight ? "lg:order-1 lg:pr-4" : "lg:pl-4"}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT }}
                >
                  <span className="font-poppins text-[14px] text-[#93939f]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="font-poppins font-medium text-[#212121] mt-2"
                    style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", lineHeight: 1.15, letterSpacing: "-0.02em" }}
                  >
                    {t(row.titleKey)}
                  </h3>
                  <p
                    className="font-poppins text-[#616161] mt-4 max-w-[440px]"
                    style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
                  >
                    {t(row.bodyKey)}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
