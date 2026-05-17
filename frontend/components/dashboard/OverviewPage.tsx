"use client";

import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'motion/react';
import {
  ChatDots,
  AltArrowRight,
  AddCircle,
  Flag,
  UserCircle,
  Bell,
  Hourglass,
  Notes,
} from '@solar-icons/react';
import { TextureButton } from '@/components/ui/texture-button';
import BudgetMetrics from '@/components/dashboard/BudgetMetrics';
import GuestTracking from '@/components/dashboard/GuestTracking';
import { fetchDashboardOverview } from '@/lib/api/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ── COMPONENTS ── */

function MetricCard({
  label,
  value,
  subtext,
  icon,
  subValue,
  iconColor = "text-[#346739]"
}: {
  label: string,
  value: string | number,
  subtext?: string,
  icon: React.ReactNode,
  subValue?: string | number,
  iconColor?: string
}) {
  return (
    <div className="flex flex-col p-5 space-y-2">
      <div className="flex items-center gap-2">
        <div className={`size-4 ${iconColor}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase text-[#93939f]">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold tracking-tight text-bold">{value}</span>
        {subValue && <span className="text-[11px] font-bold text-bold/40">{subValue}</span>}
        {subtext && <span className="text-[11px] text-[#75758a]">{subtext}</span>}
      </div>
    </div>
  );
}

function AssignmentTag({ user }: { user: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-100">
      <UserCircle size={10} className={user === 'EO' ? 'text-[#346739]' : 'text-amber-500'} />
      <span className="text-[8px] font-bold uppercase text-neutral-500">
        {user === 'EO' ? 'EO' : 'You'}
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
    duration: 0.6,
    ease: [0.32, 0.72, 0, 1] as const // ease-drawer
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
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
  const alertCount = overview.alerts.urgent_tasks + overview.alerts.overdue_tasks + overview.alerts.overdue_budget_items;
  const milestone = overview.next_milestone;
  const tasks = overview.checklist.tasks;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="bg-white min-h-screen"
    >
      {/* ── HEADER SECTION ── */}
      <motion.header
        variants={itemVariants}
        className="pt-6 md:pt-10 pb-2"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-bold">
              {coupleName}&rsquo;s Wedding
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#75758a]">Planning center for your most beautiful day.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <TextureButton variant="primary" className="h-10 rounded-full text-xs px-6 w-full md:w-auto">
              Invite Partner
            </TextureButton>
          </div>
        </div>
      </motion.header>

      {/* ── THE PULSE (METRICS RIBBON) ── */}
      <motion.section
        variants={itemVariants}
        className="py-6 md:py-8 bg-[#fafafa]/30"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="bg-white rounded-xl ring-1 ring-foreground/10 overflow-hidden grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 divide-x divide-[#f2f2f2]/50">
            <MetricCard
              label="Countdown"
              value={diffDays ?? "No Date"}
              subtext={diffDays === null ? "Set event date" : "Days to go"}
              icon={<Hourglass weight="BoldDuotone" />}
              iconColor="text-[#346739]"
            />
            <MetricCard
              label="Messages"
              value="0 New"
              subtext="Organizer Chat"
              icon={<ChatDots weight="BoldDuotone" />}
              iconColor="text-[#1863dc]"
            />
            <MetricCard
              label="Checklist"
              value={`${overview.checklist.progress}%`}
              subtext="Completion"
              icon={<Notes weight="BoldDuotone" />}
              iconColor="text-[#ff7759]"
            />
            <MetricCard
              label="Alerts"
              value={alertCount}
              subtext={alertCount === 1 ? "Action Required" : "Actions Required"}
              icon={<Bell weight="BoldDuotone" />}
              iconColor="text-red-500"
            />
            <div className="hidden lg:block">
              <MetricCard
                label="Next Milestone"
                value={milestone?.label ?? "No milestone"}
                subtext={milestone?.due_date ? formatShortDate(milestone.due_date) : "Add tasks"}
                icon={<Flag weight="BoldDuotone" />}
                iconColor="text-slate-400"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── MAIN CONTENT GRID ── */}
      <main className="pb-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* LEFT CONTENT (8/12) */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-12">
              {/* Guest Tracking Section */}
              <section className="space-y-6">
                <GuestTracking data={overview.guests} />
              </section>

              {/* Checklist Section */}
              <section className="space-y-6">
                <Card className="border-[#f2f2f2] shadow-sm overflow-hidden bg-white rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6 px-4 md:px-6">
                    <div className="space-y-1">
                      <CardTitle className="text-base md:text-lg font-semibold tracking-tight">Active Checklist</CardTitle>
                      <CardDescription className="text-[11px] md:text-xs text-[#75758a]">Priority tasks for your current planning stage.</CardDescription>
                    </div>
                    <TextureButton variant="outline" className="h-8 rounded-full text-[10px] md:text-[11px] px-3 md:px-4 shrink-0">
                      <span className="md:hidden">Timeline</span>
                      <span className="hidden md:inline">Full Timeline</span>
                    </TextureButton>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-[#f2f2f2] border-t border-[#f2f2f2]">
                      {tasks.length > 0 ? tasks.map((task) => (
                        <div key={task.id} className="group flex items-center justify-between py-4 md:py-5 hover:bg-[#fafafa] transition-colors px-4 md:px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-5 h-5 rounded-md border-2 border-neutral-200 group-hover:border-[#346739] transition-colors flex items-center justify-center cursor-pointer">
                              <div className="w-2 h-2 rounded-sm bg-[#346739] scale-0 group-hover:scale-100 transition-transform" />
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-bold">{task.label}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-[#93939f] font-medium">{task.category || "Checklist"}</span>
                                <span className="text-neutral-300">·</span>
                                <AssignmentTag user={task.assigned_to || "You"} />
                              </div>
                            </div>
                          </div>
                          <AltArrowRight size={18} className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )) : (
                        <div className="px-4 md:px-6 py-8 text-[13px] text-[#75758a]">
                          No active checklist tasks.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </motion.div>

            {/* RIGHT SIDEBAR (4/12) */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-12">
              {/* Payment Pulse */}
              <section className="space-y-6">
                <BudgetMetrics data={overview.budget} />
              </section>

              {/* Quick Actions */}
              <section className="space-y-6">
                <h2 className="text-lg font-semibold tracking-tight">Shortcuts</h2>
                <div className="grid grid-cols-1 gap-3">
                  <TextureButton variant="primary" className="w-full h-12 text-[13px] font-bold gap-3 justify-start px-5">
                    <AddCircle size={20} weight="Bold" />
                    Add New Expense
                  </TextureButton>
                  <TextureButton variant="outline" className="w-full h-12 text-[13px] font-bold gap-3 justify-start px-5 rounded-full">
                    <ChatDots size={20} weight="Bold" className="text-neutral-400" />
                    Message Organizer
                  </TextureButton>
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
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

function parseISODate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
