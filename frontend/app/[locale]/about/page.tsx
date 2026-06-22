// ─── About page ─────────────────────────────────────────────────────────────
// Composition only: each section is its own component in @/components/about.
// Header (sticky/morph) and Footer (parallax) are mounted once in
// app/[locale]/layout.tsx via MarketingChrome — no imports needed here.

import AboutHero from "@/components/about/AboutHero";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutCTA from "@/components/about/AboutCTA";

export default function AboutPage() {
  return (
    <>
      <div className="relative min-h-screen bg-white text-[#212121] font-poppins flex flex-col pt-5 sm:pt-6 md:pt-8 overflow-hidden">

        {/* Background Soft Ambient Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#346739]/3 rounded-full blur-[120px] pointer-events-none -z-10" />

        <AboutHero />
        <AboutTimeline />

      </div>

      {/* ── CTA BAND — full-bleed, outside the padded white container ── */}
      <AboutCTA />
    </>
  );
}
