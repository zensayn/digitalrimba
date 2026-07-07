"use client";

import HeroMorph from "@/components/HeroMorph";
import Navbar from "@/components/Navbar";
import OurServices from "@/components/OurServices";
import OurServices2 from "@/components/OurServices2";
import TemplatesShowcase from "@/components/TemplatesShowcase";
import ProductSuite from "@/components/ProductSuite";
import ServiceScope from "@/components/ServiceScope";
import WhyRimba from "@/components/WhyRimba";
import CaraOrder from "@/components/CaraOrder";
import HowToOrder from "@/components/HowToOrder";
import Pricings from "@/components/pricings";
import Testimoni from "@/components/Testimoni";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
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
      <TemplatesShowcase />
      <OurServices />
      <OurServices2 />
      <ProductSuite />
      <ServiceScope />
      <WhyRimba />
      <CaraOrder />
      <HowToOrder />
      <Pricings />
      <Testimoni />
      <FAQ />
      <FinalCTA />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}