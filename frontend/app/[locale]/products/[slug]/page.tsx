// ─── Product Detail Page ──────────────────────────────────────────────────────
// Server Component: fetches the product (with its R2 images) and same-collection
// recommendations from the catalog API. Header + Footer are mounted in
// app/[locale]/layout.tsx (MarketingChrome).
// Route: /[locale]/products/[slug]

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { IconArrowLeft } from "@tabler/icons-react";
import ProductInteractive from "@/components/products/ProductInteractive";
import RecommendedTemplates from "@/components/products/RecommendedTemplates";
import { fetchProductBySlug, fetchProducts } from "@/lib/catalog";

const MAX_RECOMMENDATIONS = 4;

// Pre-render every catalog product page at build time (best-effort — falls back
// to on-demand rendering if the catalog API is unavailable during build).
export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("Templates");
  const tp = await getTranslations("Products");

  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const features = [
    tp("feature1"),
    tp("feature2"),
    tp("feature3"),
    tp("feature4"),
    tp("feature5"),
  ];

  const categoryLabel = product.collection_name;
  const description = t("editDescription", { category: categoryLabel });

  const images = product.images.map((img) => ({
    id: String(img.position),
    src: img.url,
    alt: img.alt,
  }));

  // Recommendations: other products from the same collection.
  const sameCollection = await fetchProducts(product.collection_code);
  const recommendations = sameCollection
    .filter((p) => p.slug !== product.slug)
    .slice(0, MAX_RECOMMENDATIONS);

  return (
    <main className="min-h-screen bg-white font-poppins">
      {/* Breadcrumb (page-level — Header sits above this from the layout) */}
      <div className="bg-white font-poppins">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-0 py-4">
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
                <span aria-current="page" className="text-[#212121] font-medium">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main product layout */}
      <section className="max-w-[1200px] mx-auto px-6 lg:px-0 py-10 md:py-14">
        <ProductInteractive
          templateName={product.name}
          categoryLabel={categoryLabel}
          images={images}
          features={features}
          labels={{
            volumeTitle: tp("volumeTitle"),
            perUnit: tp("perUnit"),
            saveLabel: tp("saveLabel"),
            subtotal: tp("subtotal"),
            minOrder: tp("minOrder"),
            shippingNote: tp("shippingNote"),
            quantityLabel: tp("quantityLabel"),
            orderWhatsApp: tp("orderWhatsApp"),
            share: tp("share"),
            shareTooltip: tp("shareTooltip"),
            linkCopied: tp("linkCopied"),
            description,
            viewMore: tp("viewMore"),
            refundPolicy: tp("refundPolicy"),
            whatsIncluded: tp("whatsIncluded"),
          }}
        />

        {/* Recommendations grid */}
        <RecommendedTemplates recommendations={recommendations} />
      </section>
    </main>
  );
}
