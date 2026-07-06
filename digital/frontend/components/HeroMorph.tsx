"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AltArrowRight, ArrowRightUp } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import CurvedMenu from "@/components/CurvedMenu";
import React from "react";

gsap.registerPlugin(ScrollTrigger);
// Ignore mobile address-bar height changes so the frozen scrub geometry doesn't fight
// the toolbar showing/hiding (same reason fisik's Hero uses this + svh units).
ScrollTrigger.config({ ignoreMobileResize: true });

// Hero video lives in R2; tiles hotlink Unsplash (CSS background, no next/image config).
const HERO_VIDEO = "https://contents.rimba.app/assets/video_rimba_hero_1.webm";
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=70`;
const PHOTOS = [
  u("1519225421980-715cb0215aed"),
  u("1511285560929-80b456fea0bc"),
  u("1465495976277-4387d4b0b4c6"),
  u("1606800052052-a08af7148866"),
  u("1519741497674-611481863552"),
  u("1522673607200-164d1b6ce486"),
  u("1583939003579-730e3918a45a"),
  u("1525258946800-98cfd641d0de"),
  u("1469371670807-013ccf25f16a"),
  u("1460978812857-470ed1c77af0"),
  u("1511795409834-ef04bbd61622"),
  u("1464366400600-7168b8af9bc3"),
];

// Run before paint on the client (kills the first-frame flash when the global
// nav switches out of flow); fall back to useEffect during SSR.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* -------------------------------------------------------------------------- */
/*  Tile model — every tile is the SAME size (one square grid cell)           */
/* -------------------------------------------------------------------------- */

type IconName = "ring" | "leaf" | "spark" | "open";

type Tile =
  | { kind: "color"; value: string; col: number; row: number; span?: number; outer?: string }
  | { kind: "image"; value: string; col: number; row: number; span?: number; outer?: string }
  | { kind: "icon"; value: IconName; col: number; row: number; span?: number; outer?: string };

// --- Desktop: 10-col grid, every tile spans 2 cols. Odd start cols (1,3,5,7,9)
// give an aligned 5-tile row; even start cols (2,4,6,8) give a half-offset 4-tile
// row that sits in the gaps. Rows 1/5 = 4 (offset), rows 2/4 = 5; caption = row 3.
// Reading order 1..18; hero video morphs into position 12 (row 4 / col 5, centred
// just below the caption).
const DESKTOP_TILES: Tile[] = [
  // Row 1 — 4 tiles, offset (1-4)
  { kind: "image", value: PHOTOS[0], col: 2, row: 1, span: 2 },
  { kind: "icon", value: "open", col: 4, row: 1, span: 2 },
  { kind: "image", value: PHOTOS[1], col: 6, row: 1, span: 2 },
  { kind: "icon", value: "spark", col: 8, row: 1, span: 2 },

  // Row 2 — 5 tiles (5-9)
  { kind: "image", value: PHOTOS[2], col: 1, row: 2, span: 2 },
  { kind: "image", value: PHOTOS[3], col: 3, row: 2, span: 2 },
  { kind: "image", value: PHOTOS[7], col: 5, row: 2, span: 2 },
  { kind: "image", value: PHOTOS[4], col: 7, row: 2, span: 2 },
  { kind: "image", value: PHOTOS[5], col: 9, row: 2, span: 2 },

  // Row 4 — 5 tiles (10-14); col 5 = hero slot / video = position 12
  { kind: "image", value: PHOTOS[6], col: 1, row: 4, span: 2 },
  { kind: "icon", value: "ring", col: 3, row: 4, span: 2 },
  { kind: "icon", value: "leaf", col: 7, row: 4, span: 2 },
  { kind: "image", value: PHOTOS[8], col: 9, row: 4, span: 2 },

  // Row 5 — 4 tiles, offset (15-18)
  { kind: "image", value: PHOTOS[9], col: 2, row: 5, span: 2 },
  { kind: "image", value: PHOTOS[10], col: 4, row: 5, span: 2 },
  { kind: "image", value: PHOTOS[11], col: 6, row: 5, span: 2 },
  { kind: "image", value: PHOTOS[0], col: 8, row: 5, span: 2 },
];
const DESKTOP_HERO = { col: 5, row: 4, span: 2 };

const PLACEHOLDER_BRANDS = ["AMARTA", "SENJA", "LARAS", "GITA", "NUSANTARA", "WANGI"];

/* -------------------------------------------------------------------------- */
/*  Hero header — Square-style transparent bar over the media.                 */
/*  Mirrors Navbar.tsx routes/links, rendered in white for the dark hero.      */
/* -------------------------------------------------------------------------- */

const HeroHeader = React.forwardRef<HTMLElement>((_, ref) => {
  const t = useTranslations("Navbar");

  const menuItems = [
    { name: t("ecosystem"), hasDropdown: false },
    { name: t("economics"), hasDropdown: true },
    { name: t("developers"), hasDropdown: false },
    { name: t("governance"), hasDropdown: true },
  ];

  return (
    <header
      ref={ref}
      className="absolute top-0 inset-x-0 z-[60] flex items-center justify-between py-6 px-6 md:px-10 w-full font-poppins"
    >
      {/* Logo — white brand mark over the video (matches fisik's hero nav) */}
      <div className="flex-1">
        <Link href="/" className="-ml-3 md:ml-0 inline-block hover:opacity-85 transition-opacity">
          <img
            src="https://contents.rimba.app/assets/rimba-logo-white.webp"
            alt="Rimba Digital"
            className="block h-16 md:h-[72px] -my-3 w-auto"
          />
        </Link>
      </div>

      {/* Center menu (desktop only) */}
      <ul className="hidden md:flex items-center gap-8 text-white font-normal text-sm">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className="cursor-pointer hover:opacity-75 transition-opacity flex items-center gap-1 group py-2"
          >
            {item.name}
            {item.hasDropdown && (
              <AltArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </li>
        ))}
      </ul>

      {/* Right side: locale dropdown + login CTA + mobile hamburger (matches fisik) */}
      <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
        <LocaleSwitcher />

        <Link
          href="/login"
          className="group/btn hidden md:flex items-center gap-2 bg-[#212121] hover:bg-[#346739] text-white text-sm font-normal rounded-full pl-2 pr-6 py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer"
        >
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/btn:rotate-[45deg] shrink-0">
            <ArrowRightUp className="w-[18px] h-[18px]" />
          </span>
          {t("login")}
        </Link>

        {/* Curved hamburger menu — mobile only */}
        <div className="md:hidden">
          <CurvedMenu buttonColor="#212121" activeButtonColor="#ffffff" />
        </div>
      </div>
    </header>
  );
});
HeroHeader.displayName = "HeroHeader";

/* -------------------------------------------------------------------------- */
/*  Thin-line doodle icons (per DESIGN.md)                                    */
/* -------------------------------------------------------------------------- */

function TileIcon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "#212121",
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-90">
      {name === "ring" && (
        <>
          <circle cx="50" cy="58" r="26" {...common} />
          <path d="M38 34 L50 18 L62 34" {...common} />
        </>
      )}
      {name === "leaf" && (
        <path d="M30 70 C30 40 60 20 78 24 C78 56 52 76 30 70 Z M30 70 L62 40" {...common} />
      )}
      {name === "spark" && (
        <path d="M50 18 L57 43 L82 50 L57 57 L50 82 L43 57 L18 50 L43 43 Z" {...common} />
      )}
      {name === "open" && (
        <>
          <rect x="24" y="30" width="52" height="40" rx="4" {...common} />
          <path d="M34 44 H66 M34 56 H54" {...common} />
        </>
      )}
    </svg>
  );
}

function TileContent({ tile }: { tile: Tile }) {
  if (tile.kind === "color") {
    const dark = tile.value === "#003c33" || tile.value === "#346739";
    return (
      <div className="w-full h-full" style={{ backgroundColor: tile.value }}>
        <div
          className="w-full h-full opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${dark ? "#ffffff" : "#212121"} 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />
      </div>
    );
  }
  if (tile.kind === "image") {
    return (
      <div
        className="w-full h-full bg-[#eeece7]"
        style={{
          backgroundImage: `url('${tile.value}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <TileIcon name={tile.value} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scattered grid (one per breakpoint)                                       */
/* -------------------------------------------------------------------------- */

function TileGrid({
  tiles,
  hero,
  columns,
  caption,
  className,
  registerTile,
  slotRef,
  captionRef,
}: {
  tiles: Tile[];
  hero: { col: number; row: number; span?: number };
  columns: number;
  caption: React.ReactNode;
  className?: string;
  registerTile: (el: HTMLDivElement | null, i: number) => void;
  slotRef: React.Ref<HTMLDivElement>;
  captionRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center md:px-12 ${className ?? ""}`}>
      {/* Mobile keeps the desktop grid at a fixed width so the viewport crops the
          edges (cards bleed off the sides); desktop fills the row. */}
      <div
        className="grid shrink-0 w-[820px] max-w-none md:w-full md:shrink gap-x-10 gap-y-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {tiles.map((tile, i) => {
          // Photos sit in a rounded card; doodle icons draw straight on the page (no card).
          const isIcon = tile.kind === "icon";
          return (
            <div
              key={i}
              className={tile.outer ?? ""}
              style={{ gridColumn: `${tile.col} / span ${tile.span ?? 1}`, gridRow: tile.row }}
            >
              <div
                ref={(el) => registerTile(el, i)}
                className={`aspect-square mx-auto w-full max-w-[118px] ${
                  isIcon ? "" : "overflow-hidden rounded-2xl border border-[#f2f2f2] shadow-sm"
                }`}
              >
                <TileContent tile={tile} />
              </div>
            </div>
          );
        })}

        {/* Empty cell (same size as every tile) the hero morphs into */}
        <div style={{ gridColumn: `${hero.col} / span ${hero.span ?? 1}`, gridRow: hero.row }}>
          <div
            ref={slotRef}
            aria-hidden
            className="aspect-square mx-auto w-full max-w-[118px] opacity-0"
          />
        </div>

        {/* Caption + arrow occupy the middle band (row 3, full span) */}
        <div
          ref={captionRef}
          style={{ gridColumn: "1 / -1", gridRow: 3 }}
          className="flex flex-col items-center justify-center px-6 py-2 text-center pointer-events-none"
        >
          {caption}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function HeroMorph() {
  const t = useTranslations("Hero");

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroHeaderRef = useRef<HTMLElement>(null);

  // Each fullscreen element exits on its own, so refs are individual.
  const overlayRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  const deskTileRefs = useRef<HTMLDivElement[]>([]);
  const deskSlotRef = useRef<HTMLDivElement>(null);
  const deskCaptionRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    const hero = heroRef.current;
    const content = contentRef.current;
    const heroHeader = heroHeaderRef.current;
    if (!container || !section || !hero || !content) return;

    const nav = document.querySelector<HTMLElement>("[data-site-nav]");

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      if (heroHeader) gsap.set(heroHeader, { autoAlpha: 0 });
      return;
    }

    const buildTimeline = (
      tiles: HTMLDivElement[],
      slot: HTMLDivElement | null,
      captionEl: HTMLDivElement | null
    ) => {
      if (!slot) return;

      // Geometry of the target slot, relative to the (pinned) section.
      const slotBox = () => {
        const s = section.getBoundingClientRect();
        const r = slot.getBoundingClientRect();
        return { top: r.top - s.top, left: r.left - s.left, width: r.width, height: r.height };
      };
      // Take the global (sticky) nav out of flow so the hero is full-bleed,
      // and hide it until the media has shrunk.
      if (nav) {
        gsap.set(nav, {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          yPercent: -120,
          autoAlpha: 0,
        });
      }

      // Full-screen starting geometry for the media card.
      gsap.set(hero, {
        top: 0,
        left: 0,
        right: "auto",
        bottom: "auto",
        width: "100%",
        height: "100%",
        borderRadius: 0,
      });
      gsap.set(content, { xPercent: -50, yPercent: -50, transformOrigin: "center center", scale: 1 });
      gsap.set(tiles, { opacity: 0, scale: 0.85, y: 16 });
      gsap.set(captionEl, { opacity: 0, y: 16 });

      // Native CSS sticky (not GSAP pin) supplies the dwell — the 200svh container
      // gives 100svh of scroll while the inner wrapper is stuck at top:0. Avoids pin's
      // snap/jump fighting (same approach as fisik's Hero).
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "hero-morph",
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // The media-card morph is the BACKBONE: a single tween that spans the whole
      // scrub (duration 1 of a ~1.5 total), so the shrink is gradual end-to-end —
      // the same "one continuous morph across the dwell" that makes fisik's hero
      // feel clean. Everything else is layered inside this window, and there's only
      // a short tail hold, so the motion never bunches up into a snap.
      tl.to(
        hero,
        {
          top: () => slotBox().top,
          left: () => slotBox().left,
          width: () => slotBox().width,
          height: () => slotBox().height,
          borderRadius: 16,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      if (heroHeader) {
        tl.to(heroHeader, { autoAlpha: 0, y: -30, duration: 0.4, ease: "power2.out" }, 0);
      }

      // Each fullscreen element exits on its own (different direction / property /
      // duration), but with opacity + transform ONLY — no per-frame filter:blur(),
      // which is expensive and stutters a scrubbed timeline. Exits use ease-out.
      tl.to(taglineRef.current, { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.out" }, 0);
      tl.to(titleRef.current, { autoAlpha: 0, y: -44, duration: 0.4, ease: "power3.out" }, 0);
      tl.to(actionsRef.current, { autoAlpha: 0, y: 32, scale: 0.94, duration: 0.35, ease: "power3.out" }, 0.05);
      tl.to(trustRef.current, { autoAlpha: 0, y: 24, duration: 0.3, ease: "power2.out" }, 0.08);
      // Readability overlay clears so the settled tile shows the clean video.
      tl.to(overlayRef.current, { autoAlpha: 0, duration: 0.5, ease: "sine.out" }, 0.1);

      // Thumbnails ease in from the centre — no overshoot, so the reveal stays calm.
      tl.to(
        tiles,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: { each: 0.02, from: "center" },
        },
        0.5
      );

      // Caption arrives as the card settles.
      tl.to(captionEl, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.62);

      // Global nav eases in once the media is small.
      if (nav) {
        tl.to(nav, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.72);
      }

      // Short dwell on the settled composition before the sticky section releases.
      tl.to({}, { duration: 0.35 });
    };

    // One grid for every breakpoint — desktop layout, cropped on mobile by the
    // overflow-hidden section (cards bleed off the sides). Same positions, just cut.
    const ctx = gsap.context(() => {
      buildTimeline(deskTileRefs.current, deskSlotRef.current, deskCaptionRef.current);
    });

    // When CurvedMenu pins <body> to lock scroll, window.scrollY reads 0 and the
    // scrubbed morph snaps back to its fullscreen start — showing through the
    // semi-transparent drawer. Freeze the scrub (keep current frame) while locked.
    const onScrollLock = (e: Event) => {
      const st = ScrollTrigger.getById("hero-morph");
      if (!st) return;
      if ((e as CustomEvent<boolean>).detail) st.disable(false);
      else st.enable();
    };
    document.addEventListener("scroll-lock", onScrollLock);

    return () => {
      document.removeEventListener("scroll-lock", onScrollLock);
      ctx.revert();
    };
  }, []);

  const captionBlock = (
    <>
      <h2 className="font-poppins font-normal text-[#212121] text-3xl md:text-5xl leading-tight tracking-[-0.5px] max-w-[340px] md:max-w-3xl">
        {t("morphCaption")}
      </h2>
    </>
  );

  return (
    <div ref={containerRef} className="relative w-full h-[200svh] bg-white font-poppins">
    <section
      ref={sectionRef}
      className="sticky top-0 w-full h-[100svh] overflow-hidden bg-white"
    >
      {/* Scattered grid — desktop layout at every size (cropped on mobile) */}
      <TileGrid
        tiles={DESKTOP_TILES}
        hero={DESKTOP_HERO}
        columns={10}
        caption={captionBlock}
        registerTile={(el, i) => {
          if (el) deskTileRefs.current[i] = el;
        }}
        slotRef={deskSlotRef}
        captionRef={deskCaptionRef}
      />

      {/* -------------------------------------------------------------- */}
      {/*  Hero media card — starts full-screen, morphs into the slot     */}
      {/* -------------------------------------------------------------- */}
      <div
        ref={heroRef}
        className="absolute inset-0 z-50 overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        {/* Full-bleed brand hero video + readability overlay */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={HERO_VIDEO}
        />
        <div ref={overlayRef} className="absolute inset-0 bg-black/40" />

        {/* Text composition — full-viewport replica that scales down (no fade) */}
        <div
          ref={contentRef}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{ width: "100vw", height: "100svh" }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span ref={taglineRef} className="font-poppins font-normal uppercase tracking-[0.28px] text-[14px] text-white/80 mb-6">
              {t("tagline")}
            </span>
            <h1 ref={titleRef} className="text-4xl md:text-6xl lg:text-[88px] font-poppins font-normal tracking-[-1.92px] leading-none text-white mb-10 max-w-5xl">
              {t("title")
                .split("\n")
                .map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i === 0 && <br />}
                  </React.Fragment>
                ))}
            </h1>
            <div ref={actionsRef} className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
              <TextureButton variant="secondary" size="lg" className="min-w-[200px] rounded-full">
                {t("primaryAction")}
              </TextureButton>
              <TextureButton size="lg" className="min-w-[200px] rounded-full">
                {t("secondaryAction")}
              </TextureButton>
            </div>
          </div>

          {/* Trust-logo strip pinned to the bottom of the full hero */}
          <div ref={trustRef} className="absolute inset-x-0 bottom-0 px-6 md:px-12 py-8 flex flex-col items-center gap-4">
            <span className="font-poppins text-[12px] text-white/60 text-center">
              {t("trustLabel")}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {PLACEHOLDER_BRANDS.map((b) => (
                <span
                  key={b}
                  className="font-poppins font-medium text-[13px] tracking-wide text-white/40"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/*  Hero header (transparent, over the media). Same routes as nav. */}
      {/* -------------------------------------------------------------- */}
      <HeroHeader ref={heroHeaderRef} />
    </section>
    </div>
  );
}
