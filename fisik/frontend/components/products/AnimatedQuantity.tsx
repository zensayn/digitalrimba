"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

// Per-digit roll, mirrored from components/ui/stepper.tsx but tuned smaller and
// snappier to fit the compact quantity pill instead of the big stepper control.
const digitVariants = {
  initial: (dir: number) => ({
    y: dir > 0 ? 12 : -12,
    opacity: 0,
    filter: "blur(1.5px)",
  }),
  animate: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -12 : 12,
    opacity: 0,
    filter: "blur(1.5px)",
  }),
};

export interface AnimatedQuantityProps {
  /** Committed numeric value — drives the roll direction. */
  value: number;
  /** Editable string buffer (lets the field be cleared / typed into freely). */
  text: string;
  onTextChange: (raw: string) => void;
  onBlur: () => void;
  ariaLabel: string;
}

/**
 * Editable quantity field that rolls each digit like the Stepper. The animated
 * digits are the visible layer; a transparent <input> sits on top so the user
 * can still clear the field and type bulk amounts directly.
 */
export function AnimatedQuantity({
  value,
  text,
  onTextChange,
  onBlur,
  ariaLabel,
}: AnimatedQuantityProps) {
  const [direction, setDirection] = React.useState(0);
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      setDirection(value > prevValueRef.current ? 1 : -1);
      prevValueRef.current = value;
    }
  }, [value]);

  const digits = text.split("");

  // Per-digit "tick" tracking: a digit only re-mounts (and thus animates) when
  // it actually changes, and stays put when only a neighbour changed. Aligned
  // from the right so widening 9 -> 10 animates the new leading digit only.
  const digitTicksRef = React.useRef<number[]>([]);
  const prevDigitsRef = React.useRef<string[]>([]);

  const prevDigits = prevDigitsRef.current;
  const prevTicks = digitTicksRef.current;

  const len = digits.length;
  const lenDiff = len - prevDigits.length;

  const nextTicks = digits.map((digit, i) => {
    const prevI = i - lenDiff;
    const prevDigit = prevI >= 0 ? prevDigits[prevI] : undefined;
    const prevTick = prevI >= 0 ? prevTicks[prevI] : 0;
    return digit !== prevDigit ? (prevTick ?? 0) + 1 : prevTick ?? 0;
  });

  React.useEffect(() => {
    digitTicksRef.current = nextTicks;
    prevDigitsRef.current = digits;
  });

  return (
    <div
      className="relative h-9 flex items-center"
      style={{ width: `${Math.max(3, text.length + 1)}ch` }}
    >
      {/* Animated digit layer (visual only) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden font-poppins text-sm font-medium tabular-nums text-[#212121]">
        {digits.map((digit, index) => (
          <div key={`${index}-${len}`} className="relative h-5 w-[1ch]">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.span
                key={nextTicks[index]}
                custom={direction}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 26,
                  mass: 0.7,
                }}
                className="absolute inset-0 flex items-center justify-center tabular-nums"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Transparent editable layer (text hidden, caret visible) */}
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onBlur}
        className="relative z-10 h-9 w-full bg-transparent px-1 text-center font-poppins text-sm font-medium tabular-nums text-transparent caret-[#212121] outline-none"
      />
    </div>
  );
}
