"use client";

import { motion } from "motion/react";
import { IconArrowUpRight, IconArrowDownLeft, IconCheck, IconUsers, IconQrcode, IconCalendar, IconArrowRight } from "@tabler/icons-react";

/* -------------------------------------------------------------------------- */
/*  Micro visual components                                                    */
/* -------------------------------------------------------------------------- */

/** Floating pill tags that represent budget categories */
function BudgetPills() {
  const pills = [
    { label: "Venue", amount: "Rp 45jt", up: false, x: "left-4", y: "top-6" },
    { label: "Catering", amount: "Rp 28jt", up: false, x: "left-[30%]", y: "top-2" },
    { label: "Photo", amount: "Rp 12jt", up: true, x: "right-8", y: "top-8" },
    { label: "Flowers", amount: "Rp 8jt", up: true, x: "right-4", y: "top-20" },
    { label: "Dress", x: "left-6", y: "bottom-10", amount: "Rp 6jt", up: false },
    { label: "Music", x: "left-[40%]", y: "bottom-4", amount: "Rp 5jt", up: true },
    { label: "Cake", x: "right-10", y: "bottom-8", amount: "Rp 3jt", up: false },
  ];

  return (
    <div className="relative w-full h-44 mt-6">
      {/* Centre balance card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-sm border border-[#f2f2f2] px-6 py-4 text-center z-10">
        <p className="text-[11px] text-[#93939f] font-poppins mb-1">Total budget</p>
        <p className="text-2xl font-poppins font-normal text-[#212121] tracking-tight">Rp 107jt</p>
        {/* Smiley */}
        <div className="mt-2 text-2xl select-none">😊</div>
      </div>

      {/* Floating pills */}
      {pills.map((p, i) => (
        <motion.div
          key={p.label}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.5 }}
          className={`absolute ${p.x} ${p.y} flex items-center gap-1.5 bg-white border border-[#f2f2f2] rounded-full px-3 py-1.5 shadow-sm`}
        >
          <span className={`text-[10px] font-poppins font-medium ${p.up ? "text-[#346739]" : "text-[#ff7759]"}`}>
            {p.up ? "↑" : "↓"}
          </span>
          <span className="text-[10px] font-poppins text-[#212121]">{p.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** Scrolling chip rows for the transaction card */
function TransactionChips() {
  const rows = [
    [
      { icon: "📋", label: "Guest List", amount: "500 guests", delta: "+12" },
      { icon: "💌", label: "Invitations", amount: "480 sent", delta: "+8" },
      { icon: "📸", label: "Photo", amount: "Rp 12jt", delta: "-Rp 2jt" },
    ],
    [
      { icon: "🌸", label: "Flowers", amount: "Rp 8jt", delta: "+Rp 1jt" },
      { icon: "🎵", label: "Music", amount: "Rp 5jt", delta: "-Rp 500k" },
      { icon: "🎂", label: "Cake", amount: "Rp 3jt", delta: "+Rp 200k" },
    ],
    [
      { icon: "🏛️", label: "Venue", amount: "Rp 45jt", delta: "-Rp 5jt" },
      { icon: "🍽️", label: "Catering", amount: "Rp 28jt", delta: "+Rp 3jt" },
      { icon: "👗", label: "Dress", amount: "Rp 6jt", delta: "-Rp 1jt" },
    ],
  ];

  return (
    <div className="mt-6 space-y-3 overflow-hidden">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-3">
          {row.map((chip, ci) => {
            const isNeg = chip.delta.startsWith("-");
            return (
              <div
                key={ci}
                className="flex-1 min-w-0 bg-[#eeece7] rounded-2xl px-3 py-3 flex items-center gap-2"
              >
                <span className="text-base shrink-0">{chip.icon}</span>
                <div className="min-w-0">
                  <p className="text-[9px] text-[#93939f] font-poppins truncate">{chip.label}</p>
                  <p className="text-[11px] font-poppins font-medium text-[#212121] truncate">{chip.amount}</p>
                  <p className={`text-[9px] font-poppins font-medium ${isNeg ? "text-[#ff7759]" : "text-[#346739]"}`}>
                    {chip.delta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Phone mockup for the wide card */
function PhoneMockup() {
  return (
    <div className="relative w-[160px] shrink-0 self-end">
      {/* Phone shell */}
      <div className="relative bg-[#212121] rounded-[28px] p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#212121] rounded-full z-10" />
        {/* Screen */}
        <div className="bg-white rounded-[22px] overflow-hidden pt-6 pb-4 px-3">
          {/* Status bar */}
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[8px] font-poppins text-[#212121]">9:30</span>
            <div className="flex gap-1">
              <div className="w-3 h-1.5 bg-[#212121] rounded-sm" />
              <div className="w-1.5 h-1.5 bg-[#212121] rounded-full" />
            </div>
          </div>
          {/* App header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-5 h-5 rounded-full bg-[#346739]/20 flex items-center justify-center">
              <span className="text-[8px]">👤</span>
            </div>
            <div>
              <p className="text-[8px] font-poppins text-[#93939f]">Hi, Couple</p>
              <p className="text-[7px] font-poppins text-[#212121]">27th April 2025</p>
            </div>
          </div>
          {/* Card */}
          <div className="bg-[#003c33] rounded-xl p-3 mb-3">
            <p className="text-[7px] text-white/60 font-poppins mb-1">Wedding Overview</p>
            <p className="text-[14px] font-poppins font-medium text-white">Rp 107jt</p>
            <p className="text-[7px] text-white/60 font-poppins">Budget limit: Rp 120jt</p>
          </div>
          {/* Rows */}
          {[
            { label: "Guests", val: "500", delta: "+12 ↑" },
            { label: "RSVP", val: "380", delta: "+8 ↑" },
            { label: "Budget", val: "89%", delta: "-2% ↓" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between items-center py-1 border-b border-[#f2f2f2] last:border-0 px-1">
              <span className="text-[8px] font-poppins text-[#93939f]">{r.label}</span>
              <span className="text-[8px] font-poppins font-medium text-[#212121]">{r.val}</span>
              <span className="text-[7px] font-poppins text-[#346739]">{r.delta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Transfer confirmation card for bottom-right */
function TransferCard() {
  return (
    <div className="mt-6 space-y-3">
      {/* Success badge */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#212121] flex items-center justify-center">
          <IconCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <p className="text-[11px] font-poppins text-[#93939f]">Booking Confirmed</p>
      </div>

      {/* Transfer rows */}
      <div className="bg-[#eeece7] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconArrowUpRight className="w-3.5 h-3.5 text-[#346739]" />
            <span className="text-[11px] font-poppins text-[#93939f]">Vendor</span>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-poppins font-medium text-[#212121]">Rp 45jt</p>
            <p className="text-[10px] font-poppins text-[#93939f]">Venue Deposit</p>
          </div>
        </div>
        <div className="h-px bg-[#d9d9dd]" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconArrowDownLeft className="w-3.5 h-3.5 text-[#ff7759]" />
            <span className="text-[11px] font-poppins text-[#93939f]">Couple</span>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-poppins font-medium text-[#212121]">Rp 28jt</p>
            <p className="text-[10px] font-poppins text-[#93939f]">Catering Deposit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

const ease = [0.22, 1, 0.36, 1] as const;

const cardBase =
  "bg-white rounded-[32px] border border-[#f2f2f2] p-8 flex flex-col overflow-hidden";

export default function BentoSection() {
  return (
    <section className="w-full bg-white px-4 md:px-8 py-20 md:py-28 font-poppins">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="mb-12 md:mb-16"
        >
          <span className="text-[12px] font-poppins font-normal uppercase tracking-[0.28px] text-[#346739] block mb-4">
            Everything in one place
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-poppins font-normal tracking-[-1px] leading-none text-[#212121] max-w-2xl">
            Your wedding,<br />fully managed.
          </h2>
        </motion.div>

        {/*
          Grid layout:
            Top row    → equal halves  (5 + 5 of 10 cols)
            Bottom row → 60 / 40 split (6 + 4 of 10 cols)
          On mobile the inline gridColumn is overridden by a single-column wrapper.
        */}
        {/* Mobile: simple 1-col stack */}
        <div className="flex flex-col gap-4 md:hidden">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease }} className={cardBase}>
            <BudgetPills />
            <div className="mt-8">
              <h3 className="text-[22px] font-poppins font-normal tracking-tight text-[#212121] mb-2">Budget at a glance</h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed">Track every spend with clear categories and insights, making it easier to control budgets and spot savings.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }} className={cardBase}>
            <TransactionChips />
            <div className="mt-8">
              <h3 className="text-[22px] font-poppins font-normal tracking-tight text-[#212121] mb-2">Every detail tracked</h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed">Stay informed with real-time updates and complete history, so you always know exactly where things stand.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease }} className={`${cardBase} flex-row items-end gap-6`}>
            <div className="flex-1">
              <h3 className="text-[32px] font-poppins font-normal tracking-tight leading-tight text-[#212121] mb-4">Introducing<br />Rimba Digital</h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed max-w-[200px]">Manage guests, invitations, and budgets in one secure platform.</p>
              <button className="mt-6 flex items-center gap-2 text-[13px] font-poppins font-medium text-[#346739]">Explore platform <IconArrowRight className="w-4 h-4" /></button>
            </div>
            <PhoneMockup />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }} className={cardBase}>
            <TransferCard />
            <div className="mt-8">
              <h3 className="text-[22px] font-poppins font-normal tracking-tight text-[#212121] mb-2">Vendor bookings with ease</h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed">Confirm vendors and track deposits effortlessly — all in one place.</p>
            </div>
          </motion.div>
        </div>

        {/* Desktop: 10-column bento grid */}
        <div
          className="hidden md:grid gap-5"
          style={{ gridTemplateColumns: "repeat(10, 1fr)" }}
        >
          {/* Top-left — 5 cols (50%) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className={cardBase}
            style={{ gridColumn: "1 / span 5" }}
          >
            <BudgetPills />
            <div className="mt-8">
              <h3 className="text-[22px] font-poppins font-normal tracking-tight text-[#212121] mb-2">
                Budget at a glance
              </h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed">
                Track every spend with clear categories and insights, making it easier to control budgets and spot savings.
              </p>
            </div>
          </motion.div>

          {/* Top-right — 5 cols (50%) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
            className={cardBase}
            style={{ gridColumn: "6 / span 5" }}
          >
            <TransactionChips />
            <div className="mt-8">
              <h3 className="text-[22px] font-poppins font-normal tracking-tight text-[#212121] mb-2">
                Every detail tracked
              </h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed">
                Stay informed with real-time updates and complete history, so you always know exactly where things stand.
              </p>
            </div>
          </motion.div>

          {/* Bottom-left — 6 cols (60%) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className={`${cardBase} flex-row items-end gap-8`}
            style={{ gridColumn: "1 / span 6" }}
          >
            <div className="flex-1">
              <h3 className="text-[40px] font-poppins font-normal tracking-tight leading-tight text-[#212121] mb-4">
                Introducing<br />Rimba Digital
              </h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed max-w-[220px]">
                Manage guests, invitations, and budgets in one secure platform built to simplify your entire wedding.
              </p>
              <button className="mt-6 flex items-center gap-2 text-[13px] font-poppins font-medium text-[#346739] hover:gap-3 transition-all">
                Explore platform <IconArrowRight className="w-4 h-4" />
              </button>
            </div>
            <PhoneMockup />
          </motion.div>

          {/* Bottom-right — 4 cols (40%) */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease }}
            className={cardBase}
            style={{ gridColumn: "7 / span 4" }}
          >
            <TransferCard />
            <div className="mt-8">
              <h3 className="text-[22px] font-poppins font-normal tracking-tight text-[#212121] mb-2">
                Vendor bookings with ease
              </h3>
              <p className="text-[14px] font-poppins text-[#93939f] leading-relaxed">
                Confirm vendors and track deposits effortlessly — all in one place, always up to date.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
