"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { BudgetCategorySummary, BudgetItem, BudgetSummary } from '@/lib/api/budget';
import { formatRupiah, formatRupiahFull, mergeWithFixed, getCategoryMeta, parseDateOnly } from './types';
import { ArcGauge, ProgressBar } from './primitives';
import { AddCircle } from '@solar-icons/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts';

type Props = {
  categories: BudgetCategorySummary[];
  summary?: BudgetSummary;
  items?: BudgetItem[];
  isLoading: boolean;
  onAdd?: () => void;
};

export function SummaryTab({ categories, summary, items = [], isLoading, onAdd }: Props) {
  const totalBudgeted = summary?.total_budgeted ?? categories.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActual = summary?.total_actual ?? categories.reduce((sum, c) => sum + c.actual, 0);
  const remaining = totalBudgeted - totalActual;
  const over = remaining < 0;
  const utilizationPct = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  const merged = useMemo(() => mergeWithFixed(categories), [categories]);
  const overspendCategories = useMemo(() => merged.filter(c => c.overspend), [merged]);

  const topCategories = useMemo(
    () => merged.filter(c => c.actual > 0 || c.budgeted > 0).sort((a, b) => b.actual - a.actual).slice(0, 5),
    [merged],
  );

  const recentItems = useMemo(() => {
    return [...items]
      .sort((a, b) => {
        const da = a.due_date ? new Date(a.due_date).getTime() : 0;
        const db = b.due_date ? new Date(b.due_date).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);
  }, [items]);

  // Cumulative cash out over time (sorted by due date). paid_amount is the
  // canonical payment field — actual_amount is cost incurred, not money spent.
  const chartData = useMemo(() => {
    if (items.length === 0) return [];
    const sorted = [...items].sort((a, b) => {
      const da = a.due_date ? new Date(a.due_date).getTime() : 0;
      const db = b.due_date ? new Date(b.due_date).getTime() : 0;
      return da - db;
    });
    let running = 0;
    const pts = sorted.map(item => {
      running += item.paid_amount;
      return { name: item.item_name, spent: running };
    });
    pts.unshift({ name: '', spent: 0 });
    return pts;
  }, [items]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        <div className="h-[260px] rounded-[20px] bg-[#f4f4f2] animate-pulse" />
        <div className="lg:col-span-2 h-[260px] rounded-[20px] bg-[#f4f4f2] animate-pulse" />
        <div className="h-[220px] rounded-[20px] bg-[#f4f4f2] animate-pulse" />
        <div className="lg:col-span-2 h-[220px] rounded-[20px] bg-[#f4f4f2] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">

      {/* ── Hero gauge ── */}
      <div className="border border-[#eef0ef] rounded-[20px] bg-white p-6 flex flex-col">
        <span className="text-[11px] font-medium text-[#93939f] uppercase">Left to spend</span>
        <div className="flex-1 flex items-center justify-center py-2">
          <ArcGauge pct={utilizationPct} over={over}>
            <span className={cn('text-[26px] md:text-[30px] font-medium leading-none', over ? 'text-[#ff7759]' : 'text-bold')}>
              {formatRupiah(Math.abs(remaining))}
            </span>
            <span className="text-[12px] text-[#93939f] font-normal mt-1.5">
              {over ? 'over budget' : 'left to spend'}
            </span>
          </ArcGauge>
        </div>
        <div className="flex items-center justify-between text-[12px] border-t border-[#f2f2f2] pt-4">
          <span className="text-[#75758a]">
            <span className="font-medium text-bold">{formatRupiah(totalActual)}</span> spent
          </span>
          <span className="text-[#93939f]">of {formatRupiah(totalBudgeted)} · {utilizationPct.toFixed(0)}%</span>
        </div>
      </div>

      {/* ── Cumulative spend chart ── */}
      <div className="lg:col-span-2 border border-[#eef0ef] rounded-[20px] bg-white p-6 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#93939f] uppercase">Spending over time</span>
            <h2 className="text-2xl md:text-3xl font-medium text-bold mt-2 leading-none">{formatRupiahFull(totalActual)}</h2>
            <p className={cn('text-[12px] font-normal mt-1.5', over ? 'text-[#ff7759]' : 'text-[#346739]')}>
              {over ? `Over budget by ${formatRupiah(Math.abs(remaining))}` : `${formatRupiah(remaining)} still available`}
            </p>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#e5e7eb] hover:border-bold text-[12px] font-medium hover:bg-[#fafafa] active:scale-97 transition-all text-bold cursor-pointer shrink-0"
            >
              <AddCircle size={14} /> Add item
            </button>
          )}
        </div>

        <div className="mt-4 -mb-2">
          {chartData.length === 0 ? (
            <div className="h-[190px] flex flex-col items-center justify-center text-center border border-dashed border-[#eef0ef] rounded-xl">
              <p className="text-[13px] font-medium text-bold">No spending yet</p>
              <p className="text-[12px] text-[#93939f] font-normal mt-1 max-w-xs">Add items to see your spend build up over time.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="budgetChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#346739" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#346739" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f2" />
              <XAxis dataKey="name" hide />
              <YAxis
                tickFormatter={(v) => formatRupiah(v)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#93939f' }}
                width={70}
              />
              <ChartTooltip
                formatter={(value: any) => [formatRupiahFull(Number(value || 0)), 'Cumulative']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="spent" stroke="#346739" strokeWidth={2} fill="url(#budgetChartFill)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#346739' }} />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top categories ── */}
      <div className="border border-[#eef0ef] rounded-[20px] bg-white p-6">
        <span className="text-[11px] font-medium text-[#93939f] uppercase">Where your money goes</span>
        {topCategories.length === 0 ? (
          <p className="text-[12px] text-[#93939f] font-normal mt-4">Add items to see your top categories.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {topCategories.map(c => {
              const meta = getCategoryMeta(c.name);
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-[12px] mb-1.5">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-[13px]">{meta.emoji}</span>
                      <span className="font-medium text-bold truncate">{c.name}</span>
                    </span>
                    <span className={cn('font-medium shrink-0', c.overspend ? 'text-[#ff7759]' : 'text-[#75758a]')}>
                      {formatRupiah(c.actual)}
                    </span>
                  </div>
                  <ProgressBar value={c.actual} budget={c.budgeted} className="h-1" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent activity ── */}
      <div className="lg:col-span-2 border border-[#eef0ef] rounded-[20px] bg-white p-6">
        <span className="text-[11px] font-medium text-[#93939f] uppercase">Recent activity</span>
        {recentItems.length === 0 ? (
          <p className="text-[12px] text-[#93939f] font-normal mt-4">No expenses logged yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-[#f4f4f4]">
            {recentItems.map(item => {
              const meta = getCategoryMeta(item.category);
              return (
                <div key={item.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: meta.soft, color: meta.accent }}>
                      {meta.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-bold truncate">{item.item_name}</p>
                      <p className="text-[11px] text-[#93939f] font-normal mt-0.5">
                        {item.due_date ? parseDateOnly(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[13px] font-medium text-bold">{formatRupiah(item.actual_amount)}</span>
                    <span className={cn(
                      'size-1.5 rounded-full',
                      item.payment_status === 'paid' ? 'bg-[#346739]' : item.payment_status === 'partial' ? 'bg-[#1863dc]' : 'bg-[#d9d9dd]',
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Overspend alert (only when real) ── */}
      {overspendCategories.length > 0 && (
        <div className="lg:col-span-3 border border-[#ffad9b] bg-[#fff8f7] rounded-[20px] p-5">
          <span className="text-[11px] font-medium text-[#b30000] uppercase">Overspend alert</span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
            {overspendCategories.map(c => (
              <div key={c.name} className="flex justify-between items-center text-[12px] border-b border-[#ffad9b]/25 pb-2">
                <div className="min-w-0">
                  <p className="text-bold font-medium truncate">{c.name}</p>
                  <p className="text-[10px] text-[#93939f] font-normal mt-0.5">Budgeted {formatRupiah(c.budgeted)}</p>
                </div>
                <span className="text-[#b30000] font-medium shrink-0">+{formatRupiah(c.actual - c.budgeted)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
