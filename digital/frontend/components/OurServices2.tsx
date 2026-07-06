"use client";

import { useTranslations } from "next-intl";

type ServiceCard = {
  key: "card1" | "card2" | "card3";
  image: string;
  titleColor: string;
  descColor: string;
  gradientClass: string;
};

const CARDS: ServiceCard[] = [
  {
    key: "card1",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    titleColor: "text-[#ff7759]", // Coral from DESIGN.md
    descColor: "text-[#ffad9b]", // Soft Coral from DESIGN.md
    gradientClass: "from-[#200a05] via-[#200a05]/40 to-transparent", // Deep warm tint
  },
  {
    key: "card2",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    titleColor: "text-[#edfce9]", // Pale Green from DESIGN.md
    descColor: "text-white/80",
    gradientClass: "from-[#001411] via-[#001411]/40 to-transparent", // Deep green-black tint
  },
  {
    key: "card3",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    titleColor: "text-[#f1f5ff]", // Pale Blue from DESIGN.md
    descColor: "text-white/80",
    gradientClass: "from-[#030910] via-[#030910]/40 to-transparent", // Deep navy-black tint
  },
];

export default function OurServices2() {
  const t = useTranslations("OurServices2");

  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            {t("heading")}
          </h2>
        </div>

        {/* ── RESPONSIVE 3-COLUMN GRID LAYOUT ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card) => {
            return (
              <div
                key={card.key}
                className="group relative rounded-[28px] overflow-hidden h-[420px] md:h-[460px] lg:h-[500px] flex flex-col justify-end p-8 cursor-pointer shadow-xs border border-neutral-100/50"
              >
                {/* Background Fullscreen Image */}
                <img
                  src={card.image}
                  alt={t(`${card.key}.title`)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Tinted Gradient Overlay for Contrast and Polish */}
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradientClass} opacity-90 transition-opacity duration-300 group-hover:opacity-95`} />

                {/* Text Content Overlay */}
                <div className="relative z-10 space-y-2">
                  <h3 className={`text-2xl md:text-3xl font-bold tracking-tight leading-tight ${card.titleColor}`}>
                    {t(`${card.key}.title`)}
                  </h3>
                  <p className={`text-sm leading-relaxed ${card.descColor}`}>
                    {t(`${card.key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}