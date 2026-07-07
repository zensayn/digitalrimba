"use client";

import { m as motion } from "framer-motion";
import ParallaxScene from "@/components/shared/ParallaxScene";
import type { InvitationConfig } from "@/lib/config-types";

import { ASSET_BASE as BASE, hideOnError } from "@/lib/assets";
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const EASE = [0.22, 1, 0.36, 1] as const;

type Chapter = InvitationConfig["loveStory"][number];

// One story "page" — a centered composition whose pieces are choreographed to
// reveal as the chapter is reached: photo develops (clip + zoom settle), title
// is wiped in like ink left→right, caption rises, connector line grows.
function ChapterBlock({ chapter, index, isLast, isFirst }: { chapter: Chapter; index: number; isLast: boolean; isFirst: boolean }) {
  const roman = ROMAN[index] ?? String(index + 1);
  const vp = { once: true, margin: "-12%" } as const;

  // Florets framing each chapter so the tall section never feels empty. Four
  // pieces hugging the photo area, asset order rotated per chapter for variety;
  // ambient sway/float gives life, static position keeps it cheap. All sit
  // behind the content (zIndex -1 inside the block's own stacking context).
  const a = index % 2 === 0;
  const florets = [
    { src: a ? "SakuraFloretA" : "SakuraFloretB", op: 0.85, box: { top: "12%", left: "-3%", width: "32%" }, anim: "sway 7.5s ease-in-out infinite", delay: 0.3 },
    { src: a ? "SakuraLeafSprig" : "SakuraBudTwig", op: 0.8, box: { top: "40%", right: "-3%", width: "30%" }, flip: true, anim: "float 6.5s ease-in-out infinite", delay: 0.45 },
    { src: a ? "SakuraBudTwig" : "SakuraLeafSprig", op: 0.78, box: { bottom: "14%", left: "0%", width: "24%" }, flip: true, anim: "sway 8.5s ease-in-out infinite", delay: 0.6 },
    { src: a ? "SakuraFloretB" : "SakuraFloretA", op: 0.72, box: { top: "9%", right: "1%", width: "20%" }, anim: "float 7.5s ease-in-out infinite", delay: 0.55 },
  ];

  return (
    <div
      className="relative flex flex-col items-center text-center w-full"
      style={{ paddingTop: isFirst ? "clamp(2px, 0.6vh, 8px)" : "clamp(18px, 4vh, 36px)", paddingBottom: "clamp(18px, 4vh, 36px)", paddingInline: "clamp(28px, 9vw, 52px)", isolation: "isolate" }}
    >
      {/* Framing florets (decorative) */}
      {florets.map((f, fi) => (
        <motion.img
          key={fi}
          src={`${BASE}/${f.src}.webp`}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: f.op }}
          viewport={vp}
          transition={{ duration: 1.0, delay: f.delay }}
          style={{ position: "absolute", ...f.box, zIndex: -1, pointerEvents: "none", transform: f.flip ? "scaleX(-1)" : undefined, animation: f.anim }}
        />
      ))}

      {/* Chapter numeral + year */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.7, ease: EASE }}
        className="font-label relative z-10"
        style={{ fontSize: "11px", letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--gold)", textShadow: "0 1px 6px rgba(250,247,242,0.85)" }}
      >
        {roman}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={vp}
        transition={{ duration: 0.8, delay: 0.12 }}
        className="font-display"
        style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "13px", letterSpacing: "0.16em", marginTop: 3, marginBottom: "clamp(8px, 1.6vh, 12px)" }}
      >
        {chapter.year}
      </motion.p>

      {/* Photo — develop reveal (clip up + zoom settle) + painterly frame */}
      <div style={{ position: "relative", width: "clamp(260px, 85vw, 366px)", aspectRatio: "4/3", margin: "clamp(2px, 0.6vh, 5px) 0" }}>
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.07 }}
          whileInView={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 1.05, ease: EASE }}
          style={{ position: "absolute", top: "11%", left: "7%", right: "7%", bottom: "11%", overflow: "hidden", boxShadow: "var(--shadow-warm)" }}
        >
          <img
            src={chapter.image}
            alt={chapter.chapter}
            loading="lazy"
            decoding="async"
            onError={hideOnError}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(20%) contrast(1.05) brightness(0.97)", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(192,120,48,0.05)", pointerEvents: "none" }} />
        </motion.div>
        <motion.img
          src={`${BASE}/PhotoFrameLandscape.webp`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={hideOnError}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.9, delay: 0.4 }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }}
        />
      </div>

      {/* Title — ink wipe left→right */}
      <motion.h2
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.95, delay: 0.15, ease: EASE }}
        className="font-display"
        style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 400, fontStyle: "italic", color: "var(--text)", lineHeight: 1.06, marginTop: "clamp(2px, 0.8vh, 8px)", textShadow: "0 1px 10px rgba(250,247,242,0.7)" }}
      >
        {chapter.chapter}
      </motion.h2>

      {/* Ornamental divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.6, delay: 0.32 }}
        className="flex items-center justify-center gap-2"
        style={{ marginTop: "clamp(10px, 2vh, 14px)", marginBottom: "clamp(8px, 2vh, 12px)" }}
      >
        <div style={{ width: 30, height: 1, background: "linear-gradient(90deg, transparent, var(--gold))", opacity: 0.5 }} />
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", opacity: 0.6 }} />
        <div style={{ width: 30, height: 1, background: "linear-gradient(90deg, var(--gold), transparent)", opacity: 0.5 }} />
      </motion.div>

      {/* Caption — rises in */}
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.85, delay: 0.42, ease: "easeOut" }}
        className="font-display"
        style={{ color: "var(--text-muted)", fontSize: "clamp(13px, 3.4vw, 15px)", fontStyle: "italic", lineHeight: 1.9, maxWidth: "34ch", textShadow: "0 1px 6px rgba(250,247,242,0.6)" }}
      >
        &ldquo;{chapter.description}&rdquo;
      </motion.p>

      {/* Connector to the next chapter — grows downward */}
      {!isLast && (
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          style={{ width: 1, height: "clamp(20px, 4vh, 36px)", background: "linear-gradient(180deg, var(--gold) 0%, rgba(153,81,26,0) 100%)", transformOrigin: "top", opacity: 0.55, marginTop: "clamp(12px, 2.5vh, 20px)" }}
        />
      )}
    </div>
  );
}

