"use client";

// ─── Home page ────────────────────────────────────────────────────────────────
// Header (sticky/morph) and Footer (parallax) are mounted once in
// app/[locale]/layout.tsx via MarketingChrome — no imports needed here.

import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import CoreFeatures from "@/components/CoreFeatures";
import TemplateCatalog from "@/components/TemplateCatalog";
import OrderProcess from "@/components/OrderProcess";
import OrderProcessAlternative from "@/components/OrderProcessAlternative";
import ReviewSection from "@/components/ReviewSection";
import FaqSection from "@/components/FaqSection";
import BottomCTA from "@/components/BottomCTA";

export default function App() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <StatsSection />
      <CoreFeatures />
      <TemplateCatalog />
      <OrderProcess />
      <ReviewSection />
      <FaqSection />
      <BottomCTA />
    </main>
  );
}
