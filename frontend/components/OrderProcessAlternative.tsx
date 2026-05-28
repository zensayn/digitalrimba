"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IconMail, 
  IconChecks, 
  IconPalette, 
  IconSettings, 
  IconTruck 
} from "@tabler/icons-react";

// Safe client-side plugin registration for Next.js SSR
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OrderProcess() {
  const t = useTranslations("OrderProcess");
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      id: 1,
      badge: "STEP 01",
      title: t("step1Title"),
      desc: t("step1Desc"),
      icon: IconMail,
      bgImage: "https://assets.codepen.io/16327/portrait-pattern-1.jpg",
    },
    {
      id: 2,
      badge: "STEP 02",
      title: t("step2Title"),
      desc: t("step2Desc"),
      icon: IconChecks,
      bgImage: "https://assets.codepen.io/16327/portrait-pattern-2.jpg",
    },
    {
      id: 3,
      badge: "STEP 03",
      title: t("step3Title"),
      desc: t("step3Desc"),
      icon: IconPalette,
      bgImage: "https://assets.codepen.io/16327/portrait-pattern-3.jpg",
    },
    {
      id: 4,
      badge: "STEP 04",
      title: t("step4Title"),
      desc: t("step4Desc"),
      icon: IconSettings,
      bgImage: "https://assets.codepen.io/16327/portrait-pattern-4.jpg",
    },
    {
      id: 5,
      badge: "STEP 05",
      title: t("step5Title"),
      desc: t("step5Desc"),
      icon: IconTruck,
      bgImage: "https://assets.codepen.io/16327/portrait-pattern-2.jpg", // Looping pattern elegantly
    }
  ];

  useEffect(() => {
    // Standard React unmount-safe GSAP context
    let ctx = gsap.context(() => {
      const wrappers = gsap.utils.toArray(".order-process-card-wrapper");
      const cards = gsap.utils.toArray(".order-process-card");

      wrappers.forEach((wrapper: any, i: number) => {
        const card = cards[i] as HTMLElement;
        let scale = 1;
        let rotation = 0;
        
        // Exact formula matching your Codepen scale and rotation logic
        if (i !== cards.length - 1) {
          scale = 0.9 + 0.025 * i;
          rotation = -10;
        }

        gsap.to(card, {
          scale: scale,
          rotationX: rotation,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top " + (200 + 15 * i), // Shifted down to the middle of the viewport, safely clearing the header navbar
            end: "bottom 660", // Unpin when the bottom of the cards container reaches the bottom of the stacked Card 5 (260 + 400 = 660) to eliminate snapping
            endTrigger: cardsContainerRef.current, // Triggers off the cards deck container directly to align natural flow
            scrub: true,
            pin: wrapper,
            pinSpacing: false, // Let subsequent cards scroll over pinned ones
            invalidateOnRefresh: true,
            id: (i + 1).toString()
          }
        });
      });

    }, containerRef);

    return () => ctx.revert(); // Safely revert all ScrollTriggers
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="wrapper order-process-wrapper relative w-full bg-[#fbfbfb] px-6 md:px-10 overflow-hidden border-t border-[#d9d9dd]/40 select-none"
    >
      
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e2e2e6_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-50 pointer-events-none" />

      {/* Top Transition Spacer */}
      <div className="h-[12vh] sm:h-[16vh]" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-24 text-center max-w-2xl mx-auto flex flex-col items-center">
          <p className="text-[11px] font-semibold text-[#346739] uppercase tracking-widest mb-3 font-poppins">
            {t("tagline")}
          </p>
          <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#212121] leading-[1.15]">
            {t("title")}
          </h2>
        </header>

        {/* 3D Cards Flow Container */}
        <div className="flex flex-col items-center w-full min-h-[800px] pb-[10vh]">
          
          <div ref={cardsContainerRef} className="cards order-process-cards w-full max-w-[750px] mx-auto px-0 sm:px-6 lg:px-12 block">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className="card-wrapper order-process-card-wrapper w-full relative mb-[50px] last:mb-0"
                  style={{ perspective: 500 }}
                >
                  <div
                    className="card order-process-card w-full h-[400px] rounded-[10px] bg-cover bg-no-repeat bg-center overflow-hidden shadow-[0_30px_30px_-10px_rgba(0,0,0,0.3)] will-change-transform relative"
                    style={{ 
                      backgroundImage: `url('${step.bgImage}')`,
                      transformStyle: "preserve-3d" 
                    }}
                  >
                    
                    {/* Dark Glassmorphic Content Layer to Protect Text Legibility */}
                    <div className="w-full h-full bg-black/45 backdrop-blur-[1px] p-8 sm:p-10 flex flex-col justify-between text-white">
                      
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-white/15 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-[8px] bg-white/10 text-white border border-white/10">
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <span className="font-poppins text-[10px] font-bold tracking-widest text-white/90 uppercase border border-white/20 bg-white/10 px-2.5 py-1 rounded-[6px]">
                            {step.badge}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-col gap-2 mt-2">
                        <h4 className="font-poppins text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                          {step.title}
                        </h4>
                        <p className="font-poppins text-xs sm:text-[14px] leading-relaxed text-white/80 pr-2">
                          {step.desc}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/40 tracking-wider font-semibold border-t border-white/10 pt-4 mt-2 font-poppins">
                        <span>RIMBA FISIK WORKFLOW</span>
                        <span>ARTISANAL PROCESS</span>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Bottom Transition Spacer (matches .spacer height: 70vh) */}
      <div className="h-[16vh] sm:h-[20vh]" />
      
    </section>
  );
}
