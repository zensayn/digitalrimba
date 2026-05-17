"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconInfoCircle, IconArrowRight } from "@tabler/icons-react";
import { useAppContext } from "@/context/AppContext";

const SERVICE_TIERS = [
  { id: "heartwood", name: "Heartwood Series", multiplier: 0.50, description: "Masterpiece masterpiece, material langka, foil/emboss (Luxury, Rare)." },
  { id: "timber", name: "Timber Series", multiplier: 0.35, description: "Kokoh, bertekstur, berkualitas (Strong, Textured, Balanced)." },
  { id: "leaf", name: "Leaf Series", multiplier: 0.15, description: "Esensial, bersih, fungsional (Simple, Light, Elegant)." }
];

const SETUP_FEE = 250;

export default function PricingEngine() {
  const { setQty: setGlobalQty, setTier: setGlobalTier, setTotal: setGlobalTotal } = useAppContext();
  const [qty, setQty] = useState(100);
  const [tier, setTier] = useState(SERVICE_TIERS[0]);

  const pricing = useMemo(() => {
    let unitPrice = 50;
    if (qty > 100 && qty <= 500) unitPrice = 40;
    if (qty > 500) unitPrice = 30;

    const baseTotal = unitPrice * qty;
    const serviceFee = baseTotal * tier.multiplier;
    const total = baseTotal + serviceFee + SETUP_FEE;

    return {
      unitPrice,
      baseTotal,
      serviceFee,
      total
    };
  }, [qty, tier]);

  // Sync with global state for WhatsApp template
  useEffect(() => {
    setGlobalQty(qty);
    setGlobalTier(tier.name);
    setGlobalTotal(pricing.total);
  }, [qty, tier, pricing.total, setGlobalQty, setGlobalTier, setGlobalTotal]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="pricing-engine" className="relative w-full bg-clay-canvas py-32 px-6 md:px-10 border-t border-clay-primary/5">
      <div className="max-w-6xl mx-auto">
        <header className="mb-20">
          <span className="font-poppins font-semibold uppercase tracking-[0.15em] text-xs mb-4 block text-clay-teal">
            Systems / Pricing Engine
          </span>
          <h2 className="text-4xl md:text-6xl font-amoria font-normal tracking-[-0.035em] text-clay-ink leading-tight max-w-2xl">
            Calculate your <br />digital wedding footprint.
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Inputs Column */}
          <div className="space-y-12">
            {/* Quantity Input */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay-ink/40">
                  Guest Quantity (Invitations)
                </label>
                <span className="text-3xl font-normal tracking-tighter text-clay-ink">
                  {qty.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value))}
                className="w-full h-1 bg-clay-primary/10 appearance-none cursor-pointer accent-clay-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-black/20  uppercase">
                <span>10</span>
                <span>2,000+</span>
              </div>
            </div>

            {/* Service Tier Selector */}
            <div className="space-y-6">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay-ink/40">
                Product Series Selection
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_TIERS.map((s) => {
                  const isHeartwood = s.id === "heartwood";
                  const isActive = tier.id === s.id;
                  
                  return (
                    <button
                      key={s.id}
                      onClick={() => setTier(s)}
                      className={`relative p-5 text-left border transition-all duration-300 rounded-[12px] flex flex-col justify-between group h-full min-h-[160px] ${
                        isActive 
                          ? "bg-clay-primary border-clay-primary text-white" 
                          : isHeartwood
                            ? "bg-white border-clay-teal/30 text-clay-ink hover:border-clay-teal"
                            : "bg-clay-surface-card border-clay-primary/5 text-clay-ink hover:bg-clay-surface-soft"
                      }`}
                    >
                      {isHeartwood && (
                        <span className={`absolute top-0 right-0 px-2 py-1 text-[8px] font-bold uppercase  ${
                          isActive ? "bg-clay-teal text-white" : "bg-clay-teal text-white"
                        } rounded-tr-[12px] rounded-bl-[12px]`}>
                          Masterpiece
                        </span>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`text-lg font-amoria font-normal tracking-tight ${isHeartwood && !isActive ? "text-clay-teal font-bold" : ""}`}>
                            {s.name}
                          </h4>
                          <span className={`text-xs font-bold  ${isActive ? "text-white/60" : "text-clay-ink/30"}`}>
                            +{s.multiplier * 100}%
                          </span>
                        </div>
                        <p className={`text-[10px] leading-relaxed ${isActive ? "text-white/40" : "text-clay-ink/30"}`}>
                          {s.description}
                        </p>
                      </div>

                      <div className={`mt-4 w-6 h-6 border flex items-center justify-center transition-colors rounded-[4px] ${
                        isActive ? "border-white/20 bg-white/10" : "border-clay-primary/10 bg-clay-primary/5"
                      }`}>
                         <div className={`w-2 h-2 rounded-[2px] ${isActive ? "bg-white" : "bg-clay-primary/20"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="bg-white p-10 md:p-16 border border-clay-primary/5 shadow-2xl rounded-[24px] flex flex-col justify-between h-full min-h-[500px]">
             <div>
                <div className="flex items-center gap-2 text-clay-teal mb-12">
                   <IconInfoCircle className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase ">Estimated Quotation</span>
                </div>

                <div className="space-y-8">
                   <div className="flex justify-between items-baseline border-b border-clay-primary/5 pb-4">
                      <span className="text-clay-ink/40 text-sm font-poppins">Base Rate (P × Q)</span>
                      <span className="text-clay-ink font-normal text-xl">${pricing.baseTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-baseline border-b border-clay-primary/5 pb-4">
                      <span className="text-clay-ink/40 text-sm font-poppins">Series Multiplier ({tier.multiplier * 100}%)</span>
                      <span className="text-clay-ink font-normal text-xl">+ ${pricing.serviceFee.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-baseline border-b border-clay-primary/5 pb-4">
                      <span className="text-clay-ink/40 text-sm font-poppins">Platform Constant (C)</span>
                      <span className="text-clay-ink font-normal text-xl">${SETUP_FEE.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             <div className="mt-20">
                <div className="mb-8">
                   <span className="text-clay-ink/40 text-[10px] font-bold uppercase  block mb-2 font-poppins">Total Investment</span>
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={pricing.total}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-6xl md:text-7xl font-amoria font-normal tracking-[-0.035em] text-clay-ink"
                      >
                         ${pricing.total.toLocaleString()}
                      </motion.div>
                   </AnimatePresence>
                </div>

                <button className="w-full bg-clay-primary text-white py-6 flex items-center justify-center gap-4 hover:opacity-90 transition-opacity rounded-[12px] group">
                   <span className="font-bold uppercase tracking-[0.2em] text-xs">Finalize Agreement</span>
                   <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
