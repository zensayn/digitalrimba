"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TextureButton } from "@/components/ui/texture-button";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useAppContext } from "@/context/AppContext";
import { Link } from "@/i18n/routing";

export default function AboutCTA() {
  const t = useTranslations("AboutCta");
  const { state } = useAppContext();

  // WhatsApp context-aware message generator
  const generateMessage = () => {
    const text = `Permintaan Penawaran Rimba Fisik (About Page):
---
Produk: ${state.product}
Jumlah: ${state.qty.toLocaleString()} lembar
Seri: ${state.tier}
Konsep Desain: ${state.design}
---
Estimasi Total: Rp ${state.total.toLocaleString()}

Saya ingin berkonsultasi mengenai desain undangan pernikahan saya.`;

    return `https://wa.me/6285750275751?text=${encodeURIComponent(text)}`;
  };

  const easeDrawer = [0.23, 1, 0.32, 1] as const;

  return (
    <section
      className="relative w-full overflow-hidden py-28 md:py-36 px-6 bg-white select-none cursor-default"
    >
      {/* SVG defs for cloud gradients */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Base/Default Cloud Gradient */}
          <linearGradient id="cta-cloud-gradient-default" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="50%" stopColor="#edfce9" />
            <stop offset="80%" stopColor="#defce1" />
            <stop offset="100%" stopColor="#edfde9" />
          </linearGradient>
          {/* Lighter/Airier Cloud Gradient */}
          <linearGradient id="cta-cloud-gradient-lighter" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="50%" stopColor="#f4fdf2" />
            <stop offset="80%" stopColor="#e8fde9" />
            <stop offset="100%" stopColor="#f5fef3" />
          </linearGradient>
          {/* Slightly Darker/Richer Cloud Gradient */}
          <linearGradient id="cta-cloud-gradient-darker" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="50%" stopColor="#e3fbdc" />
            <stop offset="80%" stopColor="#cbf9d0" />
            <stop offset="100%" stopColor="#e4fbdd" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Content Wrapper ────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1200px] mx-auto w-full">
        
        {/* Cloud 2 (Behind Card, z-0) - Right Mid */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--2 absolute -right-4 sm:-right-8 md:-right-12 top-[30%] w-24 sm:w-32 md:w-38 z-0 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-default)"
            style={{ filter: "drop-shadow(0 8px 16px rgba(52, 103, 57, 0.04)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
        </span>

        {/* Cloud 3 (Behind Card, z-0) - Top Left */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--3 absolute left-6 sm:left-12 md:left-16 -top-10 sm:-top-14 md:-top-16 w-16 sm:w-22 md:w-28 z-0 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-darker)"
            style={{ filter: "drop-shadow(0 6px 12px rgba(52, 103, 57, 0.03)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M18.4 10.6C17.7 7.3 14.8 5 11.5 5 8.9 5 6.6 6.5 5.5 8.7 2.8 9 0.7 11.3 0.7 14.1c0 3 2.5 5.4 5.5 5.4h11.9c2.5 0 4.6-2 4.6-4.5 0-2.4-1.9-4.3-4.3-4.4z" />
          </svg>
        </span>

        {/* Cloud 5 (Behind Card, z-0) - Left Bottom */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--5 absolute -left-8 sm:-left-12 md:-left-16 bottom-[10%] w-14 sm:w-20 md:w-24 z-0 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-darker)"
            style={{ filter: "drop-shadow(0 6px 12px rgba(52, 103, 57, 0.03)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M17 18H7a4 4 0 0 1-1-7.87 3.5 3.5 0 0 1 6.8-1.07A4.5 4.5 0 0 1 17 18Z" />
          </svg>
        </span>

        {/* Cloud 7 (Behind Card, z-0) - Top Center */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--7 absolute left-[45%] -top-16 sm:-top-20 md:-top-24 w-12 sm:w-16 md:w-20 -translate-x-1/2 z-0 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-lighter)"
            style={{ filter: "drop-shadow(0 4px 8px rgba(52, 103, 57, 0.02)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M19 18H7a4 4 0 0 1-.6-7.96 5.5 5.5 0 0 1 10.55-1.6A4.5 4.5 0 0 1 19 18Z" />
          </svg>
        </span>

        {/* The Card Container */}
        <div 
          style={{
            backgroundImage: "radial-gradient(rgba(33, 33, 33, 0.015) 1.5px, transparent 1.5px), linear-gradient(to bottom, #ffffff 60%, #faf9f6 100%)",
            backgroundSize: "20px 20px, 100% 100%",
          }}
          className="relative z-10 bg-white border-b-8 border border-[#f2f2f2] rounded-[32px] p-8 sm:p-12 md:py-16 md:px-0 text-center flex flex-col items-center shadow-[0_15px_45px_rgba(0,0,0,0.025)] select-none overflow-hidden"
        >
          {/* Faint inner dashed guide ring matching Cohere technical drawing layout grids */}
          <div 
            className="absolute inset-3 md:inset-4 border border-dashed border-[#346739]/10 rounded-[20px] md:rounded-[24px] pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* Short and Bold Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeDrawer }}
            className="relative z-10 font-poppins text-3xl sm:text-4xl md:text-[42px] font-medium tracking-[-0.02em] text-[#212121] mb-8"
          >
            {t("title")}
          </motion.h2>

          {/* Dual Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.24, ease: easeDrawer }}
            className="relative z-10 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto"
          >
            {/* Primary: WhatsApp Consultation */}
            <a
              href={generateMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="z-10"
            >
              <TextureButton variant="primary" size="lg" className="font-poppins font-medium">
                <IconBrandWhatsapp className="w-5 h-5" />
                {t("primaryBtn")}
              </TextureButton>
            </a>

            {/* Secondary: Digital Invitations */}
            <Link href="/dashboard" className="z-10">
              <TextureButton variant="secondary" size="lg" className="font-poppins font-medium">
                {t("secondaryBtn")}
              </TextureButton>
            </Link>
          </motion.div>
        </div>

        {/* Cloud 1 (Above Card, z-20) - Left Top-Mid */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--1 absolute -left-4 sm:-left-8 md:-left-12 top-[25%] w-20 sm:w-28 md:w-36 z-20 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-darker)"
            style={{ filter: "drop-shadow(0 8px 16px rgba(52, 103, 57, 0.05)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M19 18H7a4 4 0 0 1-.6-7.96 5.5 5.5 0 0 1 10.55-1.6A4.5 4.5 0 0 1 19 18Z" />
          </svg>
        </span>

        {/* Cloud 4 (Above Card, z-20) - Top Right */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--4 absolute right-8 sm:right-16 md:right-24 -top-6 sm:-top-8 md:-top-10 w-12 sm:w-16 md:w-22 z-20 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-default)"
            style={{ filter: "drop-shadow(0 4px 8px rgba(52, 103, 57, 0.05)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M17 18H7a4 4 0 0 1-1-7.87 3.5 3.5 0 0 1 6.8-1.07A4.5 4.5 0 0 1 17 18Z" />
          </svg>
        </span>

        {/* Cloud 6 (Above Card, z-20) - Bottom Right */}
        <span
          aria-hidden="true"
          className="rf-cta__cloud rf-cta__cloud--6 absolute -right-6 sm:-right-10 md:-right-14 bottom-[0%] w-16 sm:w-22 md:w-26 z-20 pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="url(#cta-cloud-gradient-lighter)"
            style={{ filter: "drop-shadow(0 8px 16px rgba(52, 103, 57, 0.05)) drop-shadow(0 0 1.5px #ffffff)" }}
            className="w-full h-auto"
          >
            <path d="M18.4 10.6C17.7 7.3 14.8 5 11.5 5 8.9 5 6.6 6.5 5.5 8.7 2.8 9 0.7 11.3 0.7 14.1c0 3 2.5 5.4 5.5 5.4h11.9c2.5 0 4.6-2 4.6-4.5 0-2.4-1.9-4.3-4.3-4.4z" />
          </svg>
        </span>

      </div>

      {/* ── Floating Animations ──────────────────────────────────────────── */}
      <style>{`
        .rf-cta__cloud--1 { animation: rfCloudFloat1 6.5s ease-in-out infinite; }
        .rf-cta__cloud--2 { animation: rfCloudFloat2 7.5s ease-in-out infinite; }
        .rf-cta__cloud--3 { animation: rfCloudFloat3 5.8s ease-in-out infinite; }
        .rf-cta__cloud--4 { animation: rfCloudFloat4 5.2s ease-in-out infinite; }
        .rf-cta__cloud--5 { animation: rfCloudFloat5 6.2s ease-in-out infinite; }
        .rf-cta__cloud--6 { animation: rfCloudFloat6 6.8s ease-in-out infinite; }
        .rf-cta__cloud--7 { animation: rfCloudFloat7 5.5s ease-in-out infinite; }

        @keyframes rfCloudFloat1 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50%      { transform: translateY(-7px) rotate(-1deg) scale(1.03); }
        }
        @keyframes rfCloudFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50%      { transform: translateY(-9px) rotate(1.5deg) scale(0.97); }
        }
        @keyframes rfCloudFloat3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-6px) rotate(0.8deg); }
        }
        @keyframes rfCloudFloat4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-4px) rotate(-1.5deg); }
        }
        @keyframes rfCloudFloat5 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes rfCloudFloat6 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50%      { transform: translateY(-7px) rotate(-1.5deg) scale(1.02); }
        }
        @keyframes rfCloudFloat7 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(2deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .rf-cta__cloud {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
