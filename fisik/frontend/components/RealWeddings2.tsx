"use client";

// ─── RealWeddings2 ────────────────────────────────────────────────────────────
// Social-proof photo collage — Readymag inspired (Mobbin ref:
// https://mobbin.com/sites/sections/fbdeae79-9c95-4a76-bba0-8efa93b731b2).
//
// A dense collage of straight-edged wedding photos in mixed sizes scattered
// across a deep-green band, with the statement headline sitting in the middle
// of the field. Hovering a photo lifts it and reveals the couple + venue.
// Pure display — no gallery route. Mounted ABOVE RealWeddings (polaroid board)
// so the two can be compared.
//
// Desktop (lg+): absolutely-positioned collage via LAYOUT.
// Mobile/tablet: two/three-column masonry (CSS columns) under the headline.
//
// Design tokens: cohere/DESIGN.md — dark-feature-band deep-green #003c33,
// white text, muted white/60, 8px small-media radius, Poppins ≤ Medium.
// Motion: emil-design-eng — transform/opacity only, strong ease-out entry,
// short stagger, hover gated to fine pointers, reduced-motion honoured.

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

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
  {
    src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=900&auto=format&fit=crop",
    couple: "Ayu & Fajar",
    venue: "Seminyak, Bali",
  },
  {
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=900&auto=format&fit=crop",
    couple: "Rani & Dimas",
    venue: "Bogor",
  },
  {
    src: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop",
    couple: "Tiara & Galih",
    venue: "Solo",
  },
  {
    src: "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?q=80&w=900&auto=format&fit=crop",
    couple: "Mega & Satria",
    venue: "Medan",
  },
];

// Desktop collage — left/top are % of the collage box, width is % too.
// Straight edges, mixed sizes, slight overlaps; the middle band stays clearer
// so the headline reads. Index-matched to WEDDINGS.
const LAYOUT = [
  // Top row — dense, slightly overlapping, bleeding past both edges
  { left: "-2%", top: "0%", width: "18%", aspect: "3 / 4", z: 12 },
  { left: "14%", top: "9%", width: "14%", aspect: "1 / 1", z: 16 },
  { left: "26%", top: "-3%", width: "22%", aspect: "4 / 3", z: 10 },
  { left: "46%", top: "7%", width: "13%", aspect: "3 / 4", z: 18 },
  { left: "57%", top: "-2%", width: "17%", aspect: "3 / 4", z: 12 },
  { left: "78%", top: "6%", width: "22%", aspect: "4 / 3", z: 10 },
  // Middle flanks — the centre stays open for the headline
  { left: "-3%", top: "36%", width: "23%", aspect: "4 / 3", z: 12 },
  { left: "80%", top: "34%", width: "19%", aspect: "3 / 4", z: 14 },
  // Bottom row
  { left: "1%", top: "63%", width: "16%", aspect: "3 / 4", z: 14 },
  { left: "19%", top: "70%", width: "26%", aspect: "4 / 3", z: 18 },
  { left: "47%", top: "74%", width: "14%", aspect: "1 / 1", z: 16 },
  { left: "63%", top: "62%", width: "19%", aspect: "3 / 4", z: 10 },
] as const;

// One collage photo — straight edges, 8px radius, hover lifts it above the
// field and fades in the couple + venue caption.
function CollagePhoto({
  wedding,
  className = "",
  style,
}: {
  wedding: Wedding;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`group relative overflow-hidden rounded-[8px] bg-[#0a4a40] ${className}`}
    >
      <TemplatePreviewCard
        src={wedding.src}
        alt={`${wedding.couple} — ${wedding.venue}`}
        sizes="(min-width: 1024px) 280px, 45vw"
        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      {/* Caption scrim — hidden until hover on fine pointers, always readable
          size when it shows; static on touch (no hover = no caption, the
          collage stays purely visual there). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-[#00201b]/90 to-transparent p-3 pt-8 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <span className="block truncate font-poppins text-[13px] font-medium leading-tight text-white">
          {wedding.couple}
        </span>
        <span className="mt-0.5 block truncate font-poppins text-[11px] uppercase text-white/60">
          {wedding.venue}
        </span>
      </div>
    </div>
  );
}

export default function RealWeddings2() {
  const t = useTranslations("RealWeddings");
  const reduce = useReducedMotion();

  const headline = (
    <>
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="font-poppins font-medium text-white whitespace-pre-line"
        style={{
          fontSize: "clamp(1.9rem, 4vw, 3rem)",
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
        }}
      >
        {t("title")}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
        className="mx-auto mt-4 max-w-md font-poppins text-[15px] leading-relaxed text-white/60"
      >
        {t("subtitle")}
      </motion.p>
    </>
  );

  return (
    <section className="w-full overflow-x-clip bg-[#003c33] px-6 py-24 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[1240px]">
        {/* ── Desktop: collage field with the headline in the middle ────── */}
        <div className="relative hidden lg:block" style={{ aspectRatio: "1240 / 860" }}>
          {/* Only as many photos as have layout slots — an unmatched edit to
              either array must not crash the render. */}
          {WEDDINGS.slice(0, LAYOUT.length).map((w, i) => {
            const pos = LAYOUT[i];
            return (
              <motion.figure
                key={w.couple}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: Math.min(i * 0.06, 0.45),
                  ease: EASE_OUT,
                }}
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  zIndex: pos.z,
                }}
                className="absolute [will-change:transform] hover:z-40"
              >
                <CollagePhoto wedding={w} style={{ aspectRatio: pos.aspect }} />
              </motion.figure>
            );
          })}

          {/* Statement headline — sits inside the photo field */}
          <div className="absolute left-1/2 top-[42%] z-20 w-full max-w-xl -translate-x-1/2 text-center">
            {headline}
          </div>
        </div>

        {/* ── Mobile / tablet: headline, then tight masonry ─────────────── */}
        <div className="lg:hidden">
          <header className="text-center">{headline}</header>
          <div className="mt-10 columns-2 gap-3 sm:columns-3">
            {WEDDINGS.map((w, i) => (
              <motion.figure
                key={w.couple}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min((i % 4) * 0.05, 0.2),
                  ease: EASE_OUT,
                }}
                className="mb-3 break-inside-avoid"
              >
                <CollagePhoto
                  wedding={w}
                  className={
                    i % 3 === 0
                      ? "aspect-[3/4]"
                      : i % 3 === 1
                        ? "aspect-square"
                        : "aspect-[4/3]"
                  }
                />
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
