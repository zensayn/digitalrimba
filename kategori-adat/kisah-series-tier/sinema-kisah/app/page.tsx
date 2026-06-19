"use client";

import { useEffect, useRef, useState } from "react";
import { useInvitationConfig } from "@/components/RimbaConfigProvider";
import MusicPlayer from "@/components/MusicPlayer";
import ChapterIndicator from "@/components/ChapterIndicator";

import ChapterCoverSlide from "@/components/slides/ChapterCoverSlide";
import GreetingSlide from "@/components/slides/GreetingSlide";
import CoupleSlide from "@/components/slides/CoupleSlide";
import LoveStorySlide from "@/components/slides/LoveStorySlide";
import EventSlide from "@/components/slides/EventSlide";
import GallerySlide from "@/components/slides/GallerySlide";
import RSVPSlide from "@/components/slides/RSVPSlide";
import GiftClosingSlide from "@/components/slides/GiftClosingSlide";

const TOTAL_SLIDES = 13;

const CHAPTERS = [
  { numeral: "I" as const,   title: "Pembukaan",   slides: [0, 1] },
  { numeral: "II" as const,  title: "Mereka",       slides: [2, 3] },
  { numeral: "III" as const, title: "Kisah Cinta",  slides: [4, 5] },
  { numeral: "IV" as const,  title: "Hari Itu",     slides: [6, 7, 8] },
  { numeral: "V" as const,   title: "Selamanya",    slides: [9, 10, 11, 12] },
];

function useHorizontalScrollController() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let locked = false;
    let lockTimer: ReturnType<typeof setTimeout>;
    let prevDelta = 0;
    let wheelResetTimer: ReturnType<typeof setTimeout>;

    const goto = (next: number) => {
      if (locked) return;
      const clamped = Math.max(0, Math.min(next, TOTAL_SLIDES - 1));
      if (clamped === slideRef.current) return;
      locked = true;
      slideRef.current = clamped;
      setCurrentSlide(clamped);
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { locked = false; }, 900);
    };

    const onWheel = (e: WheelEvent) => {
      let el = e.target as Element | null;
      while (el && el !== container) {
        if (el.getAttribute("data-prevent-snap") === "true") return;
        el = el.parentElement;
      }
      e.preventDefault();

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const absDelta = Math.abs(delta);
      const prevAbs = Math.abs(prevDelta);

      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { prevDelta = 0; }, 150);
      prevDelta = delta;

      if (locked) return;
      if (prevAbs > 0 && absDelta <= prevAbs) return;
      goto(slideRef.current + (delta > 0 ? 1 : -1));
    };

    let x0 = 0, y0 = 0, touchStartSlide = 0, isTouchActive = false;

    const onTouchStart = (e: TouchEvent) => {
      let el = e.target as Element | null;
      while (el && el !== container) {
        if (el.getAttribute("data-prevent-snap") === "true") return;
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      touchStartSlide = slideRef.current;
      isTouchActive = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouchActive) return;
      isTouchActive = false;
      const dx = x0 - e.changedTouches[0].clientX;
      const dy = y0 - e.changedTouches[0].clientY;
      if (Math.abs(dy) > Math.abs(dx) * 0.7) return;
      if (Math.abs(dx) < 40) return;
      goto(touchStartSlide + (dx > 0 ? 1 : -1));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); goto(slideRef.current + 1); }
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   { e.preventDefault(); goto(slideRef.current - 1); }
    };

    container.addEventListener("wheel",      onWheel,      { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend",   onTouchEnd,   { passive: true });
    document.addEventListener("keydown",     onKey);

    return () => {
      container.removeEventListener("wheel",      onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend",   onTouchEnd);
      document.removeEventListener("keydown",     onKey);
      clearTimeout(lockTimer);
      clearTimeout(wheelResetTimer);
    };
  }, []);

  return { currentSlide, containerRef };
}

function InvitationContent() {
  const config = useInvitationConfig();
  const { currentSlide, containerRef } = useHorizontalScrollController();
  const [guestName, setGuestName] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("to");
    if (name) setGuestName(name);
  }, []);

  const coverImages: (string | null)[] = [
    config.couple.groom.photo,
    config.couple.bride.photo,
    config.loveStory[0]?.image ?? null,
    config.gallery[0]?.src ?? null,
    config.gallery[1]?.src ?? null,
  ];

  const renderSlide = (index: number) => {
    switch (index) {
      case 0:
        return (
          <ChapterCoverSlide
            numeral="I"
            title="Pembukaan"
            coverImage={coverImages[0]}
            isActive={currentSlide === 0}
          />
        );
      case 1:
        return <GreetingSlide guestName={guestName} />;
      case 2:
        return (
          <ChapterCoverSlide
            numeral="II"
            title="Mereka"
            coverImage={coverImages[1]}
            isActive={currentSlide === 2}
          />
        );
      case 3:
        return <CoupleSlide />;
      case 4:
        return (
          <ChapterCoverSlide
            numeral="III"
            title="Kisah Cinta"
            coverImage={coverImages[2]}
            isActive={currentSlide === 4}
          />
        );
      case 5:
        return <LoveStorySlide />;
      case 6:
        return (
          <ChapterCoverSlide
            numeral="IV"
            title="Hari Itu"
            coverImage={coverImages[3]}
            isActive={currentSlide === 6}
          />
        );
      case 7:
        return <EventSlide event={config.events.akad}    index={0} sectionId="akad" />;
      case 8:
        return <EventSlide event={config.events.resepsi} index={1} sectionId="resepsi" />;
      case 9:
        return (
          <ChapterCoverSlide
            numeral="V"
            title="Selamanya"
            coverImage={coverImages[4]}
            isActive={currentSlide === 9}
          />
        );
      case 10:
        return <GallerySlide />;
      case 11:
        return <RSVPSlide />;
      case 12:
        return <GiftClosingSlide />;
      default:
        return null;
    }
  };

  return (
    <>
      <MusicPlayer />

      <div className="slide-viewport">
        <div
          ref={containerRef}
          className="slide-container"
          style={{
            width: `${TOTAL_SLIDES * 100}vw`,
            transform: `translateX(-${currentSlide * 100}vw)`,
            transition: "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <div key={i} style={{ width: "100vw", height: "100dvh", flexShrink: 0, overflow: "hidden", position: "relative" }}>
              {renderSlide(i)}
            </div>
          ))}
        </div>
      </div>

      <ChapterIndicator chapters={CHAPTERS} currentSlide={currentSlide} />
    </>
  );
}

export default function Page() {
  return <InvitationContent />;
}
