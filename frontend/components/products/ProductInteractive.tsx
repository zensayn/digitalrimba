"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  IconMinus,
  IconPlus,
  IconShare,
  IconCheck,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextureButton } from "@/components/ui/texture-button";
import ProductImageDialog from "./ProductImageDialog";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

// Volume pricing tiers (per piece, in Rupiah). The unit price drops as the
// order quantity grows; `min` is both the bracket floor and the qty applied
// when a tier card is tapped. The first tier's price is the savings baseline.
const PRICE_TIERS = [
  { range: "50–99", min: 50, max: 99, price: 16000 },
  { range: "100–299", min: 100, max: 299, price: 14375 },
  { range: "300–499", min: 300, max: 499, price: 13563 },
  { range: "500+", min: 500, max: Infinity, price: 11750 },
] as const;

const BASE_PRICE = PRICE_TIERS[0].price;
const MIN_QTY = PRICE_TIERS[0].min;
const MAX_QTY = 100000;

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

// Sales WhatsApp line (placeholder matches the rest of the site's CTAs).
const WA_NUMBER = "1234567890";

const tierForQty = (q: number) =>
  PRICE_TIERS.find((t) => q >= t.min && q <= t.max) ?? PRICE_TIERS[0];

export interface ProductView {
  id: string;
  src: string;
  alt: string;
}

interface Props {
  templateName: string;
  categoryLabel: string;
  images: ProductView[];
  features: string[];
  labels: {
    volumeTitle: string;
    perUnit: string;
    saveLabel: string;
    subtotal: string;
    minOrder: string;
    shippingNote: string;
    quantityLabel: string;
    orderWhatsApp: string;
    share: string;
    shareTooltip: string;
    linkCopied: string;
    description: string;
    viewMore: string;
    refundPolicy: string;
    whatsIncluded: string;
  };
}

