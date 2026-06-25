"use client";

// ─── ConsultationScheduler ────────────────────────────────────────────────────
// Standalone Cal.com scheduler for the /consultation page — JUST the calendar, no
// card chrome and no deep-green context band. Deliberately distinct from the
// landing page's <ConsultationBooking /> split desk: here the embed gets the full
// content width, so Cal renders its wide month layout (calendar grid + time column
// side by side) instead of the narrow stacked step-booker in the landing's cell.
//
// A separate Cal namespace ("konsultasi-page") keeps this embed instance fully
// independent from the landing embed, so the two never share UI config or events.
//
// Accent branded to primary #346739 (cal-brand) per cohere/DESIGN.md.

import { useEffect, useRef } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useTranslations } from "next-intl";
import { IconBrandWhatsapp } from "@tabler/icons-react";

// Same published Cal.com event as the rest of the site. Swap this constant if the
// consultation page should point at a different/longer event type.
const CAL_LINK = "rimba-io/konsultasi-rimba";
// Distinct namespace → independent embed instance from <ConsultationBooking />.
const CAL_NAMESPACE = "konsultasi-page";
const BRAND = "#346739";
// WhatsApp fallback for people who'd rather chat before committing to a time.
const WHATSAPP_URL = "https://wa.me/6285750275751";

export default function ConsultationScheduler() {
  const t = useTranslations("Consultation");
  const schedulerRef = useRef<HTMLDivElement>(null);

  // Stop Cal from scrolling the whole page when the user steps through the embed
  // (date → time → form). Cal calls scrollIntoView() on its injected <cal-inline>
  // on every internal route change; neutralise it on this instance only.
  useEffect(() => {
    const root = schedulerRef.current;
    if (!root) return;
    const patch = () => {
      const el = root.querySelector("cal-inline") as HTMLElement | null;
      if (el) {
        el.scrollIntoView = () => {};
        return true;
      }
      return false;
    };
    if (patch()) return;
    const observer = new MutationObserver(() => {
      if (patch()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Brand the embedded UI (Rimba green) once the embed API is ready.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cal = await getCalApi({ namespace: CAL_NAMESPACE });
        if (!active) return;
        cal("ui", {
          cssVarsPerTheme: { light: { "cal-brand": BRAND }, dark: { "cal-brand": BRAND } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      } catch {
        /* network/adblock — page still renders; the WhatsApp float remains usable */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="w-full bg-white px-6 pb-20 md:pb-28 flex flex-col items-center">
      {/* Soft Cohere card: 32px radius + light border + a gentle green-tinted lift
          (DESIGN.md keeps depth restrained — no heavy drop shadows). A thin p-2/p-3
          frame keeps the card only just larger than the calendar itself. */}
      <div className="mx-auto w-full max-w-[1200px]">
          <Cal
            namespace={CAL_NAMESPACE}
            calLink={CAL_LINK}
            config={{ layout: "month_view" }}
            className="h-full w-full"
            style={{ width: "100%", height: "100%", overflow: "scroll", minWidth: 280 }}
          />
      </div>

      {/* WhatsApp fallback — a quiet bordered row (Resend-style), secondary to the
          calendar above. Text left, outline action right; stacks on mobile. */}
      <div className="mx-auto mt-6 flex w-full max-w-[1040px] flex-col gap-4 rounded-[20px] border border-[#e5e7eb] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edfce9] text-[#346739]">
            <IconBrandWhatsapp size={19} stroke={1.75} />
          </span>
          <div>
            <p className="font-poppins text-[15px] font-medium text-[#212121]">{t("ctaTitle")}</p>
            <p className="mt-0.5 font-poppins text-[13.5px] leading-relaxed text-[#616161]">
              {t("ctaText")}
            </p>
          </div>
        </div>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#d9d9dd] px-5 py-2.5 font-poppins text-[14px] font-medium text-[#212121] transition-[color,border-color,transform] duration-200 hover:border-[#346739] hover:text-[#346739] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c6ee6] focus-visible:ring-offset-2 sm:self-auto"
        >
          <IconBrandWhatsapp size={17} stroke={1.75} className="text-[#346739]" />
          {t("ctaAction")}
        </a>
      </div>
    </section>
  );
}
