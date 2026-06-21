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
const SNAP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const SNAP_DURATION = "680ms";
const SNAP_TRANSITION = `transform ${SNAP_DURATION} ${SNAP_EASING}`;
const LOCK_MS = 900;
const DRAG_THRESHOLD = 40;     // min px to commit a swipe
const FLICK_VELOCITY = 0.35;   // px/ms — flick overrides distance threshold
const RUBBER_BAND = 0.22;      // resistance factor at edge

const CHAPTERS = [
  { numeral: "I"   as const, title: "Pembukaan",  slides: [0, 1] },
  { numeral: "II"  as const, title: "Mereka",      slides: [2, 3] },
  { numeral: "III" as const, title: "Kisah Cinta", slides: [4, 5] },
  { numeral: "IV"  as const, title: "Hari Itu",    slides: [6, 7, 8] },
  { numeral: "V"   as const, title: "Selamanya",   slides: [9, 10, 11, 12] },
];

function useHorizontalScrollController() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef    = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // ── Helpers ────────────────────────────────────────────────────────────
    const setTransform = (px: number, animate: boolean) => {
      el.style.transition = animate ? SNAP_TRANSITION : "none";
      el.style.transform  = `translateX(${px}px)`;
    };

    const slideToX = (idx: number) => -(idx * window.innerWidth);

    const commit = (target: number) => {
      const clamped = Math.max(0, Math.min(target, TOTAL_SLIDES - 1));
      slideRef.current = clamped;
      setCurrentSlide(clamped);
      setTransform(slideToX(clamped), true);
    };

    // Init
    setTransform(0, false);

    let locked = false;
    let lockTimer: ReturnType<typeof setTimeout>;

    const lock = () => {
      locked = true;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { locked = false; }, LOCK_MS);
    };

    const tryGoto = (next: number) => {
      if (locked) return;
      const clamped = Math.max(0, Math.min(next, TOTAL_SLIDES - 1));
      if (clamped === slideRef.current) return;
      lock();
      commit(clamped);
    };

    // ── Wheel ──────────────────────────────────────────────────────────────
    let prevDelta = 0;
    let wheelResetTimer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      const isH = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isH ? e.deltaX : e.deltaY;

      let node = e.target as Element | null;
      while (node && node !== el) {
        if (node.getAttribute("data-prevent-snap") === "true") {
          if (!isH) return;
          break;
        }
        node = node.parentElement;
      }

      e.preventDefault();

      const abs = Math.abs(delta);
      const prevAbs = Math.abs(prevDelta);
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { prevDelta = 0; }, 150);
      prevDelta = delta;

      if (locked) return;
      if (prevAbs > 0 && abs <= prevAbs) return;
      tryGoto(slideRef.current + (delta > 0 ? 1 : -1));
    };

    // ── Touch — live drag ──────────────────────────────────────────────────
    let x0 = 0, y0 = 0, startSlide = 0;
    let dragActive  = false;   // committed to horizontal drag
    let movedAtAll  = false;
    let velX        = 0;
    let lastT       = 0;
    let lastX       = 0;

    const onTouchStart = (e: TouchEvent) => {
      x0         = e.touches[0].clientX;
      y0         = e.touches[0].clientY;
      startSlide = slideRef.current;
      dragActive = false;
      movedAtAll = false;
      velX       = 0;
      lastT      = e.timeStamp;
      lastX      = x0;
      // Kill any in-flight animation immediately so the next frame shows
      // the exact current visual position (no jump).
      const current = new DOMMatrix(getComputedStyle(el).transform).m41;
      el.style.transition = "none";
      el.style.transform  = `translateX(${current}px)`;
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - x0;
      const dy = e.touches[0].clientY - y0;

      // Velocity tracking (px / ms)
      const now = e.timeStamp;
      if (now > lastT) {
        velX  = (e.touches[0].clientX - lastX) / (now - lastT);
        lastT = now;
        lastX = e.touches[0].clientX;
      }

      movedAtAll = true;

      if (!dragActive) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;            // dead zone
        if (Math.abs(dy) > Math.abs(dx) * 0.85) return;              // clearly vertical — let scroll happen
        dragActive = true;
      }

      e.preventDefault(); // own horizontal drag — stop page scroll

      // Rubber-band resistance beyond first/last slide
      const raw = slideToX(startSlide) + dx;
      const minX = slideToX(TOTAL_SLIDES - 1);
      const maxX = 0;
      const clamped =
        raw > maxX ? maxX + (raw - maxX) * RUBBER_BAND :
        raw < minX ? minX + (raw - minX) * RUBBER_BAND :
        raw;

      el.style.transform = `translateX(${clamped}px)`;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!movedAtAll || !dragActive) return;
      dragActive = false;

      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;

      // Vertical-dominant swipe — snap back without navigating
      if (Math.abs(dy) > Math.abs(dx) * 0.85) {
        setTransform(slideToX(slideRef.current), true);
        return;
      }

      const isFlick = Math.abs(velX) > FLICK_VELOCITY;
      if (Math.abs(dx) < DRAG_THRESHOLD && !isFlick) {
        setTransform(slideToX(slideRef.current), true);
        return;
      }

      // Negative dx = swiped left = go forward
      const direction = (dx < 0 || (isFlick && velX < 0)) ? 1 : -1;
      const target = Math.max(0, Math.min(TOTAL_SLIDES - 1, startSlide + direction));

      if (target === slideRef.current) {
        setTransform(slideToX(slideRef.current), true);
        return;
      }

      lock();
      commit(target);
    };

    // ── Keyboard ───────────────────────────────────────────────────────────
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); tryGoto(slideRef.current + 1); }
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   { e.preventDefault(); tryGoto(slideRef.current - 1); }
    };

    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    document.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
      document.removeEventListener("keydown", onKey);
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
      case 0:  return <ChapterCoverSlide numeral="I"   title="Pembukaan"  coverImage={coverImages[0]} isActive={currentSlide === 0} />;
      case 1:  return <GreetingSlide guestName={guestName} />;
      case 2:  return <ChapterCoverSlide numeral="II"  title="Mereka"      coverImage={coverImages[1]} isActive={currentSlide === 2} />;
      case 3:  return <CoupleSlide />;
      case 4:  return <ChapterCoverSlide numeral="III" title="Kisah Cinta" coverImage={coverImages[2]} isActive={currentSlide === 4} />;
      case 5:  return <LoveStorySlide />;
      case 6:  return <ChapterCoverSlide numeral="IV"  title="Hari Itu"    coverImage={coverImages[3]} isActive={currentSlide === 6} />;
      case 7:  return <EventSlide event={config.events.akad}    index={0} sectionId="akad" />;
      case 8:  return <EventSlide event={config.events.resepsi} index={1} sectionId="resepsi" />;
      case 9:  return <ChapterCoverSlide numeral="V"   title="Selamanya"   coverImage={coverImages[4]} isActive={currentSlide === 9} />;
      case 10: return <GallerySlide />;
      case 11: return <RSVPSlide />;
      case 12: return <GiftClosingSlide />;
      default: return null;
    }
  };

  return (
    <>
      <MusicPlayer />

      <div className="slide-viewport">
        <div
          ref={containerRef}
          className="slide-container"
          style={{ width: `${TOTAL_SLIDES * 100}vw` }}
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
