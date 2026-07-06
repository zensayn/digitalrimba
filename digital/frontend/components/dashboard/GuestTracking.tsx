'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, CloseCircle, QuestionCircle } from '@solar-icons/react'
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardGuestSummary } from '@/lib/api/dashboard'

const guestChartConfig = {
  yes: {
    label: "Yes",
    color: "#346739", // Rimba Green
  },
  no: {
    label: "No",
    color: "#ef4444", // Red 500
  },
  pending: {
    label: "Pending",
    color: "#f59e0b", // Amber 500
  },
} satisfies ChartConfig

interface GuestTrackingProps {
  data: DashboardGuestSummary
}

export default function GuestTracking({ data }: GuestTrackingProps) {
  const invited = Math.max(data.invited, 0)
  const responseRate = invited > 0 ? Math.round(((data.confirmed + data.declined) / invited) * 100) : 0
  const percent = (value: number) => invited > 0 ? Math.max(0, Math.min(100, (value / invited) * 100)) : 0
  const chartData = data.history.length > 0
    ? data.history.map(point => ({
        date: point.date,
        yes: point.confirmed,
        no: point.declined,
        pending: point.pending,
      }))
    : [{ date: "Now", yes: data.confirmed, no: data.declined, pending: data.pending }]

  const metrics = [
    {
      label: 'Confirmed',
      value: data.confirmed,
      icon: <CheckCircle size={18} className="text-[#346739]" weight="BoldDuotone" />,
      subtext: 'Guests attending',
      color: 'bg-[#346739]'
    },
    {
      label: 'Declined',
      value: data.declined,
      icon: <CloseCircle size={18} className="text-red-500" weight="BoldDuotone" />,
      subtext: 'Unable to join',
      color: 'bg-red-500'
    },
    {
      label: 'Pending',
      value: data.pending,
      icon: <QuestionCircle size={18} className="text-amber-500" weight="BoldDuotone" />,
      subtext: 'Awaiting reply',
      color: 'bg-amber-500'
    }
  ]

  return (
    <Card className='overflow-hidden rounded-[22px] border-[#e5e7eb] bg-white py-0 shadow-none'>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 border-b border-[#e5e7eb] px-4 py-5 md:px-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-[#212121]">Guest Tracking</CardTitle>
          <CardDescription className="text-[12px] text-[#75758a]">RSVP response trend and invitation health.</CardDescription>
        </div>
        <Link
          href="/dashboard/guests"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[#d9d9dd] bg-white px-4 text-[11px] font-semibold text-[#212121] transition-[transform,border-color,background-color] duration-[160ms] ease-out hover:border-[#346739]/25 hover:bg-[#edfce9]/40 active:scale-[0.97]"
        >
          <span className="md:hidden">Manage</span>
          <span className="hidden md:inline">Manage List</span>
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='grid lg:grid-cols-[236px_minmax(0,1fr)]'>
          <aside className='border-b border-[#e5e7eb] p-5 md:p-6 lg:border-r lg:border-b-0'>
            <p className='text-[10px] font-semibold uppercase text-[#93939f]'>Total invited</p>
            <p className='mt-3 text-5xl font-normal leading-none tracking-normal text-[#212121]'>{invited}</p>
            <p className='mt-2 text-[12px] leading-5 text-[#75758a]'>Guests across every RSVP status.</p>

            <div className='mt-8'>
              <div className='mb-3 flex justify-between text-[10px] font-semibold uppercase text-[#93939f]'>
                <span>Response rate</span>
                <span className='text-[#346739]'>{responseRate}%</span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-[#eeece7]'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${responseRate}%` }}
                  className="h-full rounded-full bg-[#346739]"
                />
              </div>
            </div>

            <div className='mt-6 h-2 w-full overflow-hidden rounded-full bg-neutral-100 flex'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent(data.confirmed)}%` }}
                className="h-full bg-[#346739]"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent(data.declined)}%` }}
                className="h-full bg-red-400"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent(data.pending)}%` }}
                className="h-full bg-amber-400"
              />
            </div>
          </aside>

          <div className='p-4 md:p-6'>
            <ChartContainer config={guestChartConfig} className='h-[300px] w-full'>
              <LineChart
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[10px] font-medium text-[#93939f]"
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="yes"
                  type="monotone"
                  stroke="var(--color-yes)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-yes)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  dataKey="no"
                  type="monotone"
                  stroke="var(--color-no)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-no)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  dataKey="pending"
                  type="monotone"
                  stroke="var(--color-pending)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-pending)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        <div className='grid border-t border-[#e5e7eb] md:grid-cols-3'>
          {metrics.map((m, i) => (
            <div key={i} className='flex items-center gap-4 border-b border-[#e5e7eb] px-5 py-4 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0 md:px-6'>
              <span className={`block h-10 w-1 rounded-full ${m.color}`} />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  {m.icon}
                  <span className='text-[10px] font-semibold uppercase text-[#93939f]'>{m.label}</span>
                </div>
                <div className='mt-1 flex items-baseline gap-2'>
                  <span className='text-xl font-semibold leading-none text-[#212121]'>{m.value}</span>
                  <span className='truncate text-[10px] text-[#75758a]'>{m.subtext}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
