"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/contact";

// Ported from fisik/frontend — hides over the hero, appears after one viewport.

export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  const handleScroll = useCallback((y: number) => {
    const threshold = typeof window !== "undefined" ? window.innerHeight - 80 : 800;
    setVisible(y > threshold);
  }, []);

  useMotionValueEvent(scrollY, "change", handleScroll);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          key="floating-whatsapp"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-6 right-4 z-[9999] flex items-center justify-center w-17 h-17 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 active:scale-95 group border border-white/20 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          aria-label="Contact us on WhatsApp"
        >
          <WhatsAppIcon className="w-10 h-10 relative z-10" />

          {/* Elegant Frosted Glass Tooltip — shown on hover AND keyboard focus */}
          <span className="absolute right-19 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900/90 backdrop-blur-md text-white text-[11px] font-medium font-poppins rounded-xl shadow-lg border border-white/10 opacity-0 scale-95 translate-x-2 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:scale-100 group-focus-visible:translate-x-0 whitespace-nowrap">
            Hubungi Admin Rimba (WhatsApp)
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
