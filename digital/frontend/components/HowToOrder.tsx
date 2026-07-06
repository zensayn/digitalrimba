"use client";

import Link from "next/link";

// Swap filmstrip pattern: dark full-width band, tall portrait photo cards in a
// native CSS scroll-snap track. ponytail: no arrow buttons — trackpad/touch scroll
// covers it; add buttons if analytics say desktop users miss the overflow.

type Frame = {
  step: string;
  title: string;
  duration: string;
  image: string;
};

const FRAMES: Frame[] = [
  {
    step: "01",
    title: "Pick a theme",
    duration: "± 2 min",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&q=80",
  },
  {
    step: "02",
    title: "Tell your story",
    duration: "± 10 min",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
  },
  {
    step: "03",
    title: "Publish",
    duration: "instant",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=80",
  },
  {
    step: "04",
    title: "Share on WhatsApp",
    duration: "one tap",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=700&q=80",
  },
  {
    step: "05",
    title: "Watch RSVPs arrive",
    duration: "automatic",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=700&q=80",
  },
];

export default function HowToOrder() {
  return (
    <section className="bg-[#00201b] text-white py-20 overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 md:px-12 lg:px-24 flex items-end justify-between gap-8 pb-10">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase text-[#edfce9]/60">
            How to order
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-amoria font-normal tracking-tight leading-tight text-white">
            The whole journey, at a glance
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
            key={f.step}
            className="group relative snap-start shrink-0 w-[240px] md:w-[280px] aspect-[3/4] rounded-[22px] overflow-hidden"
          >
            <img
              src={f.image}
              alt={f.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00201b]/85 via-[#00201b]/15 to-transparent" />
            <span className="absolute top-5 left-5 font-amoria text-4xl text-white/90">
              {f.step}
            </span>
            <div className="absolute bottom-5 left-5 right-5 space-y-1">
              <p className="text-lg font-medium leading-snug">{f.title}</p>
              <p className="text-xs font-medium uppercase text-[#edfce9]/70">
                {f.duration}
              </p>
            </div>
          </div>
        ))}
        {/* closing CTA card */}
        <Link
          href="/dashboard/invitation"
          className="relative snap-start shrink-0 w-[240px] md:w-[280px] aspect-[3/4] rounded-[22px] bg-[#edfce9] flex flex-col items-start justify-between p-6 transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <span className="font-amoria text-4xl text-[#003c33]/40">→</span>
          <div className="space-y-2">
            <p className="text-lg font-medium leading-snug text-[#003c33]">
              Mulai sekarang
            </p>
            <p className="text-xs text-[#346739]">Your invitation is 15 minutes away.</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
