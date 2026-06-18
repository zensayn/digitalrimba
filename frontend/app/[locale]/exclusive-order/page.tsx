"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  IconBrandWhatsapp,
  IconBolt,
  IconClock,
  IconMessageCircle,
  IconFileText,
  IconTruckDelivery,
  IconCheck,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";

const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Wedding-stationery photo for the hero (Unsplash host is allowlisted in next.config).
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop";

const HERO_STATS = [
  { valueKey: "heroStat1Value", labelKey: "heroStat1Label" },
  { valueKey: "heroStat2Value", labelKey: "heroStat2Label" },
  { valueKey: "heroStat3Value", labelKey: "heroStat3Label" },
] as const;

// Site-wide WhatsApp number (matches the existing CTA pattern in AboutCTA/BottomCTA).
const WA_NUMBER = "1234567890";
const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const TIERS = [
  { id: 1, nameKey: "tier1Name", daysKey: "tier1Days", surchargeKey: "tier1Surcharge", popular: false },
  { id: 2, nameKey: "tier2Name", daysKey: "tier2Days", surchargeKey: "tier2Surcharge", popular: true },
  { id: 3, nameKey: "tier3Name", daysKey: "tier3Days", surchargeKey: "tier3Surcharge", popular: false },
] as const;

const STEPS = [
  { icon: IconMessageCircle, titleKey: "step1Title", descKey: "step1Desc" },
  { icon: IconFileText, titleKey: "step2Title", descKey: "step2Desc" },
  { icon: IconTruckDelivery, titleKey: "step3Title", descKey: "step3Desc" },
] as const;

