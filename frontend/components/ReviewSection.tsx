"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { IconQuote } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

// ─── ReviewCard ───────────────────────────────────────────────────────────────
type Review = {
  id: number;
  logoText: string;
  content: string;
  author: string;
  role: string;
  avatar: string;
  color: string;
  linkType?: "story" | "gallery";
};

function ReviewCard({
  review,
  readStoryLabel,
  visitWeddingLabel,
}: {
  review: Review;
  readStoryLabel: string;
  visitWeddingLabel: string;
}) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-[22px] border border-[#d9d9dd] transition-[border-color,box-shadow] duration-300 hover:border-[#346739]/40 hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)] flex flex-col gap-5 justify-between group cursor-default">
      <div className="flex items-center justify-between">
        <span className="font-poppins text-[10px] font-bold tracking-widest text-[#212121] uppercase">
          {review.logoText}
        </span>
        <IconQuote
          className={`w-5 h-5 ${review.color} opacity-60 transition-transform duration-300 group-hover:scale-110`}
        />
      </div>

      <p className="font-poppins text-sm leading-relaxed text-[#616161] font-normal italic">
        &ldquo;{review.content}&rdquo;
      </p>

      {review.linkType && (
        <div className="text-xs font-semibold text-[#346739] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200 cursor-pointer mb-1">
          <span>
            {review.linkType === "story" ? readStoryLabel : visitWeddingLabel}
          </span>
          <span className="text-xs">→</span>
        </div>
      )}

      <div className="w-full h-px bg-[#d9d9dd]/50" />

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.avatar}
          alt={review.author}
          width={40}
          height={40}
          loading="eager"
          decoding="async"
          className="w-10 h-10 rounded-full object-cover border border-[#e5e7eb] transition-transform duration-300 group-hover:scale-105"
        />
        <div className="flex flex-col">
          <span className="font-poppins text-xs font-semibold text-[#212121]">
            {review.author}
          </span>
          <span className="font-poppins text-[9px] sm:text-[10px] text-[#93939f] font-medium uppercase tracking-wider mt-0.5">
            {review.role}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Marquee column ───────────────────────────────────────────────────────────
// One column = duplicate cards stacked vertically + a WAAPI animation that
// translates by the EXACT pixel height of one set (cards + gaps including the
// trailing gap that bridges into the duplicate). This avoids the half-gap
// snap that translateY(-50%) introduces.

const SCROLL_DURATION_MS = 38000;
const SCROLL_DURATION_MS_REVERSE = 44000;

// Strong ease-out for pause/resume LERP (Emil's design principles)
const LERP_FACTOR = 0.06;

