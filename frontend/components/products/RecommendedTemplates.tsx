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
import { TEMPLATE_LIST } from "@/lib/template-catalog-data";

const MAX_RECOMMENDATIONS = 4;

interface Props {
  /** The currently viewed template — excluded from results. */
  currentSlug: string;
  /** Primary category of the current template — used to bias recommendations. */
  primaryCategory: string;
}

export default function RecommendedTemplates({
  currentSlug,
  primaryCategory,
}: Props) {
  const t = useTranslations("Templates");
  const tp = useTranslations("Products");

  // Same-category matches first, then popular fillers from other categories,
  // then anything else, excluding the current slug. Capped at MAX_RECOMMENDATIONS.
  const sameCategory = TEMPLATE_LIST.filter(
    (tpl) => tpl.id !== currentSlug && tpl.categories.includes(primaryCategory)
  );

  const popularFiller = TEMPLATE_LIST.filter(
    (tpl) =>
      tpl.id !== currentSlug &&
      !tpl.categories.includes(primaryCategory) &&
      tpl.popular
  );

  const otherFiller = TEMPLATE_LIST.filter(
    (tpl) =>
      tpl.id !== currentSlug &&
      !tpl.categories.includes(primaryCategory) &&
      !tpl.popular
  );

  const recommendations = [
    ...sameCategory,
    ...popularFiller,
    ...otherFiller,
  ].slice(0, MAX_RECOMMENDATIONS);

  if (recommendations.length === 0) return null;

  return (
    <section className="bg-white -mx-6 md:-mx-10 py-12 md:py-16">
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
          {recommendations.map((template) => (
            <Link
              key={template.id}
              href={`/products/${template.id}`}
              className="group block text-left"
            >
              {/* Image-only card */}
              <div className="relative w-full aspect-[4/5] bg-[#fdfdfd] rounded-[18px] overflow-hidden border border-[#f2f2f2] shadow-card-lift transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-card-lift-hover group-hover:border-[#d9d9dd]">
                {/* Popular badge (top-left, overlay only — category lives below) */}
                {template.popular && (
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <span className="inline-flex items-center bg-[#edfce9] border border-[#346739]/20 text-[#346739] text-[9px] px-2 py-0.5 rounded-full font-poppins font-semibold select-none">
                      {t("popularLabel")}
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
                  templateId={template.id}
                  className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                />
              </div>

              {/* Metadata — outside the card, plain text */}
              <div className="mt-2.5 flex justify-between items-baseline gap-2">
                <h3 className="font-poppins text-[14px] font-medium text-[#212121] truncate">
                  {template.name}
                </h3>
                <span className="shrink-0 font-poppins text-[12px] font-medium text-[#212121]">
                  {t("priceTag")}
                </span>
              </div>

              <p className="mt-0.5 font-poppins text-[12px] text-[#616161] leading-snug">
                {t(`categories.${template.categories[0]}`)}
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
