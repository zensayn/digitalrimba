"use client";

import { useId } from "react";
import { IconChevronUp } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

interface FilterSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: FilterSectionProps) {
  const headerId = useId();
  const panelId = useId();

  return (
    <div className="border-b border-[#f2f2f2] py-4 last:border-b-0">
      <button
        type="button"
        id={headerId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-sm font-poppins font-medium text-[#212121]">{title}</span>
        <IconChevronUp
          size={16}
          className="text-[#93939f] transition-transform duration-200 ease-out"
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(180deg)" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_STRONG }}
            style={{ overflow: "hidden" }}
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
