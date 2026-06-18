"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  IconStar,
  IconMinus,
  IconPlus,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconChevronRight,
  IconChevronLeft,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";
import ProductImageDialog from "./ProductImageDialog";

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

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
  reviews: Array<{ body: string; author: string }>;
  labels: {
    ratingShort: string;
    priceTag: string;
    shippingNote: string;
    addAddress: string;
    variantsLabel: string;
    variantSimple: string;
    variantPremium: string;
    quantityLabel: string;
    oneTimePurchase: string;
    buyNow: string;
    addToCart: string;
    subscribeSave: string;
    saveBadge: string;
    save: string;
    share: string;
    description: string;
    viewMore: string;
    refundPolicy: string;
    whatsIncluded: string;
    reviewsTitle: string;
    reviewsAvg: string;
    reviewsCountFull: string;
  };
}

export default function ProductInteractive({
  templateName,
  categoryLabel,
  images,
  features,
  reviews,
  labels,
}: Props) {
  const [activeView, setActiveView] = useState(0);
  const [variant, setVariant] = useState<"simple" | "premium">("premium");
  const [qty, setQty] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState<"one" | "subscribe">("one");
  const [saved, setSaved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const reviewsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateReviewsScrollState = useCallback(() => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    updateReviewsScrollState();
    el.addEventListener("scroll", updateReviewsScrollState, { passive: true });
    const ro = new ResizeObserver(updateReviewsScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateReviewsScrollState);
      ro.disconnect();
    };
  }, [updateReviewsScrollState, reviews.length]);

  const scrollReviews = (direction: "left" | "right") => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const cardWidth = card?.offsetWidth ?? 320;
    const gap = 16;
    el.scrollBy({
      left: (cardWidth + gap) * (direction === "left" ? -1 : 1),
      behavior: "smooth",
    });
  };


  const views = images;

  const MAX_VISIBLE_THUMBNAILS = 5;
  const visibleThumbnails = views.slice(0, MAX_VISIBLE_THUMBNAILS);
  const hiddenCount = Math.max(0, views.length - MAX_VISIBLE_THUMBNAILS);

  const openOverflow = (index: number) => {
    setActiveView(index);
    setIsDialogOpen(true);
  };

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Top Section: Media preview + buy triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] gap-5 md:gap-12 items-start">
        
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
                  aria-label={isOverflowTile ? `View ${hiddenCount} more images` : `View ${i + 1}`}
                  aria-current={activeView === i}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] border"
                  style={{
                    borderColor: activeView === i ? "#346739" : "#f2f2f2",
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
              {views.map((view, i) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(i)}
                  aria-label={`View ${i + 1}`}
                  aria-current={activeView === i}
                  className="relative flex-1 aspect-[3/4] overflow-hidden rounded-[10px] border"
                  style={{
                    borderColor: activeView === i ? "#346739" : "#f2f2f2",
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
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right info panel ───────────────── */}
        <aside className="flex flex-col gap-6 w-full items-stretch md:items-start">
          
          {/* Stark Cohesive Top Section */}
          <div className="flex flex-col gap-2.5 items-center md:items-start text-center md:text-left">
            <h1
              className="font-poppins font-medium text-[#212121] leading-tight"
              style={{ fontSize: "1.75rem", letterSpacing: "-0.015em" }}
            >
              {templateName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[12.5px] font-poppins text-[#616161] mt-0.5">
              <span>{categoryLabel}</span>
              <span className="text-[#d9d9dd] select-none">•</span>
              <div className="flex items-center gap-1">
                <IconStar
                  size={14}
                  className="text-[#346739] fill-[#346739]"
                />
                <span className="text-[12px] text-[#1863dc] underline underline-offset-2 cursor-pointer font-medium">
                  {labels.ratingShort}
                </span>
              </div>
            </div>
            <span className="font-poppins text-3xl font-medium text-[#212121] mt-1.5">
              {labels.priceTag}
            </span>
          </div>

          {/* Premium Cohesive Shipping Card */}
          <div className="w-full max-w-[340px] md:max-w-none mx-auto md:mx-0 bg-[#fafafa] border border-[#e5e7eb] rounded-[14px] p-3 flex flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">📦</span>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-[#93939f] font-poppins uppercase tracking-wider leading-none mb-0.5">Pengiriman</span>
                <span className="text-[12px] font-medium text-[#616161] leading-tight">{labels.shippingNote}</span>
              </div>
            </div>
            <button
              type="button"
              className="text-[12px] text-[#1863dc] hover:text-[#1452b8] hover:underline shrink-0 font-medium font-poppins cursor-pointer"
            >
              {labels.addAddress}
            </button>
          </div>

          {/* Full-width Variant Selector Card */}
          <div className="flex flex-col gap-2.5 items-center md:items-start w-full max-w-[340px] md:max-w-none mx-auto md:mx-0">
            <span className="text-[12px] font-medium text-[#93939f] font-poppins uppercase tracking-wider leading-none">
              Pilih Variasi: <span className="text-[#212121] font-semibold uppercase">{variant === "simple" ? labels.variantSimple : labels.variantPremium}</span>
            </span>
            <div className="flex justify-center md:justify-start gap-2.5 w-full">
              {[
                { id: "simple" as const, label: labels.variantSimple },
                { id: "premium" as const, label: labels.variantPremium },
              ].map((v) => {
                const isActive = variant === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(v.id)}
                    className="flex-1 md:flex-initial text-center px-5 py-2.5 rounded-full text-sm font-medium border active:scale-[0.97] transition-all cursor-pointer"
                    style={{
                      borderColor: isActive ? "#346739" : "#e5e7eb",
                      background: isActive ? "#346739" : "#ffffff",
                      color: isActive ? "#ffffff" : "#212121",
                      boxShadow: isActive ? "0 4px 12px rgba(52,103,57,0.12)" : "none",
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium Row-based Quantity Picker */}
          <div className="flex items-center justify-between w-full max-w-[340px] md:max-w-none mx-auto md:mx-0 border-t border-b border-[#f2f2f2] py-3.5">
            <span className="text-sm font-medium text-[#212121] font-poppins uppercase tracking-wider text-[12px] text-[#93939f]">
              {labels.quantityLabel}
            </span>
            <div className="inline-flex items-center border border-[#e5e7eb] rounded-full overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                onClick={dec}
                aria-label="Decrease quantity"
                className="px-3 h-9 flex items-center justify-center text-[#212121] hover:bg-[#f2f2f2] active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
              >
                <IconMinus size={14} />
              </button>
              <span
                role="status"
                aria-live="polite"
                className="min-w-[44px] text-center text-sm font-medium text-[#212121] font-poppins"
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={inc}
                aria-label="Increase quantity"
                className="px-3 h-9 flex items-center justify-center text-[#212121] hover:bg-[#f2f2f2] active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
              >
                <IconPlus size={14} />
              </button>
            </div>
          </div>

          <div className="w-full max-w-full md:max-w-none flex flex-col gap-3 bg-white border border-[#e5e7eb] rounded-[18px] p-4">
            <button
              type="button"
              onClick={() => setPurchaseMode("one")}
              className="flex items-start justify-between text-left rounded-[8px]"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#212121]">
                  {labels.oneTimePurchase}
                </span>
                <span className="text-sm text-[#212121]">{labels.priceTag}</span>
              </div>
              <RadioDot selected={purchaseMode === "one"} />
            </button>

            {purchaseMode === "one" && (
              <div className="flex gap-2">
                <TextureButton
                  type="button"
                  variant="dark"
                  className="flex-1 h-12 rounded-full text-sm font-medium"
                >
                  {labels.buyNow}
                </TextureButton>
                <TextureButton
                  type="button"
                  variant="primary"
                  className="flex-1 h-12 rounded-full text-sm font-medium shadow-none"
                >
                  {labels.addToCart}
                </TextureButton>
              </div>
            )}

            <div className="h-px bg-[#f2f2f2] -mx-4" />

            <button
              type="button"
              onClick={() => setPurchaseMode("subscribe")}
              className="flex items-start justify-between text-left rounded-[8px]"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#212121] flex items-center gap-2">
                  {labels.subscribeSave}
                  <span className="text-[10px] font-bold uppercase bg-[#edfce9] text-[#346739] px-2 py-0.5 rounded-full">
                    {labels.saveBadge}
                  </span>
                </span>
                <span className="text-sm text-[#212121] flex items-center gap-2">
                  <span>{labels.priceTag}</span>
                  <span className="text-[#93939f] line-through">{labels.priceTag}</span>
                </span>
              </div>
              <RadioDot selected={purchaseMode === "subscribe"} />
            </button>

            {purchaseMode === "subscribe" && (
              <TextureButton
                type="button"
                variant="primary"
                className="w-full h-12 rounded-full text-sm font-medium shadow-none"
              >
                {labels.subscribeSave}
              </TextureButton>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <TextureButton
              type="button"
              variant="secondary"
              onClick={() => setSaved((s) => !s)}
              aria-pressed={saved}
              className="h-11 rounded-full text-sm font-medium"
            >
              {saved ? (
                <IconHeartFilled size={16} className="text-[#ff7759]" />
              ) : (
                <IconHeart size={16} />
              )}
              {labels.save}
            </TextureButton>
            <TextureButton
              type="button"
              variant="secondary"
              className="h-11 rounded-full text-sm font-medium"
            >
              <IconShare size={16} />
              {labels.share}
            </TextureButton>
          </div>

          <p className="text-[13px] text-[#616161] leading-relaxed pb-4 text-center md:text-left">
            {labels.description}
            <button
              type="button"
              className="ml-1 text-[#1863dc] hover:underline font-medium"
            >
              {labels.viewMore}
            </button>
          </p>

          <button
            type="button"
            className="inline-flex items-center w-fit mx-auto md:mx-0 gap-1.5 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-white text-[12px] text-[#212121] hover:border-[#212121] transition-colors duration-200"
          >
            <span aria-hidden="true">📄</span>
            {labels.refundPolicy}
            <IconChevronRight size={12} />
          </button>
        </aside>
      </div>

      {/* ─── What's included strip ────────────────────────────────── */}
      <section className="border-t border-[#f2f2f2] bg-white pt-12 md:pt-16">
        <div className="w-full">
          <h2
            className="font-poppins font-medium text-[#212121] mb-8"
            style={{ fontSize: "1.5rem", letterSpacing: "-0.015em" }}
          >
            {labels.whatsIncluded}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feat, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#edfce9] rounded-full border border-[#346739]/15 flex items-center justify-center text-[#346739] shrink-0 mt-0.5">
                  <IconCheck size={12} />
                </span>
                <span className="text-sm text-[#616161] leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Reviews ──────────────────────────────────────────────── */}
      <section className="border-t border-b-4 border-[#f2f2f2] bg-[#fafafa] rounded-[24px] -mx-6 md:-mx-10 px-6 md:px-10 py-12 md:py-16">
        <div className="w-full">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2
                className="font-poppins font-medium text-[#212121] mb-2"
                style={{ fontSize: "1.75rem", letterSpacing: "-0.015em" }}
              >
                {labels.reviewsTitle}
              </h2>
              <div className="flex items-baseline gap-3">
                <span
                  className="font-poppins font-medium text-[#212121]"
                  style={{ fontSize: "2.25rem", letterSpacing: "-0.02em" }}
                >
                  {labels.reviewsAvg}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar
                      key={i}
                      size={14}
                      className="text-[#346739] fill-[#346739]"
                    />
                  ))}
                </div>
                <span className="text-sm text-[#93939f]">{labels.reviewsCountFull}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollReviews("left")}
                aria-label="Scroll left"
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center text-[#212121] hover:border-[#212121] hover:bg-neutral-50 active:scale-[0.97] transition-[opacity,border-color,background-color,transform] duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollReviews("right")}
                aria-label="Scroll right"
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center text-[#212121] hover:border-[#212121] hover:bg-neutral-50 active:scale-[0.97] transition-[opacity,border-color,background-color,transform] duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={reviewsTrackRef}
            className="overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0 scroll-pl-6 md:scroll-pl-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex gap-4 pb-4">
              {reviews.map((r, i) => (
                <article
                  key={i}
                  data-review-card
                  className="bg-white border border-[#f2f2f2] rounded-[22px] p-6 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)] snap-start shrink-0 w-[85vw] sm:w-[45vw] md:w-[350px] lg:w-[380px]"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <IconStar
                        key={j}
                        size={12}
                        className="text-[#346739] fill-[#346739]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[#212121] leading-relaxed">
                    {r.body}
                  </p>
                  <span className="text-xs text-[#93939f] mt-auto">{r.author}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

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

interface RadioProps {
  selected: boolean;
}

function RadioDot({ selected }: RadioProps) {
  return (
    <span
      aria-hidden="true"
      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
      style={{
        borderColor: selected ? "#346739" : "#d9d9dd",
        transition: `border-color 200ms ${EASE}`,
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full bg-[#346739]"
        style={{
          opacity: selected ? 1 : 0,
          transform: selected ? "scale(1)" : "scale(0.4)",
          transition: `opacity 180ms ${EASE}, transform 180ms ${EASE}`,
        }}
      />
    </span>
  );
}