"use client";

// ─── StatsHighlight ──────────────────────────────────────────────────────────
// Editorial "big-number" proof band — YLLW-inspired. Unframed columns split by
// hairline rules, label-on-top, oversized Poppins numerals with a green accent
// on the suffix. Sits above StatsSection as the headline proof statement.
//
// Design tokens: cohere/DESIGN.md (Poppins, ink #212121, primary #346739,
// hairline #e5e7eb, weight ≤ Medium, tracking 0, white canvas).
// Motion: Emil — ease-out cubic-bezier(0.23, 1, 0.32, 1), ~70ms stagger,
// translateY+opacity (never scale(0)), play once on viewport entry.

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CountUp } from "@/components/ui/count-up";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type CountStat = { type: "count"; numeric: number; suffix: string; label: string };
type StaticStat = { type: "static"; value: string; label: string };
type Stat = CountStat | StaticStat;

export default function StatsHighlight() {
  const t = useTranslations("StatsHighlight");
  const s = useTranslations("Stats");

  const stats: Stat[] = [
    { type: "count", numeric: s.raw("stat1Numeric") as number, suffix: s("stat1Suffix"), label: s("stat1Label") },
    { type: "count", numeric: s.raw("stat2Numeric") as number, suffix: s("stat2Suffix"), label: s("stat2Label") },
    { type: "count", numeric: s.raw("stat3Numeric") as number, suffix: s("stat3Suffix"), label: s("stat3Label") },
    { type: "count", numeric: s.raw("stat4Numeric") as number, suffix: s("stat4Suffix"), label: s("stat4Label") },
  ];

  return (
    <section className="w-full bg-white px-6 py-24 font-poppins">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* ── Editorial header — left aligned, distinct from StatsSection ── */}
        <motion.div
          className="max-w-[620px] mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <h2
            className="font-poppins font-medium text-[#212121] mt-3 whitespace-pre-line"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
          >
            {t("title")}
          </h2>
          <p className="font-poppins text-[#616161] mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.5 }}>
            {t("subtitle")}
          </p>
        </motion.div>

        {/* ── Big-number row — unframed columns split by hairline rules ──── */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            // Responsive hairline dividers: 2×2 on mobile, single row on desktop.
            const borders = [
              "border-[#e5e7eb]",
              i % 2 === 1 ? "border-l" : "", // mobile: divider before right column
              i >= 2 ? "border-t" : "", // mobile: divider above second row
              "lg:border-t-0", // desktop: no horizontal rules
              i === 0 ? "lg:border-l-0" : "lg:border-l", // desktop: vertical dividers
            ].join(" ");

            return (
              <motion.div
                key={i}
                className={`flex flex-col px-5 lg:px-7 py-4 lg:py-2 ${borders}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: EASE_OUT }}
              >
                {/* Label — on top, quiet */}
                <span className="font-poppins text-[11px] text-[#93939f] uppercase leading-tight">
                  {stat.label}
                </span>

                {/* Number — editorial scale, green accent suffix */}
                <span
                  className="font-poppins font-medium text-[#212121] mt-3 inline-flex items-baseline"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1, letterSpacing: "-0.03em" }}
                >
                  {stat.type === "count" ? (
                    <>
                      <CountUp from={0} to={stat.numeric} separator="," duration={1.4} delay={0.15 + i * 0.07} />
                      {stat.suffix && (
                        <span className="text-[#346739]" aria-hidden="true">
                          {stat.suffix}
                        </span>
                      )}
                    </>
                  ) : (
                    stat.value
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
