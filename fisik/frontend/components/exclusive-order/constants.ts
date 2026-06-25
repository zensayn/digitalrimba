// ─── Exclusive Order — shared constants & helpers ─────────────────────────────
// Single source of truth for the Exclusive Order page sections. Keeping the
// tier/step/gallery data and the WhatsApp/Unsplash helpers here lets each
// section component (Hero, Steps, PriorityTiers, CostIllustration, ClosingCta)
// stay presentational and easy to tweak in isolation.

import {
  IconMessageCircle,
  IconFileText,
  IconTruckDelivery,
} from "@tabler/icons-react";

// Strong ease-out curve — shared across every section's entrance motion.
export const EASE_OUT_STRONG: [number, number, number, number] = [
  0.23, 1, 0.32, 1,
];

// Hero subject (couple + composited UI) — hosted on the allowlisted contents.rimba.app.
export const HERO_PHOTO =
  "https://contents.rimba.app/assets/hero-exclusive-order-2.webp";

export const HERO_STATS = [
  { valueKey: "heroStat1Value", labelKey: "heroStat1Label" },
  { valueKey: "heroStat2Value", labelKey: "heroStat2Label" },
  { valueKey: "heroStat3Value", labelKey: "heroStat3Label" },
] as const;

// Site-wide WhatsApp number (matches the existing CTA pattern in AboutCTA/BottomCTA).
export const WA_NUMBER = "6285750275751";
export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// Flagship "Exclusive" tiers — the two headline packages from the brochure.
// Rendered as the prominent pair above the Priority trio. `flagship` marks the
// top tier (Elite) that gets the dark featured card; `popular` marks the
// most-chosen tier (Premium) — the ONLY tier with the green CTA + "Most chosen"
// badge. `featureKeys` drive the Framer-style checkmark inclusions list.
export const EXCLUSIVE_TIERS = [
  {
    id: "elite",
    nameKey: "eliteName", daysKey: "eliteDays", surchargeKey: "eliteSurcharge", descKey: "eliteDesc",
    pct: 50, flagship: true, popular: false,
    featureKeys: ["eliteFeat1", "eliteFeat2", "eliteFeat3"],
  },
  {
    id: "premium",
    nameKey: "premiumName", daysKey: "premiumDays", surchargeKey: "premiumSurcharge", descKey: "premiumDesc",
    pct: 40, flagship: false, popular: true,
    featureKeys: ["premiumFeat1", "premiumFeat2", "premiumFeat3"],
  },
] as const;

// Priority tiers — the granular speed options below the flagship pair. None are
// "popular" now (the most-chosen flag lives on Premium), so all use neutral CTAs.
export const TIERS = [
  { id: 1, nameKey: "tier1Name", daysKey: "tier1Days", surchargeKey: "tier1Surcharge", popular: false, featureKeys: ["tier1Feat1", "tier1Feat2"] },
  { id: 2, nameKey: "tier2Name", daysKey: "tier2Days", surchargeKey: "tier2Surcharge", popular: false, featureKeys: ["tier2Feat1", "tier2Feat2"] },
  { id: 3, nameKey: "tier3Name", daysKey: "tier3Days", surchargeKey: "tier3Surcharge", popular: false, featureKeys: ["tier3Feat1", "tier3Feat2"] },
] as const;

export const STEPS = [
  { icon: IconMessageCircle, titleKey: "step1Title", descKey: "step1Desc" },
  { icon: IconFileText, titleKey: "step2Title", descKey: "step2Desc" },
  { icon: IconTruckDelivery, titleKey: "step3Title", descKey: "step3Desc" },
] as const;

// Closing-CTA gallery — wedding moments (Unsplash), scattered along a staggered
// baseline so the strip bleeds off both edges (Ada-style). Verified-resolving IDs.
export const CTA_GALLERY = [
  { id: "photo-1519225421980-715cb0215aed", offset: 56 },
  { id: "photo-1511285560929-80b456fea0bc", offset: 96 },
  { id: "photo-1606216794074-735e91aa2c92", offset: 24 },
  { id: "photo-1465495976277-4387d4b0b4c6", offset: 72 },
  { id: "photo-1519741497674-611481863552", offset: 8 },
  { id: "photo-1525772764200-be829a350797", offset: 64 },
  { id: "photo-1583939003579-730e3918a45a", offset: 28 },
  { id: "photo-1469371670807-013ccf25f16a", offset: 88 },
] as const;
export const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=420&q=70`;

// Cost-illustration calculator — sample order total + the real Priority surcharges.
export const SAMPLE_BASE = 1_000_000;
export const CALC_TIERS = [
  { id: 1, nameKey: "tier1Name", daysKey: "tier1Days", pct: 35, popular: false },
  { id: 2, nameKey: "tier2Name", daysKey: "tier2Days", pct: 25, popular: true },
  { id: 3, nameKey: "tier3Name", daysKey: "tier3Days", pct: 15, popular: false },
] as const;
