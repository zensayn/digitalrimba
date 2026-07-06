"use client";

import Link from "next/link";

// Kalstore stacked-process pattern + CSS sticky card-deck scroll: cards pile up
// as you scroll, header stays pinned left. No JS state — pure layout.
// Photos take ~58% of each card and fade into the wash via a mask — no hard seam.

type Step = {
  title: string;
  detail: string;
  duration: string;
  image: string;
  surface: string;
};

const STEPS: Step[] = [
  {
    title: "Pick a theme",
    detail: "Browse hand-crafted themes and choose the one that feels like you.",
    duration: "± 2 min",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#eeece7]",
  },
  {
    title: "Tell your story",
    detail: "Names, date, venue, photos — one simple form, no design skills needed.",
    duration: "± 10 min",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#edfce9]",
  },
  {
    title: "Publish",
    detail: "Preview live as you type, publish the moment it feels right.",
    duration: "instant",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#f1f5ff]",
  },
  {
    title: "Share on WhatsApp",
    detail: "Send every guest a personal link with their name on it.",
    duration: "one tap",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#ffefe9]",
  },
  {
    title: "Watch RSVPs arrive",
    detail: "Replies land in your dashboard by themselves. That's it.",
    duration: "automatic",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
    surface: "bg-white",
  },
];

export default function CaraOrder() {
  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[4fr_8fr] gap-12 lg:gap-20 items-start">
        {/* Pinned intro */}
        <div className="space-y-5 lg:sticky lg:top-32">
          <p className="text-sm font-medium uppercase text-[#93939f]">Cara Order</p>
          <h2 className="text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            Five steps.
            <br />
            About 15 minutes.
          </h2>
          <p className="text-base leading-relaxed text-[#616161] max-w-xs">
            Most of them do themselves.
          </p>
          <Link
            href="/dashboard/invitation"
            className="inline-block px-6 py-3 rounded-full bg-[#003c33] text-white text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Mulai sekarang
          </Link>
        </div>

        {/* Card deck — each card sticks and the next piles on top */}
        <div>
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="sticky"
              style={{ top: `${96 + i * 20}px`, paddingBottom: i === STEPS.length - 1 ? 0 : 24 }}
            >
              <div
                className={`${s.surface} relative rounded-[28px] overflow-hidden border border-black/[0.04] shadow-[0_-12px_30px_-26px_rgba(0,0,0,0.3)]`}
              >
                {/* photo — prominent, edge fades into the wash */}
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="h-52 w-full object-cover [mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)] md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[58%] md:[mask-image:linear-gradient(to_left,black_55%,transparent_98%)]"
                />

                <div className="relative z-10 flex min-h-[220px] flex-col justify-between gap-10 p-8 md:min-h-[340px] md:max-w-[46%] md:p-10">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-[#212121]/15 bg-white text-sm font-medium tabular-nums text-[#212121]">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium uppercase text-[#346739]">
                      {s.duration}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl md:text-4xl font-amoria font-normal tracking-tight leading-tight text-[#212121]">
                      {s.title}
                    </h3>
                    <p className="text-sm md:text-base leading-relaxed text-[#616161] max-w-sm">
                      {s.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
