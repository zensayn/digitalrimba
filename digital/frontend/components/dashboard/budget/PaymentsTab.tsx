"use client";

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AltArrowDown, AddCircle, TrashBinMinimalistic, Pen, Pen2 } from '@solar-icons/react';
import { cn } from '@/lib/utils';
import { upsertCategoryBudget, type BudgetItem, type BudgetSummary } from '@/lib/api/budget';
import { FIXED_CATEGORIES, STATUS_CONFIG, EASE_OUT, formatRupiah, getCategoryMeta, parseDateOnly } from './types';
import { ProgressBar } from './primitives';

type Props = {
  items: BudgetItem[];
  summary?: BudgetSummary;
  isLoading: boolean;
  onTogglePaid: (id: string, paidAmount: number) => Promise<void>;
  onAdd: (category?: string) => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
};

export function PaymentsTab({ items, summary, isLoading, onTogglePaid, onAdd, onEdit, onDelete }: Props) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = useState('');
  const cancelingRef = useRef(false);

  const toggleExpand = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const budgetMutation = useMutation({
    mutationFn: ({ category, planned }: { category: string; planned: number }) =>
      upsertCategoryBudget(category, planned),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget', 'summary'] }),
    onError: () => toast.error("Couldn't save the category budget. Please try again."),
  });

  function saveBudget(category: string) {
    const planned = Math.max(0, Number(budgetDraft) || 0);
    budgetMutation.mutate({ category, planned });
    setEditingBudget(null);
  }

  function cancelEditingBudget() {
    cancelingRef.current = true;
    setEditingBudget(null);
  }

  function startEditingBudget(name: string, draft: string) {
    cancelingRef.current = false;
    setEditingBudget(name);
    setBudgetDraft(draft);
  }

  // Planned (top-down) budget per category from the summary; 0 when unset.
  const plannedByName = useMemo(() => {
    const m = new Map<string, number>();
    (summary?.categories ?? []).forEach(c => m.set(c.name, c.planned));
    return m;
  }, [summary]);

  // Group items by category, keeping all fixed categories visible.
  const categoriesData = useMemo(() => {
    const map = new Map<string, { items: BudgetItem[]; estimated: number; actual: number }>();
    FIXED_CATEGORIES.forEach(cat => map.set(cat, { items: [], estimated: 0, actual: 0 }));

    items.forEach(item => {
      const existing = map.get(item.category) ?? { items: [], estimated: 0, actual: 0 };
      existing.items.push(item);
      existing.estimated += item.estimated_amount;
      existing.actual += item.actual_amount;
      map.set(item.category, existing);
    });

    return Array.from(map.entries()).map(([name, data]) => {
      const sortedItems = [...data.items].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
      // Top-down planned budget wins; fall back to the sum of item estimates.
      const planned = plannedByName.get(name) ?? 0;
      const budgeted = planned > 0 ? planned : data.estimated;
      const utilization = budgeted > 0 ? (data.actual / budgeted) * 100 : 0;
      const over = data.actual > budgeted;
      const allPaid = data.items.length > 0 && data.items.every(i => i.payment_status === 'paid');
      return { name, items: sortedItems, budgeted, planned, actual: data.actual, utilization, over, allPaid };
    });
  }, [items, plannedByName]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin size-8 border-2 border-[#346739] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-1.5 mb-5">
        <h2 className="text-xl font-medium text-bold">Budget by category</h2>
        <p className="text-[13px] text-[#75758a] font-normal leading-relaxed">
          See where every category stands and mark items as you pay them off.
        </p>
      </div>

      {/* Single editorial card, categories separated by hairlines */}
      <div className="border border-[#eef0ef] rounded-[20px] bg-white divide-y divide-[#f2f2f2] overflow-hidden">
        {categoriesData.map((cat) => {
          const isExpanded = !!expanded[cat.name];
          const meta = getCategoryMeta(cat.name);
          const hasItems = cat.items.length > 0;
          const available = cat.budgeted - cat.actual;

          return (
            <div key={cat.name}>
              {/* ── Category row ── */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggleExpand(cat.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(cat.name);
                  }
                }}
                className="px-4 md:px-5 py-4 flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 cursor-pointer hover:bg-[#fafafa] transition-colors"
              >
                {/* Emoji + name */}
                <div className="flex items-center gap-3 w-[150px] md:w-[200px] shrink-0">
                  <div
                    className="size-9 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: meta.soft, color: meta.accent }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-medium text-bold truncate">{cat.name}</h3>
                    <p className="text-[11px] text-[#93939f] font-normal mt-0.5">
                      {cat.items.length} {cat.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Inline progress + editable planned budget — wraps to its own
                    full-width line on mobile instead of disappearing */}
                <div className="w-full sm:w-auto sm:flex-1 min-w-0 order-last sm:order-none" onClick={e => e.stopPropagation()}>
                  {editingBudget === cat.name ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#93939f] font-medium shrink-0">Budget Rp</span>
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={budgetDraft}
                        onChange={e => setBudgetDraft(e.target.value)}
                        onBlur={() => {
                          if (cancelingRef.current) {
                            cancelingRef.current = false;
                            return;
                          }
                          saveBudget(cat.name);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveBudget(cat.name);
                          if (e.key === 'Escape') cancelEditingBudget();
                        }}
                        className="h-8 w-32 px-2.5 rounded-lg border border-[#346739] text-[12px] bg-white outline-hidden"
                        placeholder="0"
                      />
                    </div>
                  ) : cat.budgeted > 0 ? (
                    <div className="space-y-1.5">
                      <ProgressBar value={cat.actual} budget={cat.budgeted} />
                      <div className="flex justify-between items-center text-[11px] font-normal leading-none">
                        <span className="text-[#75758a] inline-flex items-center gap-1.5">
                          {formatRupiah(cat.actual)} <span className="text-[#c4c4cc]">of</span> {formatRupiah(cat.budgeted)}
                          <button
                            type="button"
                            onClick={() => startEditingBudget(cat.name, cat.planned ? String(cat.planned) : '')}
                            className="text-[#c4c4cc] hover:text-[#346739] transition-colors cursor-pointer"
                            title="Set category budget"
                          >
                            <Pen2 size={12} />
                          </button>
                          {cat.planned > 0 && <span className="text-[#c4c4cc]">· target set</span>}
                        </span>
                        {cat.over ? (
                          <span className="text-[#ff7759] font-medium">over by {formatRupiah(Math.abs(available))}</span>
                        ) : cat.allPaid ? (
                          <span className="text-[#346739] font-medium">fully paid</span>
                        ) : (
                          <span className="text-[#93939f]">{formatRupiah(available)} left</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditingBudget(cat.name, '')}
                      className="text-[11px] text-[#93939f] hover:text-[#346739] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Pen2 size={12} /> Set a budget
                    </button>
                  )}
                </div>

                {/* Add + chevron */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAdd(cat.name); }}
                    className="size-8 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#75758a] hover:text-bold hover:bg-[#fafafa] active:scale-90 transition-all cursor-pointer"
                    title={`Add to ${cat.name}`}
                  >
                    <AddCircle size={15} />
                  </button>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="text-[#93939f] px-1"
                  >
                    <AltArrowDown size={16} />
                  </motion.div>
                </div>
              </div>

              {/* ── Expanded items ── */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: EASE_OUT }}
                    className="bg-[#fafafa] overflow-hidden"
                  >
                    <div className="px-4 md:px-5 py-4">
                      {!hasItems ? (
                        <div className="text-center py-7 border border-dashed border-[#e5e7eb] rounded-xl bg-white">
                          <p className="text-[12px] text-[#93939f] font-normal mb-3">No items in this category yet.</p>
                          <button
                            type="button"
                            onClick={() => onAdd(cat.name)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#d9d9dd] hover:border-bold text-[12px] font-medium hover:bg-[#fafafa] active:scale-97 transition-all text-bold cursor-pointer"
                          >
                            <AddCircle size={14} /> Add the first item
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[#eef0ef] bg-white divide-y divide-[#f4f4f4] overflow-hidden">
                          {cat.items.map((item) => {
                            const statusCfg = STATUS_CONFIG[item.payment_status];
                            const itemOver = item.actual_amount > item.estimated_amount;
                            return (
                              <div key={item.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors">
                                {/* Name + vendor + due */}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-medium text-bold truncate">{item.item_name}</p>
                                  <p className="text-[11px] text-[#93939f] font-normal mt-0.5 truncate">
                                    {item.vendor || 'No vendor'}
                                    {item.due_date && (
                                      <> · {parseDateOnly(item.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</>
                                    )}
                                  </p>
                                </div>

                                {/* Amounts */}
                                <div className="text-right shrink-0 w-[110px]">
                                  <p className={cn('text-[13px] font-medium', itemOver ? 'text-[#ff7759]' : 'text-bold')}>
                                    {formatRupiah(item.actual_amount)}
                                  </p>
                                  <p className="text-[10px] text-[#93939f] font-normal mt-0.5">
                                    of {formatRupiah(item.estimated_amount)}
                                  </p>
                                </div>

                                {/* Paid toggle: fully paid ⇄ unpaid (partial is set in the item modal) */}
                                <button
                                  type="button"
                                  onClick={() => onTogglePaid(item.id, item.payment_status === 'paid' ? 0 : item.actual_amount)}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 active:scale-95 transition-all cursor-pointer hover:brightness-95',
                                    statusCfg.bg, statusCfg.text,
                                  )}
                                  title={item.payment_status === 'paid' ? 'Mark as unpaid' : 'Mark as fully paid'}
                                >
                                  <span className={cn('size-1.5 rounded-full', statusCfg.dot)} />
                                  {statusCfg.label}
                                </button>

                                {/* Edit / delete */}
                                <div className="flex items-center gap-1 shrink-0 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="size-7 rounded-full hover:bg-[#eeece7]/60 flex items-center justify-center text-[#75758a] hover:text-bold transition-colors cursor-pointer"
                                    title="Edit item"
                                  >
                                    <Pen size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDelete(item)}
                                    className="size-7 rounded-full hover:bg-[#fff8f7] flex items-center justify-center text-[#93939f] hover:text-[#b30000] transition-colors cursor-pointer"
                                    title="Delete item"
                                  >
                                    <TrashBinMinimalistic size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
