"use client";

// ─── RecommendedTemplates ─────────────────────────────────────────────────────
// Small recommendation grid rendered below Reviews on /products/[slug].
// Prefers same-category matches first, then fills with popular templates,
// excluding the currently viewed slug.
//
// Marked as a Client Component because @solar-icons/react and the next-intl
// Link wrapper both rely on React context that doesn't work in RSC.

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Eye } from "@solar-icons/react";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import type { CatalogProduct } from "@/lib/catalog";

interface Props {
  /** Products to recommend (already filtered/ordered by the server). */
  recommendations: CatalogProduct[];
}

export default function RecommendedTemplates({ recommendations }: Props) {
  const t = useTranslations("Templates");
  const tp = useTranslations("Products");

  if (recommendations.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="w-full">
        {/* Eyebrow + heading */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="block text-[11px] font-semibold text-[#346739] uppercase mb-2">
              {tp("recommendedEyebrow")}
            </span>
            <h2
              className="font-poppins font-medium text-[#212121]"
              style={{ fontSize: "1.75rem", letterSpacing: "-0.015em" }}
            >
              {tp("recommendedTitle")}
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-[#212121] hover:text-[#346739] transition-colors font-poppins font-medium"
          >
            {tp("recommendedCta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Card grid — 2 cols on mobile, 4 on lg */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-5 gap-y-7">
          {recommendations.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="group block text-left"
            >
              {/* Image-only card */}
              <div className="relative w-full aspect-[4/5] bg-[#fdfdfd] rounded-[18px] overflow-hidden border border-[#f2f2f2] shadow-card-lift transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-card-lift-hover group-hover:border-[#d9d9dd]">
                {/* Seller badge (top-left) — top seller filled, popular pale */}
                {(product.top_seller || product.popular) && (
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <span
                      className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded-full font-poppins font-semibold select-none ${
                        product.top_seller
                          ? "bg-[#346739] text-white"
                          : "bg-[#edfce9] border border-[#346739]/20 text-[#346739]"
                      }`}
                    >
                      {product.top_seller ? t("topSellerLabel") : t("popularLabel")}
                    </span>
                  </div>
                )}

                {/* Eye affordance — fades in on hover */}
                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-out">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/85 backdrop-blur-md border border-[#d9d9dd] text-[#212121]">
                    <Eye size={13} weight="Linear" />
                  </div>
                </div>

                <TemplatePreviewCard
                  src={product.cover_url}
                  alt={product.name}
                  sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
                  className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                />
              </div>

              {/* Metadata — outside the card, plain text */}
              <div className="mt-2.5 flex justify-between items-baseline gap-2">
                <h3 className="font-poppins text-[14px] font-medium text-[#212121] truncate">
                  {product.name}
                </h3>
                <span className="shrink-0 font-poppins text-[12px] font-medium text-[#212121]">
                  {t("priceTag")}
                </span>
              </div>

              <p className="mt-0.5 font-poppins text-[12px] text-[#616161] leading-snug">
                {product.collection_name}
              </p>
            </Link>
          ))}
        </div>

        {/* Mobile-only "see all" link below the grid */}
        <Link
          href="/products"
          className="md:hidden mt-8 inline-flex items-center gap-1.5 text-sm text-[#212121] hover:text-[#346739] transition-colors font-poppins font-medium"
        >
          {tp("recommendedCta")}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
