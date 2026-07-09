"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  // Custom transition curve per Emil's design principles
  const easeDrawer = [0.32, 0.72, 0, 1] as const;

  return (
    <div className="w-full border-b border-[#d9d9dd] last:border-b-0">
      {/* Clickable Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-5 md:py-6 gap-6 cursor-pointer select-none outline-none group"
      >
        <span className="font-poppins text-base sm:text-lg md:text-xl font-medium text-[#212121] leading-snug transition-colors duration-200 group-hover:text-[#346739]">
          {question}
        </span>
        
        {/* Symmetrical Plus/Minus Morphing Button */}
        <div className="w-8 h-8 rounded-full bg-stone-100/80 flex items-center justify-center relative shrink-0 transition-all duration-300 group-hover:bg-stone-200/80 group-active:scale-95">
          {/* Horizontal line */}
          <div className="absolute w-3 h-[1.5px] bg-[#212121]" />
          {/* Vertical line - morphs to transparent and rotates on open */}
          <div 
            className={`absolute w-[1.5px] h-3 bg-[#212121] transition-all duration-300 ${
              isOpen ? "rotate-90 opacity-0 scale-75" : ""
            }`} 
          />
        </div>
      </button>

      {/* Accordion Sliding Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeDrawer }}
            className="overflow-hidden"
          >
            <div className="font-poppins text-sm sm:text-base text-[#616161] leading-relaxed font-light pb-5 pr-10 space-y-4">
              {answer.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const t = useTranslations("Faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    { question: t("q1"), answer: t("a1") },
    { question: t("q2"), answer: t("a2") },
    { question: t("q3"), answer: t("a3") },
    { question: t("q4"), answer: t("a4") },
    { question: t("q5"), answer: t("a5") },
    { question: t("q6"), answer: t("a6") },
    { question: t("q7"), answer: t("a7") },
    { question: t("q8"), answer: t("a8") },
    { question: t("q9"), answer: t("a9") },
    { question: t("q10"), answer: t("a10") },
    { question: t("q11"), answer: t("a11") },
    { question: t("q12"), answer: t("a12") },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#ffffff] py-20 md:py-24 px-6 md:px-10 flex justify-center">
      <div className="w-full max-w-[900px] flex flex-col">
        {/* Centered Heading Block */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <span className="text-md uppercase font-poppins font-regular text-[#346739] mb-3">
            {t("tagline")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[#212121] font-poppins mb-4 text-center">
            {t("title")}
          </h2>
          <p className="text-[#616161] font-poppins text-sm sm:text-base font-light max-w-[600px] text-center leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col w-full">
          {faqData.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
