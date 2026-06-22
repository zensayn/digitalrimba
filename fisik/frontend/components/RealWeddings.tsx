"use client";

// ─── RealWeddings ─────────────────────────────────────────────────────────────
// Social-proof "memory board" — real couples shown as polaroid keepsakes pinned
// to a wall, slightly rotated and overlapping like a wedding scrapbook. On hover
// a polaroid straightens, lifts and rises above the rest. This collage is the
// brand's keepsake idea made literal — deliberately un-template-like.
//
// Desktop (lg+): absolutely-positioned scatter via LAYOUT.
// Mobile/tablet: collapses to a tidy two-column staggered stack so it never
// turns into an unreadable pile on small screens.
//
// Sits below TemplateGallery: designs → real weddings → "how it works".
// CTA links to the full /gallery page.
//
// Design tokens: cohere/DESIGN.md — Poppins, ink #212121, primary #346739,
// body-muted #616161, soft-stone, white canvas. Motion: emil-design-eng —
// ease-out cubic-bezier(0.23, 1, 0.32, 1), play once on viewport entry.

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";

// Strong ease-out for the scroll-in reveal (emil-design-eng).
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Hover uses a spring so a polaroid feels alive as it straightens and lifts —
// interruptible, no delay, snappy on release. zIndex jumps instantly so the
// hovered photo rises above its neighbours rather than fading up.
const HOVER_SPRING = {
  type: "spring" as const,
  stiffness: 220,
  damping: 24,
  mass: 0.9,
  zIndex: { duration: 0 },
};

// Real-wedding photos. Couple + venue are proper nouns (not translated); swap
// the Unsplash placeholders for real shots by editing this array.
type Wedding = { src: string; couple: string; venue: string };

const WEDDINGS: Wedding[] = [
  {
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=900&auto=format&fit=crop",
    couple: "Dewi & Arya",
    venue: "Ubud, Bali",
  },
  {
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=900&auto=format&fit=crop",
    couple: "Sari & Bagus",
    venue: "Yogyakarta",
  },
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop",
    couple: "Maya & Rizki",
    venue: "Bandung",
  },
  {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=900&auto=format&fit=crop",
    couple: "Putri & Adit",
    venue: "Jakarta",
  },
  {
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=900&auto=format&fit=crop",
    couple: "Intan & Yoga",
    venue: "Surabaya",
  },
  {
    src: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?q=80&w=900&auto=format&fit=crop",
    couple: "Nadia & Reza",
    venue: "Lombok",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop",
    couple: "Citra & Bima",
    venue: "Semarang",
  },
  {
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=900&auto=format&fit=crop",
    couple: "Laras & Damar",
    venue: "Malang",
  },
];

// Desktop scatter — left/top are % of the collage box; rotate is the resting
// tilt; z is the stacking order. Tuned to overlap pleasingly while keeping every
// caption readable. Index-matched to WEDDINGS.
const LAYOUT = [
  // Row 1
  { left: "3%", top: "2%", width: "21%", rotate: -5, z: 12 },
  { left: "38%", top: "0%", width: "22%", rotate: 3, z: 22 },
  { left: "73%", top: "4%", width: "21%", rotate: -3, z: 14 },
  // Row 2
  { left: "14%", top: "36%", width: "21%", rotate: 4, z: 16 },
  { left: "41%", top: "39%", width: "22%", rotate: -5, z: 26 },
  { left: "69%", top: "35%", width: "21%", rotate: 3, z: 18 },
  // Row 3
  { left: "25%", top: "76%", width: "22%", rotate: -4, z: 20 },
  { left: "54%", top: "78%", width: "21%", rotate: 4, z: 17 },
] as const;

// Mobile/tablet scatter — per-photo tilt + small horizontal/vertical nudges so the
// two-column stack reads as hand-pinned rather than a regular grid. Index-matched
// to WEDDINGS. Offsets stay small so captions never collide or clip off-screen.
const MOBILE_SCATTER = [
  { rotate: -4, x: -6, y: 0 },
  { rotate: 5, x: 8, y: 28 },
  { rotate: 3, x: 7, y: 0 },
  { rotate: -6, x: -8, y: 22 },
  { rotate: -3, x: 6, y: 14 },
  { rotate: 4, x: -7, y: 38 },
  { rotate: 6, x: -5, y: 6 },
  { rotate: -5, x: 9, y: 30 },
] as const;

