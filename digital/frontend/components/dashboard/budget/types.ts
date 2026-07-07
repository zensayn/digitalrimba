import type { PaymentStatus } from '@/lib/api/budget';

export const FIXED_CATEGORIES = [
  'Venue',
  'Catering',
  'Attire',
  'Decoration & Florist',
  'Photo & Video',
  'Entertainment & MC',
  'Others',
] as const;

export type BudgetTab = 'summary' | 'items' | 'payments';

export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  paid:    { label: 'Paid',    bg: 'bg-[#edfce9]', text: 'text-[#2d6a30]', dot: 'bg-[#346739]' },
  partial: { label: 'Partial', bg: 'bg-[#f1f5ff]', text: 'text-[#1863dc]', dot: 'bg-[#1863dc]' },
  unpaid:  { label: 'Unpaid',  bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
};

export const TABS: Array<{ id: BudgetTab; label: string }> = [
  { id: 'summary',  label: 'Summary' },
  { id: 'items',    label: 'Items' },
  { id: 'payments', label: 'Category Budget' },
];

/**
 * Single source of truth for a category's emoji + accent colour.
 * Used by Summary, Items and Category Budget so they never drift apart.
 * `accent` drives text/icon/bar colour; `soft` is the tinted chip background.
 * Applied via inline styles (Tailwind JIT can't see runtime-built classes).
 */
export const CATEGORY_META: Record<string, { emoji: string; accent: string; soft: string }> = {
  'Venue':                { emoji: '🏰', accent: '#346739', soft: '#edfce9' },
  'Catering':             { emoji: '🍽️', accent: '#ff7759', soft: '#fff1ed' },
  'Attire':               { emoji: '👔', accent: '#1863dc', soft: '#f1f5ff' },
  'Decoration & Florist': { emoji: '🌸', accent: '#9b60aa', soft: '#f7f0f9' },
  'Photo & Video':        { emoji: '📸', accent: '#75758a', soft: '#eeece7' },
  'Entertainment & MC':   { emoji: '🎵', accent: '#c98a0f', soft: '#fbf3df' },
  'Others':               { emoji: '✨', accent: '#616161', soft: '#f3f3f3' },
};

export function getCategoryMeta(name: string) {
  return CATEGORY_META[name] ?? { emoji: '✨', accent: '#616161', soft: '#f3f3f3' };
}

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000)     return `Rp ${(value / 1_000_000).toFixed(0)}jt`;
  if (value >= 1_000)         return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value.toFixed(0)}`;
}

export function formatRupiahFull(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Due-date urgency for an unpaid item. `overdue` = past due, `soon` = within 14
 * days. Fully-paid items are never flagged. Days compared at date granularity.
 */
export function dueDateStatus(
  dueDate: string | null | undefined,
  paymentStatus: PaymentStatus,
): 'overdue' | 'soon' | null {
  if (!dueDate || paymentStatus === 'paid') return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return 'overdue';
  if (days <= 14) return 'soon';
  return null;
}

export function mergeWithFixed(
  apiCategories: { name: string; budgeted: number; actual: number; overspend: boolean }[]
) {
  const byName = new Map(apiCategories.map(c => [c.name, c]));
  const fixedNames = new Set(FIXED_CATEGORIES as unknown as string[]);
  const merged = FIXED_CATEGORIES.map(
    name => byName.get(name) ?? { name, budgeted: 0, actual: 0, overspend: false }
  );
  const orphans = apiCategories.filter(c => !fixedNames.has(c.name));
  return [...merged, ...orphans];
}
