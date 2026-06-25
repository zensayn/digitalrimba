"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRightUp, AltArrowRight, LetterOpened, WindowFrame, CrownStar } from "@solar-icons/react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { TextureButton } from "@/components/ui/texture-button";
import CurvedMenu from "@/components/CurvedMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Mobile browsers resize the viewport as the address bar hides/shows during
// scroll. Left unhandled, that fires ScrollTrigger refreshes mid-scroll and the
// hero morph jumps. `ignoreMobileResize` makes ScrollTrigger disregard those
// toolbar-driven height changes so the transition stays smooth on mobile.
ScrollTrigger.config({ ignoreMobileResize: true });


// Strong ease-out curve per Emil's design principles
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

// ─── HeroNavbar (in-flow only — sticky/morph header lives in Header.tsx) ─────
function HeroNavbar() {
  const t = useTranslations("Navbar");
  const [productsHovered, setProductsHovered] = useState(false);

  const menuItems = [
    { name: t("ecosystem"), href: "/products", hasDropdown: true, isProducts: true },
    { name: t("exclusiveOrder"), href: "/exclusive-order", hasDropdown: false },
    { name: t("governance"), href: "/about", hasDropdown: false },
  ];

  return (
    <nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-10">
      {/* Logo */}
      <div className="flex-1">
        <Link href="/" className="-ml-3 md:ml-0 inline-block hover:opacity-85 transition-opacity">
          <Image
            src="https://contents.rimba.app/assets/rimba-logo-white.webp"
            alt="Rimba Fisik"
            width={569}
            height={320}
            priority
            className="block h-16 md:h-[72px] -my-3 w-auto"
          />
        </Link>
      </div>

      {/* Center menu (desktop only) */}
      <ul className="hidden md:flex items-center gap-8 text-white font-normal text-sm">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className="relative"
            onMouseEnter={() => item.isProducts && setProductsHovered(true)}
            onMouseLeave={() => item.isProducts && setProductsHovered(false)}
          >
            {item.isProducts ? (
              <div className="cursor-pointer hover:opacity-75 transition-opacity flex items-center gap-1 group py-2">
                <span>{item.name}</span>
                {item.hasDropdown && (
                  <AltArrowRight className={`w-4 h-4 transition-transform duration-200 ${productsHovered ? 'rotate-90 text-[#346739]' : 'group-hover:translate-x-0.5'}`} />
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group py-2"
              >
                {item.name}
                {item.hasDropdown && (
                  <AltArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            )}

            {item.isProducts && (
              <AnimatePresence>
                {productsHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[340px] bg-white border border-neutral-200/80 shadow-xl rounded-2xl p-4 z-[99999] flex flex-col gap-2"
                  >
                    {/* Physical Option */}
                    <Link
                      href="/products"
                      className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                      onClick={() => setProductsHovered(false)}
                    >
                      <div className="bg-[#346739]/10 p-2 rounded-lg text-[#346739] group-hover/item:bg-[#346739]/20 transition-colors shrink-0">
                        <LetterOpened className="w-5 h-5" weight="BoldDuotone" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm text-neutral-800 flex items-center gap-1 group-hover/item:text-[#346739] transition-colors">
                          {t("productFisikTitle")}
                          <AltArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                        </span>
                        <span className="text-[11px] leading-relaxed text-neutral-500 font-normal">
                          {t("productFisikDesc")}
                        </span>
                      </div>
                    </Link>

                    {/* Digital Option */}
                    <Link
                      href="https://rimba-digital.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                      onClick={() => setProductsHovered(false)}
                    >
                      <div className="bg-sky-500/10 p-2 rounded-lg text-sky-500 group-hover/item:bg-sky-500/20 transition-colors shrink-0">
                        <WindowFrame className="w-5 h-5" weight="BoldDuotone" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm text-neutral-800 flex items-center gap-1 group-hover/item:text-sky-500 transition-colors">
                          {t("productDigitalTitle")}
                          <AltArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                        </span>
                        <span className="text-[11px] leading-relaxed text-neutral-500 font-normal">
                          {t("productDigitalDesc")}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </li>
        ))}
      </ul>

      {/* Right CTA + locale + mobile hamburger */}
      <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
        <div className="hidden md:block">
          <LocaleSwitcher />
        </div>
        {/* Curved hamburger menu — mobile only */}
        <div className="md:hidden">
          <CurvedMenu buttonColor="#ffffff" activeButtonColor="#212121" />
        </div>
      </div>
    </nav>
  );
}



// ─── BottomRightCorner ────────────────────────────────────────────────────────
function BottomRightCorner() {
  return (
    <Link href="/products">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute bottom-0 right-0 p-3 pt-5 pl-8 sm:p-4 sm:pt-6 sm:pl-10 md:p-6 md:pt-8 md:pl-14 bg-white rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center gap-3 sm:gap-4 md:gap-6 cursor-pointer hover:opacity-95 transition-opacity"
      >
        {/* Top intersection mask */}
        <div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3.5rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#ffffff" />
          </svg>
        </div>

        {/* Left intersection mask */}
        <div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3.5rem] w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#ffffff" />
          </svg>
        </div>

        <div className="bg-[#346739]/10 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-[#346739]/20">
          <ArrowRightUp className="w-5 h-5 md:w-6 md:h-6 text-[#346739]" />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[16px] md:text-[20px] font-normal text-[#212121]">
            Katalog Desain
          </span>
          <div className="flex items-center gap-1 text-[#212121]/60 hover:text-[#346739] transition-colors">
            <span className="text-[12px] md:text-[15px] font-normal">Jelajahi seri</span>
            <AltArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const t = useTranslations("Hero");
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add({
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)"
      }, (context) => {
        // @ts-ignore
        const { isDesktop } = context.conditions;

        const tl = gsap.timeline({
          scrollTrigger: {
            // The dwell is native CSS `position: sticky`, NOT a GSAP pin. The
            // hero holds at the top (handled by the browser compositor) while
            // the container scrolls through its extra height, and GSAP only
            // scrubs the inset morph. Because GSAP never sets `position: fixed`
            // and never touches the scroll position, there's nothing to fight
            // the native overscroll — so no snap/jump in either direction, even
            // on aggressive flicks. The container is 200vh, so the morph runs
            // over the first 100vh of scroll (the sticky dwell) and completes
            // exactly as the hero releases.
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // The card is positioned `absolute inset-0` (fills the trigger), and we
        // animate its inset symmetrically instead of width/height. Two wins:
        //  • Centered by construction — equal top/bottom + left/right insets, so
        //    there is no flex re-centering and no per-frame sub-pixel vertical
        //    wobble (the "glitching up and down").
        //  • Functions + invalidateOnRefresh recompute correctly on resize, so
        //    returning to the top always restores a clean full-bleed (inset 0).
        // endWidth caps at 1200 on desktop; the video re-crops via object-cover,
        // exactly as before. On desktop we round every frame to whole pixels to
        // keep it crisp; on mobile the total travel is tiny, so that same
        // rounding makes the morph step visibly — there we let it run sub-pixel
        // for a smooth glide.
        const endWidth = () =>
          isDesktop ? Math.min(1200, window.innerWidth - 40) : window.innerWidth - 24;
        const endHeight = () =>
          isDesktop ? window.innerHeight - 40 : window.innerHeight - 24;
        const insetX = () => Math.max(0, (window.innerWidth - endWidth()) / 2);
        const insetY = () => Math.max(0, (window.innerHeight - endHeight()) / 2);
        const roundPx = (v: string) => `${Math.round(parseFloat(v))}px`;

        tl.fromTo(
          cardRef.current,
          { top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0 },
          {
            top: insetY,
            bottom: insetY,
            left: insetX,
            right: insetX,
            borderRadius: isDesktop ? 48 : 24,
            ease: "power2.inOut",
            ...(isDesktop
              ? { modifiers: { top: roundPx, right: roundPx, bottom: roundPx, left: roundPx } }
              : {}),
          },
          0
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[200svh] bg-white font-poppins">
      {/* Native sticky dwell: the hero holds at the top while the 200svh container
          scrolls through; GSAP scrubs the morph. No JS pin = no scroll fight.
          Height MUST be a STABLE unit, NOT `dvh`: on mobile `dvh` resizes this
          element as the address bar hides/shows during scroll, which fights the
          frozen ScrollTrigger geometry and makes the morph drift out of bounds then
          snap. We use `svh` (small viewport height) rather than `vh`: `svh` is just
          as stable (it never changes mid-scroll) but equals the *visible* viewport
          with the address bar shown, whereas `100vh` is taller than the visible area
          on mobile — which pushed the bottom "Katalog Desain" card below the fold.
          `svh` keeps the whole hero, including that card, on one screen. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-white">
        <section
          ref={cardRef}
          className="absolute inset-0 overflow-hidden shadow-none flex flex-col items-center bg-white/10 group"
        >
          {/* Video background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
          >
            <source
              src="https://contents.rimba.app/assets/video_rimba_hero_1.webm"
              type="video/webm"
            />
            <source
              src="https://contents.rimba.app/assets/video_rimba_hero_fallback.mp4"
              type="video/mp4"
            />
          </video>

          {/* Subtle overlay to keep text readable */}
          <div className="absolute inset-0 z-[1] bg-black/40" />

          {/* Content layer */}
          <div className="relative z-10 w-full h-full flex flex-col items-center">
            <HeroNavbar />

            {/* Text container */}
            <div className="w-full flex-1 flex flex-col items-center justify-center pb-24 md:pb-36 px-6 text-center max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-white mb-4 leading-[1.05] tracking-[-0.02em]"
              >
                {t("title")
                  .split("\n")
                  .map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed max-w-xl font-normal"
              >
                Karena hari istimewa Anda layak dimulai dengan cara yang indah.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="mt-8 grid grid-cols-2 gap-3 w-fit"
              >
                <Link href="https://wa.me/6285750275751" target="_blank" rel="noopener noreferrer">
                  <TextureButton variant="primary" size="lg" className="w-full whitespace-nowrap font-medium">
                    <IconBrandWhatsapp className="w-5 h-5 shrink-0" />
                    <span className="sm:hidden">Konsultasi</span>
                    <span className="hidden sm:inline">Konsultasi via WhatsApp</span>
                  </TextureButton>
                </Link>
                <Link href="/exclusive-order">
                  <TextureButton variant="outline" size="lg" className="w-full whitespace-nowrap font-medium">
                    <CrownStar className="w-5 h-5 shrink-0" weight="BoldDuotone" />
                    <span className="sm:hidden">Eksklusif</span>
                    <span className="hidden sm:inline">Exclusive Order</span>
                  </TextureButton>
                </Link>
              </motion.div>
            </div>

            <BottomRightCorner />
          </div>
        </section>
      </div>
    </div>
  );
}
