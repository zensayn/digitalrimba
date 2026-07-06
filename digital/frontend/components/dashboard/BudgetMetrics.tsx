'use client'

import Link from 'next/link'
import {
  AltArrowRight,
  Widget,
  MoneyBag,
  Wallet,
  GraphUp,
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
      icons: <GraphUp className='size-4' />,
      title: 'Payment Trend',
      value: data.overspend ? 'Overspent' : 'On Track'
    },
    {
      icons: <MoneyBag className='size-4' />,
      title: 'Next Payment',
      value: nextPaymentValue
    },
    {
      icons: <Wallet className='size-4' />,
      title: 'Paid Total',
      value: formatRupiah(data.paid)
    },
    {
      icons: <Widget className='size-4' />,
      title: 'Remaining',
      value: formatRupiah(data.remaining)
    }
  ]

  return (
    <Card className="overflow-hidden rounded-[22px] border-[#e5e7eb] bg-white py-0 shadow-none">
      <CardHeader className="border-b border-[#e5e7eb] px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-[#212121]">Financial Pulse</CardTitle>
          <Link
            href="/dashboard/budget"
            className="group inline-flex items-center gap-1 text-[11px] font-semibold text-[#346739] transition-colors hover:text-[#212121]"
          >
            Open
            <AltArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className='space-y-6 px-5 py-5'>
        {/* TOP: SUMMARY & CHART */}
        <div className='flex items-center justify-between gap-5'>
          <div className='space-y-1'>
            <p className='text-[10px] font-semibold uppercase text-[#93939f]'>Total Spent</p>
            <p className='text-3xl font-normal leading-none tracking-normal text-[#212121]'>{formatRupiah(data.spent)}</p>
            <p className='text-[11px] leading-5 text-[#75758a]'>of {formatRupiah(data.total)} budget</p>
          </div>
          
          <div className='shrink-0'>
            <ChartContainer config={revenueChartConfig} className='h-24 w-24'>
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
                              className='fill-[#212121] text-lg font-semibold'
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
        <div className='divide-y divide-[#e5e7eb] border-y border-[#e5e7eb]'>
          {MetricsData.map((metric, index) => (
            <div key={index} className='group flex items-center gap-3 py-3.5'>
              <div className='flex size-8 items-center justify-center rounded-[10px] bg-[#fafafa] text-[#93939f] transition-colors group-hover:bg-[#edfce9] group-hover:text-[#346739]'>
                {metric.icons}
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='text-[10px] font-semibold uppercase text-[#93939f]'>{metric.title}</span>
                <span className='truncate text-[13px] font-semibold text-[#212121]'>{metric.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* NEXT DUE — alert styling only when there's a real upcoming payment */}
        <div className={`flex flex-col justify-between gap-3 border-l-2 py-3 pl-4 pr-2 sm:flex-row sm:items-center ${
          nextPayment ? 'border-[#ff7759] bg-[#fff7f3]' : 'border-[#346739] bg-[#edfce9]'
        }`}>
          <div className='flex items-center gap-3'>
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-white ${
              nextPayment ? 'text-[#ff7759]' : 'text-[#346739]'
            }`}>
              <MoneyBag className="size-4" weight="BoldDuotone" />
            </div>
            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase leading-none ${
                nextPayment ? 'text-[#9b4b32]' : 'text-[#346739]'
              }`}>Next Due: {nextPayment?.label ?? 'No upcoming payment'}</p>
              <p className='text-[13px] font-semibold text-[#212121]'>{nextPaymentValue}</p>
            </div>
          </div>
          <div className='px-11 sm:px-0 sm:text-right'>
            <p className={`w-fit rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase sm:w-auto ${
              nextPayment ? 'text-[#9b4b32]' : 'text-[#346739]'
            }`}>{nextPaymentDue}</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className='space-y-3 pt-2'>
          <div className='flex justify-between items-end'>
            <span className='text-[10px] font-semibold uppercase text-[#93939f]'>Budget Utilization</span>
            <span className='text-[10px] font-semibold text-[#212121]'>{utilization}%</span>
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
