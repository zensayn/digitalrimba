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
  { id: 'payments', label: 'Payments' },
];

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
