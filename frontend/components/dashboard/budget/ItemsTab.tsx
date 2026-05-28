"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Table, TableBody, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TextureButton } from '@/components/ui/texture-button';
import {
  Magnifer, AddCircle, AltArrowDown,
  TrashBinMinimalistic, Pen,
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import type { BudgetItem, PaymentStatus } from '@/lib/api/budget';
import { FIXED_CATEGORIES, STATUS_CONFIG, EASE_OUT, formatRupiah } from './types';

const STATUS_FILTERS: Array<{ id: 'all' | PaymentStatus; label: string }> = [
  { id: 'all',     label: 'All' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid',    label: 'Paid' },
];

type Props = {
  items: BudgetItem[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
};

export function ItemsTab({ items, isLoading, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const filtered = useMemo(() => items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.item_name.toLowerCase().includes(q) || (item.vendor ?? '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || item.payment_status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [items, search, categoryFilter, statusFilter]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Magnifer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-full bg-white ring-1 ring-foreground/10 text-[13px]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 px-4 rounded-full bg-white border border-neutral-200 flex items-center gap-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                {categoryFilter === 'all' ? 'All categories' : categoryFilter}
                <AltArrowDown size={14} className="text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl ring-1 ring-black/5 max-h-64 overflow-y-auto">
              <DropdownMenuItem onSelect={() => setCategoryFilter('all')} className="text-[13px]">All categories</DropdownMenuItem>
              {FIXED_CATEGORIES.map(c => (
                <DropdownMenuItem key={c} onSelect={() => setCategoryFilter(c)} className="text-[13px]">{c}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full">
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
                      layoutId="items-status-pill"
                      className="absolute inset-0 bg-[#212121] rounded-full"
                      transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <TextureButton
          variant="primary"
          size="sm"
          className="h-10 rounded-full px-4 text-[13px] font-medium gap-1.5 flex-shrink-0"
          onClick={onAdd}
        >
          <AddCircle size={15} weight="BoldDuotone" />
          Add item
        </TextureButton>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <p className="text-[13px] text-neutral-400">
            {items.length === 0 ? 'No items yet. Add your first budget item.' : 'No items match your filters.'}
          </p>
          {items.length === 0 && (
            <TextureButton variant="outline" size="sm" className="rounded-full px-5 h-9 text-[13px]" onClick={onAdd}>
              <AddCircle size={14} weight="BoldDuotone" />
              Add item
            </TextureButton>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[800px] px-4 md:px-0">
            <Table>
              <TableHeader className="bg-transparent border-b border-neutral-100">
                <TableRow className="hover:bg-transparent border-neutral-100">
                  {['Item', 'Category', 'Vendor', 'Budgeted', 'Actual', 'Due date', 'Status', ''].map(h => (
                    <TableHead key={h} className="h-12 px-0 text-[13px] font-medium text-neutral-500">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((item, idx) => {
                    const statusCfg = STATUS_CONFIG[item.payment_status];
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: EASE_OUT, delay: idx * 0.02 }}
                        className="group border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                      >
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[14px] font-semibold text-bold">{item.item_name}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[12px] text-neutral-500">{item.category}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[12px] text-neutral-400">{item.vendor ?? '—'}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className="text-[13px] font-medium text-bold">{formatRupiah(item.estimated_amount)}</span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className={cn('text-[13px] font-medium', item.actual_amount > item.estimated_amount ? 'text-[#ff7759]' : 'text-bold')}>
                            {formatRupiah(item.actual_amount)}
                          </span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          {item.due_date
                            ? <span className="text-[12px] text-neutral-400">{new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            : <span className="text-[12px] text-neutral-300">—</span>
                          }
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium', statusCfg.bg, statusCfg.text)}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-0 py-4 align-middle">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-bold">
                                  <Pen size={15} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-foreground/10">
                                <DropdownMenuItem onSelect={() => onEdit(item)} className="text-[12px] font-semibold gap-2">
                                  <Pen size={13} className="text-neutral-400" weight="BoldDuotone" />
                                  Edit item
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => onDelete(item.id)}
                                  className="text-[12px] font-semibold text-red-500 focus:text-red-500 focus:bg-red-50 gap-2"
                                >
                                  <TrashBinMinimalistic size={13} className="text-red-500" weight="BoldDuotone" />
                                  Delete item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
