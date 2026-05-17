"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin } from "@tabler/icons-react";

const SOCIAL_ICONS = [
    { Icon: IconBrandFacebook, href: "#" },
    { Icon: IconBrandTwitter, href: "#" },
    { Icon: IconBrandInstagram, href: "#" },
    { Icon: IconBrandLinkedin, href: "#" },
];

export default function Footer() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Parallax transform for the truck
    const truckY = useTransform(scrollYProgress, [0, 1], [-50, 150]);

    return (
        <footer className="relative bg-background overflow-hidden">
            {/* Main Parallax Container - Restored to HAUL! Style */}
            <div
                ref={containerRef}
                className="h-screen relative bg-cover bg-center overflow-hidden"
                style={{
                    backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260430_115327_3f256636-9e63-4885-8d0b-09317dc2b0a5.png&w=1280&q=85')`
                }}
            >
                {/* Background Truck Parallax Layer - Restored to Full Color/Opacity */}
                <motion.div
                    style={{ y: truckY }}
                    className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-20 flex items-end justify-center"
                >
                    <img
                        src="https://roof-wish-40038865.figma.site/_components/v2/f31fd17907ce60745d45e83a61d44fd3810d5f25/truck_1.8c4bff83.png"
                        alt="Parallax Truck"
                        className="w-full h-full object-contain object-bottom origin-bottom scale-[1.5] sm:scale-110 md:scale-[2.0] lg:scale-105"
                    />
                </motion.div>

                {/* The Top-Aligned Footer Card - DESIGN.MD STYLE */}
                <div className="absolute top-0 w-full pt-12 md:pt-24 px-4 z-30">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-7xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl rounded-none overflow-hidden font-mazzard"
                    >
                        {/* Footer Content (Top Half) */}
                        <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between gap-12 md:gap-8">
                            {/* Logo Area */}
                            <div className="flex items-center gap-6">
                                <div className="bg-brand-primary w-12 h-12 rounded-none p-2 flex items-center justify-center">
                                    <svg viewBox="0 0 256 256" className="w-full h-full fill-white">
                                        <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-black text-3xl font-normal tracking-tighter uppercase leading-none">HAUL!</span>
                                    <span className="font-amoria text-[10px] uppercase tracking-[0.4em] text-black/40 mt-1">Institutional Power</span>
                                </div>
                            </div>

                            {/* Links Area */}
                            <div className="flex flex-wrap gap-12 md:gap-16">
                                {/* Company */}
                                <div className="flex flex-col gap-4">
                                    <span className="font-amoria uppercase tracking-[0.2em] text-[10px] font-bold text-black/40">Company</span>
                                    <div className="flex flex-col gap-2">
                                        {["Founding", "Platform", "Testify"].map(link => (
                                            <a key={link} href="#" className="text-black text-sm font-medium hover:text-brand-primary transition-colors tracking-tight">{link}</a>
                                        ))}
                                    </div>
                                </div>
                                {/* Mobile */}
                                <div className="flex flex-col gap-4">
                                    <span className="font-amoria uppercase tracking-[0.2em] text-[10px] font-bold text-black/40">Mobile</span>
                                    <div className="flex flex-col gap-2">
                                        {["Get Apple App", "Get Google App"].map(link => (
                                            <a key={link} href="#" className="text-black text-sm font-medium hover:text-brand-primary transition-colors tracking-tight">{link}</a>
                                        ))}
                                    </div>
                                </div>
                                {/* Contracts */}
                                <div className="flex flex-col gap-4">
                                    <span className="font-amoria uppercase tracking-[0.2em] text-[10px] font-bold text-black/40">Contracts</span>
                                    <div className="flex flex-col gap-2">
                                        {["Private Data", "User Consent"].map(link => (
                                            <a key={link} href="#" className="text-black text-sm font-medium hover:text-brand-primary transition-colors tracking-tight">{link}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Content (Bottom Bar) */}
                        <div className="border-t border-gray-100 bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <span className="text-[10px] text-black/30 font-bold uppercase  text-center md:text-left">
                                © 2026 HAUL! All Rights Reserved
                            </span>
                            <div className="flex gap-3">
                                {SOCIAL_ICONS.map(({ Icon, href }, idx) => (
                                    <a
                                        key={idx}
                                        href={href}
                                        className="w-10 h-10 rounded-none border border-gray-100 flex items-center justify-center text-black/40 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
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