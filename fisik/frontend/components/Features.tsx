"use client";

import { motion } from "motion/react";
import React from "react";
import { useTranslations } from "next-intl";

// ─── Features ─────────────────────────────────────────────────────────────────
// Platform/capability section — "what Rimba does for you" (customization,
// shipping, gallery). Pairs with CraftMaterials, which owns the "detail &
// quality / keepsake" narrative; keep the two framings distinct.
export default function Features() {
  const t = useTranslations("Features");
  const easeCurve = [0.23, 1, 0.32, 1] as const;

  return (
    <section className="bg-[#edfce9] px-6 py-24 w-full font-poppins">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Row 1: 2-column header grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          {/* Left Column: Headline */}
          <div className="flex flex-col items-start">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: easeCurve }}
              className="font-poppins font-medium text-[#212121] mb-8"
              style={{ fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em" }}
            >
              {t("title")}
            </motion.h2>
          </div>

          {/* Right Column: Paragraph */}
          <div className="md:pt-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: easeCurve }}
              className="text-[#616161] font-normal font-poppins"
              style={{ fontSize: "18px", lineHeight: "1.6", letterSpacing: "0px" }}
            >
              {t("subtitle")}
            </motion.p>
          </div>
        </div>

        {/* Row 2: 4-column card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Spans 2 columns on lg, has background image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            transition={{ duration: 0.6, ease: easeCurve }}
            style={{
              backgroundImage: "url('https://contents.rimba.app/assets/rimba-features-image.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="lg:col-span-2 rounded-3xl p-8 min-h-[22rem] flex flex-col justify-between border border-[#e5e7eb] shadow-sm overflow-hidden relative group cursor-pointer"
          >
            {/* Dark gradient overlay on hover for premium feeling */}
            <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/[0.04] transition-colors pointer-events-none" />

            <div className="relative z-10">
              <h3 
                className="text-[#212121] font-medium font-poppins whitespace-pre-line"
                style={{ fontSize: "32px", lineHeight: "1.2", letterSpacing: "0px" }}
              >
                {t("card1Title")}
              </h3>
            </div>

            <div className="relative z-10">
              <p 
                className="text-[#212121] font-normal md:max-w-[300px] max-w-[200px] font-poppins"
                style={{ fontSize: "16px", lineHeight: "1.5", letterSpacing: "0px" }}
              >
                {t("card1Desc")}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Solid primary color card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(52,103,57,0.15)" }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeCurve }}
            className="bg-[#346739] rounded-3xl p-8 min-h-[22rem] flex flex-col justify-between overflow-hidden relative group cursor-pointer"
          >
            {/* Subtle glow overlay on hover */}
            <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors pointer-events-none" />

            <div>
              <h3 
                className="text-white font-medium whitespace-pre-line font-poppins"
                style={{ fontSize: "32px", lineHeight: "1.2", letterSpacing: "0px" }}
              >
                {t("card2Title")}
              </h3>
            </div>

            <div>
              <p 
                className="text-white/60 font-normal font-poppins"
                style={{ fontSize: "16px", lineHeight: "1.5", letterSpacing: "0px" }}
              >
                {t("card2Desc")}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Solid primary color card (Fully automated) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(52,103,57,0.15)" }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeCurve }}
            className="bg-[#346739] rounded-3xl p-8 min-h-[22rem] flex flex-col justify-between overflow-hidden relative group cursor-pointer"
          >
            {/* Subtle glow overlay on hover */}
            <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors pointer-events-none" />

            <div>
              <h3 
                className="text-white font-medium whitespace-pre-line font-poppins"
                style={{ fontSize: "32px", lineHeight: "1.2", letterSpacing: "0px" }}
              >
                {t("card3Title")}
              </h3>
            </div>

            <div>
              <p 
                className="text-white/60 font-normal font-poppins"
                style={{ fontSize: "16px", lineHeight: "1.5", letterSpacing: "0px" }}
              >
                {t("card3Desc")}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
