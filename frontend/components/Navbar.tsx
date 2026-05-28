"use client";

import { motion } from "motion/react";
import { IconChevronRight, IconWorld, IconMoon, IconSun } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { TextureButton } from "@/components/ui/texture-button";

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const menuItems = [
    { name: t('ecosystem'), hasDropdown: false },
    { name: t('economics'), hasDropdown: true },
    { name: t('developers'), hasDropdown: false },
    { name: t('governance'), hasDropdown: true },
  ];

  return (
    <nav className="sticky top-0 flex items-center justify-between py-3 px-6 md:px-10 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-[#d9d9dd]">
      {/* Left Side: Logo */}
      <Link href="/" className="flex-1 flex items-center gap-4">
         <span className="font-poppins font-bold tracking-tight text-xl text-[#212121]">
          RIMBA FISIK
        </span>
      </Link>

      {/* Center Menu */}
      <ul className="hidden md:flex items-center gap-8 text-[#212121]/70 font-poppins font-normal text-[12px] lowercase tracking-normal">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className="cursor-pointer hover:text-[#346739] transition-colors flex items-center gap-1 group"
          >
            {item.name}
            {item.hasDropdown && (
              <IconChevronRight className="w-3 h-3 transition-transform group-hover:rotate-90" />
            )}
          </li>
        ))}
      </ul>

      {/* Right Side: Theme Toggle + Language + Button */}
      <div className="flex-1 flex justify-end items-center gap-6">
        <div className="flex items-center gap-2 text-[#212121]/40 font-poppins font-bold text-[10px] uppercase ">
          <button 
            onClick={() => handleLocaleChange('id')}
            className={`hover:text-[#346739] transition-colors ${locale === 'id' ? 'text-[#346739] underline underline-offset-4' : ''}`}
          >
            ID
          </button>
          <span>/</span>
          <button 
            onClick={() => handleLocaleChange('en')}
            className={`hover:text-[#346739] transition-colors ${locale === 'en' ? 'text-[#346739] underline underline-offset-4' : ''}`}
          >
            EN
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 text-[#212121]/40 hover:text-[#346739] transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <IconMoon className="w-4 h-4" />
          ) : (
            <IconSun className="w-4 h-4" />
          )}
        </button>

        <TextureButton size="sm" className="hidden md:flex rounded-full transition-all">
          {t('login')}
        </TextureButton>
      </div>
    </nav>
  );
}