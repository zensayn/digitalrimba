"use client";

import { motion } from "motion/react";
import { ArrowRightUp, AltArrowRight } from "@solar-icons/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import CurvedMenu from "@/components/CurvedMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";

// Strong ease-out curve per Emil's design principles
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Always-visible header for non-landing marketing pages (products, about, haul, team …).
// Unlike Header.tsx which is scroll-triggered, this renders immediately on mount.
export default function PageHeader() {
  const t = useTranslations("Navbar");

  const menuItems = [
    { name: t("ecosystem"), href: "/products", hasDropdown: false },
    { name: t("economics"), href: "/products", hasDropdown: true },
    { name: t("developers"), href: "/products", hasDropdown: false },
    { name: t("governance"), href: "/about", hasDropdown: true },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-[9999] bg-white/85 backdrop-blur-xl border-b border-[#e5e7eb]">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between py-3.5 px-6 md:px-10">
        {/* Logo */}
        <div className="flex-1">
          <Link
            href="/"
            className="inline-block font-poppins font-bold tracking-tight text-lg md:text-xl text-[#212121] hover:opacity-85 transition-opacity"
          >
            RIMBA FISIK
          </Link>
        </div>

        {/* Center menu (desktop only) */}
        <ul className="hidden md:flex items-center gap-8 text-[#212121] font-normal text-sm">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group"
              >
                {item.name}
                {item.hasDropdown && (
                  <AltArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: locale + CTA + mobile hamburger */}
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <Link href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.16, ease: EASE_OUT_STRONG }}
              className="flex items-center bg-[#212121] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[#346739] transition-colors cursor-pointer"
            >
              <div className="bg-white/20 p-1 md:p-1.5 rounded-full flex items-center justify-center">
                <ArrowRightUp className="w-4 h-4 md:w-[18px] md:h-[18px] text-white" />
              </div>
              <span className="text-xs md:text-sm font-normal">
                <span className="hidden sm:inline">{t("bookDemo")}</span>
                <span className="inline sm:hidden">{t("bookDemoMobile")}</span>
              </span>
            </motion.button>
          </Link>

          {/* Curved hamburger menu — mobile only */}
          <div className="md:hidden">
            <CurvedMenu buttonColor="#212121" activeButtonColor="#ffffff" />
          </div>
        </div>
      </div>
    </header>
  );
}
