"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  fetchBudgetSummary, fetchBudgetItems,
  createBudgetItem, updateBudgetItem, deleteBudgetItem,
  type BudgetItem, type CreateBudgetItemInput, type UpdateBudgetItemInput,
} from '@/lib/api/budget';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  TABS, EASE_OUT, formatRupiah, formatRupiahFull,
  type BudgetTab,
} from './types';
import { SummaryTab } from './SummaryTab';
import { ItemsTab } from './ItemsTab';
import { PaymentsTab } from './PaymentsTab';
import { BudgetItemModal } from './BudgetItemModal';
import { TextureButton } from '@/components/ui/texture-button';
import { AddCircle } from '@solar-icons/react';

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
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<BudgetItem | null>(null);

  const summaryQ = useQuery({ queryKey: ['budget', 'summary'], queryFn: fetchBudgetSummary });
  const itemsQ   = useQuery({ queryKey: ['budget', 'items'],   queryFn: fetchBudgetItems });

  const summary = summaryQ.data;
  const items   = itemsQ.data ?? [];

  const totalBudgeted  = summary?.total_budgeted ?? 0;
  const totalActual    = summary?.total_actual   ?? 0;
  const remaining      = totalBudgeted - totalActual;
  const paidAmount     = summary?.total_paid ?? 0;
  const paidPct        = totalActual > 0 ? Math.round((paidAmount / totalActual) * 100) : 0;
  const overspendCount = (summary?.categories ?? []).filter(c => c.overspend).length;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['budget', 'summary'] });
    qc.invalidateQueries({ queryKey: ['budget', 'items'] });
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetItemInput) => createBudgetItem(data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditingItem(null); setDefaultCategory(undefined); },
    onError: () => toast.error("Couldn't add that item. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetItemInput }) => updateBudgetItem(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditingItem(null); setDefaultCategory(undefined); },
    onError: () => toast.error("Couldn't save your changes. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    onSuccess: () => { invalidate(); toast.success('Item deleted.'); },
    onError: () => toast.error("Couldn't delete that item. Please try again."),
  });

  // paid_amount is canonical; the Category Budget tab cycles fully-paid ⇄ unpaid.
  // Partial payments are entered with an amount via the item modal.
  const paidMutation = useMutation({
    mutationFn: ({ id, paid_amount }: { id: string; paid_amount: number }) =>
      updateBudgetItem(id, { paid_amount }),
    onSuccess: invalidate,
    onError: () => toast.error("Couldn't update payment. Please try again."),
  });

  function openAdd(category?: string) { setEditingItem(null); setDefaultCategory(category); setModalOpen(true); }
  function openEdit(item: BudgetItem) { setEditingItem(item); setDefaultCategory(undefined); setModalOpen(true); }

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

        {/* ── PAGE HEADER ── */}
        <motion.div variants={sectionVariants} className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-medium text-bold leading-none">Wedding budget</h1>
            <p className="text-[13px] md:text-sm text-[#75758a] font-normal mt-2.5">
              Track every expense and stay on plan.
            </p>
          </div>
          <TextureButton
            variant="primary"
            size="sm"
            className="rounded-full px-5 h-10 text-[13px] shrink-0 gap-1.5"
            onClick={() => openAdd()}
          >
            <AddCircle size={16} /> Add item
          </TextureButton>
        </motion.div>

        {/* ── METRICS STRIP ── */}
        <motion.div variants={sectionVariants} className="mb-7">
          <div className="grid grid-cols-2 md:grid-cols-5 border-y border-neutral-100 divide-x divide-neutral-100">
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className={cn(
                  'flex flex-col gap-1 px-5 py-4 md:py-5',
                  // first cell carries no left rule; mobile second column keeps its divider
                  i === 0 && 'border-l-0',
                )}
              >
                <span className="text-[10px] font-medium uppercase text-[#93939f] leading-none">{m.label}</span>
                <span className={cn('text-2xl md:text-[28px] font-medium leading-none mt-2', m.valueClass ?? 'text-bold')}>
                  {m.value}
                </span>
                <span className="text-[11px] text-[#93939f] font-normal mt-1">{m.sub}</span>
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
                  summary={summary}
                  items={items}
                  isLoading={summaryQ.isLoading || itemsQ.isLoading}
                  onAdd={openAdd}
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
                  onDelete={setPendingDelete}
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
                  summary={summary}
                  isLoading={itemsQ.isLoading}
                  onTogglePaid={(id, paid_amount) => paidMutation.mutateAsync({ id, paid_amount }).then(() => undefined)}
                  onAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={setPendingDelete}
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
        onClose={() => { setModalOpen(false); setEditingItem(null); setDefaultCategory(undefined); }}
        item={editingItem}
        defaultCategory={defaultCategory}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Delete confirmation ── */}
      <Dialog open={!!pendingDelete} onOpenChange={v => !v && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-bold">Delete this item?</DialogTitle>
            <DialogDescription className="text-[13px] text-[#75758a]">
              {pendingDelete ? `“${pendingDelete.item_name}” will be removed from your budget. This can’t be undone.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <TextureButton
              type="button" variant="outline" size="sm"
              className="rounded-full px-5 h-10 text-[13px]"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </TextureButton>
            <TextureButton
              type="button" variant="destructive" size="sm"
              className="rounded-full px-5 h-10 text-[13px]"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete item'}
            </TextureButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
