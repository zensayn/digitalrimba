"use client";

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { BudgetCategorySummary } from '@/lib/api/budget';
import { EASE_OUT, formatRupiah, mergeWithFixed } from './types';

type Props = {
  categories: BudgetCategorySummary[];
  isLoading: boolean;
};

function CategoryRow({
  category,
  index,
}: {
  category: BudgetCategorySummary;
  index: number;
}) {
  const pct = category.budgeted > 0
    ? Math.min((category.actual / category.budgeted) * 100, 100)
    : 0;
  const overspend = category.overspend;
  const overspendAmt = category.actual - category.budgeted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT, delay: index * 0.06 }}
      className="py-4 border-b border-neutral-100 last:border-0"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-bold">{category.name}</span>
          {overspend && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff8f7] text-[#b30000]">
              +{formatRupiah(overspendAmt)}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={cn('text-[13px] font-semibold', overspend ? 'text-[#ff7759]' : 'text-bold')}>
            {formatRupiah(category.actual)}
          </span>
          <span className="text-[12px] text-neutral-400 ml-1">/ {formatRupiah(category.budgeted)}</span>
        </div>
      </div>

      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: index * 0.06 + 0.1 }}
          className={cn('h-full rounded-full', overspend ? 'bg-[#ff7759]' : 'bg-[#346739]')}
        />
      </div>
    </motion.div>
  );
}

export function SummaryTab({ categories, isLoading }: Props) {
  const merged = mergeWithFixed(categories);
  const overspendCategories = merged.filter(c => c.overspend);

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-4 border-b border-neutral-100">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div>
        {merged.map((cat, i) => (
          <CategoryRow key={cat.name} category={cat} index={i} />
        ))}
      </div>

      {overspendCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl border border-[#ffad9b] bg-[#fff8f7]"
        >
          <p className="text-[11px] font-bold uppercase text-[#b30000] mb-2">Over budget</p>
          <div className="space-y-1">
            {overspendCategories.map(c => (
              <div key={c.name} className="flex justify-between text-[13px]">
                <span className="text-[#212121] font-medium">{c.name}</span>
                <span className="text-[#b30000] font-semibold">+{formatRupiah(c.actual - c.budgeted)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {merged.every(c => c.budgeted === 0 && c.actual === 0) && (
        <div className="py-20 text-center">
          <p className="text-[13px] text-neutral-400">Add budget items to see your category breakdown.</p>
        </div>
      )}
    </div>
  );
}
