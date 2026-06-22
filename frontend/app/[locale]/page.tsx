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
import RealWeddings from "@/components/RealWeddings";
import ReviewSection from "@/components/ReviewSection";
import FaqSection from "@/components/FaqSection";
import BottomCTA from "@/components/BottomCTA";
import ConsultationBooking from "@/components/ConsultationBooking";
import { fetchCollections, fetchProducts } from "@/lib/catalog";
import HowItWorks from "@/components/HowItWorks";

export default async function App() {
  const [collections, products] = await Promise.all([
    fetchCollections(),
    fetchProducts(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <StatsHighlight />
      <Features />
      {/* Two craft-section variants to compare — keep the one that fits, remove the other */}
      <CraftMaterials />
      {/* Face Formula-style editorial gallery — comparison candidate, sits above
          the existing dark-band carousel. Keep the one that wins, drop the other. */}
      <TemplateGallery products={products} collections={collections} />
      {/* Social-proof masonry — real couples; teaser linking to /gallery */}
      <RealWeddings />
      <HowItWorks />
      <ReviewSection />
      <FaqSection />
      <ConsultationBooking />
      <BottomCTA />
    </main>
  );
}
