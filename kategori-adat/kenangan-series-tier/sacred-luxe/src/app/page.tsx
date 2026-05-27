"use client";

import { useEffect, useRef, useState } from "react";

import CoverSection from "@/components/sections/CoverSection";
import GreetingSection from "@/components/sections/GreetingSection";
import CoupleSection from "@/components/sections/CoupleSection";
import LoveStorySection from "@/components/sections/LoveStorySection";
import EventSection from "@/components/sections/EventSection";
import DressCodeSection from "@/components/sections/DressCodeSection";
import GallerySection from "@/components/sections/GallerySection";
import RSVPSection from "@/components/sections/RSVPSection";
import GiftSection from "@/components/sections/GiftSection";
import ClosingSection from "@/components/sections/ClosingSection";
import MusicPlayer from "@/components/MusicPlayer";
import { events } from "@/data/invitation";

// ─── Smooth scroll with easeOutQuint easing ──────────────────────────────────
function smoothScrollTo(container: HTMLElement, targetY: number, onDone?: () => void) {
  const startY = container.scrollTop;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) { onDone?.(); return; }

  const duration = 680;
  const startTime = performance.now();
  // easeOutCubic: starts fast, decelerates — lebih natural untuk swipe
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  let raf: number;
  const tick = (now: number) => {
    const t = Math.min((now - startTime) / duration, 1);
    container.scrollTop = startY + delta * ease(t);
    if (t < 1) { raf = requestAnimationFrame(tick); }
    else { container.scrollTop = targetY; onDone?.(); }
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// ─── Scroll controller ────────────────────────────────────────────────────────
function useScrollController(sectionIds: string[]) {
  const idxRef = useRef(0);

  useEffect(() => {
    const container = document.querySelector(".snap-container") as HTMLElement | null;
    if (!container) return;

    let locked = false;
    let cancelPrev: (() => void) | undefined;
    let lockTimer: ReturnType<typeof setTimeout> | undefined;

    // Keep idxRef in sync via IntersectionObserver
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = sectionIds.findIndex((id) => id === (entry.target as HTMLElement).id);
            if (i !== -1) idxRef.current = i;
          }
        }
      },
      { root: container, threshold: 0.55 }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    const goto = (next: number, force = false) => {
      if (locked) return;
      const clamped = Math.max(0, Math.min(next, sectionIds.length - 1));
      if (!force && clamped === idxRef.current) return;

      locked = true;
      idxRef.current = clamped;
      cancelPrev?.();
      clearTimeout(lockTimer);

      const targetY = clamped * container.clientHeight;
      cancelPrev = smoothScrollTo(container, targetY, () => {
        locked = false;
        clearTimeout(lockTimer);
      }) ?? undefined;

      // Safety unlock in case animation is interrupted
      lockTimer = setTimeout(() => { locked = false; }, 800);
    };

    // ── Wheel (desktop) ──────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      let el = e.target as Element | null;
      while (el && el !== container) {
        if (el.getAttribute("data-prevent-snap") === "true") {
          e.preventDefault();
          return;
        }
        el = el.parentElement;
      }
      e.preventDefault();
      goto(idxRef.current + (e.deltaY > 0 ? 1 : -1));
    };

    // ── Touch (mobile) ───────────────────────────────────────────────────────
    let y0 = 0, x0 = 0;
    let scrollTop0 = 0;
    let isTouchDragging = false;
    let touchStartIdx = 0; // snapshot saat touch mulai, bukan idxRef yang bisa berubah di tengah drag

    const onTouchStart = (e: TouchEvent) => {
      let el = e.target as Element | null;
      while (el && el !== container) {
        if (el.getAttribute("data-prevent-snap") === "true") return;
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }

      y0 = e.touches[0].clientY;
      x0 = e.touches[0].clientX;
      scrollTop0 = container.scrollTop;
      touchStartIdx = idxRef.current;
      isTouchDragging = true;
      cancelPrev?.();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchDragging) return;
      const dy = y0 - e.touches[0].clientY;
      const dx = x0 - e.touches[0].clientX;
      // Skip if swipe is more horizontal than vertical (carousel sections)
      if (Math.abs(dx) >= Math.abs(dy) * 0.7) {
        isTouchDragging = false;
        return;
      }
      e.preventDefault();
      container.scrollTop = scrollTop0 + dy;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouchDragging) return;
      isTouchDragging = false;

      const dy = y0 - e.changedTouches[0].clientY;
      const dx = x0 - e.changedTouches[0].clientX;
      if (Math.abs(dx) >= Math.abs(dy) * 0.7) return;

      if (Math.abs(dy) < 40) {
        // Swipe terlalu pendek — snap balik ke section asal
        goto(touchStartIdx, true);
        return;
      }
      // Pakai touchStartIdx bukan idxRef.current — IO bisa sudah update idxRef di tengah drag
      goto(touchStartIdx + (dy > 0 ? 1 : -1), true);
    };

    // ── Keyboard ─────────────────────────────────────────────────────────────
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goto(idxRef.current + 1); }
      if (e.key === "ArrowUp"   || e.key === "PageUp")   { e.preventDefault(); goto(idxRef.current - 1); }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("keydown", onKey);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      io.disconnect();
      cancelPrev?.();
      container.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onKey);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [sectionIds]);

  return idxRef;
}

// ─────────────────────────────────────────────────────────────────────────────

const SECTION_IDS = [
  "cover", "greeting", "couple", "lovestory",
  "akad", "resepsi", "dresscode",
  "gallery", "rsvp", "gift", "closing",
];

function InvitationContent() {
  const [guestName, setGuestName] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("to");
    if (name) setGuestName(name);
  }, []);

  useScrollController(SECTION_IDS);

  return (
    <>
      <MusicPlayer />

      <div className="snap-container">
        <CoverSection />
        <GreetingSection guestName={guestName} />
        <CoupleSection />
        <LoveStorySection />
        <EventSection event={events.akad} index={0} sectionId="akad" />
        <EventSection event={events.resepsi} index={1} sectionId="resepsi" />
        <DressCodeSection />
        <GallerySection />
        <RSVPSection />
        <GiftSection />
        <ClosingSection />
      </div>
    </>
  );
}

export default function Page() {
  return <InvitationContent />;
}
