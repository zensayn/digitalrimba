"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowRightUp } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";
import { LocaleSwitcherList } from "@/components/LocaleSwitcher";

// Menu animation variants
const menuSlide = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } },
  exit: { x: "calc(100% + 100px)", transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }
};

const slide = {
  initial: { x: 80, opacity: 0 },
  enter: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.05 * i }
  }),
  exit: (i: number) => ({
    x: 80,
    opacity: 0,
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.05 * i }
  })
};

interface CurvedMenuProps {
  buttonColor?: string;
  activeButtonColor?: string;
}

export default function CurvedMenu({ buttonColor = "#212121", activeButtonColor = "#ffffff" }: CurvedMenuProps) {
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const t = useTranslations("Navbar");
  const router = useRouter();

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

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = isActive ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isActive]);

  const menuItems = [
    { name: t("ecosystem"), href: "/products" },
    { name: t("economics"), href: "/#pricing-engine" },
    { name: t("developers"), href: "/products" },
    { name: t("governance"), href: "/about" },
  ];

  // Dynamic SVG path animations
  const initialPath = `M100 0 L100 ${dimensions.height} Q-100 ${dimensions.height / 2} 100 0`;
  const targetPath = `M100 0 L100 ${dimensions.height} Q100 ${dimensions.height / 2} 100 0`;

  const curveVariants = {
    initial: { d: initialPath },
    enter: { d: targetPath, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } },
    exit: { d: initialPath, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
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

      {/* ── Sliding Curved Menu Drawer ────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            variants={menuSlide}
            initial="initial"
            animate="enter"
            exit="exit"
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-zinc-900 text-white z-[9999] flex flex-col justify-between p-10 md:p-16 box-border shadow-2xl"
          >
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
                {menuItems.map((item, index) => (
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
                      onClick={() => setIsActive(false)}
                      className="font-poppins text-3xl sm:text-4xl font-normal text-zinc-100 hover:text-[#edfce9] transition-colors duration-200 block"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Footer inside Drawer */}
            <motion.div
              custom={4}
              variants={slide}
              initial="initial"
              animate="enter"
              exit="exit"
              className="flex flex-col gap-6"
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
                  variant="outline"
                  className="self-start rounded-full border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  onClick={() => {
                    setIsActive(false);
                    router.push("/login");
                  }}
                >
                  {t("login")}
                </TextureButton>

                <TextureButton
                  variant="primary"
                  className="self-start"
                  onClick={() => {
                    setIsActive(false);
                    window.open("https://wa.me/1234567890", "_blank", "noopener,noreferrer");
                  }}
                >
                  <span>{t("bookDemo")}</span>
                  <ArrowRightUp className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </TextureButton>
              </div>

              <div className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
                © {new Date().getFullYear()} Rimba Digital
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
