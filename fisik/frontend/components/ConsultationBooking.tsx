"use client";

// ─── ConsultationBooking ──────────────────────────────────────────────────────
// Design-consultation scheduler rendered on the home page (between the FAQ and the
// bottom CTA). A two-column "booking desk": a deep-green feature band on the left
// sells the in-person consultation (title, reassurance points, WhatsApp fallback),
// and the Cal.com inline scheduler sits in a clean white cell on the right. Deep
// green against white is the Cohere system's product-band move — kept flat and
// restrained, with depth from surface contrast rather than heavy shadow.
//
// Integration uses @calcom/embed-react: <Cal/> mounts the inline embed and
// getCalApi() returns the embed API so we can brand the embedded UI to Rimba green
// via cssVarsPerTheme ("cal-brand"). No manual <script>/CSS injection is needed.
//
// Tokens mirror the rest of the site: ink #212121, primary #346739, deep-green
// #003c33, pale-green #edfce9, body-muted #616161, Poppins. Motion: ease-out
// cubic-bezier(0.23, 1, 0.32, 1), reveal once on viewport entry.

import { useEffect, useRef } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { IconCheck, IconBrandWhatsapp } from "@tabler/icons-react";

const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

// Rimba's Cal.com booking link → https://cal.com/rimba-io/konsultasi-rimba
// This MUST be a *published* event type that exists in the Cal.com dashboard.
const CAL_LINK = "rimba-io/konsultasi-rimba";
// Namespace isolates this embed's Cal instance; it must match on getCalApi() and <Cal/>.
const CAL_NAMESPACE = "konsultasi";
// Brand the embedded widget to match the page (Rimba green accent).
const BRAND = "#346739";
// WhatsApp fallback for people who'd rather chat first (matches FloatingWhatsApp).
const WHATSAPP_URL = "https://wa.me/628123456789";

export default function ConsultationBooking() {
  const t = useTranslations("ExclusiveOrder");
  const reduce = useReducedMotion();
  const schedulerRef = useRef<HTMLDivElement>(null);

  // Stop Cal's embed from yanking the page on step changes. On every internal
  // route change (date → time → form), @calcom/embed-core runs, inside its
  // "__routeChanged" handler, `inlineEl.scrollIntoView()` whenever the embed's top
  // is scrolled above the viewport — which scrolls the whole page up to the
  // calendar. Our scheduler is a fixed-height, internally-scrolling card, so that
  // jump is never wanted. Neutralise scrollIntoView on the injected <cal-inline>
  // element (scoped to this instance only) as soon as Cal mounts it.
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

  // Brand the embedded UI once the embed API is ready. cssVarsPerTheme drives the
  // accent ("cal-brand") for both light and dark so it stays Rimba green.
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

        // On a narrow embed Cal uses its step booker (date → time → form), whose
        // back chevron sits at the top of each step. Since we suppress Cal's own
        // page-level scroll, reset our internal scroller to the top on every step
        // change so that header — and the back button to change the date — is always
        // visible without nudging the page itself.
        cal("on", {
          action: "__routeChanged",
          callback: () => {
            const scroller =
              schedulerRef.current?.querySelector<HTMLElement>(".cal-inline-container");
            scroller?.scrollTo({ top: 0, behavior: "smooth" });
          },
        });
      } catch {
        /* network/adblock — the copy + WhatsApp fallback on the left stay usable */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const points = [t("consultPoint1"), t("consultPoint2"), t("consultPoint3")];

  return (
    <section className="w-full px-6 py-16 md:py-24">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE_OUT_STRONG }}
        // The composite card. Cohere keeps surfaces mostly flat — depth comes from the
        // deep-green band against white, not heavy shadows — so this carries only a
        // soft lift. transform-none defuses any transform inherited from an ancestor
        // page transition: an active transform on an iframe ancestor flattens the
        // rendering layer and kills touch inside the iframe on iOS Safari.
        className="mx-auto grid max-w-[1200px] grid-cols-1 overflow-hidden rounded-[32px] bg-white border border-[#e0e0e0] shadow-[0_12px_40px_-20px_rgba(0,60,51,0.18)] transform-none lg:grid-cols-[0.82fr_1.18fr]"
      >
        {/* ── Left: deep-green feature band ───────────────────────────────────── */}
        <div className="flex flex-col bg-[#003c33] px-8 py-10 md:px-10 md:py-12 lg:px-12 lg:py-14">
          <h2 className="max-w-[15ch] font-poppins text-[1.75rem] font-medium leading-[1.12] tracking-[-0.02em] text-white md:text-[2rem]">
            {t("consultTitle")}
          </h2>
          <p className="mt-4 max-w-[42ch] font-poppins text-[15px] font-normal leading-relaxed text-[#a9c4b3]">
            {t("consultSubtitle")}
          </p>

          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edfce9] text-[#346739]">
                  <IconCheck size={12} stroke={2.75} />
                </span>
                <span className="font-poppins text-[14px] leading-snug text-white/90">{point}</span>
              </li>
            ))}
          </ul>

          {/* WhatsApp fallback, pinned to the bottom of the band on desktop */}
          <div className="mt-8 lg:mt-auto lg:pt-8">
            <div aria-hidden className="mb-5 h-px w-full bg-white/10" />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded font-poppins text-[13.5px] font-medium text-[#cfe3d3] transition-[color,transform] duration-200 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c6ee6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#003c33]"
            >
              <IconBrandWhatsapp size={20} stroke={1.75} className="text-[#7fb98a] shrink-0" />
              <span className="underline-offset-4 group-hover:underline">{t("consultWhatsapp")}</span>
            </a>
          </div>
        </div>

        {/* ── Right: Cal.com scheduler in a white cell ────────────────────────────
            The embed is INSET in white padding so its iframe keeps square corners and
            is never clipped by the card's rounded edge — that sidesteps the iOS Safari
            WebKit hit-box bug (rounded/clipped iframes detach taps from the visible UI)
            entirely, while the rounded corners live on the white cell instead. The
            definite height (svh-capped on mobile) keeps the card a fixed, internally
            scrolling panel; the scrollIntoView neutralisation in the effect above
            stops Cal from scrolling the whole page on step changes. */}
        <div className="flex h-[78svh] flex-col bg-white lg:h-[720px]">
          <div className="flex items-baseline justify-between gap-4 px-6 pb-4 pt-6 md:px-8">
            <h3 className="font-poppins text-[17px] font-medium text-[#212121]">
              {t("consultPickLabel")}
            </h3>
            <p className="hidden max-w-[34ch] text-right font-poppins text-[12px] leading-snug text-[#93939f] sm:block">
              {t("consultPickHint")}
            </p>
          </div>

          <div ref={schedulerRef} className="min-h-0 flex-1 px-3 pb-3 md:px-4 md:pb-4">
            <Cal
              namespace={CAL_NAMESPACE}
              calLink={CAL_LINK}
              config={{ layout: "month_view" }}
              className="h-full w-full"
              style={{ width: "100%", height: "100%", overflow: "scroll", minWidth: 280 }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
