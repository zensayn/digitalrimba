"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Swap filmstrip pattern: dark full-width band, tall portrait photo cards in a
// native CSS scroll-snap track. ponytail: no arrow buttons — trackpad/touch scroll
// covers it; add buttons if analytics say desktop users miss the overflow.

type Frame = {
  key: "frame1" | "frame2" | "frame3" | "frame4" | "frame5";
  step: string;
  image: string;
};

const FRAMES: Frame[] = [
  {
    key: "frame1",
    step: "01",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&q=80",
  },
  {
    key: "frame2",
    step: "02",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
  },
  {
    key: "frame3",
    step: "03",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=80",
  },
  {
    key: "frame4",
    step: "04",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=700&q=80",
  },
  {
    key: "frame5",
    step: "05",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=700&q=80",
  },
];

export default function HowToOrder() {
  const t = useTranslations("HowToOrder");

  return (
    <section className="bg-[#00201b] text-white py-20 overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 md:px-12 lg:px-24 flex items-end justify-between gap-8 pb-10">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase text-[#edfce9]/60">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-amoria font-normal tracking-tight leading-tight text-white">
            {t("heading")}
          </h2>
        </div>
        <p aria-hidden="true" className="hidden md:block shrink-0 text-sm text-white/40">
          scroll →
        </p>
      </div>

      {/* filmstrip — native scroll-snap, bleeds off the right edge */}
      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-6 md:px-12 lg:px-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FRAMES.map((f) => (
          <div
            key={f.key}
            className="group relative snap-start shrink-0 w-[240px] md:w-[280px] aspect-[3/4] rounded-[22px] overflow-hidden"
          >
            <Image
              src={f.image}
              alt={t(`frames.${f.key}.title`)}
              fill
              sizes="(min-width: 768px) 280px, 240px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#00201b]/85 via-[#00201b]/15 to-transparent" />
            <span className="absolute top-5 left-5 font-amoria text-4xl text-white/90">
              {f.step}
            </span>
            <div className="absolute bottom-5 left-5 right-5 space-y-1">
              <p className="text-lg font-medium leading-snug">{t(`frames.${f.key}.title`)}</p>
              <p className="text-xs font-medium uppercase text-[#edfce9]/70">
                {t(`frames.${f.key}.duration`)}
              </p>
            </div>
          </div>
        ))}
        {/* closing CTA card */}
        <Link
          href="/dashboard/invitations/new"
          className="relative snap-start shrink-0 w-[240px] md:w-[280px] aspect-[3/4] rounded-[22px] bg-[#edfce9] flex flex-col items-start justify-between p-6 transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <span className="font-amoria text-4xl text-[#003c33]/40">→</span>
          <div className="space-y-2">
            <p className="text-lg font-medium leading-snug text-[#003c33]">
              {t("ctaTitle")}
            </p>
            <p className="text-xs text-[#346739]">{t("ctaSubtitle")}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
