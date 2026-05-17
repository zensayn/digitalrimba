"use client";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
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
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
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