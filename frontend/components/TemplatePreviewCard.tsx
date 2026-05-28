"use client";

// ─── TemplatePreviewCard ───────────────────────────────────────────────────────
// Portrait invitation-card preview. Replaces the laptop CSS-art mockup.
// Accepts the template ID and renders the appropriate gradient + art.

import React from "react";

interface Props {
  templateId: string;
  className?: string;
}

const VISUALS: Record<string, { bg: string; content: React.ReactNode }> = {
  city3: {
    bg: "bg-gradient-to-b from-[#102a1b] to-[#05110a]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-14 h-14 border border-amber-500/25 rounded-full flex items-center justify-center">
          <span className="text-lg text-amber-400">⚜</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[9px] text-amber-200/40 uppercase tracking-[0.25em] font-poppins">The Wedding Of</p>
          <h4 className="font-poppins text-sm text-amber-200 uppercase tracking-widest font-light">
            Abhishek &amp; Kanika
          </h4>
        </div>
        <div className="w-8 h-px bg-amber-500/25" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] text-amber-500/60 font-poppins uppercase tracking-widest">Save the Date</p>
          <p className="text-[9px] text-amber-300/45 font-poppins">12 • 12 • 2026</p>
        </div>
      </div>
    ),
  },

  city: {
    bg: "bg-gradient-to-b from-[#d35400] via-[#e67e22] to-[#f39c12]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center overflow-hidden">
        <div className="absolute top-8 left-10 w-4 h-5 bg-yellow-300/25 rounded-full blur-sm" />
        <div className="absolute top-5 right-12 w-3 h-4 bg-yellow-200/35 rounded-full blur-sm" />
        <div className="absolute bottom-10 left-14 w-5 h-6 bg-yellow-400/20 rounded-full blur-sm" />
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/55 font-poppins">The Wedding Of</span>
        <h4 className="font-poppins text-2xl text-white tracking-wide font-normal">A &amp; K</h4>
        <div className="w-8 h-px bg-white/30" />
        <p className="text-[8px] text-white/60 font-poppins uppercase tracking-widest">Join Us to Celebrate</p>
      </div>
    ),
  },

  beach: {
    bg: "bg-gradient-to-b from-[#4b1248] via-[#f0788c] to-[#fbc531]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center overflow-hidden">
        <div className="absolute bottom-0 inset-x-0 h-8 bg-white/10 rounded-t-[50%]" />
        <div className="absolute bottom-2 inset-x-0 h-5 bg-white/15 rounded-t-[50%]" />
        <h4 className="font-poppins text-sm text-white uppercase tracking-widest font-normal">Beach Side Love</h4>
        <span className="text-2xl text-white/80">⚓</span>
        <p className="text-[9px] text-white/60 font-poppins uppercase tracking-widest mt-1">Bali • Desember 2026</p>
      </div>
    ),
  },

  grace: {
    bg: "bg-[#faf9f5]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="absolute top-6 left-0 right-0 flex justify-between px-6 text-[#2c402e]/15 text-xl">
          <span>🌿</span>
          <span>🌿</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] text-stone-400 uppercase tracking-[0.25em] font-poppins">Until Forever</p>
          <h4 className="font-poppins text-base text-[#2c402e] font-medium">Grace &amp; Samuel</h4>
        </div>
        <div className="w-8 h-px bg-[#2c402e]/20" />
        <p className="text-[9px] text-stone-400 font-poppins tracking-wider uppercase">20 • 09 • 2026</p>
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 text-[#2c402e]/15 text-xl">
          <span>🌿</span>
          <span>🌿</span>
        </div>
      </div>
    ),
  },

  serenity: {
    bg: "bg-slate-100",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center border-t-[3px] border-[#346739] m-5 rounded-sm">
        <p className="text-[9px] text-slate-400 uppercase tracking-[0.25em] font-poppins">The Wedding</p>
        <span className="text-2xl text-[#346739]">⛪</span>
        <p className="text-[9px] text-slate-400 font-poppins uppercase tracking-widest">Elegant Simplicity</p>
      </div>
    ),
  },

  royalSikh: {
    bg: "bg-gradient-to-b from-[#4a000b] to-[#1f0004]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="w-14 h-14 border border-amber-400/25 rounded-full flex items-center justify-center">
          <span className="text-amber-400 text-2xl">☬</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <h4 className="font-poppins text-sm text-amber-200 uppercase tracking-widest font-normal">Anand Karaj</h4>
          <p className="text-[9px] text-amber-500/60 font-poppins uppercase tracking-widest">Royal Wedding · Punjab</p>
        </div>
      </div>
    ),
  },

  noor: {
    bg: "bg-gradient-to-b from-[#022c22] to-[#011410]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-3xl">🌙</span>
        <div className="flex flex-col items-center gap-1.5">
          <h4 className="font-poppins text-sm text-emerald-100 uppercase tracking-widest font-light">Walimatul Urs</h4>
          <p className="text-[9px] text-emerald-500/70 font-poppins uppercase tracking-widest">Noor &amp; Farhan</p>
        </div>
        <div className="w-8 h-px bg-emerald-500/25" />
        <p className="text-[9px] text-emerald-400/40 font-poppins">BISMILLAH</p>
      </div>
    ),
  },

  royalDeccan: {
    bg: "bg-[#b45309]",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-3xl">🪔</span>
        <div className="flex flex-col items-center gap-1.5">
          <h4 className="font-poppins text-sm text-white uppercase tracking-widest font-medium">South Heritage</h4>
          <p className="text-[9px] text-yellow-200/65 font-poppins uppercase tracking-widest">Kanchipuram · Chennai</p>
        </div>
      </div>
    ),
  },

  minimalist: {
    bg: "bg-white",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="border border-stone-900 inset-4 absolute" />
        <h4 className="font-poppins text-lg text-stone-900 font-bold uppercase tracking-tighter">M &amp; S</h4>
        <div className="w-10 h-px bg-stone-900" />
        <p className="text-[9px] text-stone-500 font-poppins uppercase tracking-[0.25em]">Established 2026</p>
      </div>
    ),
  },
};

export default function TemplatePreviewCard({ templateId, className = "" }: Props) {
  const visual = VISUALS[templateId] ?? VISUALS.city3;

  return (
    <div className={`relative overflow-hidden ${visual.bg} ${className}`}>
      {/* Glass shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.06] pointer-events-none z-10" />
      {visual.content}
    </div>
  );
}
