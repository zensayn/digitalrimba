# Exclusive Order Page — Design

**Date:** 2026-06-18
**Route:** `/[locale]/exclusive-order` (new)
**File:** `frontend/app/[locale]/exclusive-order/page.tsx` (new)
**Source of truth for copy:** `frontend/Exclusive Order.pdf`

## Problem

The header (`Header.tsx` / `PageHeader.tsx`) links to `/exclusive-order`, but the
route does not exist — a dead link. Exclusive Order is the brand's rush-order /
expedited-production service for customers whose event is close. It needs its own
visually distinct page that frames urgency + premium service and converts via
WhatsApp.

## Decisions (confirmed with user)

- **Tier scheme:** Priority I/II/III **only**. The PDF's Elite/Premium named
  packages are dropped (they overlap/conflict with the Priority scheme).
- **Primary conversion:** WhatsApp-first. All CTAs are plain `wa.me` links with a
  tier-specific pre-filled message. No backend, no form.
- **Data:** Static copy sourced from the PDF, delivered through a new next-intl
  `ExclusiveOrder` namespace (id + en). No catalog/pricing API.

## Content (from the PDF, Priority scheme)

Intro (empathy/urgency): *"Kami mengerti momen spesial tak boleh tertunda.
Terkadang waktu juga tidak bersahabat. Untuk itu kami ingin tetap memberikan
pelayanan terbaik. Dengan menghadirkan Exclusive Order agar undangan kamu bisa
sampai lebih cepat."*

Priority Order speeds **production time only** — *"Tidak termasuk desain, revisi,
dan konsultasi."*

| Tier | Production time | Surcharge |
|---|---|---|
| Priority I | 15 hari | +35% dari total order |
| Priority II | 20 hari | +25% dari total order |
| Priority III | 25 hari | +15% dari total order |

Notes: *"Proses produksi tidak terhitung pada hari Minggu/libur."*

Calculation illustration — **adapted to Priority I** (the PDF example used the
now-dropped Premium tier): Total Order Rp 1.000.000 × +35% (Priority I) =
Rp 350.000 → **Grand Total Rp 1.350.000**.

## Page structure (top → bottom)

1. **Hero band — distinct dark `#003c33`**, full-bleed, faint wedding photo behind
   a green overlay. Eyebrow `RIMBA · EXCLUSIVE ORDER`; H1 "Exclusive Order"
   (Poppins medium, white, Cohere display scale); intro paragraph; an honest
   urgency chip (no fake countdown); primary CTA **"Chat via WhatsApp"** + a
   secondary "Lihat paket Priority" that scrolls to the tiers.
2. **How it works — 3 steps** (white section): Chat & pilih Priority → Submit data
   & desain final → Produksi dipercepat & dikirim.
3. **Priority tiers — 3 cards** in a responsive grid (1 col mobile, 3 col lg).
   Card style matches the product variant cards already built
   (`16px` radius, ink/green border). **Priority II highlighted** with the
   `#346739` border as "Paling dipilih". Each card: tier name, production-time
   badge, surcharge line, and its own WhatsApp CTA pre-filling that tier. Below the
   grid: the two honest notes (excludes design/revision/consult; excludes
   Sundays/holidays).
4. **Ilustrasi Perhitungan** — a soft-stone (`#eeece7`/`#edfce9`) card showing the
   Priority I surcharge math (Total → +35% → Grand Total).
5. **Closing CTA band** — recap urgency + large WhatsApp button.

## WhatsApp integration

- A single phone constant reused from the existing site pattern (the `wa.me`
  number already used in `Header.tsx`/`FloatingWhatsApp`). Define it once at the
  top of the page module (or a small `lib` helper) rather than hardcoding inline.
- Helper builds `https://wa.me/<number>?text=<encoded message>`. Each tier CTA
  encodes a message naming the tier, e.g. *"Halo, saya mau Exclusive Order —
  Priority II (20 hari). Acara saya tanggal ___."* The hero CTA uses a generic
  rush-order message.
- All WhatsApp links: `target="_blank" rel="noopener noreferrer"`.

## Conventions

- **Design tokens (Cohere `design-template/cohere/DESIGN.md`):** `#003c33` dark
  bands, `#edfce9`/`#eeece7` warm accents, white base, Poppins, pill buttons,
  `#346739` primary, ink `#212121` (never pure black), hairlines `#f2f2f2`.
- **Motion (Emil `emil-design-eng/SKILL.md`):** entrance animations only where
  they earn it, strong ease-out curve `cubic-bezier(0.23,1,0.32,1)`, durations
  <300ms, `:active` scale on pressables, animate transform/opacity only. Client
  component, consistent with sibling pages (`workflow`, `about`).
- **i18n:** new `ExclusiveOrder` namespace in `messages/id.json` and
  `messages/en.json`; Indonesian copy from the PDF, English translated. No copy
  hardcoded in the component.
- **Metadata:** localized page `<title>`/description via `generateMetadata` or a
  static `metadata` export, following sibling pages.

## Out of scope

- Elite/Premium named packages (dropped).
- Real availability / pricing / lead-time API; any live countdown timer.
- An on-page request form or checkout integration.
- Navigation changes — `PageHeader`/`Header` already link to `/exclusive-order`.

## Success criteria

- Visiting `/id/exclusive-order` and `/en/exclusive-order` renders the full page
  in the correct language; the header link resolves (no longer dead).
- All five sections present; Priority II visibly highlighted; both honest notes
  shown.
- Every CTA opens WhatsApp (`wa.me`) in a new tab with a sensible pre-filled
  message; tier CTAs name their tier.
- No Elite/Premium content anywhere; calc example uses Priority I.
- `bun run build` / typecheck and ESLint pass; no hardcoded user-facing strings
  (all via the `ExclusiveOrder` namespace).
- Layout responsive: hero readable on mobile, tier grid collapses to one column.
