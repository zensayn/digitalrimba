"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import {
  ChatRoundDots,
  ChatRoundCheck,
  UsersGroupRounded,
  Calendar,
  TagPrice,
  Wallet,
  CheckCircle,
  Eye,
  PaletteRound,
  ChecklistMinimalistic,
  Gift,
  Box,
  BagCheck,
  Layers,
  Play,
  Pause,
} from "@solar-icons/react";
import { Delivery } from "@solar-icons/react/ssr";

// ─── HowItWorks ───────────────────────────────────────────────────────────────
// Left column lists the numbered order steps (one active, the rest dimmed).
// Right column shows a *bespoke* animated mockup per step — each one narrates that
// stage instead of echoing the left copy: chat intake, DP invoice, design preview
// with revisions, production checklist, and final payment + shipping. Steps
// auto-advance on a timer (play/pause). Cohere tokens (green accent, ink,
// soft-stone, Poppins); motion follows the emil-design-eng rules (custom ease-out,
// short stagger, transform/opacity/clip-path only, reduced-motion aware).

const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];
const STEP_DURATION = 6000; // ms each step stays active before advancing
const RING_R = 22; // play/pause progress ring radius
const RING_C = 2 * Math.PI * RING_R; // its circumference

// Strip the leading "N. " and convert the title to sentence case.
const formatTitle = (s: string) => {
  const stripped = s.replace(/^\s*\d+\.\s*/, "").trim();
  if (!stripped) return "";
  return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
};

type StepIcon = typeof ChatRoundDots;
type L = (id: string, en: string) => string;
type Vars = { container: Variants; item: Variants };
type MockProps = { L: L; reduced: boolean; V: Vars };

// Motion variants for the mockup body: a staggered entrance gated on reduced motion.
const makeVariants = (reduced: boolean): Vars => ({
  container: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.07,
        delayChildren: reduced ? 0 : 0.08,
      },
    },
    exit: {
      opacity: 0,
      y: reduced ? 0 : -8,
      filter: reduced ? "blur(0px)" : "blur(4px)",
      transition: { duration: 0.22, ease: EASE_OUT_STRONG },
    },
  },
  item: {
    hidden: { opacity: 0, y: reduced ? 0 : 14, filter: reduced ? "blur(0px)" : "blur(5px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: EASE_OUT_STRONG },
    },
  },
});

// ─── shared atoms ───────────────────────────────────────────────────────────

function TypingDots({ reduced }: { reduced: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#93939f]"
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={
            reduced ? undefined : { duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }
          }
        />
      ))}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe9cd] bg-[#edfce9] px-2.5 py-1 text-[11px] font-medium text-[#346739]">
      {children}
    </span>
  );
}

// ─── Step 1 · Order intake (chat) ─────────────────────────────────────────────

function OrderMock({ L, reduced, V }: MockProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* contact header */}
      <motion.div variants={V.item} className="flex items-center gap-2.5">
        <span className="relative w-9 h-9 rounded-full bg-[#346739] flex items-center justify-center text-white">
          <UsersGroupRounded size={18} weight="BoldDuotone" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#3ec46d] border-2 border-white" />
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-medium text-[#212121]">Rimba Fisik</p>
          <p className="text-[11px] text-[#93939f]">{L("Online sekarang", "Online now")}</p>
        </div>
      </motion.div>

      {/* incoming greeting */}
      <motion.div variants={V.item} className="self-start max-w-[80%] rounded-2xl rounded-bl-md bg-[#f4f2ee] px-3.5 py-2.5">
        <p className="text-[12.5px] leading-relaxed text-[#3a3a3a]">
          {L("Hai! Ceritakan detail acaramu ya 🌸", "Hi! Tell us about your event 🌸")}
        </p>
      </motion.div>

      {/* customer detail bubble */}
      <motion.div variants={V.item} className="self-end max-w-[88%] rounded-2xl rounded-br-md bg-[#346739] px-3.5 py-3 text-white">
        <p className="text-[12.5px] leading-relaxed mb-2">
          {L("Mau pesan undangan untuk:", "I'd like to order invitations for:")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
            <TagPrice size={13} weight="Bold" />
            {L("Undangan", "Invitation")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
            150 pcs
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
            <Calendar size={13} weight="Bold" />
            12.12.26
          </span>
        </div>
      </motion.div>

      {/* team typing + replied status */}
      <motion.div variants={V.item} className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f4f2ee] px-3 py-2">
          <TypingDots reduced={reduced} />
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#346739]">
          <ChatRoundCheck size={15} weight="Bold" />
          {L("Dibalas < 24 jam", "Replied < 24 hrs")}
        </span>
      </motion.div>
    </div>
  );
}

