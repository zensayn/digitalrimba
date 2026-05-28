"use client";

import { motion } from "motion/react";
import { ArrowRightUp, AltArrowRight, StarsMinimalistic } from "@solar-icons/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import CurvedMenu from "@/components/CurvedMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";

// ─── HeroNavbar (in-flow only — sticky/morph header lives in Header.tsx) ─────
function HeroNavbar() {
  const t = useTranslations("Navbar");

  const menuItems = [
    { name: t("ecosystem"), href: "/products", hasDropdown: false },
    { name: t("economics"), href: "/products", hasDropdown: true },
    { name: t("developers"), href: "/products", hasDropdown: false },
    { name: t("governance"), href: "/about", hasDropdown: true },
  ];

  return (
    <nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-10">
      {/* Logo */}
      <div className="flex-1">
        <Link href="/" className="inline-block font-poppins font-bold tracking-tight text-lg md:text-xl text-[#212121] hover:opacity-85 transition-opacity">
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

      {/* Right CTA + locale + mobile hamburger */}
      <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
        <div className="hidden md:block">
          <LocaleSwitcher />
        </div>
        <Link href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center bg-[#212121] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[#346739] transition-colors group cursor-pointer"
          >
            <div className="bg-white/20 p-1 md:p-1.5 rounded-full flex items-center justify-center">
              <ArrowRightUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-xs md:text-sm font-normal">
              <span className="hidden sm:inline">{t('bookDemo')}</span>
              <span className="inline sm:hidden">{t('bookDemoMobile')}</span>
            </span>
          </motion.button>
        </Link>

        {/* Curved hamburger menu — mobile only */}
        <div className="md:hidden">
          <CurvedMenu buttonColor="#212121" activeButtonColor="#ffffff" />
        </div>
      </div>
    </nav>
  );
}

// ─── BottomLeftCard ───────────────────────────────────────────────────────────
function BottomLeftCard() {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute bottom-28 right-4 left-auto md:left-6 md:right-auto md:bottom-6 lg:bottom-10 lg:left-10 p-3 md:p-4 lg:p-5 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2.2rem] bg-white/30 backdrop-blur-xl flex flex-col gap-2 lg:gap-3 min-w-[140px] md:min-w-[150px] lg:min-w-[180px] w-fit"
    >
      <div className="flex flex-col">
        <span className="text-2xl md:text-3xl font-normal text-[#212121] tracking-tight">
          1,200+
        </span>
        <span className="text-[10px] md:text-[12px] font-normal text-[#212121]/60 uppercase">
          Pernikahan diabadikan
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center bg-white rounded-full pl-1.5 pr-5 py-1.5 gap-2 hover:bg-white/90 transition-colors self-start group"
      >
        <div className="bg-[#212121]/10 p-1 rounded-full flex items-center justify-center">
          <ArrowRightUp className="w-3.5 h-3.5 text-[#212121]" />
        </div>
        <span className="text-[14px] font-normal text-[#212121]">Lihat hasil cetak</span>
      </motion.button>
    </motion.div>
  );
}

// ─── BottomRightCorner ────────────────────────────────────────────────────────
function BottomRightCorner() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="absolute bottom-0 right-0 p-3 pt-5 pl-8 sm:p-4 sm:pt-6 sm:pl-10 md:p-6 md:pt-8 md:pl-14 bg-white rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center gap-3 sm:gap-4 md:gap-6"
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
        <div className="flex items-center gap-1 text-[#212121]/60 cursor-pointer hover:text-[#346739] transition-colors">
          <span className="text-[12px] md:text-[15px] font-normal">Jelajahi seri</span>
          <AltArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-white">
      <section className="relative w-full max-w-[1200px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center bg-white/10 group">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle overlay to keep text readable */}
        <div className="absolute inset-0 z-[1] bg-white/20" />

        {/* Content layer */}
        <div className="relative z-10 w-full h-full flex flex-col items-center">
          <HeroNavbar />

          {/* Text container */}
          <div className="w-full flex flex-col items-center pt-8 px-6 text-center max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-[#212121] mb-4 leading-[1.05] tracking-[-0.02em]"
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
              className="text-sm sm:text-base md:text-lg text-[#212121]/70 leading-relaxed max-w-xl font-normal"
            >
              Karena hari istimewa Anda layak dimulai dengan cara yang indah.
            </motion.p>
          </div>

          <BottomLeftCard />
          <BottomRightCorner />
        </div>
      </section>
    </div>
  );
}
