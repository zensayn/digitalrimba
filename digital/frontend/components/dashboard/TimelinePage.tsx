"use client";

import { useState } from 'react';
import { CheckCircle, RecordCircle, AddCircle } from '@solar-icons/react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/components/dashboard/budget/types';
import { TextureButton } from '@/components/ui/texture-button';
import FullCalendar from '@/components/ui/full-calendar';

type Task = { id: number; label: string; done: boolean; category: string };

const defaultTasks: Task[] = [
  { id: 1,  label: 'Book the venue',                done: true,  category: '12 months before' },
  { id: 2,  label: 'Choose photographer & videographer', done: true, category: '12 months before' },
  { id: 3,  label: 'Set the guest list & send save-the-dates', done: false, category: '6 months before' },
  { id: 4,  label: 'Finalise menu with catering team', done: false, category: '6 months before' },
  { id: 5,  label: 'Send digital invitations',       done: false, category: '3 months before' },
  { id: 6,  label: 'Confirm RSVP count',             done: false, category: '3 months before' },
  { id: 7,  label: 'Arrange seating chart',          done: false, category: '1 month before' },
  { id: 8,  label: 'Final dress fitting',            done: false, category: '1 month before' },
  { id: 9,  label: 'Confirm vendors & schedule',     done: false, category: '1 week before' },
  { id: 10, label: 'Prepare check-in team & devices', done: false, category: '1 week before' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const categories = [...new Set(tasks.map((t) => t.category))];
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  // Per-milestone completion, and the first milestone that isn't fully done = "current".
  const milestones = categories.map((cat) => {
    const items = tasks.filter((t) => t.category === cat);
    const doneCount = items.filter((t) => t.done).length;
    return { cat, items, doneCount, complete: doneCount === items.length };
  });
  const currentIndex = milestones.findIndex((m) => !m.complete);

  function toggle(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-white"
    >
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24">

        {/* ── PAGE HEADER ── */}
        <motion.div variants={sectionVariants} className="mb-7">
          <h1 className="text-[28px] md:text-[34px] font-medium text-bold leading-none">Timeline &amp; checklist</h1>
          <p className="text-[13px] md:text-sm text-[#75758a] font-normal mt-2.5">
            Your road to the big day, one milestone at a time.
          </p>
        </motion.div>

        {/* ── OVERALL PROGRESS ── */}
        <motion.div variants={sectionVariants} className="mb-10 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] text-[#75758a] font-normal">
              {done} of {tasks.length} tasks completed
            </p>
            <span className="text-[13px] font-medium text-[#346739]">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#eeece7] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.3 }}
              className="h-full rounded-full bg-[#346739] motion-reduce:transition-none"
            />
          </div>
        </motion.div>

        {/* ── MILESTONE TIMELINE ── */}
        <motion.div variants={sectionVariants}>
          {milestones.map((m, i) => {
            const isCurrent = i === currentIndex;
            const isLast = i === milestones.length - 1;
            // Segment below this node is "reached" once this milestone is complete.
            const segmentReached = m.complete;
            return (
              <div key={m.cat} className="flex gap-4 md:gap-5">
                {/* Rail */}
                <div className="relative flex w-7 shrink-0 flex-col items-center">
                  {/* Node */}
                  <div
                    className={cn(
                      'relative z-10 mt-1 flex size-7 items-center justify-center rounded-full transition-colors duration-300 motion-reduce:transition-none',
                      m.complete
                        ? 'bg-[#346739] text-white'
                        : isCurrent
                          ? 'bg-white ring-2 ring-[#346739]'
                          : 'bg-white ring-2 ring-neutral-200',
                    )}
                  >
                    {m.complete ? (
                      <CheckCircle size={16} weight="Bold" />
                    ) : (
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          isCurrent ? 'bg-[#346739]' : 'bg-neutral-200',
                        )}
                      />
                    )}
                  </div>
                  {/* Connector */}
                  {!isLast && (
                    <div
                      className={cn(
                        'w-px flex-1',
                        segmentReached
                          ? 'bg-[#346739]'
                          : 'border-l border-dashed border-neutral-200',
                      )}
                    />
                  )}
                </div>

                {/* Card */}
                <div className={cn('flex-1', isLast ? 'pb-0' : 'pb-5 md:pb-6')}>
                  <div
                    className={cn(
                      'rounded-[16px] bg-white p-5 md:p-6 ring-1 transition-shadow',
                      isCurrent ? 'ring-[#346739]/25 shadow-sm' : 'ring-foreground/5',
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          'text-[11px] font-medium uppercase',
                          isCurrent ? 'text-[#346739]' : 'text-[#93939f]',
                        )}
                      >
                        {m.cat}
                      </span>
                      <span className="text-[11px] font-normal text-[#93939f]">
                        {m.doneCount}/{m.items.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {m.items.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => toggle(task.id)}
                          className="group -mx-2 flex items-center gap-3 rounded-[10px] px-2 py-2.5 text-left transition-colors hover:bg-neutral-50/70 active:scale-[0.99]"
                        >
                          {task.done ? (
                            <CheckCircle size={20} weight="Bold" className="shrink-0 text-[#346739]" />
                          ) : (
                            <RecordCircle
                              size={20}
                              weight="Linear"
                              className="shrink-0 text-neutral-200 group-hover:text-neutral-300"
                            />
                          )}
                          <span
                            className={cn(
                              'text-[14px] font-medium transition-colors',
                              task.done ? 'text-neutral-300 line-through' : 'text-neutral-700',
                            )}
                          >
                            {task.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add custom task — aligned with the card column */}
          <div className="ml-[44px] md:ml-12 pt-2">
            <TextureButton variant="outline" className="h-11 gap-2 rounded-full px-6 text-[13px] font-medium">
              <AddCircle size={18} weight="Bold" />
              Add custom task
            </TextureButton>
          </div>
        </motion.div>

        {/* ── CALENDAR ── */}
        <motion.div variants={sectionVariants} className="mt-16 border-t border-neutral-100 pt-12">
          <div className="mb-8">
            <h2 className="text-[20px] md:text-2xl font-medium text-bold leading-none">Calendar</h2>
            <p className="text-[13px] md:text-sm text-[#75758a] font-normal mt-2">
              Pin tastings, fittings and vendor meetings to specific dates.
            </p>
          </div>
          <FullCalendar />
        </motion.div>

      </div>
    </motion.div>
  );
}
