"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { TextureButton } from "@/components/ui/texture-button";
import { useTranslations } from 'next-intl';
import React from "react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const COLOR_BLOCKS = [
  { color: "#eeece7", rotation: -2 }, // soft-stone
  { color: "#003c33", rotation: 3 },  // deep-green
  { color: "#edfce9", rotation: 1.5 }, // pale-green
  { color: "#346739", rotation: -1, isPrimary: true }, // primary green
];

export default function Hero() {
  const t = useTranslations('Hero');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const primaryCardRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !primaryCardRef.current || !triggerRef.current || !heroContentRef.current || !collageRef.current) return;

    const ctx = gsap.context(() => {
      // Responsive values using gsap.matchMedia
      const mm = gsap.matchMedia();

      mm.add({
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)"
      }, (context) => {
        // @ts-ignore
        const { isDesktop } = context.conditions;

        // Set initial positions via GSAP to avoid CSS conflicts
        gsap.set(collageRef.current, {
          y: isDesktop ? "15vh" : "2vh" // Tucked slightly below on mobile, pushed up more on desktop
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top top",
            end: "+=1500",
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. Synchronized Start: Text fade + Card straighten + Collage move
        tl.to(heroContentRef.current, {
          opacity: 0,
          y: -100,
          duration: 1,
          ease: "power2.inOut",
        }, 0);

        tl.to(primaryCardRef.current, {
          rotate: 0,
          duration: 0.8,
          ease: "power2.inOut",
        }, 0);

        // Move the whole collage baseline to 0 during zoom
        tl.to(collageRef.current, {
          y: 0,
          duration: 1.5,
          ease: "power3.inOut"
        }, 0);

        // 2. Zoom the primary card to fullscreen
        tl.to(primaryCardRef.current, {
          width: "100vw",
          height: "100vh",
          maxWidth: "none",
          bottom: 0,
          scale: 1,
          zIndex: 100,
          duration: 1.5,
          ease: "power3.inOut",
        }, 0);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-white font-poppins min-h-screen">
      <div ref={triggerRef} className="w-full h-screen h-[100dvh] relative overflow-hidden flex flex-col bg-white">

        {/* Hero Header */}
        <div ref={heroContentRef} className="flex-1 flex flex-col items-center justify-center pt-10 pb-40 md:pt-20 md:pb-32 px-6 text-center z-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-poppins font-normal text-[#346739] uppercase tracking-[0.28px] text-[14px] mb-6"
          >
            {t('tagline')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[96px] font-poppins font-normal tracking-[-1.92px] leading-none text-[#212121] mb-12 max-w-5xl"
          >
            {t('title').split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i === 0 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-8"
          >
            <TextureButton size="lg" className="min-w-[220px] rounded-full">
              {t('primaryAction')}
            </TextureButton>
            <TextureButton variant="secondary" size="lg" className="min-w-[220px] rounded-full">
              {t('secondaryAction')}
            </TextureButton>
          </motion.div>
        </div>

        {/* Visual Component: The Tilted Blocks Collage */}
        <div className="absolute bottom-0 left-0 w-full h-[60vh] flex justify-center z-10 pointer-events-none">
          <div ref={collageRef} className="relative w-full max-w-5xl flex justify-center items-end h-full">
            {COLOR_BLOCKS.map((block, index) => {
              const isPrimary = block.isPrimary;
              return (
                <div
                  key={index}
                  ref={isPrimary ? primaryCardRef : null}
                  style={{
                    backgroundColor: block.color,
                    zIndex: isPrimary ? 50 : index,
                    transform: `rotate(${block.rotation}deg)`,
                  }}
                  className={`absolute bottom-0 w-[75%] md:w-[65%] h-[25vh] md:h-[35vh] shadow-2xl flex items-center justify-center rounded-[22px] overflow-hidden origin-bottom ${isPrimary ? "z-[60]" : ""
                    }`}
                >
                  {/* Subtle texture/pattern on blocks */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--foreground)_1px,_transparent_1px)] bg-[size:24px_24px]" />

                  {isPrimary && (
                    <div className="flex flex-col items-center gap-6 p-12">
                      <div className="w-24 h-24 border-4 border-white/20 rounded-[8px] flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/40 rounded-[4px]" />
                      </div>
                      <div className="text-white/20 text-4xl font-bold  uppercase text-center">
                        RIMBA DIGITAL
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
