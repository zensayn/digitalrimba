"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import {
  BillCheck,
  Wallet,
  RulerCrossPen,
  Box,
  CashOut,
  CheckCircle,
  ClockCircle,
} from "@solar-icons/react";
import { BrowserWindow } from "@/components/browserwindow";
import { CarouselNavigator } from "@/components/ui/carousel-navigator";
import { DrawSignatureComponent } from "@/components/ui/draw-signature";
import AboutCTA from "@/components/about/AboutCTA";

const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

// ─── Mock-screen presentational helpers ─────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f2f2f2] last:border-0">
      <span className="text-[11px] text-[#93939f]">{label}</span>
      <span className="text-xs font-medium text-[#212121]">{value}</span>
    </div>
  );
}

function ProgressRow({
  label,
  state,
  doneLabel,
  progressLabel,
  queuedLabel,
}: {
  label: string;
  state: "done" | "progress" | "queued";
  doneLabel: string;
  progressLabel: string;
  queuedLabel: string;
}) {
  const map = {
    done: { text: doneLabel, cls: "bg-[#edfce9] text-[#346739]" },
    progress: { text: progressLabel, cls: "bg-amber-50 text-amber-600" },
    queued: { text: queuedLabel, cls: "bg-[#f2f2f2] text-[#93939f]" },
  } as const;
  const s = map[state];
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f2f2f2] last:border-0">
      <div className="flex items-center gap-2.5">
        {state === "done" ? (
          <CheckCircle weight="Bold" className="w-4 h-4 text-[#346739]" />
        ) : (
          <ClockCircle className="w-4 h-4 text-[#93939f]" />
        )}
        <span className="text-xs text-[#212121]">{label}</span>
      </div>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.text}</span>
    </div>
  );
}

// ─── Screen builders (receive the namespaced translator) ────────────────────
type T = ReturnType<typeof useTranslations>;

function OrderScreen(t: T) {
  return (
    <div className="p-5 flex flex-col gap-3 h-full overflow-hidden">
      <span className="text-sm font-medium text-[#212121]">{t("s1ScreenTitle")}</span>
      <div className="rounded-2xl border border-[#f2f2f2] bg-white p-4 flex-1">
        <DetailRow label={t("s1Product")} value={t("s1ProductVal")} />
        <DetailRow label={t("s1Qty")} value={t("s1QtyVal")} />
        <DetailRow label={t("s1Date")} value={t("s1DateVal")} />
        <DetailRow label={t("s1Theme")} value={t("s1ThemeVal")} />
      </div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#93939f] bg-[#f2f2f2] px-2.5 py-1 rounded-full">
          <ClockCircle className="w-3 h-3" /> {t("s1Status")}
        </span>
        <span className="text-xs font-medium text-white bg-[#346739] px-4 py-2 rounded-full">
          {t("s1Cta")}
        </span>
      </div>
    </div>
  );
}

function DepositScreen(t: T) {
  return (
    <div className="p-5 flex flex-col gap-3 h-full overflow-hidden">
      <span className="text-sm font-medium text-[#212121]">{t("s2ScreenTitle")}</span>
      <div className="rounded-2xl border border-[#f2f2f2] bg-white p-4 flex-1 flex flex-col justify-center gap-1.5">
        <DetailRow label={t("s2Total")} value={t("s2TotalVal")} />
        <div className="flex items-center justify-between py-2.5 border-b border-[#f2f2f2]">
          <span className="text-[11px] text-[#93939f]">{t("s2Dp")}</span>
          <span className="text-sm font-medium text-[#346739]">{t("s2DpVal")}</span>
        </div>
        <DetailRow label={t("s2Method")} value={t("s2MethodVal")} />
      </div>
      <div className="bg-[#edfce9] border border-[#346739]/20 text-[#346739] rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2">
        <CheckCircle weight="Bold" className="w-4 h-4" />
        {t("s2Status")}
      </div>
    </div>
  );
}

