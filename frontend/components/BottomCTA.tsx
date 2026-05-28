"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { TextureButton } from "@/components/ui/texture-button";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useAppContext } from "@/context/AppContext";
import { Link } from "@/i18n/routing";

export default function BottomCTA() {
  const t = useTranslations("BottomCta");
  const { state } = useAppContext();

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
    <section className="relative w-full overflow-hidden py-28 md:py-36 px-6">

      {/* ── Background Image ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-cta.webp')",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[720px] mx-auto text-center flex flex-col items-center">

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeDrawer }}
          className="font-poppins text-3xl sm:text-4xl md:text-[46px] font-medium leading-[1.15] tracking-[-0.02em] text-[#212121] mb-5"
        >
          {t("title")}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.12, ease: easeDrawer }}
          className="font-poppins text-base md:text-lg text-[#616161] font-normal leading-relaxed max-w-xl mb-10"
        >
          {t("subtitle")}
        </motion.p>

        {/* Dual Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.24, ease: easeDrawer }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-10"
        >
          {/* Primary: WhatsApp Consultation — uses TextureButton */}
          <a
            href={generateMessage()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <TextureButton variant="primary" size="lg" className="font-poppins font-medium">
              <IconBrandWhatsapp className="w-5 h-5" />
              {t("primaryBtn")}
            </TextureButton>
          </a>

          {/* Secondary: Digital Invitations — uses TextureButton secondary */}
          <Link href="/dashboard">
            <TextureButton variant="secondary" size="lg" className="font-poppins font-medium">
              {t("secondaryBtn")}
            </TextureButton>
          </Link>
        </motion.div>

        {/* Trust Badges Row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.36, ease: easeDrawer }}
          className="flex items-center justify-center gap-8 text-sm font-poppins text-[#616161]"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">★</span>
            <span className="font-medium text-[#212121]">4.9</span>
            <span className="text-[#93939f]">{t("badge1")}</span>
          </div>
          <div className="w-px h-4 bg-[#d9d9dd]" />
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">★</span>
            <span className="font-medium text-[#212121]">25+</span>
            <span className="text-[#93939f]">{t("badge2")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
