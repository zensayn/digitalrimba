'use client'

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
import { TextureButton } from '@/components/ui/texture-button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
      icon: <CheckCircle className="size-8 text-[#346739]" weight="BoldDuotone" />,
      subtext: 'Guests attending',
      color: 'bg-[#346739]/5'
    },
    {
      label: 'Declined',
      value: data.declined,
      icon: <CloseCircle className="size-8 text-red-500" weight="BoldDuotone" />,
      subtext: 'Unable to join',
      color: 'bg-red-50'
    },
    {
      label: 'Pending',
      value: data.pending,
      icon: <QuestionCircle className="size-8 text-amber-500" weight="BoldDuotone" />,
      subtext: 'Awaiting reply',
      color: 'bg-amber-50'
    }
  ]

  return (
    <Card className='border-[#f2f2f2] shadow-premium overflow-hidden bg-white rounded-2xl'>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6 px-4 md:px-6">
        <div className="space-y-1">
          <CardTitle className="text-base md:text-lg font-semibold tracking-tight">Guest Tracking</CardTitle>
          <CardDescription className="text-[11px] md:text-xs text-[#75758a]">Monitor RSVP trends and responses.</CardDescription>
        </div>
        <TextureButton variant="outline" className="h-8 rounded-full text-[10px] md:text-[11px] px-3 md:px-4 shrink-0">
          <span className="md:hidden">Manage</span>
          <span className="hidden md:inline">Manage List</span>
          <ArrowRight size={14} className="ml-1" />
        </TextureButton>
      </CardHeader>

      <CardContent className='space-y-6 md:space-y-8 px-4 md:px-6 pb-6'>
        {/* CHART SECTION */}
        <div className='w-full'>
          <ChartContainer config={guestChartConfig} className='h-[240px] w-full'>
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

        {/* METRICS GRID */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {metrics.map((m, i) => (
            <div key={i} className='flex items-center gap-4 p-4 rounded-xl border border-[#f2f2f2] bg-white shadow-premium hover:shadow-md transition-all group'>
              <Avatar className='size-10 rounded-lg'>
                <AvatarFallback className={`${m.color} rounded-lg`}>
                  {m.icon}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-[10px] font-semibold uppercase text-[#93939f]'>{m.label}</span>
                <div className='flex items-baseline gap-2'>
                  <span className='text-xl font-bold text-black'>{m.value}</span>
                  <span className='text-[9px] text-[#75758a] font-medium'>{m.subtext}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PROGRESS SUMMARY */}
        <div className='pt-6 border-t border-[#f2f2f2]'>
          <div className='flex justify-between items-end mb-3'>
            <div>
              <p className='text-[10px] font-semibold uppercase text-[#93939f]'>Total Invited</p>
              <p className='text-2xl font-bold text-black tracking-tighter'>{invited} Guests</p>
            </div>
            <div className='text-right'>
              <p className='text-[10px] font-semibold uppercase text-[#93939f]'>Response Rate</p>
              <p className='text-[14px] font-bold text-[#346739]'>{responseRate}%</p>
            </div>
          </div>
          <div className='h-2 w-full bg-neutral-100 rounded-full overflow-hidden flex'>
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
        </div>
      </CardContent>
    </Card>
  )
}
