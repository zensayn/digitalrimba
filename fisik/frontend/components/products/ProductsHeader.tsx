"use client";

// ─── ProductsHeader ────────────────────────────────────────────────────────────
// Animated editorial header for the /products listing. Extracted into a client
// component so the page itself can be an async Server Component that fetches the
// catalog from the API.

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;

export default function ProductsHeader() {
  const t = useTranslations("Templates");

  return (
    <header className="w-full max-w-[1200px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-4 text-center flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT_STRONG }}
            className="font-poppins font-medium text-[#212121] mt-3 whitespace-pre-line"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", lineHeight: 1.08, letterSpacing: "-0.02em" }}
      >
        {t("title")
          .split("\n")
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_STRONG }}
        className="font-poppins text-[#616161] mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.5 }}
      >
        {t("subtitle")}
      </motion.p>
    </header>
  );
}
