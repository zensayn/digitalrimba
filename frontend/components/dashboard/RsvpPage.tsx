"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import {
  CheckCircle,
  ClockCircle,
  CloseCircle,
  ChatRoundDots,
  SendSquare,
  QrCode,
  UsersGroupRounded,
  Export,
  Magnifer,
  Letter,
} from "@solar-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TextureButton } from "@/components/ui/texture-button";

type RSVPStatus = "confirmed" | "pending" | "declined";
type Method = "whatsapp" | "web" | "qr";

type RsvpEntry = {
  id: string;
  name: string;
  status: RSVPStatus;
  attendees: number;
  method: Method;
  respondedAt: string | null;
  message: string;
  group: string;
};

const MOCK_RSVPS: RsvpEntry[] = [
  {
    id: "1", name: "Ahmad Rizaldi", status: "confirmed", attendees: 2,
    method: "whatsapp", respondedAt: "2026-05-08",
    message: "Terima kasih atas undangannya! Kami pasti hadir bersama keluarga.",
    group: "Family",
  },
  {
    id: "2", name: "Dewi Anggraeni", status: "confirmed", attendees: 2,
    method: "web", respondedAt: "2026-05-07",
    message: "InsyaAllah hadir bersama suami. Semoga acara lancar dan penuh berkah.",
    group: "Friends",
  },
  {
    id: "3", name: "Siti Nurhaliza", status: "pending", attendees: 0,
    method: "whatsapp", respondedAt: null,
    message: "",
    group: "Family",
  },
  {
    id: "4", name: "Budi Hartono", status: "declined", attendees: 0,
    method: "web", respondedAt: "2026-05-09",
    message: "Mohon maaf tidak bisa hadir. Selamat menempuh hidup baru!",
    group: "Colleagues",
  },
  {
    id: "5", name: "Rania Putri", status: "confirmed", attendees: 3,
    method: "qr", respondedAt: "2026-05-10",
    message: "Kami datang bertiga. Tidak sabar untuk merayakan bersama kalian!",
    group: "Friends",
  },
  {
    id: "6", name: "Muhammad Farhan", status: "confirmed", attendees: 1,
    method: "whatsapp", respondedAt: "2026-05-11",
    message: "Siap hadir! Sudah catat di kalender dari jauh-jauh hari.",
    group: "Colleagues",
  },
  {
    id: "7", name: "Indira Sari", status: "pending", attendees: 0,
    method: "whatsapp", respondedAt: null,
    message: "",
    group: "Family",
  },
  {
    id: "8", name: "Hendra Wijaya", status: "declined", attendees: 0,
    method: "web", respondedAt: "2026-05-06",
    message: "Maaf, ada acara keluarga besar yang sudah terjadwal sejak lama.",
    group: "Colleagues",
  },
  {
    id: "9", name: "Layla Amira", status: "confirmed", attendees: 2,
    method: "web", respondedAt: "2026-05-12",
    message: "So excited for you both! We will be there without a doubt.",
    group: "Friends",
  },
  {
    id: "10", name: "Rizky Prasetyo", status: "confirmed", attendees: 4,
    method: "whatsapp", respondedAt: "2026-05-05",
    message: "Sekeluarga hadir! Empat orang total ya, sudah siapkan baju.",
    group: "Family",
  },
  {
    id: "11", name: "Cantika Novita", status: "pending", attendees: 0,
    method: "whatsapp", respondedAt: null,
    message: "",
    group: "Friends",
  },
  {
    id: "12", name: "Dito Kusuma", status: "confirmed", attendees: 1,
    method: "qr", respondedAt: "2026-05-13",
    message: "Hadir! Sendirian tapi semangat merayakan hari spesial kalian.",
    group: "Colleagues",
  },
];

const STATUS_CONFIG: Record<RSVPStatus, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  confirmed: { label: "Confirmed", bg: "bg-[#edfce9]", text: "text-[#2d6a30]", Icon: CheckCircle },
  pending:   { label: "Awaiting",  bg: "bg-[#f1f5ff]", text: "text-[#1863dc]", Icon: ClockCircle },
  declined:  { label: "Declined",  bg: "bg-[#fff8f7]", text: "text-[#b30000]", Icon: CloseCircle },
};

const METHOD_CONFIG: Record<Method, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  whatsapp: { label: "WhatsApp", bg: "bg-[#edfce9]", text: "text-[#2d6a30]", Icon: ChatRoundDots },
  web:      { label: "Web Form", bg: "bg-[#f1f5ff]", text: "text-[#1863dc]", Icon: SendSquare },
  qr:       { label: "QR Scan",  bg: "bg-[#f5f5f5]", text: "text-[#75758a]", Icon: QrCode },
};