export default function ExclusiveOrderPage() {
  const t = useTranslations("ExclusiveOrder");

  return (
    <main className="bg-white font-poppins text-[#212121]">
      {/* ── 1. Hero band (distinct deep-green, split layout) ─────────── */}
      <section className="relative overflow-hidden bg-[#003c33] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(55% 70% at 85% 0%, rgba(52,103,57,0.55), transparent 60%), radial-gradient(45% 55% at 0% 100%, rgba(237,252,233,0.10), transparent 60%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)] gap-10 lg:gap-14 items-center">
          {/* Left: copy + CTAs + proof */}
          <div className="flex flex-col">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_STRONG }}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#edfce9]/12 border border-[#edfce9]/20 px-3.5 py-1.5 text-[12px] font-medium text-[#edfce9]"
            >
              <IconBolt size={14} />
              {t("urgencyChip")}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT_STRONG }}
              className="mt-5 font-medium leading-[1.02] tracking-[-0.02em] text-[2.75rem] md:text-[4.25rem]"
            >
              {t("heroTitle").split(" ")[0]}{" "}
              <span className="text-[#bfe3b4]">
                {t("heroTitle").split(" ").slice(1).join(" ")}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT_STRONG }}
              className="mt-5 max-w-[520px] text-[15px] md:text-base leading-relaxed text-white/80"
            >
              {t("heroIntro")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT_STRONG }}
              className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <a href={waLink(t("waGeneric"))} target="_blank" rel="noopener noreferrer">
                <TextureButton variant="primary" size="lg" className="w-full sm:w-auto font-medium">
                  <IconBrandWhatsapp className="w-5 h-5" />
                  {t("heroCtaPrimary")}
                </TextureButton>
              </a>
              <a href="#priority" className="sm:self-center">
                <span className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out">
                  {t("heroCtaSecondary")}
                </span>
              </a>
            </motion.div>
            {/* Proof row (derived from the real Priority tiers) */}
            <motion.dl
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: EASE_OUT_STRONG }}
              className="mt-10 grid grid-cols-3 gap-4 max-w-[460px] border-t border-white/10 pt-6"
            >
              {HERO_STATS.map((stat) => (
                <div key={stat.valueKey} className="flex flex-col">
                  <dt className="order-2 text-[12px] text-white/55 leading-tight mt-1">
                    {t(stat.labelKey)}
                  </dt>
                  <dd className="order-1 text-[1.5rem] font-medium tracking-[-0.02em] text-white">
                    {t(stat.valueKey)}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Right: rounded photo with floating lead-time chip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_STRONG }}
            className="relative w-full"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] ring-1 ring-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
              <Image
                src={HERO_PHOTO}
                alt={t("heroPhotoAlt")}
                fill
                sizes="(min-width: 1024px) 460px, 100vw"
                className="object-cover"
                priority
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#003c33]/55 via-transparent to-transparent"
              />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3.5 py-2 text-[12.5px] font-medium text-[#003c33] shadow-sm">
                <IconClock size={14} />
                {t("photoChip")}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. How it works ──────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-24">
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

      {/* ── 3. Priority tiers ────────────────────────────────────────── */}
      <section id="priority" className="bg-[#fafafa] border-y border-[#f2f2f2] py-16 md:py-24 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <h2 className="font-medium tracking-[-0.015em] text-[1.5rem] md:text-[2rem]">
            {t("tiersTitle")}
          </h2>
          <p className="mt-2 text-sm text-[#616161]">{t("tiersSubtitle")}</p>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {TIERS.map((tier) => {
              const isPopular = tier.popular;
              const label = `${t(tier.nameKey)} (${t(tier.daysKey)})`;
              return (
                <div
                  key={tier.id}
                  className="relative flex flex-col rounded-[20px] bg-white p-6 md:p-7 border"
                  style={{
                    borderColor: isPopular ? "#346739" : "#e5e7eb",
                    borderWidth: isPopular ? 2 : 1,
                  }}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-[#346739] text-white text-[11px] font-medium px-3 py-1">
                      {t("tierBadgePopular")}
                    </span>
                  )}
                  <h3 className="text-lg font-medium text-[#212121]">{t(tier.nameKey)}</h3>
                  <span className="mt-4 text-[2rem] font-medium tracking-[-0.02em] text-[#212121]">
                    {t(tier.daysKey)}
                  </span>
                  <span className="mt-2 inline-flex w-fit items-center rounded-full bg-[#edfce9] text-[#346739] text-[12px] font-medium px-3 py-1">
                    {t(tier.surchargeKey)}
                  </span>
                  <a
                    href={waLink(t("waTier", { tier: label }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6"
                  >
                    <TextureButton
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full h-11 rounded-full text-sm font-medium"
                    >
                      <IconBrandWhatsapp className="w-4 h-4" />
                      {t("tierCta")}
                    </TextureButton>
                  </a>
                </div>
              );
            })}
          </div>
          <ul className="mt-8 flex flex-col gap-2">
            {[t("noteExclusions"), t("noteHolidays")].map((note) => (
              <li key={note} className="flex items-start gap-2 text-[13px] text-[#616161]">
                <IconCheck size={15} className="mt-0.5 text-[#346739] shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 4. Calculation illustration ──────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-[460px] mx-auto rounded-[24px] bg-[#eeece7] p-7 md:p-9">
          <h2 className="font-medium tracking-[-0.015em] text-[1.25rem] text-center mb-6">
            {t("calcTitle")}
          </h2>
          <div className="flex items-center justify-between py-3 border-b border-[#d9d9dd]">
            <span className="text-sm text-[#616161]">{t("calcTotalLabel")}</span>
            <span className="text-sm font-medium text-[#212121]">{t("calcTotalValue")}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[#d9d9dd]">
            <span className="text-sm text-[#616161]">{t("calcSurchargeLabel")}</span>
            <span className="text-sm font-medium text-[#212121]">{t("calcSurchargeValue")}</span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="text-base font-medium text-[#212121]">{t("calcGrandLabel")}</span>
            <span className="text-lg font-medium text-[#346739]">{t("calcGrandValue")}</span>
          </div>
          <p className="mt-5 text-[12px] text-[#93939f] leading-relaxed">{t("calcNote")}</p>
        </div>
      </section>

      {/* ── 5. Closing CTA band ──────────────────────────────────────── */}
      <section className="bg-[#003c33] text-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col items-center text-center">
          <h2 className="font-medium tracking-[-0.02em] text-[1.75rem] md:text-[2.5rem] max-w-[640px]">
            {t("closingTitle")}
          </h2>
          <a href={waLink(t("waGeneric"))} target="_blank" rel="noopener noreferrer" className="mt-8">
            <TextureButton variant="primary" size="lg" className="font-medium">
              <IconBrandWhatsapp className="w-5 h-5" />
              {t("closingCta")}
            </TextureButton>
          </a>
        </div>
      </section>
    </main>
  );
}
