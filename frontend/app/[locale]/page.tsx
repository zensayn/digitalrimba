"use client";

import HeroMorph from "@/components/HeroMorph";
import Navbar from "@/components/Navbar";
import BentoSection from "@/components/BentoSection";
import FeaturesSection from "@/components/FeaturesSection";
import MemoriesSection from "@/components/MemoriesSection";
import ThreeCardsSection from "@/components/ThreeCardsSection";
import DigitalCatalog from "@/components/DigitalCatalog";
import ReviewSection from "@/components/ReviewSection";
import PricingEngine from "@/components/PricingEngine";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Footer from "@/components/Footer";

export default function App() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroMorph />
      <BentoSection />
      <FeaturesSection />
      <MemoriesSection />
      <ThreeCardsSection />
      <DigitalCatalog />
      <ReviewSection />
      <PricingEngine />
      <AvailabilityCalendar />
      <WhatsAppCTA />
      <Footer />
    </main>
  );
}