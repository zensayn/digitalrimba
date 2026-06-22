"use client";

import { useTranslations } from "next-intl";
import {
  Letter,
  Wallet,
  Pen,
  Box,
  CheckCircle,
  BillCheck,
  CashOut,
  RulerCrossPen,
  VerifiedCheck,
} from "@solar-icons/react";
import { Delivery } from "@solar-icons/react/ssr";

// ─── OrderProcessAlternative ──────────────────────────────────────────────────
// Sticky-stack ordering process: left column has the eyebrow/title/CTA and
// pins; right column stacks 5 compact step rows that pin in sequence so each
// new step lands on top of the previous one at the same scroll anchor.

interface Step {
  id: number;
  title: string;
  description: string;
  Icon: typeof Letter;
}

// Strong ease-out per Emil's design principles
const HOVER_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

function StepRow({ step, index, total }: { step: Step; index: number; total: number }) {
  const { Icon } = step;
  return (
    // Each row is its own sticky context so it pins at top:80px on mobile and
    // top:180px on desktop, then unsticks when the next sibling pushes past it.
    // Z-index ascends so later steps visually cover earlier ones — final visual
    // is one row at the pin point.
    <div
      className="order-alt-row-wrapper w-full bg-white relative sticky top-[80px] h-[240px] md:top-[180px] md:h-[260px]"
      style={{ zIndex: index + 1 }}
    >
      <div className="w-full h-full flex items-stretch">
        {/* Hairline rule on top, except for the first row (it inherits the section divider above) */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 h-px bg-[#d9d9dd]/60 ${index === 0 ? "md:hidden" : ""}`}
        />

        {/* Body */}
        <div className="flex-1 flex items-start gap-4 sm:gap-6 py-5 sm:py-8">
          {/* Icon badge */}
          <div
            className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-[#346739] transition-transform duration-200 ease-out hover:scale-[1.04]"
            style={{ transitionTimingFunction: HOVER_EASE }}
          >
            <Icon size={56} weight="BoldDuotone" className="sm:!w-16 sm:!h-16" />
          </div>

          {/* Title + description */}
          <div className="flex-1 flex flex-col min-w-0">
            <h3 className="font-poppins text-base sm:text-lg lg:text-xl font-medium tracking-tight text-[#212121] leading-snug mb-1.5 sm:mb-2">
              {step.title}
            </h3>
            <p className="font-poppins text-[13px] sm:text-sm leading-relaxed text-[#616161] max-w-[560px]">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderProcessAlternative() {
  const t = useTranslations("OrderProcess");

  const steps: Step[] = [
    {
      id: 1,
      title: t("step1Title"),
      description: t("step1Desc"),
      Icon: BillCheck,
    },
    {
      id: 2,
      title: t("step2Title"),
      description: t("step2Desc"),
      Icon: CashOut,
    },
    {
      id: 3,
      title: t("step3Title"),
      description: t("step3Desc"),
      Icon: RulerCrossPen,
    },
    {
      id: 4,
      title: t("step4Title"),
      description: t("step4Desc"),
      Icon: Delivery,
    },
    {
      id: 5,
      title: t("step5Title"),
      description: t("step5Desc"),
      Icon: VerifiedCheck,
    },
  ];

  return (
    <section className="wrapper order-process-alt-wrapper relative w-full bg-white px-6 md:px-12 py-24 md:py-36 select-none">
      {/* Subtle grid background */}
      <div className="absolute inset-0 z-0" />

      <div className="max-w-[1200px] mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10">
        {/* ─── LEFT: sticky intro ─────────────────────────────────────── */}
        <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-[180px] flex flex-col items-start h-fit md:h-[260px] pr-0 md:pr-4 lg:pr-8 z-30 pb-4 md:pb-0">
          <span className="text-xs font-regular text-[#346739] uppercase mb-3 font-poppins">
            {t("tagline")}
          </span>
          <h2 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-[#212121] leading-[1.12] mb-5">
            {t("title")}
          </h2>
          <p className="font-poppins text-sm lg:text-[15px] leading-relaxed text-[#616161] mb-7 max-w-sm">
            {t("leftDesc")}
          </p>
          <button
            type="button"
            className="font-poppins bg-[#212121] hover:bg-[#0f0f0f] text-white text-[14px] font-regular px-6 py-3 rounded-full transition-[background-color,transform,box-shadow] duration-150 ease-out active:scale-[0.97] hover:shadow-md"
          >
            {t("ctaBtn")}
          </button>
        </div>

        {/* ─── RIGHT: stacking step rows ─────────────────────────────── */}
        <div className="md:col-span-7 lg:col-span-8 block relative z-20">
          {steps.map((step, i) => (
            <StepRow key={step.id} step={step} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
