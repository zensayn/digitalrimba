// ─── Product Detail Page ──────────────────────────────────────────────────────
// Cohere-aligned product detail layout: thumbnail rail · main preview · sticky
// info panel, then reviews. Header + Footer are mounted in
// app/[locale]/layout.tsx (MarketingChrome).
// Route: /[locale]/products/[slug]

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTemplateBySlug, templateList } from "@/lib/templates";
import { Link } from "@/i18n/routing";
import { IconArrowLeft } from "@tabler/icons-react";
import ProductInteractive from "@/components/products/ProductInteractive";
import RecommendedTemplates from "@/components/products/RecommendedTemplates";

// Pre-render every template page at build time
export async function generateStaticParams() {
  return templateList.map((t) => ({ slug: t.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("Templates");
  const tp = await getTranslations("Products");

  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const features = [
    tp("feature1"),
    tp("feature2"),
    tp("feature3"),
    tp("feature4"),
    tp("feature5"),
  ];

  const categoryKey = template.categories[0] as
    | "all"
    | "hindu"
    | "christian"
    | "sikh"
    | "muslim"
    | "southIndian"
    | "saveDate";
  const categoryLabel = t(`categories.${categoryKey}`);

  const description = t("editDescription", { category: categoryLabel });

  const reviews = [
    { body: tp("review1Body"), author: tp("review1Author") },
    { body: tp("review2Body"), author: tp("review2Author") },
    { body: tp("review3Body"), author: tp("review3Author") },
  ];

  return (
    <main className="min-h-screen bg-white font-poppins">
      {/* Breadcrumb (page-level — Header sits above this from the layout) */}
      <div className="border-b border-[#f2f2f2] bg-white font-poppins">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4">
          <nav aria-label="breadcrumb">
            <ol className="flex flex-wrap items-center gap-3 text-sm">
              <li>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-[#616161] hover:text-[#212121] transition-colors"
                >
                  <IconArrowLeft size={14} />
                  {tp("backLabel")}
                </Link>
              </li>
              <li aria-hidden="true" className="text-[#d9d9dd] font-light">
                /
              </li>
              <li>
                <span
                  aria-current="page"
                  className="text-[#212121] font-medium"
                >
                  {template.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main product layout */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 md:py-14">
        <ProductInteractive
          templateId={template.id}
          templateName={template.name}
          categoryLabel={categoryLabel}
          features={features}
          reviews={reviews}
          labels={{
            ratingShort: tp("ratingShort"),
            priceTag: t("priceTag"),
            shippingNote: tp("shippingNote"),
            addAddress: tp("addAddress"),
            variantsLabel: tp("variantsLabel"),
            variantSimple: tp("variantSimple"),
            variantPremium: tp("variantPremium"),
            quantityLabel: tp("quantityLabel"),
            oneTimePurchase: tp("oneTimePurchase"),
            buyNow: tp("buyNow"),
            addToCart: tp("addToCart"),
            subscribeSave: tp("subscribeSave"),
            saveBadge: tp("saveBadge"),
            save: tp("save"),
            share: tp("share"),
            description,
            viewMore: tp("viewMore"),
            refundPolicy: tp("refundPolicy"),
            whatsIncluded: tp("whatsIncluded"),
            reviewsTitle: tp("reviewsTitle"),
            reviewsAvg: tp("reviewsAvg"),
            reviewsCountFull: tp("reviewsCountFull"),
          }}
        />

        {/* Recommendations grid (server-rendered, sits below Reviews) */}
        <RecommendedTemplates
          currentSlug={template.id}
          primaryCategory={categoryKey}
        />
      </section>
    </main>
  );
}
