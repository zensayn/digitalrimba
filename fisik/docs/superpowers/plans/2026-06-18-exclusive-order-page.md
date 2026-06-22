# Exclusive Order Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/[locale]/exclusive-order` rush-order marketing page (Priority I/II/III tiers, WhatsApp-first conversion), resolving the currently-dead header link.

**Architecture:** A single localized client page component (matching sibling pages `about`/`workflow`), rendered inside the existing MarketingChrome. All copy lives in a new `ExclusiveOrder` next-intl namespace (id + en). CTAs are plain `wa.me` links with tier-specific pre-filled text — no backend, no form.

**Tech Stack:** Next.js 16 App Router, next-intl v4, `motion/react`, `@tabler/icons-react`, `@/components/ui/texture-button`, Tailwind.

## Global Constraints

- **Design tokens (Cohere):** Poppins; ink `#212121` (never pure black); primary `#346739`; deep-green band `#003c33`; warm accents `#edfce9` / `#eeece7`; hairlines `#f2f2f2` / `#d9d9dd`; pill buttons; flat (no heavy shadows). No `tracking-wider` on labels.
- **Motion (Emil):** strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; durations < 300ms for UI; animate transform/opacity only; `:active` scale on pressables.
- **i18n:** every user-facing string comes from the `ExclusiveOrder` namespace — no hardcoded copy in the component. id is the source (from the PDF); en is the translation. Both files must have identical keys.
- **Tiers:** Priority I/II/III only. No Elite/Premium content anywhere. Calc example uses Priority I.
- **WhatsApp:** number `1234567890` (the site-wide placeholder already used in `AboutCTA`/`BottomCTA`/`Header`); all WhatsApp anchors use `target="_blank" rel="noopener noreferrer"`.
- **No new dependencies.** Verify with `npx tsc --noEmit -p tsconfig.json` (no errors in touched files) and `npx eslint <files>` (clean). All commands run from `frontend/`.
- **Deviation from spec (intentional):** the hero uses a deep-green band with a decorative CSS gradient instead of a wedding photo, to avoid depending on an image asset that doesn't exist. A photo can be layered in later.

---

### Task 1: Add the `ExclusiveOrder` i18n namespace (id + en)

**Files:**
- Modify: `frontend/messages/id.json` (add one top-level `"ExclusiveOrder"` key)
- Modify: `frontend/messages/en.json` (add the same key with English values)

**Interfaces:**
- Produces: translation keys consumed by Task 2 via `useTranslations("ExclusiveOrder")`:
  `eyebrow, heroTitle, heroIntro, urgencyChip, heroCtaPrimary, heroCtaSecondary,
  howTitle, step1Title, step1Desc, step2Title, step2Desc, step3Title, step3Desc,
  tiersTitle, tiersSubtitle, tier1Name, tier1Days, tier1Surcharge, tier2Name,
  tier2Days, tier2Surcharge, tier3Name, tier3Days, tier3Surcharge, tierBadgePopular,
  tierCta, noteExclusions, noteHolidays, calcTitle, calcTotalLabel, calcTotalValue,
  calcSurchargeLabel, calcSurchargeValue, calcGrandLabel, calcGrandValue, calcNote,
  closingTitle, closingCta, waGeneric, waTier`.
  `waTier` contains an ICU `{tier}` placeholder.

- [ ] **Step 1: Add the namespace to `messages/id.json`**

Insert this as a new top-level key (e.g. right after the opening `{`, keeping JSON valid — mind the trailing comma):