export default function LoveStorySection({ loveStory }: { loveStory: InvitationConfig["loveStory"] }) {
  return (
    <section
      id="lovestory"
      className="snap-section"
      style={{ background: "transparent", justifyContent: "flex-start", minHeight: "auto", position: "relative" }}
    >
      {/* Couple's garland hangs over our top (old drape + top corners doubled
          up with it); our bottom corners overhang into Akad the same way. */}
      <ParallaxScene
        layers={[
          { src: `${BASE}/LoveStoryBg.webp`, depth: 0.03, zIndex: 0 },
          { src: `${BASE}/SakuraCornerL.webp`, depth: 0.11, opacity: 0.82, zIndex: 1, overhang: true, box: { bottom: "-2svh", left: "-6%", width: "40%" } },
          { src: `${BASE}/SakuraCornerR2.webp`, depth: 0.11, opacity: 0.82, zIndex: 1, overhang: true, box: { bottom: "-2svh", right: "-6%", width: "40%" } },
        ]}
      />
      <div className="paper-overlay" />

      {/* Italic watermark */}
      <div
        className="absolute font-display select-none pointer-events-none z-0"
        style={{ fontSize: "clamp(56px, 18vw, 100px)", fontWeight: 400, fontStyle: "italic", color: "rgba(192,120,48,0.025)", bottom: "6%", right: "-2%", letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap" }}
      >
        Kisah Kami
      </div>

      {/* Header */}
      <div className="w-full flex flex-col items-center text-center flex-shrink-0 z-10 px-8" style={{ paddingTop: "clamp(32px, 8vh, 64px)", paddingBottom: "clamp(6px, 1.5vh, 12px)", position: "relative", isolation: "isolate" }}>
        {/* Florets framing the header so the top of the section isn't flat */}
        <motion.img
          src={`${BASE}/SakuraFloretA.webp`}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.82 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.0, delay: 0.3 }}
          style={{ position: "absolute", top: "18%", left: "2%", width: "24%", zIndex: -1, pointerEvents: "none", animation: "sway 8s ease-in-out infinite" }}
        />
        <motion.img
          src={`${BASE}/SakuraLeafSprig.webp`}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.75 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.0, delay: 0.45 }}
          style={{ position: "absolute", top: "8%", right: "2%", width: "22%", zIndex: -1, pointerEvents: "none", transform: "scaleX(-1)", animation: "float 7s ease-in-out infinite" }}
        />
        <motion.p
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="font-label"
          style={{ fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--gold-dim)" }}
        >
          Kisah Kami
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="font-display"
          style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "clamp(12.5px, 3.1vw, 14px)", marginTop: 10, lineHeight: 1.65, maxWidth: "26ch" }}
        >
          Setiap momen, satu langkah lebih dekat menuju selamanya.
        </motion.p>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          className="copper-divider"
          style={{ marginTop: 14 }}
        />
      </div>

      {/* Chapters */}
      <div className="w-full z-10" style={{ paddingBottom: "clamp(36px, 8vh, 60px)" }}>
        {loveStory.map((chapter, i) => (
          <ChapterBlock key={i} chapter={chapter} index={i} isFirst={i === 0} isLast={i === loveStory.length - 1} />
        ))}
      </div>
    </section>
  );
}
