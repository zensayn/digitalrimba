"use client";

// ─── TemplateGallery ──────────────────────────────────────────────────────────
// Editorial product gallery for the homepage — Face Formula inspired.
//
// A calmer, gallery-style alternative to the dark-band carousel in
// TemplateCatalog (mode="home"). White canvas, centered Poppins display
// heading, a quiet text-only category filter, framed covers floating in soft
// stone, and a single editor's-pick band that echoes Face Formula's bottom
// feature image. Mounted ABOVE TemplateCatalog so the two can be compared.
//
// Design tokens: cohere/DESIGN.md — Poppins, weight ≤ Medium, tracking 0,
// ink #212121, primary #346739, body-muted #616161, soft-stone #eeece7,
// hairline #d9d9dd, 22px media radius, white canvas, no heavy drop shadows.
// Motion: emil-design-eng — ease-out cubic-bezier(0.23, 1, 0.32, 1),
// translateY + opacity (never scale(0)), play once on viewport entry, short
// stagger, transform/opacity-only transitions, :active scale feedback.

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight } from "@solar-icons/react";
import { Link } from "@/i18n/routing";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import type { CatalogProduct, CatalogCollection } from "@/lib/catalog";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface TemplateGalleryProps {
  products: CatalogProduct[];
  collections: CatalogCollection[];
  /** How many covers to show in the grid before "View all". */
  limit?: number;
  /** Show the editor's-pick feature band below the grid. */
  showFeatured?: boolean;
}

export default function TemplateGallery({
  products,
  collections,
  limit = 8,
  showFeatured = true,
}: TemplateGalleryProps) {
  const t = useTranslations("Templates");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: t("categories.all") },
    ...collections.map((c) => ({ id: c.code, label: c.name })),
  ];

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((p) => p.collection_code === activeCategory),
    [products, activeCategory]
  );

  const visible = filtered.slice(0, limit);
  // Feature band = the collection's top seller; fall back to any seller, then
  // to the first product so the band always has something to show.
  const featured =
    filtered.find((p) => p.top_seller) ??
    filtered.find((p) => p.popular) ??
    filtered[0];

  return (
    <section className="w-full bg-white px-6 md:px-10 py-24 md:py-28 flex flex-col items-center">
      <div className="w-full max-w-[1200px]">
        {/* ── Centered editorial heading ───────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="font-poppins font-medium text-[#212121] mt-3 whitespace-pre-line"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            {t("galleryTitle")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            className="mt-4 max-w-md font-poppins text-[15px] text-[#616161] leading-relaxed"
          >
            {t("gallerySubtitle")}
          </motion.p>
        </header>

        {/* ── Category filter + adjacent "view all" ────────────────────── */}
        <div className="relative mt-9 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={isActive}
                  className={`relative font-poppins text-[12px] uppercase pb-1 transition-colors duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                    isActive ? "text-[#212121]" : "text-[#93939f] hover:text-[#616161]"
                  }`}
                >
                  {cat.label}
                  {/* Active underline — animates between items via layout id */}
                  {isActive && (
                    <motion.span
                      layoutId="gallery-filter-underline"
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="absolute left-0 right-0 -bottom-px h-px bg-[#346739]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sits beside the tabs (right on desktop, centered under them on
              mobile) so the action is where users decide what to browse. */}
          <Link
            href="/products"
            className="group mt-5 flex items-center justify-center gap-1.5 font-poppins text-[12px] uppercase text-[#346739] transition-colors duration-200 ease-out hover:text-[#28502c] md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2"
          >
            {t("viewAll")}
            <ArrowRight
              size={13}
              weight="Linear"
              className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* ── Editorial grid: framed covers floating in soft stone ─────── */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
        >
          {visible.map((product, i) => (
            <motion.div
              layout
              key={product.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: Math.min(i * 0.05, 0.3),
                ease: EASE_OUT,
              }}
            >
              <Link href={`/products/${product.slug}`} className="group block text-left">
                {/* Soft-stone frame so the cover reads as a curated object */}
                <div className="rounded-[22px] bg-[#f5f4f0] p-3 border border-[#ececea] transition-colors duration-300 ease-out group-hover:border-[#d9d9dd]">
                  <div className="relative aspect-[4/5] rounded-[14px] overflow-hidden bg-[#eeece7]">
                    <TemplatePreviewCard
                      src={product.cover_url}
                      alt={product.name}
                      className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                {/* Metadata below the frame — plain text, editorial */}
                <div className="mt-3.5 px-0.5 flex items-baseline justify-between gap-3">
                  <h3 className="font-poppins text-[14px] font-medium text-[#212121] truncate">
                    {product.name}
                  </h3>
                  <span className="shrink-0 font-poppins text-[13px] text-[#212121]">
                    {t("priceTag")}
                  </span>
                </div>
                <p className="mt-1 px-0.5 font-poppins text-[12px] text-[#93939f]">
                  {product.popular ? `${t("popularLabel")} · ` : ""}
                  {product.collection_name}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Editor's-pick feature band (Face Formula bottom image) ────── */}
        {showFeatured && featured && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="mt-16 md:mt-20"
          >
            <Link
              href={`/products/${featured.slug}`}
              className="group relative block w-full overflow-hidden rounded-[28px] md:rounded-[32px]"
            >
              <div className="relative aspect-[3/4] sm:aspect-[16/10] lg:aspect-[21/9]">
                <TemplatePreviewCard
                  src={featured.cover_url}
                  alt={featured.name}
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                {/* Readability scrim — left-weighted so copy stays legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#003c33]/80 via-[#003c33]/25 to-transparent pointer-events-none" />

                {/* Overlaid copy + CTA */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10">
                  <div className="flex flex-col items-start gap-3 max-w-lg">
                    <span className="font-poppins text-[11px] uppercase text-white/70">
                      {t("featuredLabel")}
                    </span>
                    <h3 className="font-poppins font-normal text-white tracking-[-0.02em] text-2xl sm:text-3xl md:text-4xl leading-[1.1]">
                      {featured.name}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-white text-[#003c33] font-poppins font-medium text-xs px-5 py-2.5 transition-colors duration-200 ease-out group-hover:bg-[#edfce9]">
                      {t("featuredCta")}
                      <ArrowRight
                        size={14}
                        weight="Linear"
                        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