```json
  "ExclusiveOrder": {
    "eyebrow": "Rimba · Exclusive Order",
    "heroTitle": "Exclusive Order",
    "heroIntro": "Kami mengerti momen spesial tak boleh tertunda. Terkadang waktu juga tidak bersahabat. Untuk itu kami ingin tetap memberikan pelayanan terbaik—menghadirkan Exclusive Order agar undangan kamu sampai lebih cepat.",
    "urgencyChip": "Acara makin dekat? Kami bantu percepat.",
    "heroCtaPrimary": "Chat via WhatsApp",
    "heroCtaSecondary": "Lihat paket Priority",
    "howTitle": "Cara kerjanya",
    "step1Title": "Chat & pilih Priority",
    "step1Desc": "Hubungi kami via WhatsApp dan pilih paket Priority sesuai tenggat acaramu.",
    "step2Title": "Submit data & desain final",
    "step2Desc": "Kirim data undangan dan finalisasi desain bersama tim kami.",
    "step3Title": "Produksi dipercepat & dikirim",
    "step3Desc": "Produksi langsung kami prioritaskan dan undangan dikirim lebih cepat.",
    "tiersTitle": "Paket Priority Order",
    "tiersSubtitle": "Layanan percepatan waktu produksi undangan.",
    "tier1Name": "Priority I",
    "tier1Days": "15 hari produksi",
    "tier1Surcharge": "+35% dari total order",
    "tier2Name": "Priority II",
    "tier2Days": "20 hari produksi",
    "tier2Surcharge": "+25% dari total order",
    "tier3Name": "Priority III",
    "tier3Days": "25 hari produksi",
    "tier3Surcharge": "+15% dari total order",
    "tierBadgePopular": "Paling dipilih",
    "tierCta": "Pilih paket ini",
    "noteExclusions": "Tidak termasuk desain, revisi, dan konsultasi.",
    "noteHolidays": "Proses produksi tidak terhitung pada hari Minggu/libur.",
    "calcTitle": "Ilustrasi perhitungan",
    "calcTotalLabel": "Total order",
    "calcTotalValue": "Rp 1.000.000",
    "calcSurchargeLabel": "Priority I (+35%)",
    "calcSurchargeValue": "Rp 350.000",
    "calcGrandLabel": "Grand total",
    "calcGrandValue": "Rp 1.350.000",
    "calcNote": "Contoh untuk Priority I. Biaya tambahan menyesuaikan paket yang dipilih.",
    "closingTitle": "Waktu mepet? Undangan tetap bisa tepat waktu.",
    "closingCta": "Chat via WhatsApp",
    "waGeneric": "Halo Rimba, saya tertarik dengan Exclusive Order untuk mempercepat undangan pernikahan saya. Tanggal acara saya: ___.",
    "waTier": "Halo Rimba, saya mau Exclusive Order paket {tier}. Tanggal acara saya: ___."
  },
```

- [ ] **Step 2: Add the same namespace to `messages/en.json`** (English values)

```json
  "ExclusiveOrder": {
    "eyebrow": "Rimba · Exclusive Order",
    "heroTitle": "Exclusive Order",
    "heroIntro": "We know special moments can't wait. Sometimes time isn't on your side. That's why we created Exclusive Order — so your invitations arrive faster, without compromise.",
    "urgencyChip": "Event coming up fast? We'll speed it up.",
    "heroCtaPrimary": "Chat on WhatsApp",
    "heroCtaSecondary": "See Priority packages",
    "howTitle": "How it works",
    "step1Title": "Chat & pick a Priority",
    "step1Desc": "Message us on WhatsApp and choose the Priority package that fits your deadline.",
    "step2Title": "Submit details & finalize design",
    "step2Desc": "Send your invitation details and finalize the design with our team.",
    "step3Title": "Fast-tracked & shipped",
    "step3Desc": "We prioritize production and ship your invitations sooner.",
    "tiersTitle": "Priority Order packages",
    "tiersSubtitle": "Faster invitation production time.",
    "tier1Name": "Priority I",
    "tier1Days": "15-day production",
    "tier1Surcharge": "+35% of order total",
    "tier2Name": "Priority II",
    "tier2Days": "20-day production",
    "tier2Surcharge": "+25% of order total",
    "tier3Name": "Priority III",
    "tier3Days": "25-day production",
    "tier3Surcharge": "+15% of order total",
    "tierBadgePopular": "Most chosen",
    "tierCta": "Choose this package",
    "noteExclusions": "Excludes design, revisions, and consultation.",
    "noteHolidays": "Production days exclude Sundays and public holidays.",
    "calcTitle": "Cost illustration",
    "calcTotalLabel": "Order total",
    "calcTotalValue": "Rp 1,000,000",
    "calcSurchargeLabel": "Priority I (+35%)",
    "calcSurchargeValue": "Rp 350,000",
    "calcGrandLabel": "Grand total",
    "calcGrandValue": "Rp 1,350,000",
    "calcNote": "Example for Priority I. The surcharge varies by the package you choose.",
    "closingTitle": "Short on time? Your invitations can still make it.",
    "closingCta": "Chat on WhatsApp",
    "waGeneric": "Hi Rimba, I'm interested in Exclusive Order to speed up my wedding invitations. My event date: ___.",
    "waTier": "Hi Rimba, I'd like the Exclusive Order {tier} package. My event date: ___."
  },
```

- [ ] **Step 3: Verify both files are valid JSON with matching keys**

Run:
```bash
python3 -c "import json; a=json.load(open('messages/id.json'))['ExclusiveOrder']; b=json.load(open('messages/en.json'))['ExclusiveOrder']; print('id keys', len(a)); print('en keys', len(b)); print('match', sorted(a)==sorted(b))"
```
Expected: `id keys 40`, `en keys 40`, `match True`

- [ ] **Step 4: Commit**

```bash
git -C /Users/pangkywaradjodi/rimba-fisik add frontend/messages/id.json frontend/messages/en.json
git -C /Users/pangkywaradjodi/rimba-fisik commit -m "i18n: add ExclusiveOrder namespace (id + en)"
```

