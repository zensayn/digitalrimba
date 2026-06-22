"use client";

// ─── Exclusive Order · Packages ───────────────────────────────────────────────
// Two-level hierarchy from the brochure:
//   • Flagship pair — Elite + Premium. Elite leads as a filled deep-green card
//     (the section's visual anchor); Premium is its lighter companion and the
//     "Most chosen" tier. Pattern follows Craft/Framer's flagship pricing pair.
//   • Priority trio — Priority I/II/III, lighter white cards.
// Each card lists its inclusions as a Framer-style checkmark list. The GREEN CTA
// is reserved for the single `popular` tier (Premium, 28-day); every other CTA
// is neutral (white). Data: EXCLUSIVE_TIERS + TIERS (constants). CTAs open
// WhatsApp pre-filled with the tier label. Tokens from design-template/cohere
// (ink #212121, primary #346739, deep-green #003c33, pale-green #edfce9).
// Motion per Emil: translateY+opacity reveal, ease-out, short stagger,
// reduced-motion aware.

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  IconBrandWhatsapp,
  IconCheck,
  IconSparkle2,
  IconBan,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";
import {
  EASE_OUT_STRONG,
  EXCLUSIVE_TIERS,
  TIERS,
  waLink,
} from "@/components/exclusive-order/constants";

