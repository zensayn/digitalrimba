"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'motion/react';
import {
  AltArrowRight,
  AddCircle,
  Flag,
  UserCircle,
  Danger,
  CalendarMark,
  Letter,
} from '@solar-icons/react';
import { TextureButton } from '@/components/ui/texture-button';
import BudgetMetrics from '@/components/dashboard/BudgetMetrics';
import GuestTracking from '@/components/dashboard/GuestTracking';
import { fetchDashboardOverview } from '@/lib/api/dashboard';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ── COMPONENTS ── */

function MicroLabel({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-normal ${tone === "dark" ? "text-white/60" : "text-[#93939f]"}`}>
      {children}
    </span>
  );
}

function AssignmentTag({ user }: { user: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-[#f2f2f2] bg-[#fafafa] px-2 py-0.5">
      <UserCircle size={10} className={user === 'EO' ? 'text-[#346739]' : 'text-amber-500'} />
      <span className="text-[8px] font-semibold uppercase text-[#75758a]">
        {user === 'EO' ? 'EO' : 'You'}
      </span>
    </div>
  );
}

function AlertRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className={`text-[13px] ${count > 0 ? 'text-[#212121]' : 'text-[#93939f]'}`}>{label}</span>
      <span className={`min-w-6 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${count > 0 ? 'bg-[#fff1ec] text-[#b30000]' : 'bg-[#fafafa] text-[#93939f]'}`}>
        {count}
      </span>
    </div>
  );
}

function OverviewStatus({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[#f2f2f2] shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function OverviewPage() {
  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: fetchDashboardOverview,
    retry: 1,
  });

  const transition = {
    duration: 0.5,
    ease: [0.32, 0.72, 0, 1] as const // ease-drawer
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition }
  }

  if (isLoading) {
    return <OverviewStatus title="Loading dashboard" description="Fetching latest wedding data." />;
  }

  if (isError) {
    return (
      <OverviewStatus
        title="Dashboard unavailable"
        description={error instanceof Error ? error.message : "Unable to load dashboard data."}
      />
    );
  }

  if (!overview?.wedding) {
    return <OverviewStatus title="No wedding found" description="Create a wedding profile before opening the dashboard overview." />;
  }

  const coupleName = overview.wedding.couple_name || 'Your Wedding';
  const diffDays = daysUntil(overview.wedding.event_date);
  const eventDate = formatLongDate(overview.wedding.event_date);
  const alertCount = overview.alerts.urgent_tasks + overview.alerts.overdue_tasks + overview.alerts.overdue_budget_items + overview.alerts.pending_rsvps;
  const milestone = overview.next_milestone;
  const checklist = overview.checklist;
  const tasks = checklist.tasks;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="min-h-screen bg-white"
    >
      <div className="mx-auto max-w-[1400px] px-4 pt-8 md:px-8 md:pt-12">

        {/* ── HEADER: date caption + greeting (Origin/Bonsai pattern) ── */}
        <motion.header variants={itemVariants} className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-[13px] text-[#75758a]">{formatTodayLong()}</p>
            <h1 className="text-[32px] font-medium leading-[1.1] tracking-tight text-[#212121] md:text-[40px]">
              {getGreeting()}, {coupleName}.
            </h1>
          </div>
          <Link href="/dashboard/settings" className="w-full md:w-auto">
            <TextureButton variant="primary" className="h-10 w-full rounded-full px-6 text-xs">
              Invite Partner
            </TextureButton>
          </Link>
        </motion.header>

        {/* ── MAIN GRID ── */}
        <main className="grid grid-cols-1 gap-8 pb-24 pt-10 md:pt-12 lg:grid-cols-12">

          {/* LEFT COLUMN (8/12) */}
          <div className="space-y-10 lg:col-span-8">

            {/* Hero countdown module — one large numeral, Origin net-worth pattern */}
            <motion.section variants={itemVariants}>
              <div className="overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-white">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4 md:px-6">
                  <MicroLabel>Countdown</MicroLabel>
                  <div className="flex items-center gap-2 text-[11px] text-[#75758a]">
                    <CalendarMark size={14} className="text-[#93939f]" />
                    {eventDate ?? "No date set"}
                  </div>
                </div>
                <div className="flex flex-col gap-8 px-5 py-6 md:flex-row md:items-end md:justify-between md:px-6 md:py-8">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-normal leading-none tracking-tight text-[#212121] md:text-7xl">
                        {diffDays ?? "—"}
                      </span>
                      <span className="text-[14px] text-[#75758a]">
                        {diffDays === null ? "set your event date" : diffDays === 1 ? "day to go" : "days to go"}
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:max-w-[260px]">
                    <div className="mb-3 flex items-end justify-between">
                      <MicroLabel>Planning progress</MicroLabel>
                      <span className="text-[11px] font-semibold text-[#212121]">{checklist.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eeece7]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${checklist.progress}%` }}
                        transition={transition}
                        className="h-full rounded-full bg-[#346739]"
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-[#75758a]">{checklist.completed} of {checklist.total} tasks complete</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Guest tracking */}
            <motion.section variants={itemVariants}>
              <GuestTracking data={overview.guests} />
            </motion.section>

            {/* Up next — unframed rule-separated rows (Cohere research-table) */}
            <motion.section variants={itemVariants}>
              <div className="flex items-end justify-between pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-[#212121]">Up next</h2>
                  <p className="text-[12px] text-[#75758a]">Priority tasks for your current planning stage.</p>
                </div>
                <Link href="/dashboard/timeline" className="shrink-0">
                  <TextureButton variant="outline" className="h-8 rounded-full px-4 text-[11px]">
                    Full Timeline
                  </TextureButton>
                </Link>
              </div>
              <div className="divide-y divide-[#e5e7eb] border-y border-[#e5e7eb]">
                {tasks.length > 0 ? tasks.map((task) => (
                  <div key={task.id} className="group flex items-center justify-between px-1 py-4 transition-colors duration-150 hover:bg-[#fafafa] md:py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex size-5 cursor-pointer items-center justify-center rounded-full border-2 border-[#d9d9dd] transition-colors duration-150 group-hover:border-[#346739]">
                        <div className="size-2 scale-0 rounded-full bg-[#346739] transition-transform duration-150 ease-out group-hover:scale-100" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#212121]">{task.label}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase text-[#93939f]">{task.category || "Checklist"}</span>
                          <span className="text-[#d9d9dd]">·</span>
                          <AssignmentTag user={task.assigned_to || "You"} />
                          {task.urgent && (
                            <span className="rounded-full bg-[#fff1ec] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#b30000]">Urgent</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {task.due_date && (
                        <span className="text-[11px] text-[#93939f]">{formatShortDate(task.due_date)}</span>
                      )}
                      <AltArrowRight size={16} className="text-[#d9d9dd] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-[13px] text-[#75758a]">
                    No active checklist tasks.
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* RIGHT RAIL (4/12) — stacked compact cards, Origin pattern */}
          <div className="space-y-6 lg:col-span-4">

            {/* Next milestone — deep-green dark-feature-band (Origin green card) */}
            <motion.section variants={itemVariants}>
              <div className="rounded-[22px] bg-[#003c33] p-6 text-white">
                <div className="flex items-center justify-between">
                  <MicroLabel tone="dark">Next milestone</MicroLabel>
                  <Flag size={16} weight="BoldDuotone" className="text-white/50" />
                </div>
                <p className="mt-4 text-xl font-medium leading-snug">
                  {milestone?.label ?? "No milestone yet"}
                </p>
                <p className="mt-1 text-[12px] text-white/60">
                  {milestone?.due_date ? `Due ${formatLongDate(milestone.due_date)}` : "Add tasks to build your timeline"}
                </p>
                <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${checklist.progress}%` }}
                    transition={transition}
                    className="h-full rounded-full bg-[#edfce9]"
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/60">{checklist.progress}% of planning complete</p>
              </div>
            </motion.section>

            {/* Needs attention */}
            <motion.section variants={itemVariants}>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-white px-5 py-5">
                <div className="flex items-center justify-between">
                  <MicroLabel>Needs attention</MicroLabel>
                  <Danger size={16} weight="BoldDuotone" className={alertCount > 0 ? "text-[#ff7759]" : "text-[#d9d9dd]"} />
                </div>
                <div className="mt-2 divide-y divide-[#f2f2f2]">
                  <AlertRow label="Urgent tasks" count={overview.alerts.urgent_tasks} />
                  <AlertRow label="Overdue tasks" count={overview.alerts.overdue_tasks} />
                  <AlertRow label="Overdue payments" count={overview.alerts.overdue_budget_items} />
                  <AlertRow label="Pending RSVPs" count={overview.alerts.pending_rsvps} />
                </div>
              </div>
            </motion.section>

            {/* Budget */}
            <motion.section variants={itemVariants}>
              <BudgetMetrics data={overview.budget} />
            </motion.section>

            {/* Shortcuts — "Message Organizer" removed until a messaging feature exists */}
            <motion.section variants={itemVariants} className="space-y-3">
              <Link href="/dashboard/budget" className="block">
                <TextureButton variant="primary" className="h-12 w-full justify-start gap-3 px-5 text-[13px] font-semibold">
                  <AddCircle size={20} weight="Bold" />
                  Add New Expense
                </TextureButton>
              </Link>
              <Link href="/dashboard/invitations" className="block">
                <TextureButton variant="outline" className="h-12 w-full justify-start gap-3 rounded-full px-5 text-[13px] font-semibold">
                  <Letter size={20} weight="Bold" className="text-[#93939f]" />
                  Send Invitations
                </TextureButton>
              </Link>
            </motion.section>
          </div>
        </main>
      </div>
    </motion.div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatTodayLong() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function daysUntil(value: string) {
  const date = parseISODate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(Math.ceil((date.getTime() - today.getTime()) / 86_400_000), 0);
}

function formatShortDate(value: string) {
  const date = parseISODate(value);
  if (!date) return "No date";
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLongDate(value: string) {
  const date = parseISODate(value);
  if (!date) return null;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function parseISODate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
