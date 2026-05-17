"use client";

import { motion } from "motion/react";
import { IconBrandWhatsapp, IconArrowRight } from "@tabler/icons-react";
import { useAppContext } from "@/context/AppContext";

export default function WhatsAppCTA() {
  const { state } = useAppContext();

  const generateMessage = () => {
    const text = `RIVR Institutional Quotation Inquiry:
---
Product: ${state.product}
Quantity: ${state.qty.toLocaleString()} units
Service Tier: ${state.tier}
Design Concept: ${state.design}
---
Estimated Total Presence: $${state.total.toLocaleString()}

I would like to discuss this configuration with a protocol representative.`;

    return `https://wa.me/1234567890?text=${encodeURIComponent(text)}`;
  };

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <>
      {/* Final Section Button */}
      <section className="relative w-full bg-white py-32 px-6 md:px-10 border-t border-black/5 flex flex-col items-center">
        <div className="max-w-4xl w-full text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-amoria uppercase tracking-[0.4em] text-xs mb-8 block text-black/40"
          >
            Finalize Your Inquiry
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-4xl md:text-7xl font-normal tracking-tighter text-black leading-tight mb-12"
          >
            Ready to secure your <br />liquid position?
          </motion.h2>

          <a 
            href={generateMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-6 bg-[#25D366] text-white px-12 py-6 text-xl font-medium rounded-none hover:bg-[#20ba59] transition-colors group shadow-2xl"
          >
            <IconBrandWhatsapp className="w-8 h-8" />
            <span className="uppercase tracking-[0.2em] text-sm font-bold">Inquire via WhatsApp</span>
            <IconArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </a>
          
          <p className="mt-12 text-black/30 text-sm max-w-lg mx-auto leading-relaxed">
            Generating a structured inquiry will help our representatives process your institutional request with maximum efficiency.
          </p>
        </div>
      </section>

      {/* Floating Mini Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 z-[200] hidden md:block"
      >
        <a
          href={generateMessage()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-[#25D366] text-white flex items-center justify-center shadow-2xl group transition-colors"
          style={{ borderRadius: "0px" }} // Hard corners as per DESIGN.md
        >
          <IconBrandWhatsapp className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </a>
      </motion.div>
    </>
  );
}
