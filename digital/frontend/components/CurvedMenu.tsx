"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRightUp } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";
import { LocaleSwitcherList } from "@/components/LocaleSwitcher";

// Shared cubic-bezier curve, typed as a 4-tuple so motion's Variants accepts it.
const EASE_CURVE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const menuSlide: Variants = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.85, ease: EASE_CURVE } },
  exit: { x: "calc(100% + 100px)", transition: { duration: 0.75, ease: EASE_CURVE } },
};

const slide: Variants = {
  initial: { x: 80, opacity: 0 },
  enter: (i: number) => ({ x: 0, opacity: 1, transition: { duration: 0.8, ease: EASE_CURVE, delay: 0.05 * i } }),
  exit: (i: number) => ({ x: 80, opacity: 0, transition: { duration: 0.6, ease: EASE_CURVE, delay: 0.05 * i } }),
};

interface CurvedMenuProps {
  buttonColor?: string;
  activeButtonColor?: string;
}

export default function CurvedMenu({ buttonColor = "#212121", activeButtonColor = "#ffffff" }: CurvedMenuProps) {
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Navbar");
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll while open by pinning <body> (preserves scroll position on
  // mobile instead of jumping to the top). Restored on close.
  useEffect(() => {
    if (!isActive) return;
    const scrollY = window.scrollY;
    // Freeze scroll-driven backgrounds (e.g. HeroMorph) BEFORE pinning <body>,
    // so their scrubbed timelines don't snap to scroll=0 behind the drawer.
    document.dispatchEvent(new CustomEvent("scroll-lock", { detail: true }));
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
      document.dispatchEvent(new CustomEvent("scroll-lock", { detail: false }));
    };
  }, [isActive]);

  const menuItems = [
    { name: t("ecosystem"), href: "#" },
    { name: t("economics"), href: "#" },
    { name: t("developers"), href: "#" },
    { name: t("governance"), href: "#" },
  ];

  const initialPath = `M100 0 L100 ${dimensions.height} Q-100 ${dimensions.height / 2} 100 0`;
  const targetPath = `M100 0 L100 ${dimensions.height} Q100 ${dimensions.height / 2} 100 0`;
  const curveVariants: Variants = {
    initial: { d: initialPath },
    enter: { d: targetPath, transition: { duration: 1, ease: EASE_CURVE } },
    exit: { d: initialPath, transition: { duration: 0.8, ease: EASE_CURVE } },
  };

  const close = () => setIsActive(false);

  // Dialog a11y: move focus in, trap Tab inside the drawer, Escape closes it.
  useEffect(() => {
    if (!isActive) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setIsActive(!isActive)}
        className="relative z-[10000] w-11 h-11 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border border-[#d9d9dd]/65 bg-white/80 backdrop-blur-md shadow-sm hover:scale-105 active:scale-95 cursor-pointer outline-none"
        style={{
          borderColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
          backgroundColor: isActive ? "rgba(24,24,27,0.85)" : undefined,
        }}
        aria-label={isActive ? "Close menu" : "Open menu"}
        aria-expanded={isActive}
      >
        <span
          className="w-5 h-[2px] rounded-full transition-all duration-300 origin-center"
          style={{ backgroundColor: isActive ? activeButtonColor : buttonColor, transform: isActive ? "rotate(45deg) translate(2.5px, 2.5px)" : "none" }}
        />
        <span
          className="w-5 h-[2px] rounded-full transition-all duration-300 origin-center"
          style={{ backgroundColor: isActive ? activeButtonColor : buttonColor, transform: isActive ? "rotate(-45deg) translate(2.5px, -2.5px)" : "none" }}
        />
      </button>

      {/* Sliding curved drawer — portaled to <body> so backdrop-blur ancestors
          don't anchor the fixed overlay. */}
      {mounted && createPortal(
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="curved-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_CURVE }}
              onClick={close}
              className="fixed inset-0 bg-black/40 z-[100000]"
            />
          )}
          {isActive && (
            <motion.div
              key="curved-menu-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              variants={menuSlide}
              initial="initial"
              animate="enter"
              exit="exit"
              className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-zinc-900 text-white z-[100001] flex flex-col justify-between p-10 md:p-16 box-border shadow-2xl"
            >
              {/* Brand logo */}
              <Link href="/" onClick={close} className="absolute top-8 left-3 md:left-12 z-10 inline-block hover:opacity-85 transition-opacity">
                <img src="https://contents.rimba.app/assets/rimba-logo-white.webp" alt="Rimba Digital" className="block h-16 w-auto" />
              </Link>

              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={close}
                aria-label="Close menu"
                className="absolute top-8 right-8 z-10 w-11 h-11 rounded-full flex items-center justify-center border border-white/15 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer outline-none"
              >
                <span className="relative block w-5 h-5">
                  <span className="absolute top-1/2 left-0 w-5 h-[2px] -translate-y-1/2 rotate-45 rounded-full bg-white" />
                  <span className="absolute top-1/2 left-0 w-5 h-[2px] -translate-y-1/2 -rotate-45 rounded-full bg-white" />
                </span>
              </button>

              {/* Curve boundary */}
              <svg className="absolute top-0 left-[-99px] w-[100px] h-full fill-zinc-900 stroke-none pointer-events-none">
                <motion.path variants={curveVariants} initial="initial" animate="enter" exit="exit" />
              </svg>

              {/* Links */}
              <div className="flex flex-col gap-12 mt-20">
                <div className="border-b border-zinc-800 pb-4">
                  <span className="font-poppins text-xs uppercase tracking-wider text-zinc-500 font-medium">Navigation</span>
                </div>

                <nav className="flex flex-col gap-6">
                  {menuItems.map((item, index) => (
                    <motion.div key={item.name} custom={index} variants={slide} initial="initial" animate="enter" exit="exit">
                      <Link
                        href={item.href}
                        onClick={close}
                        className="font-poppins text-3xl sm:text-4xl font-normal text-zinc-100 hover:text-[#edfce9] transition-colors duration-200 block"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Footer: language + login CTA */}
              <motion.div custom={4} variants={slide} initial="initial" animate="enter" exit="exit" className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col gap-3.5">
                  <div className="mb-1">
                    <span className="font-poppins text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-2 px-4">
                      {t("languageLabel")}
                    </span>
                    <LocaleSwitcherList onSelect={close} />
                  </div>

                  <Link href="/login" onClick={close}>
                    <TextureButton variant="primary" className="w-full max-w-full">
                      <span>{t("login")}</span>
                      <ArrowRightUp className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </TextureButton>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
