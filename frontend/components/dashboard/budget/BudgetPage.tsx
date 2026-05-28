"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  fetchBudgetSummary, fetchBudgetItems,
  createBudgetItem, updateBudgetItem, deleteBudgetItem,
  type BudgetItem, type CreateBudgetItemInput, type UpdateBudgetItemInput, type PaymentStatus,
} from '@/lib/api/budget';
import {
  TABS, EASE_OUT, formatRupiah, formatRupiahFull,
  type BudgetTab,
} from './types';
import { SummaryTab } from './SummaryTab';
import { ItemsTab } from './ItemsTab';
import { PaymentsTab } from './PaymentsTab';
import { BudgetItemModal } from './BudgetItemModal';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export default function BudgetPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<BudgetTab>('summary');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const summaryQ = useQuery({ queryKey: ['budget', 'summary'], queryFn: fetchBudgetSummary });
  const itemsQ   = useQuery({ queryKey: ['budget', 'items'],   queryFn: fetchBudgetItems });

  const summary = summaryQ.data;
  const items   = itemsQ.data ?? [];

  const totalBudgeted  = summary?.total_budgeted ?? 0;
  const totalActual    = summary?.total_actual   ?? 0;
  const remaining      = totalBudgeted - totalActual;
  const paidAmount     = items.filter(i => i.payment_status === 'paid').reduce((s, i) => s + i.actual_amount, 0);
  const paidPct        = totalActual > 0 ? Math.round((paidAmount / totalActual) * 100) : 0;
  const overspendCount = (summary?.categories ?? []).filter(c => c.overspend).length;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['budget', 'summary'] });
    qc.invalidateQueries({ queryKey: ['budget', 'items'] });
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetItemInput) => createBudgetItem(data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditingItem(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetItemInput }) => updateBudgetItem(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditingItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      updateBudgetItem(id, { payment_status: status, paid: status === 'paid' }),
    onSuccess: invalidate,
  });

  function openAdd() { setEditingItem(null); setModalOpen(true); }
  function openEdit(item: BudgetItem) { setEditingItem(item); setModalOpen(true); }

  async function handleSave(data: CreateBudgetItemInput | UpdateBudgetItemInput) {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: data as UpdateBudgetItemInput });
    } else {
      await createMutation.mutateAsync(data as CreateBudgetItemInput);
    }
  }

  const metrics = [
    {
      label: 'TOTAL BUDGET',
      value: formatRupiah(totalBudgeted),
      sub: formatRupiahFull(totalBudgeted),
    },
    {
      label: 'SPENT',
      value: formatRupiah(totalActual),
      sub: `${totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0}% of budget`,
    },
    {
      label: 'REMAINING',
      value: formatRupiah(Math.abs(remaining)),
      sub: remaining < 0 ? 'over budget' : 'available',
      valueClass: remaining < 0 ? 'text-[#ff7759]' : undefined,
    },
    {
      label: 'PAID',
      value: `${paidPct}%`,
      sub: `${formatRupiah(paidAmount)} paid`,
    },
    {
      label: 'OVERSPEND',
      value: overspendCount,
      sub: overspendCount === 0 ? 'all clear' : `categor${overspendCount === 1 ? 'y' : 'ies'}`,
      valueClass: overspendCount > 0 ? 'text-[#ff7759]' : 'text-[#346739]',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-10">

        {/* ── METRICS STRIP ── */}
        <motion.div variants={sectionVariants} className="mb-7">
          <div className="grid grid-cols-2 md:grid-cols-5 border border-neutral-100 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            {metrics.map(m => (
              <div key={m.label} className="flex flex-col gap-1 px-5 py-4 md:py-5">
                <span className="text-[9px] font-bold uppercase text-neutral-400">{m.label}</span>
                <span className={cn('text-2xl md:text-3xl font-bold leading-none mt-1', m.valueClass ?? 'text-bold')}>
                  {m.value}
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5">{m.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TAB BAR ── */}
        <motion.div variants={sectionVariants} className="border-b border-neutral-200 mb-8">
          <div className="flex items-center gap-1">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative px-4 py-4 text-sm font-semibold transition-colors outline-hidden',
                    isActive ? 'text-[#346739]' : 'text-neutral-400 hover:text-neutral-600',
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="budget-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#346739] rounded-t-full"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <motion.div variants={sectionVariants}>
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <SummaryTab
                  categories={summary?.categories ?? []}
                  isLoading={summaryQ.isLoading}
                />
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <ItemsTab
                  items={items}
                  isLoading={itemsQ.isLoading}
                  onAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={id => deleteMutation.mutate(id)}
                />
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                <PaymentsTab
                  items={items}
                  isLoading={itemsQ.isLoading}
                  onStatusChange={(id, status) => statusMutation.mutateAsync({ id, status }).then(() => undefined)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="pb-16" />
      </div>

      {/* ── MODAL ── */}
      <BudgetItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        item={editingItem}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </motion.div>
  );
}
