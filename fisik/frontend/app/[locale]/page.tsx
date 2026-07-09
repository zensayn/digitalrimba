// ─── Home page ────────────────────────────────────────────────────────────────
// Server Component: fetches the catalog so the template section shows real R2
// covers. Header (sticky/morph) and Footer (parallax) are mounted once in
// app/[locale]/layout.tsx via MarketingChrome — no imports needed here.

import Hero from "@/components/Hero";
import StatsHighlight from "@/components/StatsHighlight";
import StatsSection from "@/components/StatsSection";
import Features from "@/components/Features";
import CraftMaterials from "@/components/CraftMaterials";
import CraftProcess from "@/components/CraftProcess";
import TemplateCatalog from "@/components/TemplateCatalog";
import TemplateGallery from "@/components/TemplateGallery";
import TemplateShowcase from "@/components/TemplateShowcase";
import RealWeddings from "@/components/RealWeddings";
import RealWeddings2 from "@/components/RealWeddings2";
import ReviewSection from "@/components/ReviewSection";
import ReviewSection2 from "@/components/ReviewSection2";
import FaqSection from "@/components/FaqSection";
import BottomCTA from "@/components/BottomCTA";
import ConsultationBooking from "@/components/ConsultationBooking";
import {
  fetchCollections,
  fetchProducts,
  fetchPricingCatalog,
  pricingBySlug,
} from "@/lib/catalog";
import HowItWorks from "@/components/HowItWorks";

export default async function App() {
  const [collections, products, pricing] = await Promise.all([
    fetchCollections(),
    fetchProducts(),
    fetchPricingCatalog(),
  ]);

  const priceBySlug = pricingBySlug(pricing);

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <StatsHighlight />
      <Features />
      {/* Two craft-section variants to compare — keep the one that fits, remove the other */}
      <CraftMaterials />
      {/* Face Formula-style editorial gallery — comparison candidate, sits above
          the existing dark-band carousel. Keep the one that wins, drop the other. */}
      {/* Swap-style image rail — comparison candidate against the
          TemplateGallery grid below. Keep the winner, drop the other. */}
      <TemplateShowcase products={products} priceBySlug={priceBySlug} />
      <TemplateGallery
        products={products}
        collections={collections}
        priceBySlug={priceBySlug}
      />
      {/* Readymag-style dark collage — comparison candidate against the
          polaroid RealWeddings below. Keep the winner, drop the other. */}
      <RealWeddings2 />
      {/* Social-proof masonry — real couples; teaser linking to /gallery */}
      <RealWeddings />
      <HowItWorks />
      {/* Fresha-style reviews rail — comparison candidate against the
          vertical-slider ReviewSection above. Keep the winner, drop the other. */}
      <ReviewSection2 />
      <ReviewSection />
      <FaqSection />
      <ConsultationBooking />
      <BottomCTA />
    </main>
  );
}