function DesignScreen(t: T) {
  return (
    <div className="p-5 flex flex-col gap-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#212121]">{t("s3ScreenTitle")}</span>
        <span className="text-[10px] font-medium text-[#346739] bg-[#edfce9] px-2.5 py-1 rounded-full">
          {t("s3Revision")}
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-[#f2f2f2] flex-1 min-h-[150px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=600&auto=format&fit=crop"
          alt="Pratinjau"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Design sign-off: signature pad floats in front of the image (absolute overlay) */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 p-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#f2f2f2] shadow-sm max-w-[90%]">
          <span className="text-[10px] font-medium text-[#346739] mb-0.5">
            {t("s3SignPrompt")}
          </span>
          <DrawSignatureComponent
            startLabel={t("s3SignStart")}
            finishLabel={t("s3SignFinish")}
            doneLabel={t("s3SignDone")}
          />
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <span className="flex-1 text-center text-xs font-medium text-[#212121] bg-white border border-[#e5e7eb] px-4 py-2 rounded-full">
          {t("s3RequestBtn")}
        </span>
      </div>
    </div>
  );
}

function ProductionScreen(t: T) {
  return (
    <div className="p-5 flex flex-col gap-3 h-full overflow-hidden">
      <span className="text-sm font-medium text-[#212121]">{t("s4ScreenTitle")}</span>
      <div className="rounded-2xl border border-[#f2f2f2] bg-white p-4 flex-1 flex flex-col justify-center">
        <ProgressRow label={t("s4Print")} state="done" doneLabel={t("s4Done")} progressLabel={t("s4Progress")} queuedLabel={t("s4Queued")} />
        <ProgressRow label={t("s4Foil")} state="done" doneLabel={t("s4Done")} progressLabel={t("s4Progress")} queuedLabel={t("s4Queued")} />
        <ProgressRow label={t("s4Wax")} state="progress" doneLabel={t("s4Done")} progressLabel={t("s4Progress")} queuedLabel={t("s4Queued")} />
        <ProgressRow label={t("s4Pack")} state="queued" doneLabel={t("s4Done")} progressLabel={t("s4Progress")} queuedLabel={t("s4Queued")} />
      </div>
    </div>
  );
}

function PaymentScreen(t: T) {
  return (
    <div className="p-5 flex flex-col gap-3 h-full overflow-hidden">
      <span className="text-sm font-medium text-[#212121]">{t("s5ScreenTitle")}</span>
      <div className="rounded-2xl border border-[#f2f2f2] bg-white p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between py-2.5">
          <span className="text-[11px] text-[#93939f]">{t("s5Balance")}</span>
          <span className="text-sm font-medium text-[#346739]">{t("s5BalanceVal")}</span>
        </div>
        <span className="text-center text-xs font-medium text-white bg-[#346739] px-4 py-2.5 rounded-full">
          {t("s5PayBtn")}
        </span>
      </div>
      <div className="rounded-2xl border border-[#f2f2f2] bg-white p-4 flex-1 flex flex-col gap-1.5">
        <DetailRow label={t("s5Shipping")} value={t("s5Courier")} />
        <div className="flex items-center gap-2 pt-1.5">
          <CheckCircle weight="Bold" className="w-4 h-4 text-[#346739] shrink-0" />
          <span className="text-[11px] text-[#616161]">{t("s5Tracking")}</span>
        </div>
      </div>
    </div>
  );
}

// Carousel themes tinted to the Rimba green so the navigator stays on-brand
const CAROUSEL_THEMES = Array.from({ length: 5 }).map(() => ({
  bg: "bg-[#edfce9]",
  button: "bg-[#346739]",
  dot: "bg-[#346739]/25",
  progress: "bg-[#346739]/40",
}));

export default function WorkflowPage() {
  const t = useTranslations("Workflow");
  const [active, setActive] = useState(0);

  // Step definitions — labels/copy/screens all pull from the Workflow namespace
  const sections: {
    key: string;
    label: string;
    icon: ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    screen: ReactNode;
  }[] = [
    {
      key: "order",
      label: t("s1Label"),
      icon: <BillCheck className="w-4 h-4" />,
      eyebrow: t("s1Eyebrow"),
      title: t("s1Title"),
      description: t("s1Desc"),
      screen: OrderScreen(t),
    },
    {
      key: "deposit",
      label: t("s2Label"),
      icon: <CashOut className="w-4 h-4" />,
      eyebrow: t("s2Eyebrow"),
      title: t("s2Title"),
      description: t("s2Desc"),
      screen: DepositScreen(t),
    },
    {
      key: "design",
      label: t("s3Label"),
      icon: <RulerCrossPen className="w-4 h-4" />,
      eyebrow: t("s3Eyebrow"),
      title: t("s3Title"),
      description: t("s3Desc"),
      screen: DesignScreen(t),
    },
    {
      key: "production",
      label: t("s4Label"),
      icon: <Box className="w-4 h-4" />,
      eyebrow: t("s4Eyebrow"),
      title: t("s4Title"),
      description: t("s4Desc"),
      screen: ProductionScreen(t),
    },
    {
      key: "payment",
      label: t("s5Label"),
      icon: <Wallet className="w-4 h-4" />,
      eyebrow: t("s5Eyebrow"),
      title: t("s5Title"),
      description: t("s5Desc"),
      screen: PaymentScreen(t),
    },
  ];

  const section = sections[active];

  const sidebarItems = sections.map((s, i) => ({
    label: s.label,
    badge: `${i + 1}`,
    icon: s.icon,
    active: i === active,
  }));

  return (
    <div className="relative min-h-screen bg-white text-[#212121] font-poppins pt-5 sm:pt-6 md:pt-8">
      <div className="w-full max-w-[1200px] mx-auto px-6 flex flex-col mt-8 pb-20">

        {/* Header */}
        <div className="flex flex-col mb-12 text-center items-center">
          <h1 className="text-4xl md:text-[56px] font-medium tracking-[-0.02em] text-[#212121] leading-[1.05] max-w-3xl">
            {t("headerTitle")}
          </h1>
          <p className="text-[#616161] mt-5 text-base md:text-lg font-normal max-w-2xl leading-relaxed">
            {t("headerSubtitle")}
          </p>
        </div>

        {/* ─── Browser mockup ─────────────────────────────────────── */}
        <div className="flex justify-center">
          <BrowserWindow
            variant="chrome"
            headerStyle="full"
            size="xl"
            showSidebar
            sidebarPosition="left"
            url={`rimba.app/${section.key}`}
            sidebarItems={sidebarItems}
            onSidebarItemClick={setActive}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: EASE_OUT_STRONG }}
                className="h-full bg-[#fbfbfb]"
              >
                {section.screen}
              </motion.div>
            </AnimatePresence>
          </BrowserWindow>
        </div>

        {/* ─── Carousel navigator (synced to the sidebar) ─────────── */}
        <div className="flex justify-center mt-6">
          <CarouselNavigator
            totalSlides={sections.length}
            themes={CAROUSEL_THEMES}
            currentIndex={active}
            onIndexChange={setActive}
            autoDelay={6000}
          />
        </div>

        {/* ─── Active section copy ────────────────────────────────── */}
        <div className="max-w-2xl mx-auto text-center mt-10 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: EASE_OUT_STRONG }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-[12px] font-medium uppercase text-[#346739] ">
                {section.eyebrow}
              </span>
              <h2 className="text-2xl md:text-3xl font-medium text-[#212121] tracking-[-0.015em] leading-tight">
                {section.title}
              </h2>
              <p className="text-sm md:text-base text-[#616161] font-normal leading-relaxed">
                {section.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}