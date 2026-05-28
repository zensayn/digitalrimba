"use client";

// ─── Products listing page ────────────────────────────────────────────────────
// Header + Footer are mounted in app/[locale]/layout.tsx (MarketingChrome).
//
// Layout split:
//   • Mobile / tablet (<lg) → MobileCatalogCarousels: Airbnb-style horizontal
//                              rails, one per category, with the same
//                              search / chip-filter / sort controls.
//   • Desktop (lg+)         → TemplateCatalog page mode: sidebar + grid.

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import TemplateCatalog from "@/components/TemplateCatalog";
import MobileCatalogCarousels from "@/components/products/MobileCatalogCarousels";

const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

export default function ProductsPage() {
  const t = useTranslations("Templates");

  return (
    <main className="min-h-screen bg-white text-[#212121] flex flex-col font-poppins">
      {/* Editorial header */}
      <header className="w-full max-w-[1200px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-4 text-center flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT_STRONG }}
          className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] leading-[1.12] text-[#212121] max-w-3xl mb-4"
        >
          {t("title").split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_STRONG }}
          className="text-sm md:text-base text-[#616161] max-w-xl font-light leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>
      </header>

      {/* Mobile + tablet: per-category horizontal carousels */}
      <div className="lg:hidden">
        <MobileCatalogCarousels />
      </div>

      {/* Desktop: full filter sidebar + grid */}
      <div className="hidden lg:block">
        <TemplateCatalog mode="page" showHeading={false} />
      </div>
    </main>
  );
}
