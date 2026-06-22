"use client";

// ─── StatsSection ──────────────────────────────────────────────────────────────
// Editorial stats section — soft-stone background, white cards, label-top layout.
// Reference: Approach A (reference image) + DESIGN.md tokens.
// Numeric values animate via the shared CountUp component on first viewport entry.

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MedalRibbon, Hearts, Letter, Stopwatch } from "@solar-icons/react";
import { CountUp } from "@/components/ui/count-up";

type CountStat = {
  type: "count";
  numeric: number;
  suffix: string;
  label: string;
  Icon: typeof MedalRibbon;
};

type StaticStat = {
  type: "static";
  value: string;
  label: string;
  Icon: typeof MedalRibbon;
};

type Stat = CountStat | StaticStat;

export default function StatsSection() {
  const t = useTranslations("Stats");

  const stats: Stat[] = [
    {
      type: "count",
      numeric: t.raw("stat1Numeric") as number,
      suffix: t("stat1Suffix"),
      label: t("stat1Label"),
      Icon: MedalRibbon,
    },
    {
      type: "count",
      numeric: t.raw("stat2Numeric") as number,
      suffix: t("stat2Suffix"),
      label: t("stat2Label"),
      Icon: Hearts,
    },
    {
      type: "count",
      numeric: t.raw("stat3Numeric") as number,
      suffix: t("stat3Suffix"),
      label: t("stat3Label"),
      Icon: Letter,
    },
  ];

  return (
    <section className="w-full bg-white px-6 py-20 font-poppins">
      <div className="max-w-[1200px] mx-auto">
        {/* ── Section Header ──────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.215, 0.61, 0.355, 1] }}
        >
          <h2
            className="font-poppins font-medium text-[#212121] mb-5"
            style={{ fontSize: "2.75rem", letterSpacing: "-0.02em" }}
          >
            {t("title")}
          </h2>

          {/* Decorated subtitle — vertical rules flanking text */}
          <div className="flex items-center justify-center gap-5">
            <div style={{ width: 1, height: 26, background: "#c4c4c8", flexShrink: 0 }} />
            <p className="font-poppins text-sm text-[#93939f]">{t("subtitle")}</p>
            <div style={{ width: 1, height: 26, background: "#c4c4c8", flexShrink: 0 }} />
          </div>
        </motion.div>

        {/* ── Stats Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const IconComponent = stat.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.09,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                className="group bg-white border border-[#f2f2f2] rounded-[22px] p-5 sm:p-8 flex flex-col gap-2 hover:border-[#346739]/25 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              >
                {/* Label — small, muted, uppercase — sits on top */}
                <span className="font-poppins text-[11px] font-medium text-[#93939f] uppercase leading-none tracking-wider">
                  {stat.label}
                </span>

                {/* Value — editorial large number */}
                <span
                  className="font-poppins font-medium text-[#212121] leading-tight inline-flex items-baseline"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    letterSpacing: "-0.025em",
                    marginTop: "6px",
                  }}
                >
                  {stat.type === "count" ? (
                    <>
                      <CountUp
                        from={0}
                        to={stat.numeric}
                        separator=","
                        direction="up"
                        duration={1.4}
                        delay={0.1 + i * 0.08}
                      />
                      {stat.suffix && (
                        <span aria-hidden="true">{stat.suffix}</span>
                      )}
                    </>
                  ) : (
                    stat.value
                  )}
                </span>

                {/* Bottom — hairline divider + subtle icon accent */}
                <div className="flex items-center gap-3 mt-auto pt-5">
                  <div className="flex-1 h-px bg-[#f2f2f2]" />
                  <IconComponent
                    size={18}
                    weight="BoldDuotone"
                    style={{ color: "#346739", opacity: 0.55, flexShrink: 0 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
