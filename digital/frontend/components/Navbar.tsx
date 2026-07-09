"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRightUp } from "@solar-icons/react";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import CurvedMenu from "@/components/CurvedMenu";
import { NAV_ITEMS } from "@/lib/site-nav";

export default function Navbar() {
  const t = useTranslations("Navbar");

  const menuItems = NAV_ITEMS.map((item) => ({ name: t(item.key), href: item.href }));

  return (
    <nav
      data-site-nav
      className="sticky top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-[#d9d9dd] will-change-transform"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between py-3.5 px-6 md:px-10">
        {/* Logo */}
        <div className="flex-1">
          <Link href="/" className="-ml-3 md:ml-0 inline-block hover:opacity-85 transition-opacity">
            <img
              src="https://contents.rimba.app/assets/rimba-logo.webp"
              alt="Rimba Digital"
              className="block h-16 md:h-[72px] -my-3 w-auto"
            />
          </Link>
        </div>

        {/* Center menu (desktop only) */}
        <ul className="hidden md:flex items-center gap-8 text-[#212121] font-normal text-sm">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="cursor-pointer hover:opacity-75 transition-opacity flex items-center gap-1 py-2"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: locale + login CTA + mobile hamburger */}
        <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>

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
      </div>
    </nav>
  );
}
