# Simplify Product Detail Panel — Design

**Date:** 2026-06-18
**Component:** `frontend/components/products/ProductInteractive.tsx` (right `<aside>` info panel)
**Route:** `/[locale]/products/[slug]`

## Problem

The right-side detail panel on the product page carries too much: a bordered
shipping card, a variant pill toggle, a row quantity picker, a purchase-mode card
with a **Subscribe & save** option, a Save/Share button row, a description with
"view more", and a bordered refund-policy chip. For a one-off **wedding
invitation** purchase this reads as cluttered, and the subscription model does
not fit the product at all.

Mobbin reference for the target density: [Hers — Full Volume Shampoo](https://mobbin.com/screens/56038a68-7a87-4975-86dd-089ad80e8335)
(tag, title, short blurb, one selector, quantity, single primary action) and
[Shop — Light Roast Coffee](https://mobbin.com/screens/206ca8cb-6783-45a4-bfdc-78e20430fa26).
The current panel closely mirrors the busier [Bones Coffee / Shop](https://mobbin.com/screens/43981d3d-54a0-4946-b918-067d7dc6e8b6)
layout — the density we are moving away from.

## Goal

Reduce the panel to the essential purchase decision, Hers-style: title + rating,
price, variant, quantity, and the two buy actions — plus minimal secondary text.
No nested/bordered cards.

## Target layout (top → bottom)

```
Whisper                              ⟱ share icon (top-right of title row)
RFH · ★ 4.8 (1.1K)                   ← muted meta + rating link

Rp 399K                              ← price, large

──────────────────────────────────  ← hairline

PILIH VARIASI: PREMIUM
[ Sederhana ]  [ Premium ]           ← pill toggle (unchanged behavior)

JUMLAH                    [ − 1 + ]  ← inline row

[      Beli sekarang      ]          ← dark, full width
[   Tambah ke keranjang   ]          ← green, full width

Deskripsi singkat… Selengkapnya      ← short blurb + view-more link
Ongkir dihitung saat checkout        ← one muted line
📄 Kebijakan refund ›                ← small plain text link
```

## Changes from current implementation

**Removed**
- The entire **Subscribe & save** block (`subscribeSave`, `saveBadge`, strikethrough price).
- The **purchase-mode radio** mechanism (`purchaseMode` state, `RadioDot`, the
  "Beli sekali" one-time-purchase row). With subscribe gone there is only one
  mode, so the buy buttons render unconditionally.
- The bordered **shipping card** (the `bg-[#fafafa]` box with 📦 + "Tambah alamat").
- The **Save (favorite)** button and the 2-col Save/Share grid (`saved` state,
  `IconHeart`/`IconHeartFilled` usage).

**Demoted to plain text**
- **Shipping**: a single muted line `Ongkir dihitung saat checkout` (drop the card,
  the "PENGIRIMAN" label, and the "Tambah alamat" action).
- **Refund policy**: a small text link with chevron, no bordered chip.

**Kept (behavior unchanged)**
- Title, category + rating meta, price.
- Variant pill toggle (`variant` state, Sederhana/Premium).
- Quantity stepper (`qty` state, `inc`/`dec`).
- The two buy buttons — `Beli sekarang` (dark) and `Tambah ke keranjang` (green),
  now **stacked full-width** and always visible.

**Moved**
- **Share**: from a full-width button to a small icon button (`IconShare`) in the
  title row, top-right aligned with the `<h1>`.

## State cleanup

Delete now-unused state and helpers from `ProductInteractive`:
- `purchaseMode` / `setPurchaseMode`
- `saved` / `setSaved`
- `RadioDot` component
- imports: `IconHeart`, `IconHeartFilled` (keep `IconShare`).

## Labels

These `labels` keys become unused and should be dropped from the `Props.labels`
type, the `page.tsx` call site, and any now-dead translation usage:
`shippingNote`* , `addAddress`, `oneTimePurchase`, `subscribeSave`, `saveBadge`,
`save`.

\* `shippingNote` is reused for the muted shipping line — keep it. Re-confirm each
key against the code during implementation before deleting, to avoid breaking the
`Products` namespace or other callers.

`variantsLabel`, `quantityLabel`, `priceTag`, `ratingShort`, `buyNow`,
`addToCart`, `description`, `viewMore`, `refundPolicy`, `share` remain.

## Out of scope

- Left media/gallery column (thumbnails, main preview, dialog) — untouched.
- "What's included" strip and Reviews section below — untouched.
- Recommendations grid — untouched.
- No new translation strings; Indonesian copy reused as-is.

## Success criteria

- Right panel shows only: title+share, rating, price, variant, quantity, two buy
  buttons, short description, one shipping line, refund link.
- No Subscribe/Save UI anywhere on the page.
- No unused state, components, imports, or label props remain.
- Mobile (`< lg`) and desktop layouts both render the simplified stack; existing
  responsive centering on mobile preserved.
- `bun run build` / typecheck passes with no unused-variable or missing-prop errors.
