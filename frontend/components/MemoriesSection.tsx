"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconMailFilled, IconHeartFilled } from "@tabler/icons-react";

gsap.registerPlugin(ScrollTrigger);

export default function MemoriesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const leftIconRef = useRef<HTMLDivElement>(null);
  const rightIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      // Text stays middle then slides left
      tl.fromTo(
        textRef.current,
        { x: 0, opacity: 0.5 },
        { x: -60, opacity: 1, duration: 1 }
      );

      // Left icon appearing above (top-left)
      tl.fromTo(
        leftIconRef.current,
        { scale: 0, opacity: 0, rotate: -45, x: 60 },
        { scale: 1, opacity: 1, rotate: -15, x: 0, duration: 0.6 },
        "<"
      );

      // Right icon appearing beside (scaling small to large)
      tl.fromTo(
        rightIconRef.current,
        { scale: 0.5, opacity: 0, x: -60 },
        { scale: 1.2, opacity: 1, x: 0, duration: 0.6 },
        "<"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-clay-canvas py-40 md:py-60 overflow-hidden flex items-center justify-center"
    >
      <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-8">
        {/* Top-Left Floating Component */}
        <div
          ref={leftIconRef}
          className="absolute -top-12 -left-8 md:-top-16 md:-left-12 w-12 h-12 md:w-16 md:h-16 bg-clay-lavender text-white rounded-[12px] flex items-center justify-center shadow-lg opacity-0"
        >
          <IconMailFilled className="w-6 h-6 md:w-8 md:h-8" />
          <div className="absolute -top-2 -right-2 bg-clay-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">10</div>
        </div>

        {/* The Main Text */}
        <h2
          ref={textRef}
          className="text-4xl md:text-7xl lg:text-8xl font-poppins font-normal tracking-[-0.035em] text-clay-ink leading-tight text-center md:text-left whitespace-nowrap"
        >
          Seamless Moments,<br />
          Timeless Memories
        </h2>

        {/* Right Scaling Component */}
        <div
          ref={rightIconRef}
          className="bg-clay-ochre px-6 py-4 md:px-8 md:py-6 rounded-[16px] md:rounded-[24px] flex items-center justify-center shadow-md mt-4 md:mt-0 opacity-0"
        >
          <span className="text-xl md:text-4xl font-amoria font-bold text-clay-ink tracking-tight">Rimba</span>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full pointer-events-none opacity-[0.03]">
        <div className="w-full h-full border-[1px] border-clay-ink rounded-full scale-[1.5]" />
      </div>
    </section>
  );
}
