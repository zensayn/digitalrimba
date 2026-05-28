"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { CloseCircle } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";

interface MockProductImage {
  id: string;
  src: string;
  alt: string;
  rotate: number;
  scale: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  images: MockProductImage[];
  initialViewIndex?: number;
}

export default function ProductImageDialog({
  isOpen,
  onClose,
  templateName,
  images = [],
  initialViewIndex = 0,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(initialViewIndex);

  // Synchronize active view when dialog opens with a specific preview index
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialViewIndex);
    }
  }, [isOpen, initialViewIndex]);

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

  // Safely guard against empty or undefined images array
  if (!images || images.length === 0) {
    return null;
  }

  const currentView = images[activeIndex] || images[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Scrollable, adaptive max-h-[92vh] container optimized for mobile view and short screens */}
      <DialogContent 
        showCloseButton={false} // Disable default close button
        className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl rounded-[22px] p-4 md:p-6 bg-white overflow-y-auto max-h-[92vh] shadow-2xl border-none gap-0 transition-all ease-out duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[96%] data-[state=closed]:zoom-out-95 data-[state=open]:duration-240 data-[state=closed]:duration-150 data-[state=open]:ease-[cubic-bezier(0.23,1,0.32,1)] scrollbar-none"
      >
        {/* Custom Premium Close Button using TextureButton */}
        <DialogClose asChild>
          <TextureButton
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 md:top-4 md:right-4 z-50 w-8 h-8 md:w-9 md:h-9 rounded-full cursor-pointer hover:border-[#212121] transition-colors"
            aria-label="Close dialog"
          >
            <CloseCircle size={16} weight="Bold" className="text-[#212121] md:w-[18px] md:h-[18px]" />
          </TextureButton>
        </DialogClose>
        
        {/* Header containing the Title */}
        <div className="pr-12 mb-4 md:mb-5 border-b border-neutral-100 pb-3">
          <DialogTitle className="font-poppins font-medium text-[#212121] text-base md:text-lg leading-tight">
            {templateName}
          </DialogTitle>
        </div>

        {/* Centered Gallery Columns - Columns wrap to rows on mobile */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 justify-center items-stretch">
          
          {/* Left Column: Big active preview card. Stark layout (no bg, no padding, no shadows on both mobile and desktop) */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-[4/5] w-full md:w-[450px] md:h-[60vh] max-h-[380px] md:max-h-[560px] bg-transparent overflow-hidden flex items-center justify-center p-0 shadow-none shrink-0"
          >
            
            <div 
              className="relative w-full h-full md:h-full md:max-h-[92%] md:aspect-[2/3] rounded-[12px] md:rounded-[14px] overflow-hidden shadow-md md:shadow-card-lift transition-all duration-300 ease-out select-none"
            >
              <Image 
                src={currentView.src} 
                alt={currentView.alt} 
                fill 
                sizes="(min-width: 768px) 450px, 90vw"
                className="object-cover" 
                priority
              />
            </div>

            {/* Left Chevron Button - Positioned & sized cleanly on mobile */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous view"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white border border-neutral-200/50 shadow-md flex items-center justify-center text-[#212121] hover:text-black transition-all active:scale-[0.93] cursor-pointer hover:shadow-lg"
            >
              <IconChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Right Chevron Button - Positioned & sized cleanly on mobile */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next view"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white border border-neutral-200/50 shadow-md flex items-center justify-center text-[#212121] hover:text-black transition-all active:scale-[0.93] cursor-pointer hover:shadow-lg"
            >
              <IconChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Right Column: Thumbnail Selector Sidebar (Set width for perfect compact spacing) */}
          <div className="w-full md:w-[320px] flex flex-col gap-3 md:gap-4 pb-2 md:pb-0">
            <h3 className="font-poppins font-medium text-xs md:text-sm text-[#212121] uppercase tracking-wider">
              Gambar Barang
            </h3>
            
            {/* Thumbnails grid */}
            <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[420px] pr-1 scrollbar-none">
              {images.map((img, i) => {
                const isActive = activeIndex === i;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`View item image ${i + 1}`}
                    aria-current={isActive}
                    className={`relative aspect-[3/4] w-full rounded-[12px] overflow-hidden border-2 bg-neutral-50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${
                      isActive ? "border-[#346739]" : "border-neutral-100 hover:border-neutral-300"
                    }`}
                  >
                    <div 
                      className="absolute inset-0 p-1.5 flex items-center justify-center"
                    >
                      <div className="relative w-full h-full rounded-[6px] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                        <Image 
                          src={img.src} 
                          alt={img.alt} 
                          fill 
                          sizes="100px"
                          className="object-cover" 
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
