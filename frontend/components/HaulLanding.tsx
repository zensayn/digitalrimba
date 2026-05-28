"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin } from "@tabler/icons-react";
import Image from "next/image";

const SOCIAL_ICONS = [
  { Icon: IconBrandFacebook, href: "#" },
  { Icon: IconBrandTwitter, href: "#" },
  { Icon: IconBrandInstagram, href: "#" },
  { Icon: IconBrandLinkedin, href: "#" },
];

export default function HaulLanding() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax transform for the truck
  const truckY = useTransform(scrollYProgress, [0, 1], [-50, 150]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Top Spacer Section */}
      <section className="h-[50vh] md:h-[30vh] bg-[#FDFDFD] flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-gray-300 text-xs font-bold uppercase tracking-[0.5em]"
        >
          View Below
        </motion.span>
      </section>

      {/* Main Parallax Container */}
      <section 
        ref={containerRef}
        className="h-screen relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260430_115327_3f256636-9e63-4885-8d0b-09317dc2b0a5.png&w=1280&q=85')`
        }}
      >
        {/* The Top-Aligned Footer Card */}
        <div className="absolute top-0 w-full pt-12 md:pt-24 px-4 z-30">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-7xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl md:rounded-3xl overflow-hidden"
          >
            {/* Footer Content (Top Half) */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
              {/* Logo Area */}
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-inner p-2 flex items-center justify-center">
                  <svg viewBox="0 0 256 256" className="w-full h-full fill-white">
                    <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
                  </svg>
                </div>
                <span className="text-gray-900 text-2xl md:text-3xl font-bold tracking-tighter uppercase">HAUL!</span>
              </div>

              {/* Links Area */}
              <div className="flex flex-wrap gap-12 md:gap-16">
                {/* Company */}
                <div className="flex flex-col gap-4">
                  <span className="uppercase  text-sm font-bold text-gray-900">Company</span>
                  <div className="flex flex-col gap-2">
                    {["Founding", "Platform", "Testify"].map(link => (
                      <a key={link} href="#" className="text-gray-500 font-medium hover:text-orange-600 transition-colors">{link}</a>
                    ))}
                  </div>
                </div>
                {/* Mobile */}
                <div className="flex flex-col gap-4">
                  <span className="uppercase  text-sm font-bold text-gray-900">Mobile</span>
                  <div className="flex flex-col gap-2">
                    {["Get Apple App", "Get Google App"].map(link => (
                      <a key={link} href="#" className="text-gray-500 font-medium hover:text-orange-600 transition-colors">{link}</a>
                    ))}
                  </div>
                </div>
                {/* Contracts */}
                <div className="flex flex-col gap-4">
                  <span className="uppercase  text-sm font-bold text-gray-900">Contracts</span>
                  <div className="flex flex-col gap-2">
                    {["Private Data", "User Consent"].map(link => (
                      <a key={link} href="#" className="text-gray-500 font-medium hover:text-orange-600 transition-colors">{link}</a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Content (Bottom Bar) */}
            <div className="border-t border-gray-100 bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-gray-500 font-medium text-center md:text-left">
                © 2026 HAUL! All Rights Reserved
              </span>
              <div className="flex gap-3">
                {SOCIAL_ICONS.map(({ Icon, href }, idx) => (
                  <a
                    key={idx}
                    href={href}
                    className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Truck Parallax Layer */}
        <motion.div
          style={{ y: truckY }}
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-20 flex items-end justify-center"
        >
          <Image
            src="https://roof-wish-40038865.figma.site/_components/v2/f31fd17907ce60745d45e83a61d44fd3810d5f25/truck_1.8c4bff83.png"
            alt="Parallax Truck"
            className="w-full h-full object-contain object-bottom origin-bottom scale-[1.5] sm:scale-110 md:scale-[2.0] lg:scale-105"
          />
        </motion.div>
      </section>
    </div>
  );
}
