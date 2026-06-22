"use client";

import { motion } from "motion/react";
import { IconSparkles } from "@tabler/icons-react";

export default function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#f2edc2]/60 backdrop-blur-md border border-white/20 mx-auto mb-3 w-fit"
    >
      <IconSparkles className="w-4 h-4 text-[#346739]/80" />
      <span className="text-[14px] font-normal text-[#346739]/90">
        Fluid Staking
      </span>
    </motion.div>
  );
}
