// ─── Consultation page ────────────────────────────────────────────────────────
// Dedicated booking surface reached from the Hero CTA, the curved mobile menu,
// and the header's "Book Consultation" pill. A short editorial intro sets
// expectations (eyebrow + headline + a three-step "what to expect" row), then a
// standalone full-width Cal.com scheduler handles the booking. Unlike the
// landing page's split "booking desk" (<ConsultationBooking />), this surface is
// just the calendar — no deep-green context band. PageHeader + Footer are
// injected globally by MarketingChrome.

import ConsultationIntro from "@/components/consultation/ConsultationIntro";
import ConsultationScheduler from "@/components/consultation/ConsultationScheduler";

export default function ConsultationPage() {
  return (
    <main className="bg-white font-poppins text-[#212121]">
      {/* 1. Editorial intro + what-to-expect sequence */}
      <ConsultationIntro />
      {/* 2. Standalone Cal.com calendar (no context band) */}
      <ConsultationScheduler />
    </main>
  );
}
