"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { TextureButton } from '@/components/ui/texture-button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AltArrowDown } from '@solar-icons/react';
import { cn } from '@/lib/utils';
import type { BudgetItem, CreateBudgetItemInput, UpdateBudgetItemInput, PaymentStatus } from '@/lib/api/budget';
import { FIXED_CATEGORIES, STATUS_CONFIG } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  item?: BudgetItem | null;
  onSave: (data: CreateBudgetItemInput | UpdateBudgetItemInput) => Promise<void>;
  isSaving?: boolean;
};

const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'partial', 'paid'];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

function BudgetItemForm({
  item,
  onSave,
  onClose,
  isSaving,
}: {
  item?: BudgetItem | null;
  onSave: Props['onSave'];
  onClose: () => void;
  isSaving?: boolean;
}) {
  const isEdit = !!item;
  const [category, setCategory] = useState(item?.category ?? FIXED_CATEGORIES[0]);
  const [itemName, setItemName] = useState(item?.item_name ?? '');
  const [vendor, setVendor] = useState(item?.vendor ?? '');
  const [estimated, setEstimated] = useState(item?.estimated_amount?.toString() ?? '');
  const [actual, setActual] = useState(item?.actual_amount?.toString() ?? '');
  const [dueDate, setDueDate] = useState(item?.due_date ?? '');
  const [status, setStatus] = useState<PaymentStatus>(item?.payment_status ?? 'unpaid');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim()) { setError('Item name is required.'); return; }
    if (!estimated || isNaN(Number(estimated)) || Number(estimated) < 0) {
      setError('Budgeted amount must be a non-negative number.'); return;
    }
    setError('');
    const data: CreateBudgetItemInput = {
      category,
      item_name: itemName.trim(),
      vendor: vendor.trim() || undefined,
      estimated_amount: Number(estimated),
      actual_amount: Number(actual) || 0,
      paid: status === 'paid',
      payment_status: status,
      due_date: dueDate || null,
    };
    await onSave(data);
  }

  const labelCls = 'text-[11px] font-bold uppercase text-[#93939f] mb-1 block';
  const inputCls = 'h-10 rounded-[12px] border-[#e5e7eb] text-[13px]';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
      <div>
        <label className={labelCls}>Category</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="w-full h-10 px-3 rounded-[12px] border border-[#e5e7eb] bg-white text-[13px] text-left flex items-center justify-between hover:bg-neutral-50 transition-colors">
              {category}
              <AltArrowDown size={14} className="text-neutral-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl ring-1 ring-black/5">
            {FIXED_CATEGORIES.map(c => (
              <DropdownMenuItem key={c} onSelect={() => setCategory(c)} className="text-[13px]">
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <label className={labelCls}>Item name</label>
        <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Venue deposit" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Vendor <span className="text-neutral-300 normal-case font-normal">(optional)</span></label>
        <Input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Grand Ballroom" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Budgeted (Rp)</label>
          <Input type="number" min="0" value={estimated} onChange={e => setEstimated(e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Actual (Rp)</label>
          <Input type="number" min="0" value={actual} onChange={e => setActual(e.target.value)} placeholder="0" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Due date <span className="text-neutral-300 normal-case font-normal">(optional)</span></label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full h-10">
            {PAYMENT_STATUSES.map(s => {
              const active = status === s;
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'relative flex-1 text-[11px] font-semibold rounded-full py-1 transition-colors z-10',
                    active ? cfg.text : 'text-neutral-400 hover:text-neutral-700'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="modal-status-pill"
                      className={cn('absolute inset-0 rounded-full', cfg.bg)}
                      transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
                    />
                  )}
                  <span className="relative z-10">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="text-[12px] text-[#b30000]">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <TextureButton type="button" variant="outline" size="sm" className="rounded-full px-5 h-10 text-[13px]" onClick={onClose}>
          Cancel
        </TextureButton>
        <TextureButton type="submit" variant="primary" size="sm" className="rounded-full px-5 h-10 text-[13px]" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
        </TextureButton>
      </div>
    </form>
  );
}

export function BudgetItemModal({ open, onClose, item, onSave, isSaving }: Props) {
  const isMobile = useIsMobile();
  const title = item ? 'Edit item' : 'Add budget item';

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={v => !v && onClose()}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-[17px] font-bold text-bold">{title}</DrawerTitle>
          </DrawerHeader>
          <BudgetItemForm item={item} onSave={onSave} onClose={onClose} isSaving={isSaving} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      {/* Remove Radix zoom-in keyframe; use Framer spring instead */}
      <DialogContent className="max-w-md rounded-[22px] p-0 !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
          className="p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-bold">{title}</DialogTitle>
          </DialogHeader>
          <BudgetItemForm item={item} onSave={onSave} onClose={onClose} isSaving={isSaving} />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
