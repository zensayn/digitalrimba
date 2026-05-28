"use client";

import { useState } from 'react';
import { CalendarMark, CheckCircle, RecordCircle, AddCircle } from '@solar-icons/react';
import { motion } from 'motion/react';
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

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const categories = [...new Set(tasks.map((t) => t.category))];
  const done = tasks.filter((t) => t.done).length;

  function toggle(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const transition = { duration: 0.6, ease: [0.32, 0.72, 0, 1] as const };
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex-1 w-full pb-24"
    >
      {/* ── CALENDAR SECTION (FULL WIDTH) ── */}
      <motion.div variants={itemVariants} className="w-full border-b border-neutral-100 p-4 md:p-12">
        <FullCalendar />
      </motion.div>

      {/* ── TIMELINE SECTION ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-16">
        <motion.div variants={itemVariants} className="mb-16 max-w-2xl">
          <h1 className="font-poppins text-3xl md:text-4xl font-bold tracking-tight text-black mb-3">Timeline & Checklist</h1>
          <div className="flex items-center justify-between mb-2">
            <p className="font-poppins text-[13px] text-neutral-500 font-medium">
              {done} of {tasks.length} tasks completed
            </p>
            <span className="text-[13px] font-bold text-[#346739]">{Math.round((done / tasks.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(done / tasks.length) * 100}%` }}
              transition={{ ...transition, delay: 0.5 }}
              className="h-full rounded-full bg-[#346739]"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-12 max-w-4xl">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-6">
                <CalendarMark size={14} weight="Bold" className="text-[#346739]" />
                <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-neutral-400">{cat}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.filter((t) => t.category === cat).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggle(task.id)}
                    className="group w-full flex items-center gap-4 rounded-[12px] border-none bg-white ring-1 ring-foreground/5 px-5 py-4 text-left hover:ring-[#346739]/20 hover:bg-neutral-50/50 transition-all active:scale-[0.99]"
                  >
                    {task.done ? (
                      <CheckCircle size={20} weight="Bold" className="text-[#346739] shrink-0" />
                    ) : (
                      <RecordCircle size={20} weight="Linear" className="text-neutral-200 group-hover:text-neutral-300 shrink-0" />
                    )}
                    <span className={`font-poppins text-[14px] font-medium transition-colors ${task.done ? 'line-through text-neutral-300' : 'text-neutral-700'}`}>
                      {task.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <TextureButton 
              variant="outline"
              className="h-12 rounded-[32px] text-xs font-bold gap-2 px-8"
            >
              <AddCircle size={18} weight="Bold" />
              Add custom task
            </TextureButton>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