const FILTERS: Array<{ id: RSVPStatus | "all"; label: string }> = [
  { id: "all",       label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending",   label: "Pending" },
  { id: "declined",  label: "Declined" },
];

const TABLE_COLS = ["Guest", "Method", "Message", "Attending", "Date", "Status"];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

type IconProps = { size?: number; weight?: string; className?: string };

export default function RsvpPage() {
  const [activeFilter, setActiveFilter] = useState<RSVPStatus | "all">("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showMessages, setShowMessages] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_RSVPS.filter((r) => {
      const matchesFilter = activeFilter === "all" || r.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const withMessages = useMemo(
    () => MOCK_RSVPS.filter((r) => r.message.trim() !== "")
      .sort((a, b) => (b.respondedAt ?? "").localeCompare(a.respondedAt ?? "")),
    [],
  );

  const confirmed      = MOCK_RSVPS.filter((r) => r.status === "confirmed");
  const pending        = MOCK_RSVPS.filter((r) => r.status === "pending");
  const declined       = MOCK_RSVPS.filter((r) => r.status === "declined");
  const totalAttendees = confirmed.reduce((s, r) => s + r.attendees, 0);
  const responseRate   = Math.round(((confirmed.length + declined.length) / MOCK_RSVPS.length) * 100);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-white"
    >
      {/* ── METRICS STRIP ── */}
      <motion.div
        variants={sectionVariants}
        className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 md:pt-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 border border-neutral-100 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-100">
          {[
            { label: "TOTAL INVITED",  value: MOCK_RSVPS.length, sub: "guests on list" },
            { label: "CONFIRMED",       value: confirmed.length,   sub: `${totalAttendees} attending` },
            { label: "AWAITING REPLY",  value: pending.length,     sub: "not responded" },
            { label: "DECLINED",        value: declined.length,    sub: "can't make it" },
            { label: "RESPONSE RATE",   value: `${responseRate}%`, sub: "of total invited" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col gap-1 px-5 py-4 md:py-5">
              <span className="text-[9px] font-bold uppercase text-neutral-400">{m.label}</span>
              <span className="text-2xl md:text-3xl font-bold text-bold leading-none mt-1">{m.value}</span>
              <span className="text-[11px] text-neutral-400 mt-0.5">{m.sub}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── TOOLBAR ── */}
      <motion.div
        variants={sectionVariants}
        className="max-w-[1400px] mx-auto px-4 md:px-8 mt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        {/* Left: search + filter pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72 group">
            <Magnifer
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors"
            />
            <Input
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-4 rounded-full bg-white ring-1 ring-foreground/10 focus:ring-primary/20 transition-all text-[13px]"
            />
          </div>

          {/* Filter pills with sliding active background */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-full">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              const count = f.id === "all" ? MOCK_RSVPS.length : MOCK_RSVPS.filter((r) => r.status === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-150 z-10",
                    isActive ? "text-white" : "text-neutral-500 hover:text-bold",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="rsvp-pill-bg"
                      className="absolute inset-0 bg-[#212121] rounded-full"
                      transition={{ type: "spring", duration: 0.35, bounce: 0.08 }}
                    />
                  )}
                  <span className="relative z-10">
                    {f.label}
                    <span className={cn("ml-1.5 text-[10px] font-bold", isActive ? "opacity-50" : "opacity-40")}>
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Export + Messages toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <TextureButton
            variant="outline"
            size="sm"
            className="h-10 rounded-full px-4 text-[13px] font-medium gap-1.5"
          >
            <Export size={14} weight="BoldDuotone" />
            Export
          </TextureButton>

          <TextureButton
            variant={showMessages ? "primary" : "outline"}
            size="sm"
            className="h-10 rounded-full px-4 text-[13px] font-medium gap-1.5"
            onClick={() => setShowMessages((v) => !v)}
          >
            <Letter size={14} weight={showMessages ? "Bold" : "Linear"} />
            Messages
            <span className="text-[10px] font-bold opacity-60">{withMessages.length}</span>
          </TextureButton>
        </div>
      </motion.div>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait" initial={false}>
        {showMessages ? (
          /* ── MESSAGES FEED ── */
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="max-w-[1400px] mx-auto px-4 md:px-8 mt-8"
          >
            {/* column header row */}
            <div className="grid grid-cols-[1fr_120px] gap-4 h-12 items-center border-b border-neutral-100">
              <span className="text-[13px] font-medium text-neutral-500">Guest</span>
              <span className="text-[13px] font-medium text-neutral-500 text-right">Date</span>
            </div>

            {withMessages.map((rsvp, idx) => {
              const statusCfg = STATUS_CONFIG[rsvp.status];
              const StatusIcon = statusCfg.Icon as React.ComponentType<IconProps>;
              return (
                <motion.div
                  key={rsvp.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT, delay: idx * 0.03 }}
                  className="group py-5 border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors duration-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: avatar + name + status */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="size-8 rounded-full bg-[#edfce9] flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-[#346739] mt-0.5">
                        {rsvp.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-[14px] font-semibold text-bold leading-snug">{rsvp.name}</span>
                          <span className="text-[11px] text-neutral-400">{rsvp.group}</span>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                            statusCfg.bg, statusCfg.text,
                          )}>
                            <StatusIcon size={10} weight="Bold" />
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-600 leading-relaxed mt-1.5">
                          &ldquo;{rsvp.message}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Right: date */}
                    <span className="text-[12px] text-neutral-400 flex-shrink-0 mt-1">
                      {rsvp.respondedAt
                        ? new Date(rsvp.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "—"}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {withMessages.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[13px] text-neutral-400">No messages received yet.</p>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── RESPONSES TABLE ── */
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="max-w-[1400px] mx-auto px-4 md:px-8 mt-8"
          >
            {/* Column headers — matches GuestManager style */}
            <div className="hidden md:grid grid-cols-[1fr_140px_minmax(0,1fr)_80px_100px_110px] gap-4 h-12 items-center border-b border-neutral-100">
              {TABLE_COLS.map((col) => (
                <span key={col} className="text-[13px] font-medium text-neutral-500">{col}</span>
              ))}
            </div>

            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((rsvp, idx) => {
                const statusCfg = STATUS_CONFIG[rsvp.status];
                const methodCfg = METHOD_CONFIG[rsvp.method];
                const StatusIcon = statusCfg.Icon as React.ComponentType<IconProps>;
                const MethodIcon = methodCfg.Icon as React.ComponentType<IconProps>;

                return (
                  <motion.div
                    key={rsvp.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE_OUT, delay: idx * 0.025 }}
                    className="group flex flex-col md:grid md:grid-cols-[1fr_140px_minmax(0,1fr)_80px_100px_110px] md:items-center gap-2 md:gap-4 py-4 border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors duration-100"
                  >
                    {/* Guest */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-full bg-[#edfce9] flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-[#346739]">
                        {rsvp.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-bold leading-snug truncate">{rsvp.name}</p>
                        <p className="text-[11px] text-neutral-400">{rsvp.group}</p>
                      </div>
                    </div>

                    {/* Method */}
                    <div>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
                        methodCfg.bg, methodCfg.text,
                      )}>
                        <MethodIcon size={11} weight="Bold" />
                        {methodCfg.label}
                      </span>
                    </div>

                    {/* Message — truncated in table view */}
                    <div className="hidden md:block min-w-0">
                      {rsvp.message
                        ? <p className="text-[12px] text-neutral-500 italic truncate">&ldquo;{rsvp.message}&rdquo;</p>
                        : <span className="text-[12px] text-neutral-300">—</span>
                      }
                    </div>

                    {/* Attending */}
                    <div className="hidden md:flex items-center gap-1">
                      {rsvp.status === "confirmed" && rsvp.attendees > 0 ? (
                        <>
                          <UsersGroupRounded size={13} className="text-neutral-400" weight="BoldDuotone" />
                          <span className="text-[13px] font-semibold text-bold">{rsvp.attendees}</span>
                        </>
                      ) : (
                        <span className="text-[12px] text-neutral-300">—</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="hidden md:block">
                      <span className="text-[12px] text-neutral-400">
                        {rsvp.respondedAt
                          ? new Date(rsvp.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                          : <span className="text-neutral-300">Pending</span>
                        }
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
                        statusCfg.bg, statusCfg.text,
                      )}>
                        <StatusIcon size={11} weight="Bold" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[13px] text-neutral-400">No responses match your search or filter.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10 pb-16">
        <p className="text-[11px] text-neutral-300 text-center">
          Mock data — live RSVP responses will appear here once messaging is connected
        </p>
      </div>
    </motion.div>
  );
}
