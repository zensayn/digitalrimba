"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { IconChevronRight } from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";
import React from "react";

gsap.registerPlugin(ScrollTrigger);

// Run before paint on the client (kills the first-frame flash when the global
// nav switches out of flow); fall back to useEffect during SSR.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* -------------------------------------------------------------------------- */
/*  Tile model — every tile is the SAME size (one square grid cell)           */
/* -------------------------------------------------------------------------- */

type IconName = "ring" | "leaf" | "spark" | "open";

type Tile =
  | { kind: "color"; value: string; col: number; row: number; outer?: string }
  | { kind: "image"; value: string; col: number; row: number; outer?: string }
  | { kind: "icon"; value: IconName; col: number; row: number; outer?: string };

// --- Desktop layout (5 columns), scattered like the reference. The caption
// occupies row 3 (full span); the hero media morphs into row 4 / col 3.
const DESKTOP_TILES: Tile[] = [
  // Row 1 — top cluster (col 3 left open)
  { kind: "icon", value: "leaf", col: 1, row: 1 },
  { kind: "image", value: "/Element3d/1.png", col: 2, row: 1 },
  { kind: "image", value: "/Element3d/2.png", col: 4, row: 1 },
  { kind: "icon", value: "spark", col: 5, row: 1 },

  // Row 2 — full band
  { kind: "image", value: "/Element3d/3.png", col: 1, row: 2 },
  { kind: "icon", value: "open", col: 2, row: 2 },
  { kind: "image", value: "/Element3d/4.png", col: 3, row: 2 },
  { kind: "image", value: "/Element3d/1.png", col: 4, row: 2 },
  { kind: "image", value: "/Element3d/2.png", col: 5, row: 2 },

  // Row 4 — bottom cluster (col 3 = hero slot)
  { kind: "icon", value: "ring", col: 1, row: 4 },
  { kind: "image", value: "/Element3d/2.png", col: 2, row: 4 },
  { kind: "icon", value: "leaf", col: 4, row: 4 },
  { kind: "image", value: "/Element3d/3.png", col: 5, row: 4 },

  // Row 5 — partially clipped tail
  { kind: "image", value: "/Element3d/4.png", col: 2, row: 5 },
  { kind: "image", value: "/Element3d/1.png", col: 3, row: 5 },
  { kind: "icon", value: "spark", col: 4, row: 5 },
];
const DESKTOP_HERO = { col: 3, row: 4 };

// --- Mobile layout (3 columns), sparser. Edge tiles bleed off-screen via the
// outer wrapper translate. Hero morphs into row 2 / col 2 (centred, prominent).
const MOBILE_TILES: Tile[] = [
  // Row 1
  { kind: "image", value: "/Element3d/1.png", col: 2, row: 1 },
  { kind: "image", value: "/Element3d/2.png", col: 3, row: 1, outer: "translate-x-[35%]" },

  // Row 2 (col 2 = hero slot)
  { kind: "icon", value: "open", col: 1, row: 2, outer: "-translate-x-[40%]" },
  { kind: "image", value: "/Element3d/3.png", col: 3, row: 2, outer: "translate-x-[40%]" },

  // Row 4
  { kind: "image", value: "/Element3d/4.png", col: 1, row: 4, outer: "-translate-x-[35%]" },
  { kind: "image", value: "/Element3d/1.png", col: 2, row: 4 },
  { kind: "icon", value: "spark", col: 3, row: 4, outer: "translate-x-[35%]" },

  // Row 5
  { kind: "icon", value: "ring", col: 1, row: 5 },
  { kind: "image", value: "/Element3d/2.png", col: 2, row: 5 },
];
const MOBILE_HERO = { col: 2, row: 2 };

const PLACEHOLDER_BRANDS = ["AMARTA", "SENJA", "LARAS", "GITA", "NUSANTARA", "WANGI"];

/* -------------------------------------------------------------------------- */
/*  Hero header — Square-style transparent bar over the media.                 */
/*  Mirrors Navbar.tsx routes/links, rendered in white for the dark hero.      */
/* -------------------------------------------------------------------------- */

