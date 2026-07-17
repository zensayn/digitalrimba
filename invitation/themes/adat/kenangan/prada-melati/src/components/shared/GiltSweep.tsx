"use client";

import {
  motion,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import type { CSSProperties } from "react";
import { hideOnError } from "@/lib/assets";

const SWEEP_ANGLE = 105; // deg, tetap (spec §5.1)

export interface GiltSweepProps {
  /** Aset emas transparan (webp alpha). */
  src: string;
  /** Progres scroll section, 0..1 (dari KelirScene). */
  progress: MotionValue<number>;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}

export default function GiltSweep({ src, progress, className, style, imgStyle }: GiltSweepProps) {
  const reduced = useReducedMotion() ?? false;
  // Sapuan menempuh -120% → 220% posisi horizontal gradien saat section
  // menyeberang viewport. Reduced-motion → beku di 45% agar emas tetap berkilat.
  const pos = useTransform(progress, [0, 1], ["-120% 50%", "220% 50%"]);

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        onError={hideOnError}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", ...imgStyle }}
      />
      <motion.div
        aria-hidden="true"
        className={reduced ? undefined : "gilt-idle"}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          background: `linear-gradient(${SWEEP_ANGLE}deg, transparent 38%, var(--gold-light) 50%, transparent 62%)`,
          backgroundSize: "280% 280%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: reduced ? "45% 50%" : pos,
          // Mask ke piksel emas: properti terpisah — `maskImage` shorthand tidak
          // menerima size/position, dan token itu membatalkan seluruh mask.
          maskImage: `url("${src}")`,
          maskSize: "contain",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          WebkitMaskImage: `url("${src}")`,
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
