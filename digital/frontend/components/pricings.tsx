"use client";

import Link from "next/link";

// YLLW "design concepts" pattern: unframed editorial columns — name + price as
// an inline headline over photography, character prose below. No cards.
// ponytail: prices are PLACEHOLDERS — replace with real Rp before launch.

type Tier = {
  name: string;
  price: string;
  character: string;
  image: string;
  popular?: boolean;
  included: boolean[]; // maps onto FEATURES
  active: string; // masa aktif
};

// One shared feature list — checked or dimmed per tier, so the upgrade path
// reads at a glance without a comparison table.
const FEATURES = [
  "WhatsApp RSVP & personal guest links",
  "Music, gallery & interactive map",
  "Love-story timeline section",
  "QR check-in & guest tracking",
  "Adat themes & custom cultural motif",
  "Priority designer support",
];

const TIERS: Tier[] = [
  {
    name: "Kenangan",
    price: "Rp 99rb",
    character: "For the moments you want kept",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    included: [true, true, false, false, false, false],
    active: "6 bulan",
  },
  {
    name: "Kisah",
    price: "Rp 199rb",
    character: "For the story worth telling",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    popular: true,
    included: [true, true, true, true, false, false],
    active: "12 bulan",
  },
  {
    name: "Warisan",
    price: "Rp 349rb",
    character: "For the heritage that endures",
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    included: [true, true, true, true, true, true],
    active: "Selamanya",
  },
];

export default function Pricings() {
  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-14">
        {/* Split editorial header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase text-[#93939f]">
              Pilihan Paket
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
              Three collections. One-time price.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-[#616161] max-w-sm lg:justify-self-end">
            No subscriptions, no ads, no per-guest fees. Pick the collection
            that sounds like you — everything else is included.
          </p>
        </div>

        {/* Unframed collection columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-14">
          {TIERS.map((t) => (
            <div key={t.name} className="group border-t border-[#212121] pt-5 space-y-5">
              {/* name + price headline row */}
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl md:text-[28px] font-amoria font-normal tracking-tight text-[#212121]">
                  {t.name}
                </h3>
                <p className="shrink-0 text-sm font-medium text-[#212121]">
                  {t.price}{" "}
                  <span className="font-normal text-[#93939f]">sekali bayar</span>
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[8px] aspect-[4/5]">
                <img
                  src={t.image}
                  alt={`${t.name} collection`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                {t.popular && (
                  <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#ff7759]">
                    Paling populer
                  </span>
                )}
              </div>

              <p className="text-base font-bold tracking-tight text-[#212121]">
                {t.character}
              </p>

              <ul className="space-y-2">
                {FEATURES.map((f, fi) => {
                  const has = t.included[fi];
                  return (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-sm leading-relaxed ${
                        has ? "text-[#3a3a3a]" : "text-[#c4c4cc] line-through decoration-[#c4c4cc]/50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 shrink-0 text-[13px] ${
                          has ? "text-[#346739]" : "text-[#d9d9dd]"
                        }`}
                        aria-hidden="true"
                      >
                        {has ? "✓" : "—"}
                      </span>
                      {f}
                    </li>
                  );
                })}
                <li className="flex items-start gap-2.5 pt-1 text-sm text-[#3a3a3a]">
                  <span className="mt-0.5 shrink-0 text-[13px] text-[#346739]" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    Masa aktif:{" "}
                    <span className="font-medium text-[#212121]">{t.active}</span>
                  </span>
                </li>
              </ul>

              <Link
                href="/dashboard/invitation"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#212121] underline underline-offset-4 decoration-[#212121]/25 transition-colors duration-200 hover:decoration-[#ff7759] hover:text-[#ff7759]"
              >
                Pilih {t.name} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