---

### Task 2: Create the Exclusive Order page component

**Files:**
- Create: `frontend/app/[locale]/exclusive-order/page.tsx`

**Interfaces:**
- Consumes: the `ExclusiveOrder` namespace from Task 1; `TextureButton` (`variant`: `"primary" | "secondary"`, optional `size="lg"`) from `@/components/ui/texture-button`; tabler icons.
- Produces: the default-exported route component (no exports consumed elsewhere).

- [ ] **Step 1: Create the page file with full content**

```tsx
"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  IconBrandWhatsapp,
  IconBolt,
  IconMessageCircle,
  IconFileText,
  IconTruckDelivery,
  IconCheck,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";

const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

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
      {/* ── 1. Hero band (distinct deep-green) ───────────────────────── */}
      <section className="relative overflow-hidden bg-[#003c33] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 80% 10%, rgba(52,103,57,0.55), transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(237,252,233,0.10), transparent 60%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_STRONG }}
            className="inline-block text-[12px] font-medium uppercase text-[#edfce9]/80"
          >
            {t("eyebrow")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT_STRONG }}
            className="mt-3 font-medium leading-[1.05] tracking-[-0.02em] text-[2.5rem] md:text-[4rem]"
          >
            {t("heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT_STRONG }}
            className="mt-5 max-w-[560px] text-[15px] md:text-base leading-relaxed text-white/80"
          >
            {t("heroIntro")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE_OUT_STRONG }}
            className="mt-7"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#edfce9]/12 border border-[#edfce9]/20 px-3.5 py-1.5 text-[12.5px] text-[#edfce9]">
              <IconBolt size={14} />
              {t("urgencyChip")}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE_OUT_STRONG }}
            className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
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
```

- [ ] **Step 2: Typecheck — verify no errors in the new file**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "exclusive-order" || echo "NO type errors in touched file"`
Expected: `NO type errors in touched file`

(If `TextureButton` rejects `size="lg"` or a `variant`, open `frontend/components/ui/texture-button.tsx`, confirm the allowed prop values, and adjust the calls to match — do not invent variants.)

- [ ] **Step 3: Lint the new file**

Run: `npx eslint "app/[locale]/exclusive-order/page.tsx"`
Expected: no output (clean).

- [ ] **Step 4: Verify the route renders in both locales (dev server on :3000)**

Run:
```bash
curl -s -o /dev/null -w "id=%{http_code}\n" http://localhost:3000/id/exclusive-order
curl -s -o /dev/null -w "en=%{http_code}\n" http://localhost:3000/en/exclusive-order
curl -s http://localhost:3000/id/exclusive-order | grep -c "Paket Priority Order"
curl -s http://localhost:3000/en/exclusive-order | grep -c "Priority Order packages"
```
Expected: `id=200`, `en=200`, and each `grep -c` prints `1` (localized tier heading present). If no dev server is running, start one with `npx next dev` first.

- [ ] **Step 5: Commit**

```bash
git -C /Users/pangkywaradjodi/rimba-fisik add frontend/app/"[locale]"/exclusive-order/page.tsx
git -C /Users/pangkywaradjodi/rimba-fisik commit -m "feat: add Exclusive Order rush-order page"
```

---

## Self-Review

**Spec coverage:**
- Hero band (distinct dark) → Task 2 §1 ✓ (photo intentionally swapped for CSS gradient — noted in Global Constraints)
- How-it-works 3 steps → Task 2 §2 ✓
- Priority I/II/III cards, II highlighted, per-card WhatsApp CTA → Task 2 §3 ✓
- Honest notes (exclusions, Sundays/holidays) → Task 2 §3 ✓
- Calc illustration adapted to Priority I → Task 2 §4 ✓
- Closing CTA band → Task 2 §5 ✓
- WhatsApp-first, pre-filled, tier-specific → `waLink` + `waGeneric`/`waTier` ✓
- Static copy via `ExclusiveOrder` namespace, id+en → Task 1 ✓
- Header dead link resolved → satisfied once route exists (Task 2); no nav change needed ✓
- Out of scope (Elite/Premium, API, countdown, form) → none added ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete; the `___` in `waGeneric`/`waTier` is intentional user-fill text in the WhatsApp message, not a plan placeholder.

**Type consistency:** `ExclusiveOrder` keys produced in Task 1 exactly match those consumed in Task 2 (incl. `waTier`'s `{tier}` ICU arg used as `t("waTier", { tier: label })`). `TextureButton` variants used (`primary`, `secondary`) and `size="lg"` match existing usage in `AboutCTA.tsx`; Step 2 includes a fallback check if the component's prop contract differs.
