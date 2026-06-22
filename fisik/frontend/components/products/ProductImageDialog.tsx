"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { CloseCircle } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";

interface ProductDialogImage {
  id: string;
  src: string;
  alt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  images: ProductDialogImage[];
  initialViewIndex?: number;
}

export default function ProductImageDialog({
  isOpen,
  onClose,
  templateName,
  images = [],
  initialViewIndex = 0,
}: Props) {
  const t = useTranslations("Products");
  const [activeIndex, setActiveIndex] = useState(initialViewIndex);
  // Second-level immersive viewer, opened by clicking the big preview.
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Synchronize active view when dialog opens with a specific preview index
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialViewIndex);
    }
  }, [isOpen, initialViewIndex]);

  // Reset the lightbox whenever the underlying dialog closes
  useEffect(() => {
    if (!isOpen) setLightboxOpen(false);
  }, [isOpen]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum swipe distance threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext(); // Swiped left → Next image
      } else {
        handlePrev(); // Swiped right → Prev image
      }
    }
    setTouchStartX(null);
  };

  // Keyboard navigation while the immersive lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "Escape") {
        // Close only the fullscreen viewer, returning to the dialog gallery.
        e.preventDefault();
        e.stopPropagation();
        setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length]);

  // Safely guard against empty or undefined images array
  if (!images || images.length === 0) {
    return null;
  }

  const currentView = images[activeIndex] || images[0];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        {/* Scrollable, adaptive max-h-[92vh] container optimized for mobile view and short screens */}
        <DialogContent
          showCloseButton={false} // Disable default close button
          // While the fullscreen lightbox is open it lives in its own portal, so
          // clicks/Escape inside it read as "outside" this dialog. Guard those so
          // closing the lightbox returns here instead of dismissing both.
          onInteractOutside={(e) => {
            if (lightboxOpen) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (lightboxOpen) e.preventDefault();
          }}
          className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl rounded-[22px] p-0 bg-white overflow-y-auto max-h-[85vh] sm:max-h-[90vh] md:max-h-[92vh] shadow-2xl border-none gap-0 transition-all ease-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[96%] data-[state=closed]:zoom-out-95 data-[state=open]:duration-240 data-[state=closed]:duration-150 data-[state=open]:ease-[cubic-bezier(0.23,1,0.32,1)] scrollbar-none"
        >
          {/* Sticky header (title + close) — stays pinned while the gallery scrolls */}
          <div className="sticky top-0 z-50 bg-white rounded-t-[22px] px-6 md:px-8 pt-5 md:pt-6 pb-3 mb-5 md:mb-6">
            {/* Custom Premium Close Button using TextureButton */}
            <DialogClose asChild>
              <TextureButton
                variant="secondary"
                size="icon"
                className="absolute top-4 right-6 md:top-5 md:right-8 z-50 w-8 h-8 md:w-9 md:h-9 rounded-full cursor-pointer hover:border-[#212121] transition-colors"
                aria-label={t("closeDialog")}
              >
                <CloseCircle size={16} weight="Bold" className="text-[#212121] md:w-[18px] md:h-[18px]" />
              </TextureButton>
            </DialogClose>

            <DialogTitle className="pr-12 font-poppins font-medium text-[#212121] text-base md:text-lg leading-tight">
              {templateName}
            </DialogTitle>
          </div>

          {/* Centered Gallery Columns - Columns wrap to rows on mobile */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-stretch px-6 md:px-8 pb-6 md:pb-8">

            {/* Left Column: Big active preview card. Stark layout (no bg, no padding, no shadows on both mobile and desktop) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-[4/5] w-full md:w-[450px] md:h-[60vh] max-h-[380px] md:max-h-[560px] bg-transparent overflow-hidden flex items-center justify-center p-0 shadow-none shrink-0 mb-8 md:mb-0"
            >

              {/* Clicking the preview opens the immersive fullscreen viewer */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={t("viewFullscreen")}
                className="relative w-full h-full md:h-full md:max-h-[92%] md:aspect-[2/3] rounded-[12px] md:rounded-[14px] overflow-hidden shadow-md md:shadow-card-lift transition-all duration-300 ease-out select-none cursor-zoom-in"
              >
                <Image
                  src={currentView.src}
                  alt={currentView.alt}
                  fill
                  sizes="(min-width: 768px) 450px, 90vw"
                  className="object-cover"
                  priority
                />
              </button>

              {/* Left Chevron Button - Positioned & sized cleanly on mobile */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label={t("previousImage")}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white border border-neutral-200/50 shadow-md flex items-center justify-center text-[#212121] hover:text-black transition-all active:scale-[0.93] cursor-pointer hover:shadow-lg"
              >
                <IconChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Right Chevron Button - Positioned & sized cleanly on mobile */}
              <button
                type="button"
                onClick={handleNext}
                aria-label={t("nextImage")}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white border border-neutral-200/50 shadow-md flex items-center justify-center text-[#212121] hover:text-black transition-all active:scale-[0.93] cursor-pointer hover:shadow-lg"
              >
                <IconChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Right Column: Thumbnail Selector Sidebar (Set width for perfect compact spacing) */}
            <div className="w-full md:w-[340px] flex flex-col gap-4 mt-6 md:mt-0 pb-8 md:pb-0">
              <h3 className="font-poppins font-medium text-xs md:text-sm text-[#212121] uppercase tracking-wider mb-2">
                {t("galleryImages")}
              </h3>

              {/* Thumbnails grid */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-1 sm:gap-x-8 sm:gap-y-2 p-3 pb-24 overflow-y-auto max-h-[440px] scrollbar-none">
                {images.map((img, i) => {
                  const isActive = activeIndex === i;
                  return (
                    <div key={img.id} className="pb-2 sm:pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        aria-label={t("viewImageNumber", { number: i + 1 })}
                        aria-current={isActive}
                        className={`relative aspect-[3/4] w-full rounded-[12px] overflow-hidden border-4 bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                          isActive ? "border-[#3B945E] scale-[1.03]" : "border-neutral-200/60 hover:border-neutral-400"
                        }`}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="100px"
                          className="object-cover"
                          priority={i < 3}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* ── Immersive fullscreen viewer (opened by clicking the big preview) ──
          Rendered as a plain portal overlay rather than a second Radix Dialog:
          two stacked modal dialogs fought over dismiss/focus, so closing this
          viewer also tore down the gallery dialog. As a portal it's fully
          independent — closing it only flips `lightboxOpen`. */}
      {lightboxOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={templateName}
            // The underlying Radix dialog sets pointer-events:none on <body>;
            // re-enable it here so the viewer's controls stay clickable.
            className="pointer-events-auto fixed inset-0 top-0 left-0 z-[10001] w-screen h-[100dvh] bg-black animate-in fade-in-0 duration-200"
          >
          {/* Top bar: Close (left) + position counter (center) */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 md:px-8 py-4 text-white">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex items-center gap-2 font-poppins text-sm md:text-base hover:opacity-80 transition-opacity active:scale-[0.97] cursor-pointer"
            >
              <IconX className="w-5 h-5" />
              {t("close")}
            </button>

            <span className="absolute left-1/2 -translate-x-1/2 font-poppins text-sm md:text-base tabular-nums select-none">
              {activeIndex + 1} / {images.length}
            </span>

            {/* Spacer keeps the counter visually centered against the Close button */}
            <span className="w-[72px]" aria-hidden="true" />
          </div>

          {/* Image — object-contain so the whole photo is visible */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 flex items-center justify-center px-4 pt-20 pb-28 md:px-16 md:py-20 select-none"
          >
            <div className="relative w-full h-full">
              <Image
                src={currentView.src}
                alt={currentView.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Desktop nav — side chevrons, vertically centered */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label={t("previousImage")}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/40 text-white items-center justify-center hover:bg-white/10 transition-all active:scale-[0.93] cursor-pointer"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={t("nextImage")}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/40 text-white items-center justify-center hover:bg-white/10 transition-all active:scale-[0.93] cursor-pointer"
          >
            <IconChevronRight className="w-6 h-6" />
          </button>

          {/* Mobile nav — larger chevrons grouped below the image */}
          <div className="md:hidden absolute bottom-8 inset-x-0 z-20 flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={t("previousImage")}
              className="w-14 h-14 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-[0.93] cursor-pointer"
            >
              <IconChevronLeft className="w-7 h-7" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={t("nextImage")}
              className="w-14 h-14 rounded-full border border-white/40 text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-[0.93] cursor-pointer"
            >
              <IconChevronRight className="w-7 h-7" />
            </button>
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
