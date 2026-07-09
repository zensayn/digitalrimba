"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ServiceScope() {
  const t = useTranslations("ServiceScope");

  const stages = [
    { phase: t("phaseNow"), name: t("stage1Name"), description: t("stage1Desc"), live: true },
    { phase: t("phaseNext"), name: t("stage2Name"), description: t("stage2Desc") },
    { phase: t("phaseLater"), name: t("stage3Name"), description: t("stage3Desc") },
  ];

  return (
    <section className="bg-white text-[#212121] py-20 px-6 md:px-12 lg:px-24 border-t border-neutral-100">
      <div className="max-w-[1300px] mx-auto space-y-16">
        {/* Split editorial header — Grok "path of progress" pattern */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-end">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase text-[#93939f]">{t("label")}</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-amoria font-normal tracking-tight leading-tight text-[#0a0a0a]">
              {t("title")}
            </h2>
          </div>
          <p className="text-base leading-relaxed text-[#616161] max-w-md lg:justify-self-end">
            {t("desc")}
          </p>
        </div>

        {/* Timeline rail with tick marks */}
        <div>
          <div
            aria-hidden="true"
            className="hidden md:block h-2.5 border-b border-[#d9d9dd]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, #d9d9dd 0 1px, transparent 1px 14px)",
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 md:pt-8">
            {stages.map((s) => (
              <div key={s.name} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      s.live
                        ? "size-2.5 rounded-full bg-[#346739]"
                        : "size-2.5 rounded-full border border-[#93939f]"
                    }
                  />
                  <span
                    className={`text-xs font-medium uppercase ${
                      s.live ? "text-[#346739]" : "text-[#93939f]"
                    }`}
                  >
                    {s.phase}
                  </span>
                </div>
                <h3
                  className={`text-xl md:text-2xl font-bold tracking-tight ${
                    s.live ? "text-[#212121]" : "text-[#93939f]"
                  }`}
                >
                  {s.name}
                </h3>
                <p
                  className={`text-sm leading-relaxed max-w-xs ${
                    s.live ? "text-[#616161]" : "text-[#93939f]"
                  }`}
                >
                  {s.description}
                </p>
                {s.live && (
                  <Link
                    href="/dashboard/invitation"
                    className="inline-block pt-1 text-sm font-medium text-[#346739] underline underline-offset-4 decoration-[#346739]/30 hover:decoration-[#346739]"
                  >
                    {t("liveCta")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