// One polaroid keepsake — white frame, photo, handwritten-style caption beneath.
function Polaroid({ wedding }: { wedding: Wedding }) {
  return (
    <div className="rounded-[4px] bg-white p-2.5 pb-2 shadow-[0_22px_45px_-20px_rgba(20,28,20,0.45)] transition-shadow duration-300 ease-out group-hover:shadow-[0_34px_64px_-22px_rgba(20,28,20,0.55)]">
      {/* Washi-tape accent — pins it to the board */}
      <span className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-2 rounded-[2px] bg-[#346739]/15 backdrop-blur-[1px]" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#eeece7]">
        <TemplatePreviewCard
          src={wedding.src}
          alt={`${wedding.couple} — ${wedding.venue}`}
          sizes="(min-width: 1024px) 300px, 45vw"
          className="h-full w-full"
        />
      </div>
      <figcaption className="px-1 pt-2.5 text-center font-poppins">
        <span className="block text-[14px] font-medium leading-tight text-[#212121]">
          {wedding.couple}
        </span>
        <span className="block text-[11px] uppercase text-[#9a9a93]">
          {wedding.venue}
        </span>
      </figcaption>
    </div>
  );
}

export default function RealWeddings() {
  const t = useTranslations("RealWeddings");
  const reduce = useReducedMotion();

  return (
    <section className="w-full overflow-x-clip bg-white px-6 md:px-10 pt-24 pb-32 md:pt-28 md:pb-44 flex flex-col items-center">
      <div className="w-full max-w-[1200px]">
        {/* ── Centered editorial heading ───────────────────────────────── */}
        <header className="flex flex-col items-center text-center">
          <motion.h2
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT }}
            className="font-poppins font-medium text-[#212121] mt-3 whitespace-pre-line"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            className="mt-4 max-w-md font-poppins text-[15px] text-[#616161] leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </header>

        {/* ── Desktop: scattered memory board (lg+) ────────────────────── */}
        <div className="relative mt-16 hidden lg:block h-[1280px]">
          {WEDDINGS.map((w, i) => {
            const pos = LAYOUT[i];
            return (
              <motion.figure
                key={w.couple}
                // Default transition = the hover spring (snappy in AND out, no
                // delay). The entry overrides it with its own eased timing below.
                transition={HOVER_SPRING}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, rotate: pos.rotate }}
                whileInView={
                  reduce
                    ? { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } }
                    : {
                        opacity: 1,
                        y: 0,
                        rotate: pos.rotate,
                        transition: {
                          duration: 0.7,
                          delay: Math.min(i * 0.08, 0.4),
                          ease: EASE_OUT,
                        },
                      }
                }
                whileHover={reduce ? undefined : { rotate: 0, scale: 1.04, y: -12, zIndex: 50 }}
                viewport={{ once: true, margin: "-80px" }}
                style={{ left: pos.left, top: pos.top, width: pos.width, zIndex: pos.z }}
                className="group absolute origin-center cursor-pointer [will-change:transform]"
              >
                <Polaroid wedding={w} />
              </motion.figure>
            );
          })}
        </div>

        {/* ── Mobile / tablet: hand-pinned two-column scatter ──────────── */}
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 lg:hidden">
          {WEDDINGS.map((w, i) => {
            const s = MOBILE_SCATTER[i % MOBILE_SCATTER.length];
            return (
              <motion.figure
                key={w.couple}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: 24, x: s.x, rotate: s.rotate }
                }
                whileInView={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, x: s.x, rotate: s.rotate }
                }
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: Math.min(i * 0.05, 0.25),
                  ease: EASE_OUT,
                }}
                style={{ marginTop: s.y }}
                className="group relative"
              >
                <Polaroid wedding={w} />
              </motion.figure>
            );
          })}
        </div>

      </div>
    </section>
  );
}
