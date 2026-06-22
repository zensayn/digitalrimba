"use client";

// ─── Exclusive Order · Cost illustration ──────────────────────────────────────
// Interactive cost illustration: pick a Priority package (left) → live receipt
// breakdown (right). Uses a sample base order total + the real surcharges.

import { useState } from "react";
import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import {
  IconBrandWhatsapp,
  IconBolt,
  IconCheck,
  IconPlus,
  IconInfoCircle,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";
import {
  EASE_OUT_STRONG,
  SAMPLE_BASE,
  CALC_TIERS,
  EXCLUSIVE_TIERS,
  waLink,
} from "@/components/exclusive-order/constants";

// Cost-illustration tabs. "priority" keeps the multi-package chooser; "premium"
// and "elite" are single flagship tiers, so they show one fixed package.
const CALC_TABS = [
  { id: "priority", labelKey: "calcTabPriority" },
  { id: "premium", labelKey: "calcTabPremium" },
  { id: "elite", labelKey: "calcTabElite" },
] as const;
type CalcTab = (typeof CALC_TABS)[number]["id"];

const ELITE = EXCLUSIVE_TIERS.find((x) => x.id === "elite")!;
const PREMIUM = EXCLUSIVE_TIERS.find((x) => x.id === "premium")!;

// Interactive selector + live breakdown.
function CostCalculator() {
  const t = useTranslations("ExclusiveOrder");
  const locale = useLocale();
  const [tab, setTab] = useState<CalcTab>("priority");
  const [selected, setSelected] = useState(0);

  const fmt = (n: number) =>
    `Rp ${new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US").format(n)}`;

  // Active tier: the chosen Priority package, or the single flagship tier.
  const tier =
    tab === "priority" ? CALC_TIERS[selected] : tab === "premium" ? PREMIUM : ELITE;
  const surcharge = (SAMPLE_BASE * tier.pct) / 100;
  const grand = SAMPLE_BASE + surcharge;
  const tierLabel = `${t(tier.nameKey)} (${t(tier.daysKey)})`;

  return (
    <div>
      {/* Tabs — switch between Priority / Premium / Elite */}
      <div
        role="tablist"
        aria-label={t("calcTitle")}
        className="inline-flex rounded-full bg-[#f4f2ee] p-1 mb-8"
      >
        {CALC_TABS.map((tb) => {
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(tb.id)}
              className={`relative rounded-full px-4 md:px-5 py-2 text-[13px] font-medium transition-colors duration-200 ${
                active ? "text-white" : "text-[#616161] hover:text-[#212121]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="calcTabPill"
                  className="absolute inset-0 rounded-full bg-[#346739]"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">{t(tb.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* LEFT — Priority shows the chooser; flagship tabs show one fixed package */}
        {tab === "priority" ? (
          <div>
            <span className="text-[12px] font-medium uppercase tracking-wide text-[#93939f]">
              {t("calcChooseLabel")}
            </span>
            <div className="mt-4 flex flex-col gap-3">
              {CALC_TIERS.map((tt, i) => {
                const isActive = i === selected;
                return (
                  <button
                    key={tt.id}
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-pressed={isActive}
                    className={`group flex items-center gap-4 w-full text-left rounded-2xl px-5 py-4 transition-all duration-300 ${
                      isActive
                        ? "bg-white border-2 border-[#346739] shadow-[0_18px_40px_-28px_rgba(52,103,57,0.7)]"
                        : "bg-white border border-[#e5e7eb] hover:border-[#cfd8cf]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0 transition-colors duration-300 ${
                        isActive
                          ? "border-[#346739] bg-[#346739] text-white"
                          : "border-[#cfcfd6] text-transparent group-hover:border-[#a9b3a9]"
                      }`}
                    >
                      <IconCheck size={14} stroke={3} />
                    </span>
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="text-base font-medium text-[#212121]">
                        {t(tt.nameKey)}
                      </span>
                      <span className="text-[13px] text-[#93939f]">{t(tt.daysKey)}</span>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full text-[13px] font-medium px-3 py-1 shrink-0 transition-colors duration-300 ${
                        isActive ? "bg-[#346739] text-white" : "bg-[#f4f2ee] text-[#616161]"
                      }`}
                    >
                      +{tt.pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <span className="text-[12px] font-medium uppercase tracking-wide text-[#93939f]">
              {t("calcSelectedLabel")}
            </span>
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
              className="mt-4 rounded-2xl bg-white border-2 border-[#346739] p-6 shadow-[0_18px_40px_-28px_rgba(52,103,57,0.7)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-medium text-[#212121]">{t(tier.nameKey)}</p>
                  <p className="text-[13px] text-[#93939f]">{t(tier.daysKey)}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#346739] text-white text-[13px] font-medium px-3 py-1 shrink-0">
                  +{tier.pct}%
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-[#616161]">
                {t(tab === "premium" ? "premiumDesc" : "eliteDesc")}
              </p>
            </motion.div>
          </div>
        )}

        {/* RIGHT — live receipt breakdown for the selected package */}
        <div className="lg:sticky lg:top-28">
        <div className="rounded-[24px] bg-white border border-[#ececec] shadow-[0_24px_60px_-32px_rgba(0,60,51,0.35)] overflow-hidden">
          <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-[#f2f2f2]">
            <span className="text-[12px] font-medium uppercase tracking-wide text-[#93939f]">
              {t("calcSelectedLabel")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#346739]">
              <IconBolt size={14} />
              {t(tier.nameKey)}
            </span>
          </div>

          <div className="px-7 pt-6">
            {/* Base order total */}
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm text-[#616161]">{t("calcTotalLabel")}</span>
              <span className="text-[15px] font-medium tabular-nums text-[#212121]">
                {fmt(SAMPLE_BASE)}
              </span>
            </div>
            {/* Priority surcharge — additive, highlighted in brand green */}
            <div className="flex items-center justify-between py-4 border-t border-dashed border-[#e3e3e3]">
              <span className="flex items-center gap-2 text-sm font-medium text-[#346739]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#edfce9] shrink-0">
                  <IconPlus size={12} />
                </span>
                {t(tier.nameKey)} (+{tier.pct}%)
              </span>
              <motion.span
                key={`s-${surcharge}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
                className="text-[15px] font-medium tabular-nums text-[#346739]"
              >
                {fmt(surcharge)}
              </motion.span>
            </div>
          </div>

          {/* Grand total — the "=" result, full-bleed brand band */}
          <div className="flex items-baseline justify-between bg-[#003c33] px-7 py-5">
            <span className="text-sm font-medium text-white/80">{t("calcGrandLabel")}</span>
            <motion.span
              key={`g-${grand}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
              className="text-[1.6rem] leading-none font-medium tracking-[-0.02em] tabular-nums text-white"
            >
              {fmt(grand)}
            </motion.span>
          </div>
        </div>

        <p className="mt-5 flex items-start gap-1.5 text-[12px] text-[#93939f] leading-relaxed">
          <IconInfoCircle size={14} className="mt-[1px] shrink-0" />
          <span>{t("calcNote")}</span>
        </p>

        <a
          href={waLink(t("waTier", { tier: tierLabel }))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block"
        >
          <TextureButton variant="primary" size="lg" className="w-full font-medium">
            <IconBrandWhatsapp className="w-5 h-5" />
            {t("tierCta")}
          </TextureButton>
        </a>
        </div>
      </div>
    </div>
  );
}

export default function CostIllustration() {
  const t = useTranslations("ExclusiveOrder");

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
      <div className="max-w-[640px] mb-10 md:mb-14">
        <h2 className="font-medium tracking-[-0.015em] text-[1.5rem] md:text-[2rem]">
          {t("calcTitle")}
        </h2>
        <p className="mt-2 text-sm text-[#616161]">{t("calcSubtitle")}</p>
      </div>
      <CostCalculator />
    </section>
  );
}
