// ─── Products listing page ────────────────────────────────────────────────────
// Server Component: fetches the catalog (collections + products) from the API
// and passes it to the client catalog UIs. Header + Footer are mounted in
// app/[locale]/layout.tsx (MarketingChrome).
//
// Layout split:
//   • Mobile / tablet (<lg) → MobileCatalogCarousels: Airbnb-style horizontal
//                              rails, one per collection, with search / filter /
//                              sort controls.
//   • Desktop (lg+)         → TemplateCatalog page mode: sidebar + grid.

import { fetchCollections, fetchProducts } from "@/lib/catalog";
import ProductsHeader from "@/components/products/ProductsHeader";
import TemplateCatalog from "@/components/TemplateCatalog";
import MobileCatalogCarousels from "@/components/products/MobileCatalogCarousels";

export default async function ProductsPage() {
  const [collections, products] = await Promise.all([
    fetchCollections(),
    fetchProducts(),
  ]);

  return (
    <main className="min-h-screen bg-white text-[#212121] flex flex-col font-poppins">
      <ProductsHeader />

      {/* Mobile + tablet: per-collection horizontal carousels */}
      <div className="lg:hidden">
        <MobileCatalogCarousels products={products} collections={collections} />
      </div>

      {/* Desktop: full filter sidebar + grid */}
      <div className="hidden lg:block">
        <TemplateCatalog
          mode="page"
          showHeading={false}
          products={products}
          collections={collections}
        />
      </div>
    </main>
  );
}
