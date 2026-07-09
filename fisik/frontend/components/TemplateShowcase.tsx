"use client";

// ─── TemplateShowcase ─────────────────────────────────────────────────────────
// Image-led catalog rail for the homepage — Swap inspired (Mobbin ref:
// https://mobbin.com/sites/sections/e10088de-d4dc-469f-bcd0-d2ef9dbeb668).
//
// Heading left, round arrows right, then a horizontal snap rail of tall
// full-bleed covers: collection chip top-left, name + price on a scrim
// bottom-left. Swipe-native on mobile (whole card is the touch target);
// arrows drive it on desktop. The last card is a soft-stone "view all" tile.
// Mounted ABOVE TemplateGallery so the two can be compared.
//
// Design tokens: cohere/DESIGN.md — 22px media radius, white canvas, hairline
// #d9d9dd controls, deep-green #003c33 scrim, uppercase micro chips, Poppins
// ≤ Medium, tracking 0. Motion: emil-design-eng — transform/opacity only,
// strong ease-out, :active scale feedback, hover gated to fine pointers.

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight } from "@solar-icons/react";
import { Link } from "@/i18n/routing";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import CardPriceTag from "@/components/products/CardPriceTag";
import type { CatalogProduct, CardPrice } from "@/lib/catalog";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Aligns the rail's first card with the 1200px/px-6 container edge:
// max(24px, (100vw - 1152px) / 2) where 1152 = 1200 - 2*24 content width.
const RAIL_INSET = "max(1.5rem, calc((100vw - 1152px) / 2))";

interface TemplateShowcaseProps {
  products: CatalogProduct[];
  /** How many covers to show before the "view all" tile. */
  limit?: number;
  /** slug → entry price + availability. Absent ⇒ cards render without a price. */
  priceBySlug?: Record<string, CardPrice>;
}

export default function TemplateShowcase({
  products,
  limit = 8,
  priceBySlug,
}: TemplateShowcaseProps) {
  const t = useTranslations("Templates");
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const visible = products.slice(0, limit);
  if (visible.length === 0) return null;

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Redirect vertical wheel input to horizontal scroll so mouse/trackpad users
  // can't scroll the page while over the rail — only left/right moves it.
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = railRef.current;
    if (!el || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  };

  return (
    <section className="w-full bg-white py-24 md:py-28 overflow-x-hidden">
      {/* ── Header: heading + subtitle left, arrows right ──────────────── */}
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="font-poppins font-medium text-[#212121] whitespace-pre-line"
              style={{
                fontSize: "clamp(1.9rem, 4vw, 3rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
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
          </div>

          {/* Desktop arrows — mobile swipes the rail directly */}
          <div className="hidden shrink-0 items-center gap-2 pb-1 md:flex">
            <RailArrow
              label="Previous designs"
              disabled={!canPrev}
              onClick={() => scroll(-1)}
            >
              <ArrowRight size={16} weight="Linear" className="rotate-180" />
            </RailArrow>
            <RailArrow
              label="Next designs"
              disabled={!canNext}
              onClick={() => scroll(1)}
            >
              <ArrowRight size={16} weight="Linear" />
            </RailArrow>
          </div>
        </div>
      </div>

      {/* ── Snap rail: tall covers + closing view-all tile ─────────────── */}
      <div
        ref={railRef}
        onScroll={updateArrows}
        onWheel={onWheel}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden md:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingInline: RAIL_INSET,
          scrollPaddingInline: RAIL_INSET,
          touchAction: "pan-x",
        }}
      >
        {visible.map((product, i) => {
          const price = priceBySlug?.[product.slug];
          const muted = !!price && !price.available;
          return (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: Math.min(i * 0.05, 0.25),
                ease: EASE_OUT,
              }}
              className="snap-start"
            >
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-[76vw] max-w-[340px] overflow-hidden rounded-[22px] bg-[#eeece7] transition-transform duration-200 ease-out active:scale-[0.99] sm:w-[340px] lg:w-[380px] lg:max-w-none"
              >
                <div className="relative aspect-[4/5]">
                  <TemplatePreviewCard
                    src={product.cover_url}
                    alt={product.name}
                    sizes="(min-width: 1024px) 380px, 76vw"
                    className={`h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                      muted ? "grayscale opacity-60" : ""
                    }`}
                  />

                  {/* Readability scrim — bottom-weighted, brand deep green */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#003c33]/85 to-transparent to-55%" />

                  {/* Chips top-left */}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white/90 px-3 py-1.5 font-poppins text-[10px] uppercase leading-none text-[#212121]">
                      {product.collection_name}
                    </span>
                    {(product.top_seller || product.popular) && (
                      <span className="rounded-full bg-[#edfce9]/95 px-3 py-1.5 font-poppins text-[10px] uppercase leading-none text-[#346739]">
                        {t("popularLabel")}
                      </span>
                    )}
                  </div>

                  {/* Name + price bottom-left, arrow affordance bottom-right */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h3 className="truncate font-poppins text-[19px] font-medium leading-tight text-white">
                        {product.name}
                      </h3>
                      <CardPriceTag
                        price={price}
                        tone="dark"
                        className="mt-1 block font-poppins text-[13px]"
                      />
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                      <ArrowRight size={15} weight="Linear" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* Closing tile — the rail's own "view all", one big touch target */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="snap-start"
        >
          <Link
            href="/products"
            className="group flex aspect-[4/5] w-[76vw] max-w-[340px] flex-col items-center justify-center gap-4 rounded-[22px] bg-[#eeece7] transition-transform duration-200 ease-out active:scale-[0.99] sm:w-[340px] lg:w-[380px] lg:max-w-none"
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-[#21212133] text-[#212121] transition-transform duration-200 ease-out group-hover:translate-x-0.5">
              <ArrowRight size={18} weight="Linear" />
            </span>
            <span className="font-poppins text-[12px] uppercase text-[#212121]">
              {t("viewAll")}
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function RailArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-[#d9d9dd] bg-white text-[#212121] transition-[transform,border-color,opacity] duration-200 ease-out hover:border-[#93939f] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
