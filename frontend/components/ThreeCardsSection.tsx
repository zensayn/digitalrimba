"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IconCoffee, IconHeartFilled, IconMailFilled, IconArrowRight } from "@tabler/icons-react";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: "01",
    title: "Amplify Your Event Reach",
    subtitle: "Bridal Engagement",
    color: "bg-clay-ochre",
    icon: IconCoffee,
  },
  {
    id: "02",
    title: "Connect, Manage, and Analyze",
    subtitle: "Moment Scheduling",
    color: "bg-clay-pink",
    icon: IconHeartFilled,
  },
  {
    id: "03",
    title: "Centralize Communication",
    subtitle: "Guest Management",
    color: "bg-clay-lavender",
    icon: IconMailFilled,
  }
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
    <section className="w-full bg-clay-canvas py-20 md:py-40 px-6 md:px-10">
      <div 
        ref={containerRef}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
      >
        {CARDS.map((card, index) => (
          <div 
            key={card.id}
            ref={(el) => { cardRefs.current[index] = el; }}
            className="flex flex-col gap-6 group"
          >
            {/* Top Text */}
            <div className="px-2">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-clay-ink leading-tight mb-2">
                {card.title}
              </h3>
            </div>

            {/* Main Visual Card */}
            <div className={`relative w-full aspect-[4/3] ${card.color} rounded-[24px] p-8 flex flex-col justify-between overflow-hidden shadow-sm transition-transform duration-500 group-hover:scale-[1.02]`}>
              <div className="flex justify-between items-start">
                <span className="text-white/60 text-xs font-bold uppercase  font-poppins">
                  {card.subtitle}
                </span>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center text-white rotate-12">
                   <card.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-7xl md:text-8xl font-poppins font-bold text-white tracking-tighter leading-none">
                  {card.id}
                </span>
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white">
                  <IconArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
