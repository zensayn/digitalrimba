"use client";

import { useState } from 'react';
import {
  Camera,
  AltArrowDown,
  AltArrowRight,
  Letter,
  MapPoint,
  Phone,
  Globus,
  AddCircle,
  ChatDots,
  UserCircle,
  UsersGroupRounded,
  CheckRead,
  Pen
} from '@solar-icons/react';
import { motion, Variants } from 'motion/react';
import { TextureButton } from '@/components/ui/texture-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isPagesOpen, setIsPagesOpen] = useState(true);

  const transition = { duration: 0.6, ease: [0.32, 0.72, 0, 1] as const };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex-1 w-full bg-white min-h-screen pb-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12">

        {/* ── PROFILE HEADER SECTION ── */}
        <motion.section
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start gap-8 md:gap-12 mb-16"
        >
          {/* Avatar Area */}
          <div className="relative group">
            <Avatar className="size-32 md:size-44 ring-4 ring-neutral-50 shadow-xl">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop" />
              <AvatarFallback className="bg-neutral-100 text-neutral-400">
                <UserCircle size={64} />
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-2 right-2 size-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-neutral-100 text-neutral-600 hover:text-bold hover:scale-110 active:scale-95 transition-all">
              <Camera size={20} />
            </button>
          </div>

          {/* Identity Area */}
          <div className="flex-1 space-y-6 pt-4">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase text-neutral-400">Account Owner</span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-bold">Pangky Revalina</h1>
              <p className="text-lg font-medium text-neutral-500">Wedding Administrator</p>
              <button className="text-[13px] font-medium text-neutral-400 hover:text-[#346739] underline underline-offset-4 decoration-neutral-200 transition-all">
                Add biography
              </button>
            </div>

            {/* Tags/Quick Info */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-black/5 bg-white text-[12px] font-medium text-neutral-600 shadow-sm">
                <Letter size={14} className="text-neutral-400" />
                pangky.rev@rimba.id
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-black/5 bg-white text-[12px] font-medium text-neutral-600 shadow-sm">
                <UsersGroupRounded size={14} className="text-neutral-400" />
                Wedding Organizer Team
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-black/5 bg-white text-[12px] font-medium text-neutral-600 shadow-sm">
                <CheckRead size={14} className="text-[#346739]" />
                Identity Verified
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium text-neutral-400 hover:text-bold transition-colors">
                <AddCircle size={14} />
                Connect Partner
              </button>
            </div>
          </div>
        </motion.section>

        {/* ── DETAILS SECTION ── */}
        <motion.section
          variants={itemVariants}
          animate={{ marginBottom: isDetailsOpen ? 64 : 24 }}
          transition={transition}
          className="space-y-6"
        >
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <h2 className="text-lg font-bold tracking-tight text-bold">Contact Details</h2>
              <AltArrowDown
                size={18}
                className={cn("text-neutral-400 transition-transform duration-300", !isDetailsOpen && "-rotate-90")}
              />
            </button>
            <TextureButton variant="outline" size="sm" className="h-8 rounded-full text-[11px] font-medium">
              <Pen size={12} className="mr-1" /> Edit details
            </TextureButton>
          </div>

          <motion.div
            animate={{ height: isDetailsOpen ? 'auto' : 0, opacity: isDetailsOpen ? 1 : 0 }}
            className="p-1" // Added padding to prevent ring cutout
          >
            <div className="grid grid-cols-1 md:grid-cols-2 ring-1 ring-foreground/10 rounded-[24px] overflow-hidden divide-x divide-y md:divide-y-0 divide-neutral-100">
              <div className="divide-y divide-neutral-100">
                <DetailRow label="Phone Number" value="+62 812 3456 7890" icon={<Phone size={14} />} />
                <DetailRow label="Location" value="Jakarta, Indonesia" icon={<MapPoint size={14} />} />
              </div>
              <div className="divide-y divide-neutral-100">
                <DetailRow label="Website" value="www.rimba.id" icon={<Globus size={14} />} />
                <DetailRow label="LinkedIn" value="linkedin.com/in/pangkyrev" icon={<Letter size={14} />} />
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ── MODULES SECTION ── */}
        <motion.section
          variants={itemVariants}
          animate={{ marginBottom: isPagesOpen ? 64 : 24 }}
          transition={transition}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPagesOpen(!isPagesOpen)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <h2 className="text-lg font-bold tracking-tight text-bold">Wedding Modules</h2>
              <AltArrowDown
                size={18}
                className={cn("text-neutral-400 transition-transform duration-300", !isPagesOpen && "-rotate-90")}
              />
            </button>
            <button className="size-8 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-bold hover:border-black transition-all">
              <AddCircle size={18} />
            </button>
          </div>

          <motion.div
            animate={{ height: isPagesOpen ? 'auto' : 0, opacity: isPagesOpen ? 1 : 0 }}
            className="p-1" // Added padding to prevent ring cutout on cards
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ModuleCard
                title="Guest List Manager"
                desc="Manage your RSVPs and guest dietary requirements in real-time."
                icon={<UsersGroupRounded size={20} weight="BoldDuotone" className="text-[#1863dc]" />}
              />
              <ModuleCard
                title="Budget Planner"
                desc="Track expenses and upcoming vendor payments automatically."
                icon={<Globus size={20} weight="BoldDuotone" className="text-emerald-500" />}
              />
              <ModuleCard
                title="Timeline & Calendar"
                desc="Coordinate your big day with a precision minute-by-minute schedule."
                icon={<Letter size={20} weight="BoldDuotone" className="text-amber-500" />}
              />
              <ModuleCard
                title="Vendor Directory"
                desc="Store contacts and contracts for all your booked wedding partners."
                icon={<ChatDots size={20} weight="BoldDuotone" className="text-purple-500" />}
              />
            </div>

            <button className="mt-8 flex items-center gap-2 text-[12px] font-medium text-neutral-400 hover:text-bold transition-all uppercase tracking-wider group">
              Show more modules
              <AltArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.section>

      </div>
    </motion.div>
  );
}

function DetailRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white hover:bg-neutral-50/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-neutral-400">
          {icon}
        </div>
        <span className="text-[13px] font-medium text-neutral-400">{label}</span>
      </div>
      <span className="text-[14px] font-normal text-bold">{value}</span>
    </div>
  );
}

function ModuleCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="group p-7 rounded-[32px] bg-white ring-1 ring-foreground/10 hover:ring-[#346739]/30 hover:shadow-2xl hover:shadow-[#346739]/5 transition-all duration-300 cursor-pointer flex flex-col gap-5">
      <div className="size-14 rounded-2xl bg-[#fafafa] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ring-1 ring-foreground/10">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-[16px] font-bold tracking-tight text-bold">{title}</h3>
        <p className="text-[13px] leading-relaxed text-neutral-500 line-clamp-3">{desc}</p>
      </div>
    </div>
  );
}
