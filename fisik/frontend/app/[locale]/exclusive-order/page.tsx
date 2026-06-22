// ─── Exclusive Order page ─────────────────────────────────────────────────────
// Composes the priority-ordering sections. Each section is a self-contained
// component under components/exclusive-order/ — edit a section there, or reorder
// / drop one here, without touching the others. Shared tier/step/gallery data
// and the WhatsApp/Unsplash helpers live in components/exclusive-order/constants.

import ExclusiveHero from "@/components/exclusive-order/ExclusiveHero";
import OrderSteps from "@/components/exclusive-order/OrderSteps";
import PriorityTiers from "@/components/exclusive-order/PriorityTiers";
import CostIllustration from "@/components/exclusive-order/CostIllustration";
import ClosingCta from "@/components/exclusive-order/ClosingCta";

export default function ExclusiveOrderPage() {
  return (
    <main className="bg-white font-poppins text-[#212121]">
      {/* 1. Hero band (distinct deep-green, split layout) */}
      <ExclusiveHero />
      {/* 2. How it works */}
      <OrderSteps />
      {/* 3. Priority tiers */}
      <PriorityTiers />
      {/* 4. Calculation illustration (interactive tier selector) */}
      <CostIllustration />
      {/* 5. Closing CTA (centered statement + scattered photo strip) */}
      <ClosingCta />
    </main>
  );
}