export default function PriorityTiers() {
  const t = useTranslations("ExclusiveOrder");
  const reduce = useReducedMotion();

  // Shared reveal: fade + rise, staggered by position. Disabled under reduced motion.
  const reveal = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay: i * 0.06, ease: EASE_OUT_STRONG },
  });

  // Checkmark inclusions list — light variant on the dark Elite card, green on light cards.
  const FeatureList = ({
    featureKeys,
    onDark = false,
  }: {
    featureKeys: readonly string[];
    onDark?: boolean;
  }) => (
    <ul className="mt-5 flex flex-col gap-2.5">
      {featureKeys.map((fk) => (
        <li
          key={fk}
          className={`flex items-start gap-2.5 text-[13px] leading-snug ${
            onDark ? "text-white/75" : "text-[#616161]"
          }`}
        >
          <IconCheck
            size={15}
            stroke={2.5}
            className={`mt-0.5 shrink-0 ${onDark ? "text-[#bfe3b4]" : "text-[#346739]"}`}
          />
          {t(fk)}
        </li>
      ))}
    </ul>
  );

  return (
    <section
      id="priority"
      className="bg-[#fafafa] border-y border-[#f2f2f2] py-16 md:py-24 scroll-mt-24"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div {...reveal(0)}>
          <h2 className="font-medium tracking-[-0.015em] text-[1.5rem] md:text-[2rem]">
            {t("tiersTitle")}
          </h2>
          <p className="mt-2 text-sm text-[#616161]">{t("tiersSubtitle")}</p>
        </motion.div>

        {/* ── Flagship pair — Elite (filled, anchor) + Premium (most chosen) ── */}
        <span className="mt-10 block text-[12px] font-medium uppercase tracking-wide text-[#93939f]">
          {t("exclusiveGroupLabel")}
        </span>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {EXCLUSIVE_TIERS.map((tier, i) => {
            const label = `${t(tier.nameKey)} (${t(tier.daysKey)})`;
            const isLead = tier.flagship;
            return (
              <motion.div
                key={tier.id}
                {...reveal(i + 1)}
                className={`relative flex flex-col rounded-[24px] p-7 md:p-8 ${
                  isLead
                    ? "overflow-hidden bg-[#003c33] text-white"
                    : "bg-white text-[#212121] border-2 border-[#346739]"
                }`}
              >
                {/* Lead card carries a soft radial glow echoing the hero band */}
                {isLead && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      background:
                        "radial-gradient(60% 70% at 90% 0%, rgba(52,103,57,0.55), transparent 60%)",
                    }}
                  />
                )}

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-lg font-medium ${isLead ? "text-white" : "text-[#212121]"}`}
                    >
                      {t(tier.nameKey)}
                    </h3>
                    {tier.flagship && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#edfce9] text-[#003c33] text-[11px] font-medium px-2.5 py-1">
                        <IconSparkle2 size={12} />
                        {t("tierBadgeFlagship")}
                      </span>
                    )}
                    {tier.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#346739] text-white text-[11px] font-medium px-2.5 py-1">
                        {t("tierBadgePopular")}
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-5 text-[2.25rem] leading-[1.05] font-medium tracking-[-0.02em] ${
                      isLead ? "text-white" : "text-[#212121]"
                    }`}
                  >
                    {t(tier.daysKey)}
                  </span>

                  <span
                    className={`mt-3 inline-flex w-fit items-center rounded-full bg-[#edfce9] text-[12px] font-medium px-3 py-1 ${
                      isLead ? "text-[#003c33]" : "text-[#346739]"
                    }`}
                  >
                    {t(tier.surchargeKey)}
                  </span>

                  <p
                    className={`mt-4 text-sm leading-relaxed ${
                      isLead ? "text-white/70" : "text-[#616161]"
                    }`}
                  >
                    {t(tier.descKey)}
                  </p>

                  <FeatureList featureKeys={tier.featureKeys} onDark={isLead} />

                  <a
                    href={waLink(t("waTier", { tier: label }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-7"
                  >
                    <TextureButton
                      variant={tier.popular ? "primary" : "secondary"}
                      className="w-full h-11 rounded-full text-sm font-medium"
                    >
                      <IconBrandWhatsapp className="w-4 h-4" />
                      {t("tierCta")}
                    </TextureButton>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Flagship inclusion — the mirror of the Priority exclusions note:
            on Elite/Premium, design + revisions + consultation ARE included. */}
        <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[#616161]">
          <IconCheck size={15} stroke={2.5} className="mt-0.5 text-[#346739] shrink-0" />
          <span>
            <span className="font-medium text-[#212121]">{t("includedTitle")}:</span>{" "}
            {t("includedNote")}
          </span>
        </p>

        {/* ── Priority trio — granular speed options (all neutral CTAs) ── */}
        <span className="mt-12 block text-[12px] font-medium uppercase tracking-wide text-[#93939f]">
          {t("priorityGroupLabel")}
        </span>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => {
            const label = `${t(tier.nameKey)} (${t(tier.daysKey)})`;
            return (
              <motion.div
                key={tier.id}
                {...reveal(i + 1)}
                className="relative flex flex-col rounded-[20px] bg-white p-6 md:p-7 border border-[#e5e7eb]"
              >
                <h3 className="text-lg font-medium text-[#212121]">{t(tier.nameKey)}</h3>
                <span className="mt-4 text-[2rem] font-medium tracking-[-0.02em] text-[#212121]">
                  {t(tier.daysKey)}
                </span>
                <span className="mt-2 inline-flex w-fit items-center rounded-full bg-[#edfce9] text-[#346739] text-[12px] font-medium px-3 py-1">
                  {t(tier.surchargeKey)}
                </span>

                <FeatureList featureKeys={tier.featureKeys} />

                <a
                  href={waLink(t("waTier", { tier: label }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-6"
                >
                  <TextureButton
                    variant="secondary"
                    className="w-full h-11 rounded-full text-sm font-medium"
                  >
                    <IconBrandWhatsapp className="w-4 h-4" />
                    {t("tierCta")}
                  </TextureButton>
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Priority-only caveat — exclusions apply to the Priority packages, not
            the Elite/Premium flagship tiers, so it sits with the Priority trio. */}
        <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[#616161]">
          <IconBan size={15} stroke={2.5} className="mt-0.5 text-red-600 shrink-0" />
          <span>
            <span className="font-medium text-[#212121]">{t("noteExclusionsTitle")}:</span>{" "}
            {t("noteExclusions")}
          </span>
        </p>


      </div>
    </section>
  );
}
