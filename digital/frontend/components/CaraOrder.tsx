"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Kalstore stacked-process pattern + CSS sticky card-deck scroll: cards pile up
// as you scroll, header stays pinned left. No JS state — pure layout.
// Photos take ~58% of each card and fade into the wash via a mask — no hard seam.

type Step = {
  key: "step1" | "step2" | "step3" | "step4" | "step5";
  image: string;
  surface: string;
};

const STEPS: Step[] = [
  {
    key: "step1",
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#eeece7]",
  },
  {
    key: "step2",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#edfce9]",
  },
  {
    key: "step3",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#f1f5ff]",
  },
  {
    key: "step4",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
    surface: "bg-[#ffefe9]",
  },
  {
    key: "step5",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
    surface: "bg-white",
  },
];

export default function CaraOrder() {
  const t = useTranslations("CaraOrder");

  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[4fr_8fr] gap-12 lg:gap-20 items-start">
        {/* Pinned intro */}
        <div className="space-y-5 lg:sticky lg:top-32">
          <p className="text-sm font-medium uppercase text-[#93939f]">{t("eyebrow")}</p>
          <h2 className="whitespace-pre-line text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            {t("heading")}
          </h2>
          <p className="text-base leading-relaxed text-[#616161] max-w-xs">
            {t("subheading")}
          </p>
          <Link
            href="/dashboard/invitations/new"
            className="inline-block px-6 py-3 rounded-full bg-[#003c33] text-white text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            {t("cta")}
          </Link>
        </div>

        {/* Card deck — each card sticks and the next piles on top */}
        <div>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className="sticky"
              style={{ top: `${96 + i * 20}px`, paddingBottom: i === STEPS.length - 1 ? 0 : 24 }}
            >
              <div
                className={`${s.surface} relative rounded-[28px] overflow-hidden border border-black/[0.04] shadow-[0_-12px_30px_-26px_rgba(0,0,0,0.3)]`}
              >
                {/* photo — prominent, edge fades into the wash */}
                <div className="relative h-52 w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)] md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[58%] md:[mask-image:linear-gradient(to_left,black_55%,transparent_98%)]">
                  <Image
                    src={s.image}
                    alt={t(`steps.${s.key}.title`)}
                    fill
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="relative z-10 flex min-h-[220px] flex-col justify-between gap-10 p-8 md:min-h-[340px] md:max-w-[46%] md:p-10">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-[#212121]/15 bg-white text-sm font-medium tabular-nums text-[#212121]">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium uppercase text-[#346739]">
                      {t(`steps.${s.key}.duration`)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl md:text-4xl font-amoria font-normal tracking-tight leading-tight text-[#212121]">
                      {t(`steps.${s.key}.title`)}
                    </h3>
                    <p className="text-sm md:text-base leading-relaxed text-[#616161] max-w-sm">
                      {t(`steps.${s.key}.detail`)}
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