export default function ProductInteractive({
  templateName,
  categoryLabel,
  images,
  features,
  labels,
}: Props) {
  const t = useTranslations("Products");
  const [activeView, setActiveView] = useState(0);
  const [qty, setQty] = useState<number>(MIN_QTY);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Share: copy the current page URL, confirm with an inline check + a toast.
  // `copied` drives both the icon crossfade and a forced-open tooltip so the
  // confirmation reads regardless of where the pointer is.
  const [copied, setCopied] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard can be unavailable (insecure context / denied permission);
      // still surface the confirmation so the press never feels dead.
    }
    setCopied(true);
    setTipOpen(true);
    toast.success(labels.linkCopied);
    window.setTimeout(() => {
      setCopied(false);
      setTipOpen(false);
    }, 1800);
  }, [labels.linkCopied]);

  // The current bracket is derived from quantity, so the tier cards and the
  // quantity stepper always agree on the active price (eBay "bulk savings").
  const activeTier = tierForQty(qty);
  const savingsPct = Math.round((1 - activeTier.price / BASE_PRICE) * 100);
  const subtotal = activeTier.price * qty;

  // Prefill the WhatsApp chat with the current selection so the sales team
  // gets product, quantity, unit price and estimated total in one message.
  const waText = `Halo Rimba, saya tertarik memesan undangan "${templateName}" (${categoryLabel}).
Jumlah: ${qty.toLocaleString("id-ID")} pcs
Harga: ${rupiah(activeTier.price)}/pcs
Estimasi total: ${rupiah(subtotal)}`;
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

  const views = images;

  const MAX_VISIBLE_THUMBNAILS = 5;
  const visibleThumbnails = views.slice(0, MAX_VISIBLE_THUMBNAILS);
  const hiddenCount = Math.max(0, views.length - MAX_VISIBLE_THUMBNAILS);

  const openOverflow = (index: number) => {
    setActiveView(index);
    setIsDialogOpen(true);
  };

  const dec = () => setQty((q) => Math.max(MIN_QTY, q - 1));
  const inc = () => setQty((q) => Math.min(MAX_QTY, q + 1));

  // Editable quantity: a string buffer lets the user clear the field and type
  // freely; it re-syncs whenever qty changes elsewhere (steppers, tier cards).
  // We only cap at MAX_QTY while typing (so the shown value never silently
  // diverges) and apply the MIN floor on blur, when the user is done.
  const [qtyText, setQtyText] = useState<string>(String(MIN_QTY));
  useEffect(() => setQtyText(String(qty)), [qty]);

  const onQtyChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      setQtyText("");
      return;
    }
    const n = Math.min(MAX_QTY, parseInt(digits, 10));
    setQtyText(String(n));
    setQty(n);
  };

  const onQtyBlur = () => {
    const n = parseInt(qtyText, 10);
    const clamped = Number.isNaN(n)
      ? MIN_QTY
      : Math.min(MAX_QTY, Math.max(MIN_QTY, n));
    setQty(clamped);
    setQtyText(String(clamped));
  };

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Top Section: Media preview + buy triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,58%)_minmax(0,42%)] gap-5 md:gap-12 items-start">
        
        {/* ── Visual Left Side (Sticky, Contained & Proportional) ──────── */}
        <div className="lg:sticky lg:top-[88px] flex gap-5 h-fit w-full">
          
          {/* Thumbnails */}
          <div className="hidden lg:flex flex-col gap-3 w-[80px] shrink-0">
            {visibleThumbnails.map((view, i) => {
              const isOverflowTile = i === visibleThumbnails.length - 1 && hiddenCount > 0;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => (isOverflowTile ? openOverflow(i) : setActiveView(i))}
                  aria-label={isOverflowTile ? t("viewMoreImages", { count: hiddenCount }) : t("viewImageNumber", { number: i + 1 })}
                  aria-current={activeView === i}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] border-4"
                  style={{
                    borderColor: activeView === i ? "#3B945E" : "#f2f2f2",
                    transition: `border-color 200ms ${EASE}`,
                  }}
                >
                  <Image
                    src={view.src}
                    alt={view.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {isOverflowTile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                      <span className="font-poppins text-sm font-medium text-white">
                        +{hiddenCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main preview */}
          <div className="relative flex-1 min-w-0">
            <div className="relative w-full h-[55vh] sm:h-[60vh] lg:h-[calc(100vh-160px)] min-h-[420px] max-h-[720px] rounded-[22px] overflow-hidden">
              {views.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => setIsDialogOpen(true)}
                  className="absolute inset-0 cursor-zoom-in"
                  style={{
                    opacity: activeView === i ? 1 : 0,
                    transition: `opacity 240ms ${EASE}`,
                    pointerEvents: activeView === i ? "auto" : "none",
                  }}
                >
                  <Image
                    src={v.src}
                    alt={v.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {/* Mobile thumbnail strip */}
            <div className="flex lg:hidden gap-2 mt-3">
              {visibleThumbnails.map((view, i) => {
                const isOverflowTile = i === visibleThumbnails.length - 1 && hiddenCount > 0;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => (isOverflowTile ? openOverflow(i) : setActiveView(i))}
                    aria-label={isOverflowTile ? t("viewMoreImages", { count: hiddenCount }) : t("viewImageNumber", { number: i + 1 })}
                    aria-current={activeView === i}
                    className="relative flex-1 aspect-[3/4] overflow-hidden rounded-[10px] border-4"
                    style={{
                      borderColor: activeView === i ? "#3B945E" : "#f2f2f2",
                      transition: `border-color 200ms ${EASE}`,
                    }}
                  >
                    <Image
                      src={view.src}
                      alt={view.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 25vw"
                      className="object-cover"
                    />
                    {isOverflowTile && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                        <span className="font-poppins text-xs font-medium text-white">
                          +{hiddenCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right info panel (minimal) ───────────────── */}
        <aside className="flex flex-col gap-6 w-full items-stretch md:items-start">

          {/* Category tag + title + description + price (Hers-style header) */}
          <div className="flex flex-col gap-3 items-start text-left w-full">
            <span className="inline-flex items-center rounded-full bg-[#edfce9] text-[#346739] px-3 py-1 text-[12px] font-medium font-poppins">
              {categoryLabel}
            </span>
            <div className="flex items-start justify-between gap-3 w-full">
              <h1
                className="font-poppins font-medium text-[#212121] leading-tight"
                style={{ fontSize: "clamp(1.6rem, 7vw, 2rem)", letterSpacing: "-0.02em" }}
              >
                {templateName}
              </h1>
              <TooltipProvider delayDuration={200}>
                <Tooltip open={tipOpen} onOpenChange={setTipOpen}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label={labels.share}
                      className="hidden md:flex shrink-0 w-9 h-9 items-center justify-center rounded-full border bg-white hover:bg-[#f2f2f2] active:scale-[0.97] transition-[color,background-color,border-color,transform] duration-150 ease-out cursor-pointer"
                      style={{
                        borderColor: copied ? "#346739" : "#e5e7eb",
                        color: copied ? "#346739" : "#616161",
                      }}
                    >
                      {/* Crossfade share <-> check; both icons share one box so
                          nothing reflows and the swap reads as a single morph. */}
                      <span className="relative w-[18px] h-[18px]">
                        <IconShare
                          size={18}
                          className="absolute inset-0"
                          style={{
                            opacity: copied ? 0 : 1,
                            transform: copied ? "scale(0.95)" : "scale(1)",
                            transition: `opacity 150ms ${EASE}, transform 150ms ${EASE}`,
                          }}
                        />
                        <IconCheck
                          size={18}
                          className="absolute inset-0"
                          style={{
                            opacity: copied ? 1 : 0,
                            transform: copied ? "scale(1)" : "scale(0.95)",
                            transition: `opacity 150ms ${EASE}, transform 150ms ${EASE}`,
                          }}
                        />
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    {copied ? labels.linkCopied : labels.shareTooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-[#616161] leading-relaxed max-w-prose">
              {labels.description}
              <button
                type="button"
                className="ml-1 text-[#1863dc] hover:underline font-medium"
              >
                {labels.viewMore}
              </button>
            </p>
          </div>

          {/* ── Pricing: dynamic per-unit headline driven by the active tier ──
              The savings badge slot keeps a fixed height (h-6) whether or not a
              discount applies, so the sections below never shift as tiers change. */}
          <div className="w-full flex flex-col items-start gap-3">
            <div className="flex items-end gap-2">
              <span className="font-poppins text-[34px] leading-none font-medium text-[#212121] tabular-nums">
                {rupiah(activeTier.price)}
              </span>
              <span className="font-poppins text-sm text-[#93939f] pb-1">
                {labels.perUnit}
              </span>
            </div>
            <div className="h-6 flex items-center">
              {savingsPct > 0 && (
                <span className="inline-flex items-center rounded-full bg-[#edfce9] text-[#346739] px-2.5 py-0.5 text-[12px] font-medium font-poppins">
                  {labels.saveLabel} {savingsPct}%
                </span>
              )}
            </div>
          </div>

          {/* ── Volume tier selector (eBay-style bulk savings) ───────────────
              Tapping a bracket sets the quantity to its floor; the stepper
              below fine-tunes within the bracket. Active tier mirrors qty. */}
          <div className="w-full flex flex-col gap-3">
            <span className="text-[12px] font-medium text-[#93939f] font-poppins uppercase self-start">
              {labels.volumeTitle}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {PRICE_TIERS.map((tier) => {
                const isActive = activeTier.range === tier.range;
                const pct = Math.round((1 - tier.price / BASE_PRICE) * 100);
                return (
                  <button
                    key={tier.range}
                    type="button"
                    onClick={() => setQty(tier.min)}
                    aria-pressed={isActive}
                    className="relative flex flex-col gap-0.5 text-left rounded-[14px] px-3.5 py-3 border bg-white active:scale-[0.98] cursor-pointer"
                    style={{
                      borderColor: isActive ? "#346739" : "#e5e7eb",
                      borderWidth: isActive ? 2 : 1,
                      backgroundColor: isActive ? "#f3fbef" : "#ffffff",
                      transition: `border-color 150ms ${EASE}, background-color 150ms ${EASE}, transform 150ms ${EASE}`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#346739] flex items-center justify-center"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "scale(1)" : "scale(0.6)",
                        transition: `opacity 150ms ${EASE}, transform 150ms ${EASE}`,
                      }}
                    >
                      <IconCheck size={12} className="text-white" />
                    </span>
                    <span className="text-[13px] font-medium text-[#212121] font-poppins">
                      {tier.range} pcs
                    </span>
                    <span className="text-[13px] text-[#616161] font-poppins tabular-nums">
                      {rupiah(tier.price)}
                      <span className="text-[#93939f]">{labels.perUnit}</span>
                    </span>
                    {pct > 0 && (
                      <span
                        className="text-[11px] font-medium font-poppins"
                        style={{ color: isActive ? "#346739" : "#93939f" }}
                      >
                        -{pct}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#93939f] font-poppins self-start">
              {labels.minOrder}
            </span>
          </div>

          {/* Hairline */}
          <div className="w-full h-px bg-[#f2f2f2]" />

          {/* Quantity */}
          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-medium text-[#93939f] font-poppins uppercase">
              {labels.quantityLabel}
            </span>
            <div className="inline-flex items-center border border-[#e5e7eb] rounded-full overflow-hidden bg-white">
              <button
                type="button"
                onClick={dec}
                aria-label={t("decreaseQuantity")}
                className="px-3 h-9 flex items-center justify-center text-[#212121] hover:bg-[#f2f2f2] active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
              >
                <IconMinus size={14} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                aria-label={labels.quantityLabel}
                value={qtyText}
                onChange={(e) => onQtyChange(e.target.value)}
                onBlur={onQtyBlur}
                style={{ width: `${Math.max(3, qtyText.length + 1)}ch` }}
                className="h-9 px-1 text-center text-sm font-medium text-[#212121] font-poppins tabular-nums bg-transparent outline-none focus:bg-[#f2f2f2] transition-colors duration-150"
              />
              <button
                type="button"
                onClick={inc}
                aria-label={t("increaseQuantity")}
                className="px-3 h-9 flex items-center justify-center text-[#212121] hover:bg-[#f2f2f2] active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
              >
                <IconPlus size={14} />
              </button>
            </div>
          </div>

          {/* Live subtotal — qty × active unit price */}
          <div className="flex items-baseline justify-between w-full">
            <span className="text-[13px] text-[#616161] font-poppins">
              {labels.subtotal}
              <span className="text-[#93939f]"> · {qty} pcs</span>
            </span>
            <span className="font-poppins text-lg font-medium text-[#212121] tabular-nums">
              {rupiah(subtotal)}
            </span>
          </div>

          {/* Single primary action: order via WhatsApp (prefilled chat) */}
          <div className="w-full">
            <TextureButton
              type="button"
              variant="primary"
              onClick={() =>
                window.open(waHref, "_blank", "noopener,noreferrer")
              }
              className="w-full h-12 rounded-full text-sm font-medium shadow-none"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <IconBrandWhatsapp size={18} />
                {labels.orderWhatsApp}
              </span>
            </TextureButton>
          </div>


        </aside>
      </div>

      <ProductImageDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        templateName={templateName}
        images={views}
        initialViewIndex={activeView}
      />
    </div>
  );
}