"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

// Going pattern: alternating photo + large quote rows — the couple photos double
// as portfolio proof.
// PLACEHOLDER content: the quotes, names, and Unsplash photos below are
// illustrative, NOT verified customers. Swap in real couples (with permission)
// before launch.
const QUOTE_KEYS = [
  {
    quoteKey: "quote1",
    detailKey: "detail1",
    nameKey: "name1",
    eventKey: "event1",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    quoteKey: "quote2",
    detailKey: "detail2",
    nameKey: "name2",
    eventKey: "event2",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
  },
] as const;

export default function Testimoni() {
  const t = useTranslations("Testimoni");

  return (
    <section id="testimonials" className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-16">
        <div className="space-y-4 max-w-2xl">
          <p className="text-sm font-medium uppercase text-[#93939f]">{t("label")}</p>
          <h2 className="text-4xl md:text-5xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
            {t("title")}
          </h2>
        </div>

        <div className="space-y-16 md:space-y-20">
          {QUOTE_KEYS.map((q, i) => (
            <figure
              key={q.nameKey}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative overflow-hidden rounded-[22px] aspect-[4/3] md:aspect-[4/5] max-w-md w-full mx-auto md:mx-0">
                <Image
                  src={q.image}
                  alt={t(q.nameKey)}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-6 max-w-lg">
                <blockquote className="text-2xl md:text-3xl font-amoria font-normal tracking-tight leading-snug text-[#003c33]">
                  &ldquo;{t(q.quoteKey)}&rdquo;
                </blockquote>
                <p className="text-sm md:text-base leading-relaxed text-[#616161]">
                  {t(q.detailKey)}
                </p>
                <figcaption className="space-y-0.5">
                  <p className="text-sm font-bold text-[#212121]">{t(q.nameKey)}</p>
                  <p className="text-xs text-[#93939f]">{t(q.eventKey)}</p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
