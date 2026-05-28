"use client";

import { motion } from "motion/react";
import { IconArrowUpRight } from "@tabler/icons-react";

export default function BottomLeftCard() {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute bottom-28 right-4 left-auto md:left-6 md:right-auto md:bottom-6 lg:bottom-10 lg:left-10 p-3 md:p-4 lg:p-5 rounded-none bg-white/30 backdrop-blur-xl flex flex-col gap-2 lg:gap-3 min-w-[140px] md:min-w-[150px] lg:min-w-[180px] w-fit"
    >
      <div className="flex flex-col">
        <span className="text-2xl md:text-3xl font-normal text-[#346739]/90 tracking-tight">
          5.2K
        </span>
        <span className="text-[10px] md:text-[12px] font-normal text-[#346739]/60 uppercase ">
          Active Yielders
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center bg-white rounded-none pl-1.5 pr-5 py-1.5 gap-2 hover:bg-white/90 transition-colors self-start group"
      >
        <div className="bg-[#346739]/10 p-1 rounded-none flex items-center justify-center">
          <IconArrowUpRight className="w-4 h-4 text-[#346739]/90" />
        </div>
        <span className="text-[14px] font-normal text-[#346739]/90">
          Join Discord
        </span>
      </motion.button>
    </motion.div>
  );
}