function MarqueeColumn({
  reviews,
  direction,
  readStoryLabel,
  visitWeddingLabel,
  className = "",
}: {
  reviews: Review[];
  direction: "up" | "down";
  readStoryLabel: string;
  visitWeddingLabel: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return;

    let animation: Animation | null = null;
    let rafId: number | null = null;
    let targetSpeed = 1;
    let currentSpeed = 1;
    let cancelled = false;

    // Wait for all images to load so heights are stable before we measure
    const images = Array.from(track.querySelectorAll("img"));
    const imagesReady = Promise.all(
      images.map((img) =>
        img.complete && img.naturalHeight !== 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
      )
    );

    // Compute the exact pixel offset of the duplicate set's first card
    const measureDistance = (): number => {
      const children = Array.from(track.children) as HTMLElement[];
      const half = children.length / 2;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.rowGap || styles.gap || "0");

      let distance = 0;
      for (let i = 0; i < half; i++) {
        // card height + the gap that follows it (gap also bridges first card of duplicate)
        distance += children[i].offsetHeight + gap;
      }
      return distance;
    };

    const startAnimation = (distance: number) => {
      if (cancelled) return;
      if (animation) animation.cancel();

      const duration =
        direction === "up" ? SCROLL_DURATION_MS : SCROLL_DURATION_MS_REVERSE;

      const keyframes =
        direction === "up"
          ? [
              { transform: "translate3d(0, 0, 0)" },
              { transform: `translate3d(0, ${-distance}px, 0)` },
            ]
          : [
              { transform: `translate3d(0, ${-distance}px, 0)` },
              { transform: "translate3d(0, 0, 0)" },
            ];

      animation = track.animate(keyframes, {
        duration,
        iterations: Infinity,
        easing: "linear",
        // Stay running even if the page is hidden so we don't appear stalled on tab focus
        composite: "replace",
      });
      animation.playbackRate = currentSpeed;
    };

    // Debounce resize-driven restarts so the loop doesn't get cancelled mid-frame
    let resizeTimer: number | null = null;
    const scheduleResize = () => {
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const distance = measureDistance();
        if (distance > 0) startAnimation(distance);
      }, 120);
    };

    // Smooth pause/resume via LERP on playbackRate (under 300ms perceived,
    // hardware-accelerated since we only manipulate playback)
    const tick = () => {
      if (cancelled || !animation) return;
      const diff = targetSpeed - currentSpeed;
      if (Math.abs(diff) > 0.001) {
        currentSpeed += diff * LERP_FACTOR;
        animation.playbackRate = currentSpeed;
        rafId = requestAnimationFrame(tick);
      } else {
        currentSpeed = targetSpeed;
        animation.playbackRate = currentSpeed;
        rafId = null;
      }
    };

    const handleEnter = () => {
      targetSpeed = 0;
      if (rafId == null) rafId = requestAnimationFrame(tick);
    };
    const handleLeave = () => {
      targetSpeed = 1;
      if (rafId == null) rafId = requestAnimationFrame(tick);
    };

    wrapper.addEventListener("mouseenter", handleEnter);
    wrapper.addEventListener("mouseleave", handleLeave);

    // Recalculate distance on resize so the loop stays seamless. Debounced
    // so a stream of resize events doesn't constantly reset the animation.
    const resizeObserver = new ResizeObserver(scheduleResize);

    imagesReady.then(() => {
      if (cancelled) return;
      const distance = measureDistance();
      if (distance > 0) startAnimation(distance);
      resizeObserver.observe(track);
    });

    return () => {
      cancelled = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      if (animation) animation.cancel();
      resizeObserver.disconnect();
      wrapper.removeEventListener("mouseenter", handleEnter);
      wrapper.removeEventListener("mouseleave", handleLeave);
    };
  }, [direction]);

  return (
    <div ref={wrapperRef} className={`flex flex-col overflow-hidden h-full ${className}`}>
      <div
        ref={trackRef}
        className="flex flex-col gap-6 will-change-transform [backface-visibility:hidden] [transform:translateZ(0)]"
      >
        {[...reviews, ...reviews].map((review, idx) => (
          <ReviewCard
            key={`${review.id}-${idx}`}
            review={review}
            readStoryLabel={readStoryLabel}
            visitWeddingLabel={visitWeddingLabel}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ReviewSection ────────────────────────────────────────────────────────────
export default function ReviewSection() {
  const t = useTranslations("Reviews");
  const easeOutStrong = [0.23, 1, 0.32, 1] as const;

  const reviews: Review[] = [
    {
      id: 1,
      logoText: "HEARTWOOD SERIES",
      content: t("r1Content"),
      author: t("r1Author"),
      role: t("r1Role"),
      avatar:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#346739]",
      linkType: "story",
    },
    {
      id: 2,
      logoText: "WEDDING PLANNER",
      content: t("r2Content"),
      author: t("r2Author"),
      role: t("r2Role"),
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#ff7759]",
      linkType: "gallery",
    },
    {
      id: 3,
      logoText: "LEAF SERIES",
      content: t("r3Content"),
      author: t("r3Author"),
      role: t("r3Role"),
      avatar:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#1863dc]",
      linkType: "story",
    },
    {
      id: 4,
      logoText: "EVENT ORGANIZER",
      content: t("r4Content"),
      author: t("r4Author"),
      role: t("r4Role"),
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#9b60aa]",
    },
    {
      id: 5,
      logoText: "TIMBER SERIES",
      content: t("r5Content"),
      author: t("r5Author"),
      role: t("r5Role"),
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#ff7759]",
      linkType: "gallery",
    },
    {
      id: 6,
      logoText: "ELYSIAN AGENCY",
      content: t("r6Content"),
      author: t("r6Author"),
      role: t("r6Role"),
      avatar:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#346739]",
    },
    {
      id: 7,
      logoText: "CREATIVE DIRECTOR",
      content: t("r7Content"),
      author: t("r7Author"),
      role: t("r7Role"),
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#1863dc]",
      linkType: "story",
    },
    {
      id: 8,
      logoText: "MODERNIST BRIDE",
      content: t("r8Content"),
      author: t("r8Author"),
      role: t("r8Role"),
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#9b60aa]",
    },
    {
      id: 9,
      logoText: "LUXURY WEDDINGS",
      content: t("r9Content"),
      author: t("r9Author"),
      role: t("r9Role"),
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
      color: "text-[#346739]",
      linkType: "gallery",
    },
  ];

  const col1 = [reviews[0], reviews[1], reviews[2]];
  const col2 = [reviews[3], reviews[4], reviews[5]];
  const col3 = [reviews[6], reviews[7], reviews[8]];

  const readStoryLabel = t("readStory");
  const visitWeddingLabel = t("visitWedding");

  return (
    <section className="w-full py-24 sm:py-32 px-6 md:px-10 overflow-hidden relative">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <header className="mb-16 text-center max-w-2xl mx-auto flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOutStrong }}
            className="text-md font-regular text-[#346739] uppercase mb-3 font-poppins"
          >
            {t("tagline")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOutStrong }}
            className="font-poppins text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.03em] text-[#212121]"
          >
            {t("title")}
          </motion.h2>
        </header>

        {/* Carousel viewport */}
        <div className="relative h-[660px] w-full overflow-hidden rounded-[24px]">
          {/* Edge fades */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-white via-white/80 to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
            <MarqueeColumn
              reviews={col1}
              direction="up"
              readStoryLabel={readStoryLabel}
              visitWeddingLabel={visitWeddingLabel}
            />
            <MarqueeColumn
              reviews={col2}
              direction="down"
              readStoryLabel={readStoryLabel}
              visitWeddingLabel={visitWeddingLabel}
              className="hidden md:flex"
            />
            <MarqueeColumn
              reviews={col3}
              direction="up"
              readStoryLabel={readStoryLabel}
              visitWeddingLabel={visitWeddingLabel}
              className="hidden lg:flex"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
