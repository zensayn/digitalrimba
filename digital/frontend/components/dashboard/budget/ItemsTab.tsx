"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Magnifer, AddCircle, TrashBinMinimalistic, Pen, CloseCircle, MenuDots,
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import type { BudgetItem, PaymentStatus } from '@/lib/api/budget';
import { FIXED_CATEGORIES, STATUS_CONFIG, EASE_OUT, formatRupiah, getCategoryMeta, dueDateStatus } from './types';

const STATUS_FILTERS: Array<{ id: 'all' | PaymentStatus; label: string }> = [
  { id: 'all',     label: 'All statuses' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid',    label: 'Paid' },
];

type SortKey = 'due' | 'amount' | 'status' | 'name';
const SORTS: Array<{ id: SortKey; label: string }> = [
  { id: 'due',    label: 'Due date' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
  { id: 'name',   label: 'Name' },
];
const STATUS_ORDER: Record<PaymentStatus, number> = { unpaid: 0, partial: 1, paid: 2 };

type Props = {
  items: BudgetItem[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
};

export function ItemsTab({ items, isLoading, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('due');

  const hasFilters = categoryFilter !== 'all' || statusFilter !== 'all' || !!search;

  const filtered = useMemo(() => {
    const rows = items.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !q || item.item_name.toLowerCase().includes(q) || (item.vendor ?? '').toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.payment_status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
    return rows.sort((a, b) => {
      switch (sortKey) {
        case 'amount': return b.actual_amount - a.actual_amount;
        case 'status': return STATUS_ORDER[a.payment_status] - STATUS_ORDER[b.payment_status];
        case 'name':   return a.item_name.localeCompare(b.item_name);
        default: // 'due' — soonest first, undated last
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
      }
    });
  }, [items, search, categoryFilter, statusFilter, sortKey]);

  const totalBudgeted = useMemo(() => filtered.reduce((s, i) => s + i.estimated_amount, 0), [filtered]);
  const totalActual = useMemo(() => filtered.reduce((s, i) => s + i.actual_amount, 0), [filtered]);

  function clearFilters() { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }

  const triggerCls = 'h-9 px-3.5 rounded-full border border-[#e5e7eb] text-[12px] font-medium text-[#616161] bg-white hover:bg-[#fafafa] active:scale-97 transition-all cursor-pointer flex items-center gap-1.5';

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Magnifer size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#93939f]" />
          <input
            type="text"
            placeholder="Search items or vendors"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 w-full pl-9 pr-9 rounded-full border border-[#e5e7eb] text-[13px] bg-white outline-hidden focus:border-[#346739] transition-colors font-poppins text-bold"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93939f] hover:text-[#212121] cursor-pointer"
            >
              <CloseCircle size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Category filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={triggerCls}>
                {categoryFilter === 'all' ? 'All categories' : categoryFilter}
                <svg className="size-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-black/5 max-h-64 overflow-y-auto">
              <DropdownMenuItem onSelect={() => setCategoryFilter('all')} className={cn('text-[12px] font-medium', categoryFilter === 'all' ? 'text-[#346739]' : 'text-[#212121]')}>
                All categories
              </DropdownMenuItem>
              {FIXED_CATEGORIES.map(c => (
                <DropdownMenuItem key={c} onSelect={() => setCategoryFilter(c)} className={cn('text-[12px] font-medium', categoryFilter === c ? 'text-[#346739]' : 'text-[#212121]')}>
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={triggerCls}>
                {STATUS_FILTERS.find(f => f.id === statusFilter)?.label ?? 'All statuses'}
                <svg className="size-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-black/5">
              {STATUS_FILTERS.map(f => (
                <DropdownMenuItem key={f.id} onSelect={() => setStatusFilter(f.id)} className={cn('text-[12px] font-medium', statusFilter === f.id ? 'text-[#346739]' : 'text-[#212121]')}>
                  {f.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={triggerCls}>
                Sort: {SORTS.find(s => s.id === sortKey)?.label}
                <svg className="size-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-black/5">
              {SORTS.map(s => (
                <DropdownMenuItem key={s.id} onSelect={() => setSortKey(s.id)} className={cn('text-[12px] font-medium', sortKey === s.id ? 'text-[#346739]' : 'text-[#212121]')}>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <button onClick={clearFilters} className="h-9 px-3 text-[12px] font-medium text-[#ff7759] hover:underline cursor-pointer">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Context line ── */}
      <div className="flex items-center gap-2 text-[12px] text-[#93939f] font-normal mb-3 px-1">
        <span className="text-bold font-medium">{filtered.length}</span>
        <span>{filtered.length === 1 ? 'item' : 'items'}</span>
        <span className="text-[#d9d9dd]">·</span>
        <span>
          <span className={cn('font-medium', totalActual > totalBudgeted ? 'text-[#ff7759]' : 'text-[#346739]')}>{formatRupiah(totalActual)}</span> spent of {formatRupiah(totalBudgeted)} budgeted
        </span>
      </div>

      {/* ── List ── */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-8 border-2 border-[#346739] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3 border border-dashed border-[#e5e7eb] rounded-[20px]">
          <p className="text-[14px] font-medium text-bold">
            {items.length === 0 ? 'No items yet' : 'Nothing matches those filters'}
          </p>
          <p className="text-[12px] text-[#93939f] font-normal max-w-xs">
            {items.length === 0
              ? 'Add your first expense to start tracking against your budget.'
              : 'Try clearing your search or filters to see everything.'}
          </p>
          {items.length === 0 ? (
            <button
              onClick={onAdd}
              className="mt-1 inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-[#d9d9dd] hover:border-bold text-[12px] font-medium hover:bg-[#fafafa] active:scale-97 transition-all text-bold cursor-pointer"
            >
              <AddCircle size={14} /> Add an item
            </button>
          ) : (
            <button onClick={clearFilters} className="mt-1 text-[12px] font-medium text-[#346739] hover:underline cursor-pointer">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-[#eef0ef] rounded-[20px] bg-white overflow-hidden">
          {/* Column header */}
          <div className="hidden md:flex items-center gap-4 px-5 py-2.5 border-b border-[#f2f2f2] text-[11px] font-medium text-[#93939f]">
            <span className="flex-1">Item</span>
            <span className="w-[160px]">Category</span>
            <span className="w-[120px]">Due date</span>
            <span className="w-[110px]">Status</span>
            <span className="w-[130px] text-right">Amount</span>
            <span className="w-7" />
          </div>

          <div className="divide-y divide-[#f4f4f4]">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((item, idx) => {
                const meta = getCategoryMeta(item.category);
                const statusCfg = STATUS_CONFIG[item.payment_status];
                const over = item.actual_amount > item.estimated_amount;
                const due = dueDateStatus(item.due_date, item.payment_status);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: EASE_OUT, delay: idx * 0.012 }}
                    onClick={() => onEdit(item)}
                    className="flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-[#fafafa] transition-colors cursor-pointer group"
                  >
                    {/* Item + vendor */}
                    <div className="min-w-0 flex-1 order-1">
                      <p className="text-[13px] font-medium text-bold truncate">{item.item_name}</p>
                      <p className="text-[11px] text-[#93939f] font-normal truncate mt-0.5">{item.vendor || 'No vendor'}</p>
                    </div>

                    {/* Category pill */}
                    <div className="w-[160px] order-3 md:order-2 shrink-0">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: meta.soft, color: meta.accent }}
                      >
                        <span className="text-[10px]">{meta.emoji}</span>
                        <span className="truncate max-w-[110px]">{item.category}</span>
                      </span>
                    </div>

                    {/* Due date */}
                    <div className="w-[120px] order-4 md:order-3 shrink-0">
                      <span className={cn(
                        'text-[12px] font-normal inline-flex items-center gap-1',
                        due === 'overdue' ? 'text-[#b30000] font-medium' : due === 'soon' ? 'text-[#c98a0f] font-medium' : 'text-[#75758a]',
                      )}>
                        {due && <span className={cn('size-1.5 rounded-full', due === 'overdue' ? 'bg-[#b30000]' : 'bg-[#c98a0f]')} />}
                        {item.due_date
                          ? new Date(item.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="w-[110px] order-5 md:order-4 shrink-0">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium', statusCfg.bg, statusCfg.text)}>
                        <span className={cn('size-1.5 rounded-full', statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="w-[130px] order-2 md:order-5 ml-auto md:ml-0 text-right shrink-0">
                      <p className={cn('text-[13px] font-medium', over ? 'text-[#ff7759]' : 'text-bold')}>
                        {formatRupiah(item.actual_amount)}
                      </p>
                      <p className="text-[10px] text-[#93939f] font-normal mt-0.5">of {formatRupiah(item.estimated_amount)}</p>
                    </div>

                    {/* Row menu */}
                    <div className="w-7 order-6 shrink-0" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-full text-neutral-300 hover:text-bold hover:bg-[#eeece7]/40 transition-all cursor-pointer active:scale-90 md:opacity-0 group-hover:opacity-100">
                            <MenuDots size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-foreground/10">
                          <DropdownMenuItem onSelect={() => onEdit(item)} className="text-[12px] font-medium gap-2">
                            <Pen size={13} className="text-[#93939f]" /> Edit item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onDelete(item)}
                            className="text-[12px] font-medium text-[#ff7759] focus:text-[#ff7759] focus:bg-[#ffad9b]/10 gap-2"
                          >
                            <TrashBinMinimalistic size={13} className="text-[#ff7759]" /> Delete item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
