"use client";

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Inline spent→budget progress bar. Fills green on track, coral when over budget.
 * Transitions `width` only; respects reduced motion.
 */
export function ProgressBar({
  value,
  budget,
  className,
}: {
  value: number;
  budget: number;
  className?: string;
}) {
  const over = budget > 0 && value > budget;
  const pct = budget > 0 ? Math.min((value / budget) * 100, 100) : 0;
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-[#eeece7] overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${pct}%`, backgroundColor: over ? '#ff7759' : '#346739' }}
      />
    </div>
  );
}

/**
 * Semicircle gauge built from two SVG arcs. No chart lib. `pct` is 0–100 of
 * budget consumed; turns coral once `over`. Center label is passed as children.
 */
export function ArcGauge({
  pct,
  over = false,
  children,
}: {
  pct: number;
  over?: boolean;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(pct, 100));
  const arcLen = Math.PI * 80; // radius 80 semicircle ≈ 251.3
  const dash = (clamped / 100) * arcLen;
  const path = 'M 20 100 A 80 80 0 0 1 180 100';

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <svg viewBox="0 0 200 108" className="w-full" aria-hidden>
        <path d={path} fill="none" stroke="#eeece7" strokeWidth={14} strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke={over ? '#ff7759' : '#346739'}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${arcLen}`}
          className="transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5 text-center">
        {children}
      </div>
    </div>
  );
}
