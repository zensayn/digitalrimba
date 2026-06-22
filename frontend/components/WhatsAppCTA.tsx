"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { IconBrandWhatsapp, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { StarsMinimalistic } from "@solar-icons/react";
import { useAppContext } from "@/context/AppContext";
import { Link } from "@/i18n/routing";
import Image from "next/image";

interface WhatsAppCTAProps {
  image1?: string;
  image2?: string;
}

export default function WhatsAppCTA({
  image1 = "/Element3d/1.png",
  image2 = "/Element3d/2.png",
}: WhatsAppCTAProps) {
  const t = useTranslations("Cta");
  const { state } = useAppContext();
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  const handleScroll = useCallback((y: number) => {
    const threshold = typeof window !== "undefined" ? window.innerHeight + 1200 - 80 : 2000;
    setVisible(y > threshold);
  }, []);

  useMotionValueEvent(scrollY, "change", handleScroll);

  const generateMessage = () => {
    const text = `Permintaan Penawaran Rimba Fisik:
---
Produk: ${state.product}
Jumlah: ${state.qty.toLocaleString()} lembar
Seri: ${state.tier}
Konsep Desain: ${state.design}
---
Estimasi Total: Rp ${state.total.toLocaleString()}

Saya ingin mendiskusikan pesanan undangan cetak ini lebih lanjut.`;

    return `https://wa.me/1234567890?text=${encodeURIComponent(text)}`;
  };

  const easeDrawer = [0.23, 1, 0.32, 1] as const;

  return (
    <>
      {/* ── Main Widescreen ClickUp-Style CTA Section ──────────────────────── */}
      <section className="w-full bg-[#ffffff] py-24 md:py-28 px-6 md:px-10 flex justify-center border-t border-[#d9d9dd]">
        <div className="w-full max-w-[1200px]">
          
          {/* Main Rounded Card Bezel with custom Cohere white-to-green gradient */}
          <div className="relative w-full rounded-[32px] bg-[#ffffff] border border-[#d9d9dd] py-16 px-8 md:p-16 overflow-hidden shadow-xl flex flex-col lg:flex-row justify-between items-center gap-12">
            
            {/* Glass shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] pointer-events-none" />

            {/* Soft Radial Green Glow behind the images (Centered on the Right, matching ClickUp's layout) */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 opacity-90" 
              style={{
                background: "radial-gradient(circle at 80% 50%, rgba(52, 103, 57, 0.12) 0%, rgba(237, 252, 233, 0.75) 30%, rgba(237, 252, 233, 0.3) 55%, rgba(255, 255, 255, 0) 75%)",
              }}
            />
            
            
            {/* Left Content Area (Directly starts with Title - No Badge) */}
            <div className="flex-1 text-left relative z-10 flex flex-col items-start max-w-2xl">
              
              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: easeDrawer }}
                className="text-3xl sm:text-4xl md:text-5xl font-poppins font-normal tracking-[-0.03em] leading-[1.15] text-[#212121] mb-4"
              >
                {t("title").split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </motion.h2>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15, ease: easeDrawer }}
                className="text-[#616161] font-poppins text-sm md:text-base leading-relaxed font-light mb-8 max-w-xl"
              >
                {t("subtitle")}
              </motion.p>

              {/* Two Pill Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, ease: easeDrawer }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                {/* Button 1: WhatsApp Primary Solid Green Pill */}
                <a
                  href={generateMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-[#346739] text-white rounded-full font-poppins text-xs uppercase tracking-wider font-semibold hover:bg-[#346739]/90 transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md active:scale-[0.97]"
                >
                  <IconBrandWhatsapp className="w-5 h-5 text-white" />
                  <span>{t("whatsappBtn")}</span>
                  <IconArrowRight className="w-4 h-4 text-white" />
                </a>

                {/* Button 2: Web Invitations Outline Stone Pill */}
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-transparent text-[#212121] border border-[#d9d9dd] rounded-full font-poppins text-xs uppercase tracking-wider font-semibold hover:bg-stone-50 transition-all cursor-pointer text-center active:scale-[0.97]"
                >
                  {t("webBtn")}
                </Link>
              </motion.div>
            </div>

            {/* Right Stacked Physical Card Deck Mockup Area */}
            <div className="flex-1 w-full relative flex justify-center lg:justify-end select-none h-[280px] lg:h-[320px] overflow-hidden">
              
              {/* Card Image 2: Configurable physical card preview (rotated right - BEHIND) */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotate: 12, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, rotate: 6, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.35, ease: easeDrawer }}
                className="absolute w-[280px] sm:w-[380px] h-[180px] lg:h-[240px] rounded-xl border border-stone-200/50 shadow-xl right-[120px] sm:right-[180px] lg:right-[200px] bottom-[-30px] z-10 overflow-hidden bg-stone-100"
              >
                <Image
                  src={image2} 
                  alt="Physical invitation card 2" 
                  className="w-full h-full object-cover select-none"
                />
                {/* Subtle luxury glass sheen overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.06] pointer-events-none" />
              </motion.div>

              {/* Card Image 1: Configurable physical card preview (rotated left - IN FRONT) */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -10 }}
                whileInView={{ opacity: 1, y: 0, rotate: -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: easeDrawer }}
                className="absolute w-[300px] sm:w-[400px] h-[200px] lg:h-[260px] rounded-xl border border-stone-200/50 shadow-2xl right-[10px] sm:right-[30px] lg:right-[40px] bottom-[-60px] z-20 overflow-hidden bg-stone-100"
              >
                <Image 
                  src={image1} 
                  alt="Physical invitation card 1" 
                  className="w-full h-full object-cover select-none"
                />
              </motion.div>

            </div>

          </div>

          {/* Optional bottom note */}
          <p className="mt-8 text-[#616161]/50 text-xs text-center max-w-lg mx-auto leading-relaxed font-poppins font-light">
            {t("footerNote")}
          </p>

        </div>
      </section>

      {/* ── Floating Mini Button ───────────────────────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[200] hidden md:block"
          >
            <a
              href={generateMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 bg-[#25D366] text-white flex items-center justify-center shadow-2xl transition-colors hover:bg-[#20ba59] active:scale-95"
              style={{ borderRadius: "9999px" }}
            >
              <IconBrandWhatsapp className="w-8 h-8" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
