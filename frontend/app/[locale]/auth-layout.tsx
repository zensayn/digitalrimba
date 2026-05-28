"use client";

import Carousel from '@/components/Carousel';
import { motion } from 'motion/react';

const carouselItems = [
  {
    id: 1,
    title: 'Design unforgettable invitations',
    description: 'Create premium digital invites with our editorial-grade builder.',
    icon: (
      <div className="w-full aspect-[16/10] bg-[#003c33] rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
        <div className="text-center">
          <p className="text-[10px] text-white/30 font-poppins tracking-[0.3em] uppercase mb-1">Preview</p>
          <div className="h-0.5 w-12 bg-[#346739] mx-auto rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Track every guest effortlessly',
    description: 'Real-time RSVP tracking and automated guest list management.',
    icon: (
      <div className="w-full aspect-[16/10] bg-[#edfce9] rounded-xl flex items-center justify-center border border-[#346739]/10">
        <div className="flex gap-2 items-end">
          <div className="w-3 h-8 bg-[#346739]/20 rounded-full" />
          <div className="w-3 h-12 bg-[#346739] rounded-full" />
          <div className="w-3 h-6 bg-[#346739]/10 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'The center for your moments',
    description: 'Collect memories and manage your budget in one beautiful space.',
    icon: (
      <div className="w-full aspect-[16/10] bg-[#f1f5ff] rounded-xl flex items-center justify-center border border-blue-500/10">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin-slow" />
      </div>
    ),
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#24212d] font-poppins overflow-hidden">
      {/* ── LEFT: branding panel with Carousel (Persistent) ── */}
      <div className="hidden lg:flex flex-col w-[45%] bg-[#24212d] relative overflow-hidden h-full">
        {/* Carousel — centered focus */}
        <div className="flex-1 flex items-center justify-center relative z-10 w-full">
          <div className="w-full">
            <div className="mx-auto" style={{ width: '560px' }}>
              <Carousel
                items={carouselItems}
                baseWidth={560}
                autoplay={true}
                autoplayDelay={5000}
                loop={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: white panel wrapper (Persistent structure) ── */}
      <div className="flex-1 flex flex-col h-full bg-white lg:rounded-l-[64px] shadow-[-60px_0_90px_-20px_rgba(0,0,0,0.3)] relative z-20 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
