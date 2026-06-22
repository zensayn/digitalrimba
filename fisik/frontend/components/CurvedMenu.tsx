"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowRightUp } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";
import { LocaleSwitcherList } from "@/components/LocaleSwitcher";

// Shared cubic-bezier curve, typed as a 4-tuple so motion/react's Variants
// type accepts it (a bare array widens to number[] and fails type-checking).
const EASE_CURVE: [number, number, number, number] = [0.76, 0, 0.24, 1];

// Menu animation variants
const menuSlide: Variants = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.85, ease: EASE_CURVE } },
  exit: { x: "calc(100% + 100px)", transition: { duration: 0.75, ease: EASE_CURVE } }
};

const slide: Variants = {
  initial: { x: 80, opacity: 0 },
  enter: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: EASE_CURVE, delay: 0.05 * i }
  }),
  exit: (i: number) => ({
    x: 80,
    opacity: 0,
    transition: { duration: 0.6, ease: EASE_CURVE, delay: 0.05 * i }
  })
};

const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface CurvedMenuProps {
  buttonColor?: string;
  activeButtonColor?: string;
}

export default function CurvedMenu({ buttonColor = "#212121", activeButtonColor = "#ffffff" }: CurvedMenuProps) {
  const [isActive, setIsActive] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Navbar");
  const router = useRouter();

  // Portals can only target document.body on the client.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll while the menu is open WITHOUT letting mobile browsers
  // clamp the viewport to the top. Because <html> is `overflow: visible`, the
  // <body> is the scroll container, so `overflow: hidden` on it makes the page
  // non-scrollable and the browser yanks scroll position to 0 — that's the
  // "jump to the top" + glitch when the menu is opened from far down the page.
  // Pinning the body with position:fixed and a negative top preserves the
  // visual position; we restore the real scroll offset on close.
  useEffect(() => {
    if (!isActive) return;

    const scrollY = window.scrollY;
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
    };
  }, [isActive]);

  const menuItems = [
    { name: t("ecosystem"), href: "/products", isProducts: true },
    { name: t("exclusiveOrder"), href: "/exclusive-order" },
    { name: t("governance"), href: "/about" },
  ];

  // Dynamic SVG path animations
  const initialPath = `M100 0 L100 ${dimensions.height} Q-100 ${dimensions.height / 2} 100 0`;
  const targetPath = `M100 0 L100 ${dimensions.height} Q100 ${dimensions.height / 2} 100 0`;

  const curveVariants: Variants = {
    initial: { d: initialPath },
    enter: { d: targetPath, transition: { duration: 1, ease: EASE_CURVE } },
    exit: { d: initialPath, transition: { duration: 0.8, ease: EASE_CURVE } }
  };

  return (
    <>
      {/* ── Hamburger Trigger Button ──────────────────────────────── */}
      <button
        onClick={() => setIsActive(!isActive)}
        className="relative z-[10000] w-11 h-11 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border border-[#d9d9dd]/65 bg-white/80 backdrop-blur-md shadow-sm hover:scale-105 active:scale-95 cursor-pointer outline-none"
        style={{
          borderColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
          backgroundColor: isActive ? "rgba(24,24,27,0.85)" : undefined,
        }}
      >
        <span
          className="w-5 h-[2px] rounded-full transition-all duration-300 origin-center"
          style={{
            backgroundColor: isActive ? activeButtonColor : buttonColor,
            transform: isActive ? "rotate(45deg) translate(2.5px, 2.5px)" : "none"
          }}
        />
        <span
          className="w-5 h-[2px] rounded-full transition-all duration-300 origin-center"
          style={{
            backgroundColor: isActive ? activeButtonColor : buttonColor,
            transform: isActive ? "rotate(-45deg) translate(2.5px, -2.5px)" : "none"
          }}
        />
      </button>

      {/* ── Sliding Curved Menu Drawer ─────────────────────────────────
          Portaled to <body>. The header carries `backdrop-blur` whose
          backdrop-filter makes it the containing block for position:fixed
          descendants — left inline, the "fixed" drawer was anchored to the
          header and lurched whenever the sticky/fixed header repositioned.
          Rendering at the body root makes it a true viewport overlay. */}
      {mounted && createPortal(
        <AnimatePresence>
          {isActive && (
            <motion.div
              key="curved-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_CURVE }}
              onClick={() => {
                setIsActive(false);
                setProductsExpanded(false);
              }}
              className="fixed inset-0 bg-black/40 z-[100000]"
            />
          )}
          {isActive && (
          <motion.div
            key="curved-menu-drawer"
            variants={menuSlide}
            initial="initial"
            animate="enter"
            exit="exit"
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-zinc-900 text-white z-[100001] flex flex-col justify-between p-10 md:p-16 box-border shadow-2xl"
          >
            {/* Brand logo — top-left anchor, mirrors the close button. */}
            <Link
              href="/"
              onClick={() => {
                setIsActive(false);
                setProductsExpanded(false);
              }}
              className="absolute top-8 left-3 md:left-12 z-10 inline-block hover:opacity-85 transition-opacity"
            >
              <img
                src="https://contents.rimba.app/assets/rimba-logo-white.webp"
                alt="Rimba Fisik"
                className="block h-16 w-auto"
              />
            </Link>

            {/* Close button — the header hamburger now sits behind the
                full-screen drawer on mobile, so the drawer owns its dismiss. */}
            <button
              onClick={() => {
                setIsActive(false);
                setProductsExpanded(false);
              }}
              aria-label="Close menu"
              className="absolute top-8 right-8 z-10 w-11 h-11 rounded-full flex items-center justify-center border border-white/15 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer outline-none"
            >
              <span className="relative block w-5 h-5">
                <span className="absolute top-1/2 left-0 w-5 h-[2px] -translate-y-1/2 rotate-45 rounded-full bg-white" />
                <span className="absolute top-1/2 left-0 w-5 h-[2px] -translate-y-1/2 -rotate-45 rounded-full bg-white" />
              </span>
            </button>

            {/* SVG curve boundary */}
            <svg className="absolute top-0 left-[-99px] w-[100px] h-full fill-zinc-900 stroke-none pointer-events-none">
              <motion.path
                variants={curveVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              />
            </svg>

            {/* Menu Links */}
            <div className="flex flex-col gap-12 mt-20">
              <div className="border-b border-zinc-800 pb-4">
                <span className="font-poppins text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  {t("ecosystem").split(" ")[0] || "Menu"} Navigation
                </span>
              </div>

              <nav className="flex flex-col gap-6">
                {menuItems.map((item, index) => {
                  if (item.isProducts) {
                    return (
                      <motion.div
                        key={item.name}
                        custom={index}
                        variants={slide}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        className="flex flex-col"
                      >
                        <button
                          onClick={() => setProductsExpanded(!productsExpanded)}
                          className="font-poppins text-3xl sm:text-4xl font-normal text-zinc-100 hover:text-[#edfce9] transition-colors duration-200 flex items-center justify-between w-full text-left outline-none cursor-pointer bg-transparent border-none p-0"
                        >
                          <span>{item.name}</span>
                          <span className={`text-xl transition-transform duration-300 ${productsExpanded ? "rotate-90 text-[#346739]" : "text-zinc-500"}`}>
                            ▶
                          </span>
                        </button>

                        <AnimatePresence>
                          {productsExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
                              className="overflow-hidden pl-4 flex flex-col gap-4 mt-3 border-l border-zinc-800"
                            >
                              <Link
                                href="/products"
                                onClick={() => {
                                  setIsActive(false);
                                  setProductsExpanded(false);
                                }}
                                className="flex flex-col gap-0.5 group text-left"
                              >
                                <span className="font-poppins text-lg font-medium text-zinc-200 group-hover:text-[#346739] transition-colors">
                                  {t("productFisikTitle")}
                                </span>
                                <span className="font-poppins text-xs text-zinc-500 font-normal">
                                  {t("productFisikDesc")}
                                </span>
                              </Link>

                              <Link
                                href="https://rimba-digital.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  setIsActive(false);
                                  setProductsExpanded(false);
                                }}
                                className="flex flex-col gap-0.5 group text-left"
                              >
                                <span className="font-poppins text-lg font-medium text-zinc-200 group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                  {t("productDigitalTitle")}
                                </span>
                                <span className="font-poppins text-xs text-zinc-500 font-normal">
                                  {t("productDigitalDesc")}
                                </span>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={item.name}
                      custom={index}
                      variants={slide}
                      initial="initial"
                      animate="enter"
                      exit="exit"
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          setIsActive(false);
                          setProductsExpanded(false);
                        }}
                        className="font-poppins text-3xl sm:text-4xl font-normal text-zinc-100 hover:text-[#edfce9] transition-colors duration-200 block"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer inside Drawer */}
            <motion.div
              custom={4}
              variants={slide}
              initial="initial"
              animate="enter"
              exit="exit"
              className="flex flex-col gap-6 mb-8"
            >
              <div className="flex flex-col gap-3.5">
                {/* Language picker */}
                <div className="mb-1">
                  <span className="font-poppins text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-2 px-4">
                    {t("languageLabel")}
                  </span>
                  <LocaleSwitcherList onSelect={() => setIsActive(false)} />
                </div>

                <TextureButton
                  variant="primary"
                  className="w-full max-w-full"
                  onClick={() => {
                    setIsActive(false);
                    setProductsExpanded(false);
                    router.push("/consultation");
                  }}
                >
                  <span>{t("bookDemo")}</span>
                  <ArrowRightUp className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </TextureButton>
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
