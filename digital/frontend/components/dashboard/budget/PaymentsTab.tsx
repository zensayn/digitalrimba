"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextureButton } from '@/components/ui/texture-button';
import { cn } from '@/lib/utils';
import type { BudgetItem, PaymentStatus } from '@/lib/api/budget';
import { STATUS_CONFIG, EASE_OUT, formatRupiah } from './types';

const STATUS_FILTERS: Array<{ id: 'all' | PaymentStatus; label: string }> = [
  { id: 'all',     label: 'All' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid',    label: 'Paid' },
];

type Props = {
  items: BudgetItem[];
  isLoading: boolean;
  onStatusChange: (id: string, status: PaymentStatus) => Promise<void>;
};

function groupByMonth(items: BudgetItem[]): Map<string, BudgetItem[]> {
  const groups = new Map<string, BudgetItem[]>();
  const today = new Date();

  const withDate = items
    .filter(i => i.due_date)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''));
  const noDate = items.filter(i => !i.due_date);

  for (const item of withDate) {
    const d = new Date(item.due_date!);
    const key = d.getFullYear() === today.getFullYear()
      ? d.toLocaleDateString('en-GB', { month: 'long' })
      : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  if (noDate.length > 0) groups.set('No due date', noDate);
  return groups;
}

function nextStatus(current: PaymentStatus): PaymentStatus {
  if (current === 'unpaid') return 'partial';
  if (current === 'partial') return 'paid';
  return 'unpaid';
}

export function PaymentsTab({ items, isLoading, onStatusChange }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = useMemo(
    () => statusFilter === 'all' ? items : items.filter(i => i.payment_status === statusFilter),
    [items, statusFilter],
  );

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <div>
      {/* Status pills */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full w-fit mb-7">
        {STATUS_FILTERS.map(f => {
          const isActive = statusFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                'relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors z-10',
                isActive ? 'text-white' : 'text-neutral-500 hover:text-bold',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="payments-status-pill"
                  className="absolute inset-0 bg-[#212121] rounded-full"
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[13px] text-neutral-400">
            {items.length === 0 ? 'No payment items yet.' : 'No items match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([month, monthItems]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase text-neutral-400">{month}</span>
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              <AnimatePresence mode="popLayout" initial={false}>
                {monthItems.map((item, idx) => {
                  const statusCfg = STATUS_CONFIG[item.payment_status];
                  const isOverdue = item.due_date
                    ? new Date(item.due_date) < today && item.payment_status !== 'paid'
                    : false;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18, ease: EASE_OUT, delay: idx * 0.02 }}
                      className="group flex items-center gap-4 py-3.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors -mx-4 px-4 md:mx-0 md:px-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-bold truncate">{item.item_name}</p>
                        <p className="text-[11px] text-neutral-400">
                          {item.category}{item.vendor ? ` · ${item.vendor}` : ''}
                        </p>
                      </div>

                      <span className="text-[13px] font-semibold text-bold flex-shrink-0">
                        {formatRupiah(item.estimated_amount)}
                      </span>

                      {item.due_date && (
                        <span className={cn(
                          'text-[12px] flex-shrink-0 w-16 text-right',
                          isOverdue ? 'text-[#ff7759] font-semibold' : 'text-neutral-400'
                        )}>
                          {new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium', statusCfg.bg, statusCfg.text)}>
                          {statusCfg.label}
                        </span>
                        <TextureButton
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-full px-3 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onStatusChange(item.id, nextStatus(item.payment_status))}
                        >
                          Mark {STATUS_CONFIG[nextStatus(item.payment_status)].label}
                        </TextureButton>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
