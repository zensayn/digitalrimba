"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

const SOCIAL_ICONS = [
  { Icon: IconBrandFacebook, href: "#", label: "Facebook" },
  { Icon: IconBrandTwitter, href: "#", label: "Twitter" },
  { Icon: IconBrandInstagram, href: "#", label: "Instagram" },
  { Icon: IconBrandLinkedin, href: "#", label: "LinkedIn" },
];

const LINK_GROUPS: { title: string; links: string[] }[] = [
  {
    title: "Produk",
    links: ["Rimba Fisik", "Rimba Digital",],
  },
  {
    title: "Layanan",
    links: ["Konsultasi Desain", "Cetak & Kirim", "Galeri"],
  },
  {
    title: "Legal",
    links: ["Kebijakan Privasi", "Syarat & Ketentuan"],
  },
];

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Truck parallax (different scroll speed than the still background)
  const truckY = useTransform(scrollYProgress, [0, 1], [-50, 150]);

  return (
    <footer className="relative bg-white overflow-hidden font-poppins">
      {/* 2. MAIN PARALLAX CONTAINER */}
      <div
        ref={containerRef}
        className="h-screen relative bg-cover bg-center overflow-hidden"
      >
        {/* Foreground parallax layer (truck) */}
        <motion.div
          style={{ y: truckY }}
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-20 flex items-end justify-center"
        >
          <Image
            src="/rimba_footer_new.webp"
            alt=""
            aria-hidden="true"
            fill
            className="object-contain object-bottom origin-bottom scale-[3.0] sm:scale-110 md:scale-[2.0] lg:scale-105"
          />
        </motion.div>

        {/* Top-aligned footer card */}
        <div className="absolute top-0 w-full pt-12 md:pt-24 px-4 z-30">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-[1200px] mx-auto bg-white shadow-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-[#f2f2f2]"
          >
            {/* Top half — logo + link groups */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
              {/* Logo block */}
              <div className="flex items-center gap-5 -ml-9 md:-ml-16">
                <Link
                  href="/"
                  className="inline-block hover:opacity-85 transition-opacity"
                >
                  <Image
                    src="https://contents.rimba.app/assets/rimba-logo.webp"
                    alt="Rimba Fisik"
                    width={340}
                    height={136}
                    className="block w-auto h-28 md:h-[136px] object-contain -my-7 md:-my-9"
                    priority
                  />
                </Link>
              </div>

              {/* Link groups */}
              <div className="flex flex-wrap gap-12 md:gap-16">
                {LINK_GROUPS.map((group) => (
                  <div key={group.title} className="flex flex-col gap-4">
                    <span className="uppercase text-xs font-bold text-[#93939f]">
                      {group.title}
                    </span>
                    <div className="flex flex-col gap-2">
                      {group.links.map((link) => (
                        <a
                          key={link}
                          href="#"
                          className="text-[#212121] text-sm font-medium hover:text-[#346739] transition-colors"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#f2f2f2] bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-xs text-[#93939f] font-medium text-center md:text-left">
                © 2026 Rimba Fisik. Seluruh hak cipta dilindungi.
              </span>

              <div className="flex gap-3">
                {SOCIAL_ICONS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-full border border-[#f2f2f2] flex items-center justify-center text-[#93939f] hover:bg-[#346739] hover:text-white hover:border-[#346739] transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
