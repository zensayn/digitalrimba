"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { FaPen } from "react-icons/fa6";
import { MdDraw } from "react-icons/md";
import { FaCheckCircle, FaRedo } from "react-icons/fa";
import { useTheme } from "next-themes";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

// Inline close icon (no icon-library dependency)
function X({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

interface DrawSignatureComponentProps {
  startLabel?: string;
  finishLabel?: string;
  doneLabel?: string;
  defaultStep?: "idle" | "drawing" | "done";
  onFinish?: (canvas: HTMLCanvasElement | null) => void;
  onClear?: () => void;
  onStepChange?: (step: "idle" | "drawing" | "done") => void;
}

export const DrawSignatureComponent: React.FC<DrawSignatureComponentProps> = ({
  startLabel = "Start Signing",
  finishLabel = "Finish Signing",
  doneLabel = "Signing Done",
  defaultStep = "idle",
  onFinish,
  onClear,
  onStepChange,
}) => {
  const [step, setStep] = useState<"idle" | "drawing" | "done">(defaultStep);
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    if (step === "drawing" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Always draw with dark/black ink on the white canvas theme
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (savedSignature) {
        const img = new Image();
        img.src = savedSignature;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  }, [step, savedSignature]);

  if (!mounted) return null;

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setSavedSignature(null);
    onClear?.();
  };

  const finishSigning = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setSavedSignature(dataUrl);
    }

    setStep("done");
    onFinish?.(canvasRef.current);
  };

  return (
    <MotionConfig
      transition={{
        type: "spring",
        bounce: 0.15,
        duration: 0.7,
      }}
    >
      <motion.div
        animate={{
          width: bounds.width > 0 ? bounds.width : "auto",
          height: bounds.height > 0 ? bounds.height : "auto",
        }}
        className={cn(
          "relative z-10 flex items-center justify-center overflow-hidden border-2 border-dashed border-transparent transition-colors duration-400 ease-out",
          step === "drawing" && "border-neutral-200"
        )}
        style={{
          borderRadius: 20,
        }}
      >
        <div ref={ref} className="flex shrink-0 p-0.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {step === "idle" && (
              <motion.button
                key="start"
                layoutId="container-button"
                onClick={() => setStep("drawing")}
                className="flex items-center gap-1.5 rounded-full bg-white border border-[#e5e7eb] px-3 py-1.5 text-[10px] font-semibold text-neutral-800 hover:bg-neutral-50 shadow-sm"
              >
                <motion.div layoutId="container-button-icon">
                  <MdDraw size={12} className="text-neutral-600" />
                </motion.div>
                <motion.span layoutId="container-button-text">
                  {startLabel}
                </motion.span>
              </motion.button>
            )}

            {step === "drawing" && (
              <motion.div
                key="pad"
                exit={{
                  opacity: 0,
                  y: "-15%",
                  scale: 0.95,
                }}
                className="w-[210px] max-w-[210px] rounded-xl bg-white border border-[#e5e7eb] p-2.5 pb-2 will-change-transform shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <button
                    onClick={clearCanvas}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <FaRedo size={11} />
                  </button>

                  <span className="text-[10px] font-semibold text-neutral-500">
                    Sign Here
                  </span>

                  <button
                    onClick={() => setStep("idle")}
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>

                <canvas
                  ref={canvasRef}
                  width={188}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="h-[100px] w-full touch-none bg-neutral-50 rounded-lg border border-neutral-100"
                  style={{
                    cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>') 0 18, auto`,
                  }}
                />

                <motion.button
                  layoutId="container-button"
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={finishSigning}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-[#346739] hover:bg-[#254d2a] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition-colors"
                >
                  <motion.div layoutId="container-button-icon">
                    <MdDraw size={12} />
                  </motion.div>
                  <motion.span layoutId="container-button-text">
                    {finishLabel}
                  </motion.span>
                </motion.button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div
                key="done"
                exit={{ opacity: 0, transition: { duration: 0 } }}
                className="flex items-center gap-1.5"
                layoutId="container-button"
              >
                <motion.div className="flex items-center gap-1 rounded-full bg-[#edfce9] border border-[#346739]/15 px-3 py-1.5 text-[10px] font-semibold text-[#346739]">
                  <motion.div layoutId="container-button-icon">
                    <FaCheckCircle size={12} />
                  </motion.div>
                  <motion.span layoutId="container-button-text">
                    {doneLabel}
                  </motion.span>
                </motion.div>

                <motion.button
                  onClick={() => setStep("drawing")}
                  className="rounded-full bg-white border border-[#e5e7eb] p-1.5 text-neutral-700 hover:bg-neutral-50 shadow-sm transition-colors"
                >
                  <FaPen size={10} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
};
