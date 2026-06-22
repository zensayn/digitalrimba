"use client";

// ─── Exclusive Order · How it works ───────────────────────────────────────────
// Three numbered steps (chat → brief → delivery), driven by STEPS in constants.

import { useTranslations } from "next-intl";
import { STEPS } from "@/components/exclusive-order/constants";

export default function OrderSteps() {
  const t = useTranslations("ExclusiveOrder");

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
      <h2 className="font-medium tracking-[-0.015em] text-[1.5rem] md:text-[2rem] mb-10">
        {t("howTitle")}
      </h2>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.titleKey} className="flex flex-col gap-3">
              <span className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#edfce9] text-[#346739] flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </span>
                <span className="text-[13px] font-medium text-[#93939f]">0{i + 1}</span>
              </span>
              <h3 className="text-base font-medium text-[#212121]">{t(step.titleKey)}</h3>
              <p className="text-sm text-[#616161] leading-relaxed">{t(step.descKey)}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
