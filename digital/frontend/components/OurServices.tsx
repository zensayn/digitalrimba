"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  IconMailFilled,
  IconUsers,
  IconQrcode,
  IconBuildingStore,
  IconArrowRight,
} from "@tabler/icons-react";
import { TextureButton } from "@/components/ui/texture-button";

/* -------------------------------------------------------------------------- */
/*  Data — the scalability point.                                              */
/*  Flip a card's `status` to "live" (or add a new entry) as products launch.  */
/* -------------------------------------------------------------------------- */

// `bg` uses the documented Cohere wash tokens so each card reads distinct.
const SERVICES = [
  { key: "webInvitations", status: "live", icon: IconMailFilled, bg: "#f1f5ff" },
  { key: "smartRsvp", status: "soon", icon: IconUsers, bg: "#eeece7" },
  { key: "qrCheckin", status: "soon", icon: IconQrcode, bg: "#edfce9" },
  { key: "vendorTools", status: "soon", icon: IconBuildingStore, bg: "#f1f5ff" },
] as const;

const ease = [0.23, 1, 0.32, 1] as const;

/* Empty phone frame — placeholder for product screenshots, peeks from card bottom. */
function PhonePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-t-[2.4rem] bg-[#1a1a1a] p-2 pb-0 shadow-2xl ${className}`}>
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-t-[1.9rem] bg-[#f5f5f7]">
        {/* notch */}
        <div className="absolute left-1/2 top-2.5 h-4 w-16 -translate-x-1/2 rounded-full bg-[#1a1a1a]" />
      </div>
    </div>
  );
}

function Chip({ live, t }: { live: boolean; t: ReturnType<typeof useTranslations> }) {
  return live ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#346739] px-3 py-1 text-[11px] font-medium text-white">
      <span className="h-1.5 w-1.5 rounded-full bg-[#9fe6a0]" />
      {t("availableLabel")}
    </span>
  ) : (
    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#93939f]">
      {t("comingSoonLabel")}
    </span>
  );
}

export default function OurServices() {
  const t = useTranslations("OurServices");
  const reduce = useReducedMotion();

  // Opacity-only when reduced motion is requested; translate + opacity otherwise.
  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 32 },
    whileInView: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, delay, ease },
  });

  const top = SERVICES.slice(0, 3);
  // ponytail: layout is designed for a 3+1 split; a 4th entry renders wide, a 5th+ won't show.
  // Revisit the grid if SERVICES regularly grows past 4.
  const wide = SERVICES.length > 3 ? SERVICES[3] : null;
  const WideIcon = wide?.icon;

  return (
    <section className="w-full bg-white px-4 md:px-8 py-20 md:py-28 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Section header — centered, like the reference. */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="mb-12 md:mb-16 text-center"
        >
          <span className="text-[12px] font-poppins font-normal uppercase tracking-[0.28px] text-[#346739] block mb-4">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto max-w-2xl whitespace-pre-line text-4xl md:text-5xl lg:text-[56px] font-poppins font-normal tracking-[-1px] leading-none text-[#212121]">
            {t("heading")}
          </h2>
        </motion.div>

        {/* Top row — three cards. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {top.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.key}
                {...rise(0.05 + i * 0.07)}
                style={{ backgroundColor: s.bg }}
                className="flex flex-col overflow-hidden rounded-[32px] p-7 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                    <Icon className="h-5 w-5 text-[#346739]" />
                  </div>
                  <Chip live={s.status === "live"} t={t} />
                </div>

                <h3 className="mt-6 text-[22px] font-normal leading-tight tracking-tight text-[#212121]">
                  {t(`services.${s.key}.title`)}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[#616161]">
                  {t(`services.${s.key}.desc`)}
                </p>

                <PhonePlaceholder className="mt-10 -mb-px w-[68%] max-w-[220px] self-center" />
              </motion.div>
            );
          })}
        </div>

        {/* Wide card — fourth service, full width below. */}
        {wide && WideIcon && (
          <motion.div
            {...rise(0.28)}
            style={{ backgroundColor: wide.bg }}
            className="mt-4 md:mt-5 flex flex-col md:flex-row items-stretch gap-8 overflow-hidden rounded-[32px] p-7 md:p-10"
          >
            <div className="flex flex-1 flex-col md:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                  <WideIcon className="h-5 w-5 text-[#346739]" />
                </div>
                <Chip live={(wide.status as string) === "live"} t={t} />
              </div>
              <h3 className="mt-6 text-[26px] md:text-[32px] font-normal leading-tight tracking-tight text-[#212121]">
                {t(`services.${wide.key}.title`)}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#616161]">
                {t(`services.${wide.key}.desc`)}
              </p>
            </div>
            <PhonePlaceholder className="-mb-px w-[60%] max-w-[260px] self-center md:self-end" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
