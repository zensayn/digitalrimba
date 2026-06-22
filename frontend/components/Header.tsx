"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { ArrowRightUp, AltArrowRight, LetterOpened, WindowFrame } from "@solar-icons/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import CurvedMenu from "@/components/CurvedMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";

// The Hero is a 200vh pinned scroll section (see Hero.tsx `h-[200vh]`). Reveal the
// header once the user is ~1.5 viewports down — i.e. as the hero scrolls away —
// rather than a full viewport + a fixed 1120px, which pushed it past the hero and
// into the stats section.
const HERO_REVEAL_VIEWPORTS = 1.5;

// Strong ease-out curve per Emil's design principles
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function Header() {
  const [visible, setVisible] = useState(false);
  const [productsHovered, setProductsHovered] = useState(false);
  const { scrollY } = useScroll();
  const t = useTranslations("Navbar");

  const menuItems = [
    { name: t("ecosystem"), href: "/products", hasDropdown: true, isProducts: true },
    { name: t("exclusiveOrder"), href: "/exclusive-order", hasDropdown: false },
    { name: t("governance"), href: "/about", hasDropdown: false },
  ];

  const handleScroll = useCallback((y: number) => {
    if (typeof window === "undefined") return;
    // The curved menu locks scroll by pinning <body> with position:fixed, which
    // collapses window.scrollY (and this motion value) to 0. Ignore scroll
    // readings while that lock is active — otherwise opening the menu hides the
    // header, unmounting the menu's portal mid-animation (it slides in, then
    // instantly closes). When the menu closes, scroll is restored and the next
    // real scroll event re-evaluates visibility normally.
    if (document.body.style.position === "fixed") return;
    setVisible(y > window.innerHeight * HERO_REVEAL_VIEWPORTS);
  }, []);

  useMotionValueEvent(scrollY, "change", handleScroll);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          key="page-header"
          // Slide down from -100% with subtle blur to mask the transition
          initial={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          transition={{
            duration: 0.28,
            ease: EASE_OUT_STRONG,
          }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-white/85 backdrop-blur-xl border-b border-[#e5e7eb]"
        >
          <div className="max-w-[1400px] mx-auto flex items-center justify-between py-3.5 px-6 md:px-10">
            {/* Logo */}
            <div className="flex-1">
              <Link
                href="/"
                className="-ml-3 md:ml-0 inline-block hover:opacity-85 transition-opacity"
              >
                <img
                  src="https://contents.rimba.app/assets/rimba-logo.webp"
                  alt="Rimba Fisik"
                  className="block h-16 md:h-[72px] -my-3 w-auto"
                />
              </Link>
            </div>

            {/* Center menu (desktop only) */}
            <ul className="hidden md:flex items-center gap-8 text-[#212121] font-normal text-sm">
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
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[340px] bg-white/95 backdrop-blur-xl border border-neutral-200/80 shadow-xl rounded-2xl p-4 z-[99999] flex flex-col gap-2"
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
                              <span className="font-semibold text-sm text-neutral-800 flex items-center gap-1 group-hover/item:text-[#346739] transition-colors">
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
                              <span className="font-semibold text-sm text-neutral-800 flex items-center gap-1 group-hover/item:text-sky-500 transition-colors">
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

            {/* Right side: locale + CTA + mobile hamburger */}
            <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
              <div className="hidden md:block">
                <LocaleSwitcher />
              </div>
              {/* Hidden on mobile — the consult action lives inside the curved
                  menu there; this pill is a desktop-only convenience. */}
              <Link
                href="/consultation"
                className="group/btn hidden md:flex items-center gap-2 bg-[#212121] hover:bg-[#346739] text-white text-xs md:text-sm font-normal rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer"
              >
                <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/btn:rotate-[45deg] shrink-0">
                  <ArrowRightUp className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </span>
                <span className="overflow-hidden h-[20px] relative inline-block">
                  <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover/btn:-translate-y-1/2">
                    <span className="h-[20px] flex items-center">
                      <span className="hidden sm:inline">{t("bookDemo")}</span>
                      <span className="inline sm:hidden">{t("bookDemoMobile")}</span>
                    </span>
                    <span className="h-[20px] flex items-center">
                      <span className="hidden sm:inline">{t("bookDemo")}</span>
                      <span className="inline sm:hidden">{t("bookDemoMobile")}</span>
                    </span>
                  </span>
                </span>
              </Link>

              {/* Curved hamburger menu — mobile only */}
              <div className="md:hidden">
                <CurvedMenu buttonColor="#212121" activeButtonColor="#ffffff" />
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
