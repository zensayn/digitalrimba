"use client";

// ─── CardPriceTag ──────────────────────────────────────────────────────────────
// The price line shown on a catalog card. Driven by the live price book:
//   • available  → entry (lowest-tier) price, e.g. "Mulai Rp17.700"
//   • pending / unpriced → muted "Cek katalog" (pairs with a desaturated cover)
//   • no pricing data at all → nothing (so a down pricing service never shows a
//     stale placeholder price)
// `tone` flips the palette for dark-background cards (the home carousel).

import { useTranslations } from "next-intl";
import { formatIDR, type CardPrice } from "@/lib/catalog";

interface Props {
  price?: CardPrice;
  /** Sizing/weight classes shared by both states (color is applied here). */
  className?: string;
  tone?: "light" | "dark";
}

export default function CardPriceTag({ price, className = "", tone = "light" }: Props) {
  const t = useTranslations("Templates");
  if (!price) return null;

  if (price.available && price.from != null) {
    const color = tone === "dark" ? "text-white/90" : "text-[#212121]";
    return (
      <span className={`${className} ${color}`}>
        {t("priceFrom")} {formatIDR(price.from)}
      </span>
    );
  }

  const muted = tone === "dark" ? "text-white/50" : "text-[#93939f]";
  return <span className={`${className} ${muted}`}>{t("checkCatalog")}</span>;
}
