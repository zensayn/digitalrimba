'use client'

import {
  Widget,
  MoneyBag,
  Wallet,
} from '@solar-icons/react'
import { motion } from 'motion/react'
import { Label, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { DashboardBudgetSummary } from '@/lib/api/dashboard'

const BudgetMetrics = ({ data }: { data: DashboardBudgetSummary }) => {
  const utilization = Math.max(0, Math.min(100, data.utilization))
  const nextPayment = data.next_payment
  const nextPaymentValue = nextPayment ? formatRupiah(nextPayment.amount) : 'No upcoming'
  const nextPaymentDue = nextPayment ? formatDueIn(nextPayment.due_in) : 'All clear'
  
  const revenueChartData = [
    { name: 'Spent', value: data.total > 0 ? data.spent : 0, fill: '#1863dc' },
    { name: 'Remaining', value: data.total > 0 ? data.remaining : 1, fill: '#f2f2f2' }
  ]

  const revenueChartConfig = {
    value: {
      label: 'Amount'
    },
    Spent: {
      label: 'Spent',
      color: '#1863dc'
    },
    Remaining: {
      label: 'Remaining',
      color: '#f2f2f2'
    }
  } satisfies ChartConfig

  const MetricsData = [
    {
      icons: <Widget className='size-5' />,
      title: 'Payment Trend',
      value: data.overspend ? 'Overspent' : 'On Track'
    },
    {
      icons: <MoneyBag className='size-5' />,
      title: 'Next Payment',
      value: nextPaymentValue
    },
    {
      icons: <Wallet className='size-5' />,
      title: 'Paid Total',
      value: formatRupiah(data.paid)
    },
    {
      icons: <Widget className='size-5' />,
      title: 'Remaining',
      value: formatRupiah(data.remaining)
    }
  ]

  return (
    <Card className="border-[#f2f2f2] shadow-none overflow-hidden">
      <CardHeader className="pb-2 px-4 md:px-6">
        <CardTitle className="text-base md:text-lg font-semibold tracking-tight">Financial Pulse</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 pt-4 px-4 md:px-6 pb-6'>
        {/* TOP: SUMMARY & CHART */}
        <div className='flex items-center justify-between gap-4 md:gap-6'>
          <div className='space-y-1'>
            <p className='text-[10px] font-semibold uppercase text-[#93939f]'>Total Spent</p>
            <p className='text-2xl md:text-3xl font-bold text-black tracking-tighter'>{formatRupiah(data.spent)}</p>
            <p className='text-[10px] md:text-[11px] text-[#75758a]'>of {formatRupiah(data.total)} budget</p>
          </div>
          
          <div className='shrink-0'>
            <ChartContainer config={revenueChartConfig} className='h-28 w-28'>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={revenueChartData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className='fill-black text-lg md:text-xl font-bold'
                            >
                              {utilization}%
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </div>

        {/* MIDDLE: CLEAN METRICS GRID */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 py-6 border-y border-[#f2f2f2]'>
          {MetricsData.map((metric, index) => (
            <div key={index} className='flex items-center gap-3 group'>
              <div className='size-9 rounded-xl bg-[#fafafa] border border-[#f2f2f2] flex items-center justify-center text-[#93939f] group-hover:bg-[#346739]/5 group-hover:text-[#346739] group-hover:border-[#346739]/10 transition-all'>
                {metric.icons}
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-semibold uppercase text-[#93939f]'>{metric.title}</span>
                <span className='text-[13px] md:text-[14px] font-bold text-black'>{metric.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ALERT: NEXT DUE (REFINED) */}
        <div className='p-3 md:p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='size-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0'>
              <MoneyBag className="size-4" weight="BoldDuotone" />
            </div>
            <div>
              <p className='text-[9px] md:text-[10px] font-bold text-amber-700 uppercase leading-none mb-1'>Next Due: {nextPayment?.label ?? 'No upcoming payment'}</p>
              <p className='text-[13px] font-bold text-black'>{nextPaymentValue}</p>
            </div>
          </div>
          <div className='sm:text-right px-11 sm:px-0'>
            <p className='text-[10px] font-bold text-amber-600 uppercase bg-amber-100/50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded w-fit sm:w-auto'>{nextPaymentDue}</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className='space-y-3 pt-2'>
          <div className='flex justify-between items-end'>
            <span className='text-[10px] font-semibold uppercase text-[#93939f]'>Budget Utilization</span>
            <span className='text-[10px] font-bold text-black'>{utilization}%</span>
          </div>
          <div className='h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden'>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${utilization}%` }} 
              className="h-full bg-[#346739]" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatRupiah(value: number) {
  return `Rp ${Math.max(value, 0).toLocaleString('id-ID')}`
}

function formatDueIn(days: number) {
  if (days < 0) return `Overdue ${Math.abs(days)}d`
  if (days === 0) return 'Due Today'
  if (days === 1) return 'In 1 Day'
  return `In ${days} Days`
}

export default BudgetMetrics