// ─── Step 2 · Down payment (invoice) ──────────────────────────────────────────

function PaymentMock({ L, reduced, V }: MockProps) {
  return (
    <div className="flex flex-col gap-4">
      <motion.div variants={V.item} className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#212121]">
          <Wallet size={17} weight="BoldDuotone" className="text-[#346739]" />
          {L("Invoice", "Invoice")}
        </span>
        <span className="text-[11px] font-medium text-[#93939f] tabular-nums">#RF-1245</span>
      </motion.div>

      {/* line items — amounts kept as masked placeholders (no invented prices) */}
      <motion.div variants={V.item} className="rounded-2xl border border-[#f0eee9] bg-[#faf9f6] p-4">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[12.5px] text-[#616161]">{L("Estimasi total", "Estimated total")}</span>
          <span className="h-3 w-20 rounded-full bg-[#e2ded5] blur-[2px]" />
        </div>
        <div className="my-2 h-px bg-[#eceae4]" />
        <div className="flex items-center justify-between py-1.5">
          <span className="text-[12.5px] font-medium text-[#212121]">{L("DP 50% — tanda jadi", "50% deposit")}</span>
          <span className="h-3.5 w-16 rounded-full bg-[#cfe9cd]" />
        </div>
      </motion.div>

      {/* progress to 50% */}
      <motion.div variants={V.item}>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
          <span className="text-[#93939f]">{L("Pembayaran", "Payment")}</span>
          <span className="text-[#346739] tabular-nums">50%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#ece9e3]">
          <motion.div
            className="h-full origin-left rounded-full bg-[#346739]"
            initial={{ scaleX: reduced ? 0.5 : 0 }}
            animate={{ scaleX: 0.5 }}
            transition={{ duration: reduced ? 0 : 0.9, ease: EASE_OUT_STRONG, delay: reduced ? 0 : 0.35 }}
          />
        </div>
      </motion.div>

      {/* confirmation */}
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.4, ease: EASE_OUT_STRONG, delay: reduced ? 0 : 0.7 }}
        className="flex items-center gap-2.5 rounded-2xl bg-[#edfce9] px-4 py-3"
      >
        <CheckCircle size={22} weight="Bold" className="text-[#346739] shrink-0" />
        <div className="leading-tight">
          <p className="text-[12.5px] font-medium text-[#212121]">{L("DP diterima", "Deposit received")}</p>
          <p className="text-[11px] text-[#5f7a5f]">{L("Produksi resmi dimulai 💛", "Crafting officially begins 💛")}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Step 3 · Designing (preview + revisions) ─────────────────────────────────

function DesignMock({ L, reduced, V }: MockProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <motion.div variants={V.item} className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#212121]">
          <Eye size={17} weight="BoldDuotone" className="text-[#346739]" />
          {L("Preview desain", "Design preview")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          {["#346739", "#d8d4cb", "#ff7759"].map((c) => (
            <span key={c} className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: c }} />
          ))}
        </span>
      </motion.div>

      {/* preview canvas revealed bottom-up via clip-path */}
      <motion.div
        variants={V.item}
        initial={{ clipPath: reduced ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduced ? 0 : 0.7, ease: EASE_OUT_STRONG, delay: reduced ? 0 : 0.15 }}
        className="rounded-2xl border border-[#e7eddf] bg-[#f4f8ef] px-6 py-7 flex flex-col items-center gap-3"
      >
        <PaletteRound size={30} weight="BoldDuotone" className="text-[#346739]" />
        <span className="h-2.5 w-32 rounded-full bg-[#cdd9c2]" />
        <span className="h-2 w-20 rounded-full bg-[#dde6d4]" />
        <span className="mt-1 h-px w-24 bg-[#d3ddc8]" />
        <span className="h-2 w-28 rounded-full bg-[#dde6d4]" />
      </motion.div>

      {/* revision counter */}
      <motion.div variants={V.item} className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#616161]">{L("Revisi gratis 5x", "Free revisions 5x")}</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === 0 ? "bg-[#346739]" : "bg-[#d9d9dd]"}`} />
            ))}
          </span>
          <span className="text-[12px] font-medium text-[#346739] tabular-nums">1/5</span>
        </span>
      </motion.div>
    </div>
  );
}