const HeroHeader = React.forwardRef<HTMLElement>((_, ref) => {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const menuItems = [
    { name: t("ecosystem"), hasDropdown: false },
    { name: t("economics"), hasDropdown: true },
    { name: t("developers"), hasDropdown: false },
    { name: t("governance"), hasDropdown: true },
  ];

  return (
    <header
      ref={ref}
      className="absolute top-0 inset-x-0 z-[60] flex items-center justify-between py-4 px-6 md:px-10 w-full font-poppins"
    >
      {/* Logo */}
      <Link href="/" className="flex-1 flex items-center gap-4">
        <span className="font-poppins font-bold tracking-tight text-xl text-white">
          RIMBA DIGITAL
        </span>
      </Link>

      {/* Center menu */}
      <ul className="hidden md:flex items-center gap-8 text-white/80 font-poppins font-normal text-[12px] lowercase">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className="cursor-pointer hover:text-white transition-colors flex items-center gap-1 group"
          >
            {item.name}
            {item.hasDropdown && (
              <IconChevronRight className="w-3 h-3 transition-transform group-hover:rotate-90" />
            )}
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="flex-1 flex justify-end items-center gap-6">
        <div className="flex items-center gap-2 text-white/50 font-poppins font-bold text-[10px] uppercase">
          <button
            onClick={() => handleLocaleChange("id")}
            className={`hover:text-white transition-colors ${locale === "id" ? "text-white underline underline-offset-4" : ""}`}
          >
            ID
          </button>
          <span>/</span>
          <button
            onClick={() => handleLocaleChange("en")}
            className={`hover:text-white transition-colors ${locale === "en" ? "text-white underline underline-offset-4" : ""}`}
          >
            EN
          </button>
        </div>

        <TextureButton variant="secondary" size="sm" className="hidden md:flex rounded-full">
          {t("login")}
        </TextureButton>
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
    <svg viewBox="0 0 100 100" className="w-1/2 h-1/2 opacity-80">
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
    <div className="w-full h-full bg-white flex items-center justify-center">
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
  hero: { col: number; row: number };
  columns: number;
  caption: React.ReactNode;
  className?: string;
  registerTile: (el: HTMLDivElement | null, i: number) => void;
  slotRef: React.Ref<HTMLDivElement>;
  captionRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center px-4 ${className ?? ""}`}>
      <div
        className="grid w-full max-w-[1100px] gap-x-4 gap-y-6 md:gap-6"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={tile.outer ?? ""}
            style={{ gridColumn: tile.col, gridRow: tile.row }}
          >
            <div
              ref={(el) => registerTile(el, i)}
              className="aspect-square overflow-hidden rounded-2xl border border-[#f2f2f2] shadow-sm"
            >
              <TileContent tile={tile} />
            </div>
          </div>
        ))}

        {/* Empty cell (same size as every tile) the hero morphs into */}
        <div style={{ gridColumn: hero.col, gridRow: hero.row }}>
          <div ref={slotRef} aria-hidden className="aspect-square opacity-0" />
        </div>

        {/* Caption + arrow occupy the middle band (row 3, full span) */}
        <div
          ref={captionRef}
          style={{ gridColumn: "1 / -1", gridRow: 3 }}
          className="flex flex-col items-center justify-center px-6 py-8 text-center pointer-events-none"
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

  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroHeaderRef = useRef<HTMLElement>(null);

  const deskTileRefs = useRef<HTMLDivElement[]>([]);
  const deskSlotRef = useRef<HTMLDivElement>(null);
  const deskCaptionRef = useRef<HTMLDivElement>(null);

  const mobTileRefs = useRef<HTMLDivElement[]>([]);
  const mobSlotRef = useRef<HTMLDivElement>(null);
  const mobCaptionRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const hero = heroRef.current;
    const content = contentRef.current;
    const heroHeader = heroHeaderRef.current;
    if (!section || !hero || !content) return;

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
      const shrinkRatio = () => slotBox().width / section.getBoundingClientRect().width;

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
      gsap.set(tiles, { opacity: 0, scale: 0.6, y: 24 });
      gsap.set(captionEl, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=2200",
          scrub: 1.5, // higher scrub smoothing → no snap on the way back
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      });

      if (heroHeader) {
        tl.to(heroHeader, { autoAlpha: 0, y: -30, duration: 0.5, ease: "power1.inOut" }, 0);
      }

      // Media card morphs from full-screen down into the uniform slot.
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

      // Text scales down in lock-step with the card — no opacity fade.
      tl.to(content, { scale: () => shrinkRatio(), duration: 1, ease: "power2.inOut" }, 0);

      // Surrounding thumbnails pop in from the centre outward.
      tl.to(
        tiles,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.4)",
          stagger: { each: 0.025, from: "center" },
        },
        0.4
      );

      // Caption + arrow arrive.
      tl.to(captionEl, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.65);

      // Global nav eases in once the media is small.
      if (nav) {
        tl.to(nav, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, 0.8);
      }
    };

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      buildTimeline(deskTileRefs.current, deskSlotRef.current, deskCaptionRef.current);
    });
    mm.add("(max-width: 767px)", () => {
      buildTimeline(mobTileRefs.current, mobSlotRef.current, mobCaptionRef.current);
    });

    return () => mm.revert();
  }, []);

  const captionBlock = (
    <>
      <h2 className="font-poppins font-normal text-[#212121] text-2xl md:text-4xl leading-tight tracking-[-0.5px] max-w-xl">
        {t("morphCaption")}
      </h2>
      <svg
        viewBox="0 0 120 90"
        className="mt-5 w-16 h-12 md:w-20 md:h-16 text-[#212121]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M95 8 C70 24 40 36 22 78" />
        <path d="M10 56 L22 80 L44 70" />
      </svg>
    </>
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-white font-poppins"
    >
      {/* Desktop scattered grid */}
      <TileGrid
        className="hidden md:flex"
        tiles={DESKTOP_TILES}
        hero={DESKTOP_HERO}
        columns={5}
        caption={captionBlock}
        registerTile={(el, i) => {
          if (el) deskTileRefs.current[i] = el;
        }}
        slotRef={deskSlotRef}
        captionRef={deskCaptionRef}
      />

      {/* Mobile scattered grid */}
      <TileGrid
        className="flex md:hidden"
        tiles={MOBILE_TILES}
        hero={MOBILE_HERO}
        columns={3}
        caption={captionBlock}
        registerTile={(el, i) => {
          if (el) mobTileRefs.current[i] = el;
        }}
        slotRef={mobSlotRef}
        captionRef={mobCaptionRef}
      />

      {/* -------------------------------------------------------------- */}
      {/*  Hero media card — starts full-screen, morphs into the slot     */}
      {/* -------------------------------------------------------------- */}
      <div
        ref={heroRef}
        className="absolute inset-0 z-50 overflow-hidden border border-[#f2f2f2]"
        style={{ borderRadius: 0 }}
      >
        {/* Media field (gradient stands in for the brand hero video) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003c33] via-[#346739] to-[#212121]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute inset-0 bg-black/25" />

        {/* Text composition — full-viewport replica that scales down (no fade) */}
        <div
          ref={contentRef}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{ width: "100vw", height: "100vh" }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="font-poppins font-normal uppercase tracking-[0.28px] text-[14px] text-white/80 mb-6">
              {t("tagline")}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-[88px] font-poppins font-normal tracking-[-1.92px] leading-none text-white mb-10 max-w-5xl">
              {t("title")
                .split("\n")
                .map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i === 0 && <br />}
                  </React.Fragment>
                ))}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
              <TextureButton variant="secondary" size="lg" className="min-w-[200px] rounded-full">
                {t("primaryAction")}
              </TextureButton>
              <TextureButton size="lg" className="min-w-[200px] rounded-full">
                {t("secondaryAction")}
              </TextureButton>
            </div>
          </div>

          {/* Trust-logo strip pinned to the bottom of the full hero */}
          <div className="absolute inset-x-0 bottom-0 px-6 md:px-12 py-8 flex flex-col items-center gap-4">
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
  );
}
