"use client";

import { motion, AnimatePresence } from "motion/react";
import { IconChartLine, IconUsers, IconQrcode, IconWallet, IconArrowRight } from "@tabler/icons-react";
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from "react";

// --- Internal Visual Components ---

const HashtagCloud = () => {
  const tags = ["#Nature", "#Art", "#Photography", "#Travel", "#Selfie", "#AI", "#Fun", "#Cooking", "#Explore", "#Foodie", "#Fitness", "#Movie"];
  return (
    <div className="relative w-full h-48 mt-8 overflow-hidden bg-white rounded-[20px] p-6 border border-clay-primary/5">
      <div className="flex flex-wrap gap-2 justify-center content-center h-full">
        {tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-3 py-1.5 bg-clay-surface-soft border border-clay-primary/5 rounded-full text-[10px] font-bold text-clay-ink/60"
          >
            {tag}
          </motion.span>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className="flex-1 bg-clay-lavender opacity-60" />
        <div className="flex-1 bg-clay-pink opacity-60" />
        <div className="flex-1 bg-clay-peach opacity-60" />
        <div className="flex-1 bg-clay-ochre opacity-60" />
      </div>
    </div>
  );
};

const RSVPChart = () => {
  return (
    <div className="mt-8 flex flex-col md:flex-row gap-6 items-start w-full">
      <div className="flex flex-col gap-3">
        <div className="bg-clay-ochre/80 p-4 rounded-[16px] w-32">
          <span className="text-[8px] font-bold uppercase  text-clay-ink/60">RSVP Rate</span>
          <div className="text-2xl font-bold text-clay-ink">+34%</div>
        </div>
        <div className="bg-clay-pink/80 p-4 rounded-[16px] w-32">
          <span className="text-[8px] font-bold uppercase  text-clay-ink/60">Guests</span>
          <div className="text-2xl font-bold text-clay-ink">+50%</div>
        </div>
      </div>
      <div className="flex-1 w-full bg-white/40 rounded-[20px] p-4 border border-clay-primary/5 h-32 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
           <div className="flex gap-1">
             {['3d', '1w', '1m', '3m'].map(t => (
               <span key={t} className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${t === '1w' ? 'bg-clay-primary text-white' : 'text-clay-ink/40'}`}>
                 {t}
               </span>
             ))}
           </div>
        </div>
        <svg className="w-full h-16" viewBox="0 0 200 60">
          <path 
            d="M0 40 L40 35 L80 45 L120 20 L160 30 L200 10" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            className="text-clay-pink"
          />
          <circle cx="120" cy="20" r="4" className="fill-clay-primary" />
          <text x="110" y="15" className="text-[8px] font-bold fill-clay-primary">+46%</text>
        </svg>
      </div>
    </div>
  );
};

// --- Main Section Component ---

export default function FeaturesSection() {
  const t = useTranslations('Hero'); // Using Hero for now, or add specific ones
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="relative w-full bg-clay-canvas text-clay-ink">
      <section className="relative w-full flex flex-col items-center justify-start px-6 pt-32 pb-32 overflow-hidden">
        <div className="max-w-6xl w-full relative z-10">
          <header className="mb-20 md:mb-32 text-center md:text-left">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease }}
              className="font-poppins uppercase tracking-[0.3em] text-xs mb-6 block text-clay-teal font-bold"
            >
              Rimba Digital Ecosystem
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease }}
              className="text-4xl md:text-6xl lg:text-7xl font-poppins font-normal tracking-[-0.035em] leading-[0.95] text-clay-ink"
            >
              Advanced Analytics <br />
              and Reporting
            </motion.h2>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
            
            {/* Card 1: Hashtag Performance (Large Vertical) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease }}
              className="md:row-span-2 p-10 bg-clay-surface-card rounded-[24px] border border-clay-primary/5 flex flex-col justify-between group"
            >
              <div>
                <h3 className="text-3xl font-poppins font-normal tracking-tight leading-[1.1] mb-6">
                  Hashtag <br />Performance
                </h3>
                <HashtagCloud />
              </div>
              <div className="mt-12 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase  text-clay-teal">View Detailed Report</span>
                <IconArrowRight className="w-5 h-5 text-clay-primary/20" />
              </div>
            </motion.div>

            {/* Card 2: Optimizing Performance (Wide Horizontal) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease }}
              className="md:col-span-2 p-10 bg-clay-surface-card rounded-[24px] border border-clay-primary/5 flex flex-col"
            >
              <h3 className="text-3xl font-poppins font-normal tracking-tight mb-2">Optimizing Performance</h3>
              <p className="text-clay-ink/40 text-sm leading-relaxed max-w-md font-poppins">
                Monitor RSVP trends and guest engagement across all digital touchpoints in real-time.
              </p>
              <RSVPChart />
            </motion.div>

            {/* Card 3: Guest Distribution (Small) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease }}
              className="p-8 bg-clay-surface-card rounded-[24px] border border-clay-primary/5 flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-clay-lavender/20 rounded-[12px] flex items-center justify-center">
                  <IconUsers className="w-5 h-5 text-clay-lavender" />
                </div>
                <span className="text-[10px] font-bold uppercase  text-clay-ink/20">Guests</span>
              </div>
              <div>
                <h4 className="text-xl font-poppins font-normal mb-2 tracking-tight">Guest Distribution</h4>
                <div className="flex -space-x-2 mt-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-clay-surface-card bg-clay-primary/10 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-clay-surface-card bg-clay-primary text-white flex items-center justify-center text-[10px] font-bold">
                    +8
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: QR Check-in (Small) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease }}
              className="p-8 bg-clay-surface-card rounded-[24px] border border-clay-primary/5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-clay-teal/10 rounded-[12px] flex items-center justify-center">
                  <IconQrcode className="w-5 h-5 text-clay-teal" />
                </div>
                <span className="text-[10px] font-bold uppercase  text-clay-ink/20">Security</span>
              </div>
              <div>
                <h4 className="text-xl font-poppins font-normal mb-2 tracking-tight">QR Check-in</h4>
                <p className="text-[10px] text-clay-ink/40 leading-relaxed font-poppins">
                  Fraud-proof guest validation at the entrance with instant dashboard sync.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
