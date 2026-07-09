"use client";

// Intercom-style tabbed big-quote testimonial (Mobbin ref:
// https://mobbin.com/sites/sections/98ef5b23-bc77-4051-b038-2a9efc38905f),
// restyled to the Cohere tokens: soft-stone panel at the 32px layout-card
// radius, a 22px media photo card, pill-outline tabs, Poppins editorial type.

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Four voices only — couple, planner, couple, agency. The quote panel is the
// hero; more tabs would turn it back into a generic carousel.
const REVIEWS = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=900&auto=format&fit=crop",
  },
] as const;

export default function ReviewSection2() {
  const t = useTranslations("Reviews");
  const [active, setActive] = useState(0);

  const reviews = REVIEWS.map(({ id, src }) => ({
    src,
    quote: t(`r${id}Content`),
    name: t(`r${id}Author`),
    role: t(`r${id}Role`),
  }));

  const current = reviews[active];

  return (
    <section className="relative py-24 bg-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mx-auto max-w-2xl text-center font-poppins text-3xl font-normal leading-[1.2] tracking-tight text-[#212121] lg:text-5xl">
          {t("title")}
        </h2>

        {/* Pill-outline tabs — Cohere's taxonomy-filter control */}
        <div
          role="tablist"
          aria-label={t("subtitle")}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {reviews.map((review, i) => (
            <button
              key={review.name}
              type="button"
              role="tab"
              id={`review2-tab-${i}`}
              aria-selected={i === active}
              aria-controls="review2-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                // WAI-ARIA tabs: arrow keys move + activate, roving tabindex.
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const next =
                  e.key === "ArrowRight"
                    ? (i + 1) % reviews.length
                    : (i - 1 + reviews.length) % reviews.length;
                setActive(next);
                document.getElementById(`review2-tab-${next}`)?.focus();
              }}
              className={cn(
                "rounded-full border px-4 py-2 font-poppins text-[12px] uppercase transition-colors duration-200 ease-out",
                i === active
                  ? "border-transparent bg-[#346739] text-white"
                  : "border-[#d9d9dd] bg-white text-[#616161] hover:border-[#346739]/40 hover:text-[#212121]"
              )}
            >
              {review.name}
            </button>
          ))}
        </div>

        {/* Quote panel — soft-stone, 32px layout-card radius */}
        <div
          id="review2-panel"
          role="tabpanel"
          aria-labelledby={`review2-tab-${active}`}
          className="mt-8 rounded-[32px] bg-[#eeece7] p-6 md:p-12"
        >
          {/* key remount restarts the enter transition on tab change */}
          <div
            key={active}
            className="review2-quote grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-14"
          >
            {/* Media card — signature 22px radius */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] lg:aspect-[4/5]">
              <Image
                src={current.src}
                alt={current.name}
                fill
                sizes="(min-width: 1024px) 340px, 100vw"
                className="object-cover"
              />
            </div>

            <figure className="flex flex-col py-2 lg:py-4">
              <blockquote className="font-poppins text-xl font-normal leading-[1.4] text-[#212121] md:text-2xl">
                &ldquo;{current.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-10 lg:mt-auto lg:pt-10">
                <div className="font-poppins text-[14px] font-medium text-[#212121]">
                  {current.name}
                </div>
                <div className="mt-1 font-poppins text-[12px] text-[#93939f]">
                  {current.role}
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <style jsx>{`
        .review2-quote {
          animation: review2-fade 200ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes review2-fade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .review2-quote {
            animation: review2-fade 200ms ease;
          }
          @keyframes review2-fade {
            from {
              opacity: 0;
              transform: none;
            }
          }
        }
      `}</style>
    </section>
  );
}
