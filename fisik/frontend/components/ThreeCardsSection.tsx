"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconArrowRight } from "@tabler/icons-react";

gsap.registerPlugin(ScrollTrigger);

const SERIES = [
  {
    id: "01",
    name: "Heartwood Series",
    tagline: "Masterpiece",
    description: "Material langka, foil emas, emboss timbul. Untuk momen yang tidak terlupakan.",
    color: "bg-[#003c33]",
    textColor: "text-white",
    accentColor: "text-white/50",
    badge: "Luxury · Rare",
    badgeBg: "bg-white/10 text-white/60",
  },
  {
    id: "02",
    name: "Timber Series",
    tagline: "Balanced",
    description: "Kokoh, bertekstur, berkualitas. Keseimbangan sempurna antara estetika dan keterjangkauan.",
    color: "bg-[#346739]",
    textColor: "text-white",
    accentColor: "text-white/50",
    badge: "Strong · Textured",
    badgeBg: "bg-white/10 text-white/60",
  },
  {
    id: "03",
    name: "Leaf Series",
    tagline: "Essential",
    description: "Bersih, fungsional, elegan. Desain minimalis yang berbicara sendiri.",
    color: "bg-[#eeece7]",
    textColor: "text-[#212121]",
    accentColor: "text-[#212121]/40",
    badge: "Simple · Light",
    badgeBg: "bg-[#212121]/5 text-[#212121]/40",
  },
];

export default function ThreeCardsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { scale: 0.8, opacity: 0, y: 50 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 50%",
              scrub: 1,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-[#ffffff] py-20 md:py-40 px-6 md:px-10 border-t border-[#d9d9dd]">
      <div className="max-w-[1200px] mx-auto mb-16">
        <span className="font-poppins uppercase text-xs text-[#346739] font-bold block mb-4">
          Seri Produk
        </span>
        <h2 className="text-4xl md:text-6xl font-poppins font-normal tracking-[-0.035em] text-[#212121] leading-tight">
          Tiga seri, <br />satu standar kualitas.
        </h2>
      </div>

      <div
        ref={containerRef}
        className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
      >
        {SERIES.map((series, index) => (
          <div
            key={series.id}
            ref={(el) => { cardRefs.current[index] = el; }}
            className="flex flex-col gap-6 group"
          >
            {/* Main Visual Card */}
            <div className={`relative w-full aspect-[3/4] ${series.color} rounded-[32px] p-8 flex flex-col justify-between overflow-hidden shadow-sm transition-transform duration-500 group-hover:scale-[1.02]`}>
              {/* Badge */}
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${series.badgeBg}`}>
                  {series.badge}
                </span>
                <span className={`text-[10px] font-bold uppercase ${series.accentColor}`}>
                  {series.tagline}
                </span>
              </div>

              {/* Card number + arrow */}
              <div className="flex items-end justify-between mt-auto">
                <span className={`text-8xl md:text-9xl font-poppins font-bold tracking-tighter leading-none ${series.textColor} opacity-20`}>
                  {series.id}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${series.textColor === "text-white" ? "bg-white/10" : "bg-[#212121]/5"}`}>
                  <IconArrowRight className={`w-4 h-4 ${series.textColor}`} />
                </div>
              </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Text below card */}
            <div className="px-2">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-[#212121] leading-tight mb-2">
                {series.name}
              </h3>
              <p className="text-sm text-[#212121]/50 font-poppins leading-relaxed">
                {series.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