// ─── Step 4 · Production (craft checklist) ────────────────────────────────────

function ProductionMock({ L, reduced, V }: MockProps) {
  const items: { Icon: StepIcon; label: string }[] = [
    { Icon: Layers, label: L("Undangan", "Invitations") },
    { Icon: Box, label: L("Pokok telur", "Egg pouches") },
    { Icon: BagCheck, label: L("Hantaran", "Hantaran trays") },
    { Icon: Gift, label: L("Souvenir", "Wedding favors") },
  ];
  return (
    <div className="flex flex-col gap-3">
      <motion.div variants={V.item} className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#212121]">
          <ChecklistMinimalistic size={17} weight="BoldDuotone" className="text-[#346739]" />
          {L("Dalam produksi", "In production")}
        </span>
        <span className="text-[11px] font-medium text-[#346739] tabular-nums">4/4</span>
      </motion.div>

      <div className="flex flex-col gap-2">
        {items.map(({ Icon, label }, i) => {
          const tick = reduced ? 0 : 0.45 + i * 0.22;
          return (
            <motion.div
              key={label}
              variants={V.item}
              initial={false}
              animate={{ backgroundColor: reduced ? "#edfce9" : ["#faf9f6", "#edfce9"] }}
              transition={{ duration: reduced ? 0 : 0.4, delay: tick }}
              className="flex items-center gap-3 rounded-xl border border-[#f0eee9] px-3 py-2.5"
            >
              <span className="w-8 h-8 rounded-lg bg-white border border-[#eceae4] flex items-center justify-center text-[#346739] shrink-0">
                <Icon size={17} weight="BoldDuotone" />
              </span>
              <span className="text-[12.5px] font-medium text-[#3a3a3a] flex-1">{label}</span>
              <motion.span
                initial={{ scale: reduced ? 1 : 0.4, opacity: reduced ? 1 : 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: EASE_OUT_STRONG, delay: tick }}
                className="text-[#346739] shrink-0"
              >
                <CheckCircle size={20} weight="Bold" />
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      <motion.p variants={V.item} className="text-[11px] text-[#93939f] pt-0.5">
        {L("Dikerjakan satu per satu dengan teliti", "Hand-finished, one detail at a time")}
      </motion.p>
    </div>
  );
}

// ─── Step 5 · Final payment + shipping ────────────────────────────────────────

function FinalMock({ L, reduced, V }: MockProps) {
  const nodes: { Icon: StepIcon; label: string }[] = [
    { Icon: CheckCircle, label: L("Lunas", "Paid") },
    { Icon: Box, label: L("Dikemas", "Packed") },
    { Icon: Delivery as StepIcon, label: L("Dikirim", "Shipped") },
  ];
  return (
    <div className="flex flex-col items-center gap-5 pt-1">
      {/* PAID stamp */}
      <motion.div
        initial={{ opacity: 0, scale: reduced ? 1 : 0.85, rotate: reduced ? -6 : -16 }}
        animate={{ opacity: 1, scale: 1, rotate: -6 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: EASE_OUT_STRONG, delay: reduced ? 0 : 0.1 }}
        className="relative inline-flex items-center gap-2 rounded-2xl border-2 border-[#346739] px-5 py-2.5"
      >
        <CheckCircle size={22} weight="Bold" className="text-[#346739]" />
        <span className="text-lg font-medium tracking-tight text-[#346739]">{L("LUNAS", "PAID")}</span>
        {/* confetti */}
        {!reduced &&
          [
            { c: "#346739", x: -34, y: -18, d: 0.45 },
            { c: "#ff7759", x: 40, y: -10, d: 0.6 },
            { c: "#3ec46d", x: 30, y: 24, d: 0.7 },
            { c: "#ffad9b", x: -40, y: 22, d: 0.55 },
          ].map((p, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: p.c }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1 }}
              transition={{ duration: 1, ease: EASE_OUT_STRONG, delay: p.d }}
            />
          ))}
      </motion.div>

      {/* shipping progress */}
      <motion.div variants={V.item} className="w-full max-w-[280px]">
        <div className="relative flex items-center justify-between">
          {/* track */}
          <div className="absolute left-5 right-5 top-5 h-0.5 bg-[#e3e0d9]" />
          <motion.div
            className="absolute left-5 top-5 h-0.5 origin-left bg-[#346739]"
            style={{ right: "1.25rem" }}
            initial={{ scaleX: reduced ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduced ? 0 : 1, ease: EASE_OUT_STRONG, delay: reduced ? 0 : 0.4 }}
          />
          {nodes.map(({ Icon, label }, i) => (
            <motion.div
              key={label}
              className="relative z-10 flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: EASE_OUT_STRONG, delay: reduced ? 0 : 0.4 + i * 0.28 }}
            >
              <span className="w-10 h-10 rounded-full bg-[#346739] text-white flex items-center justify-center shadow-[0_6px_16px_-8px_rgba(52,103,57,0.7)]">
                <Icon size={19} weight="BoldDuotone" />
              </span>
              <span className="text-[11px] font-medium text-[#3a3a3a]">{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.span
        variants={V.item}
        className="inline-flex items-center gap-2 rounded-full bg-[#edfce9] px-4 py-2 text-[12px] font-medium text-[#346739]"
      >
        <Delivery size={16} weight="Bold" />
        {L("Siap dikirim — tunggu hari bahagiamu 🎉", "Ready to ship — your big day awaits 🎉")}
      </motion.span>
    </div>
  );
}

const MOCKS = [OrderMock, PaymentMock, DesignMock, ProductionMock, FinalMock];

// ─── main ─────────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const t = useTranslations("OrderProcess");
  const locale = useLocale();
  const reduced = !!useReducedMotion();
  const L: L = (id, en) => (locale === "id" ? id : en);
  const V = makeVariants(reduced);

  const stepIcons: StepIcon[] = [ChatRoundDots, Wallet, PaletteRound, ChecklistMinimalistic, BagCheck];
  const steps = [
    { title: formatTitle(t("step1Title")), description: t("step1Desc") },
    { title: formatTitle(t("step2Title")), description: t("step2Desc") },
    { title: formatTitle(t("step3Title")), description: t("step3Desc") },
    { title: formatTitle(t("step4Title")), description: t("step4Desc") },
    { title: formatTitle(t("step5Title")), description: t("step5Desc") },
  ];
  const total = steps.length;

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  // RAF-driven progress so pause/resume is seamless. elapsedRef accumulates time
  // so a resume continues where it paused; the timer bar is updated directly on
  // the DOM node (no per-frame re-render).
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const rafRef = useRef(0);
  const ringRef = useRef<SVGCircleElement | null>(null);

  // Reset the accumulated time + progress ring whenever the active step changes.
  useEffect(() => {
    elapsedRef.current = 0;
    startRef.current = null;
    if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_C);
  }, [active]);

  useEffect(() => {
    if (!playing) return;

    const tick = (ts: number) => {
      if (startRef.current == null) startRef.current = ts - elapsedRef.current;
      const elapsed = ts - startRef.current;
      elapsedRef.current = elapsed;
      const p = Math.min(elapsed / STEP_DURATION, 1);
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_C * (1 - p));
      if (p >= 1) {
        setActive((a) => (a + 1) % total);
        return; // the [active] effect resets state; this effect re-runs fresh
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, active, total]);

  const current = steps[active];
  const HeaderIcon = stepIcons[active];
  const Mock = MOCKS[active];
  const mockProps: MockProps = { L, reduced, V };

  return (
    <section className="wrapper relative w-full bg-white px-6 md:px-12 py-24 md:py-36 select-none font-poppins">
      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* ─── Header: badge + heading (left) and intro (right) ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start mb-14 md:mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-[#212121] leading-[1.12]">
              {t("title")}
            </h2>
          </div>
          <p className="text-sm lg:text-[15px] leading-relaxed text-[#616161] lg:pt-2">
            {t("leftDesc")}
          </p>
        </div>

        {/* ─── Main: step list (left) + animated mockup (right) ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* LEFT — step list */}
          <ol className="flex flex-col">
            {steps.map((step, i) => {
              const isActive = i === active;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive ? "step" : undefined}
                    className={`group relative w-full text-left rounded-2xl transition-colors duration-300 ${
                      isActive
                        ? "bg-white border border-[#e5e7eb] shadow-sm px-5 sm:px-6 py-5"
                        : "border border-transparent px-5 sm:px-6 py-4 hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span
                        className={`text-[15px] tabular-nums font-medium shrink-0 transition-colors duration-300 ${
                          isActive ? "text-[#346739]" : "text-[#c4c4cc]"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      <span
                        className={`text-base sm:text-lg lg:text-xl font-medium tracking-tight leading-snug transition-colors duration-300 ${
                          isActive ? "text-[#212121]" : "text-[#bcbcc4] group-hover:text-[#93939f]"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          key="desc"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE_OUT_STRONG }}
                          className="overflow-hidden"
                        >
                          <p className="pl-[2.6rem] pr-2 pt-2.5 text-[13px] sm:text-sm leading-relaxed text-[#616161] max-w-[560px]">
                            {step.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* RIGHT — bespoke animated mockup panel */}
          <div className="relative lg:sticky lg:top-28">
            <div className="relative rounded-[32px] bg-[#eeece7] p-6 sm:p-9 min-h-[460px] sm:min-h-[520px] flex items-center justify-center overflow-hidden">
              {/* mockup card */}
              <div className="w-full max-w-[440px] rounded-[22px] bg-white border border-[#f2f2f2] shadow-[0_18px_50px_-25px_rgba(0,0,0,0.25)] overflow-hidden">
                {/* card header: accent icon + title */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[#f2f2f2]">
                  <span className="w-9 h-9 rounded-xl bg-[#edfce9] flex items-center justify-center text-[#346739] shrink-0">
                    <HeaderIcon size={20} weight="BoldDuotone" />
                  </span>
                  <h3 className="text-base sm:text-lg font-medium tracking-tight text-[#212121] leading-snug truncate">
                    {current.title}
                  </h3>
                </div>

                {/* bespoke step body */}
                <div className="px-6 py-6 min-h-[300px] sm:min-h-[324px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={active} variants={V.container} initial="hidden" animate="show" exit="exit">
                      <Mock {...mockProps} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* play / pause control with circular step-timer progress */}
              <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 w-12 h-12">
                <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                  <circle cx="24" cy="24" r={RING_R} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                  <circle
                    ref={ringRef}
                    cx="24"
                    cy="24"
                    r={RING_R}
                    fill="none"
                    stroke="#346739"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C}
                  />
                </svg>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause" : "Play"}
                  className="absolute inset-1 rounded-full bg-white shadow-sm flex items-center justify-center text-[#212121] hover:scale-[1.05] active:scale-95 transition-transform duration-150"
                >
                  {playing ? <Pause size={18} weight="Bold" /> : <Play size={18} weight="Bold" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
