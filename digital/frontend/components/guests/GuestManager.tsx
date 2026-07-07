"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  UsersGroupRounded,
  ChatDots,
  AddCircle,
  Import,
  Export,
  Magnifer,
  TrashBinMinimalistic,
  AltArrowDown,
  CheckCircle,
  ClockCircle,
  CloseCircle,
  Pen,
  UsersGroupTwoRounded,
  Star,
  User,
  Box,
  ChatRoundDots,
  SendSquare,
  QrCode,
  Letter,
} from "@solar-icons/react";
import { motion, AnimatePresence, Variants } from "motion/react";

import { CsvImportModal } from "./CsvImportModal";
import { GuestEmptyState } from "./GuestEmptyState";
import type { Guest, GuestTag, RSVPStatus } from "./types";
import {
  fetchGuests,
  deleteGuests,
  updateGuestTag,
  importGuests,
} from "@/lib/api/guests";
import { resolveGuestTableData } from "./table-state";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TextureButton } from "@/components/ui/texture-button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { Counter } from "@/components/ui/counter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

const TAGS: GuestTag[] = ["family", "vip", "friend", "vendor"];
const TAG_ICONS: Record<GuestTag, React.ReactNode> = {
  family: <UsersGroupTwoRounded size={14} weight="BoldDuotone" />,
  vip: <Star size={14} weight="BoldDuotone" />,
  friend: <User size={14} weight="BoldDuotone" />,
  vendor: <Box size={14} weight="BoldDuotone" />
};
const RSVP_FILTERS: Array<{ id: RSVPStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Pending" },
  { id: "declined", label: "Declined" },
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

type MethodCfg = { label: string; bg: string; text: string; Icon: React.ElementType };
const METHOD_CONFIG: Record<string, MethodCfg> = {
  whatsapp: { label: "WhatsApp", bg: "bg-[#edfce9]", text: "text-[#2d6a30]", Icon: ChatRoundDots },
  web: { label: "Web Form", bg: "bg-[#f1f5ff]", text: "text-[#1863dc]", Icon: SendSquare },
  qr: { label: "QR Scan", bg: "bg-[#f5f5f5]", text: "text-[#75758a]", Icon: QrCode },
};
const FALLBACK_METHOD: MethodCfg = { label: "—", bg: "bg-neutral-100", text: "text-neutral-400", Icon: SendSquare };

function RSVPSegment({
  active,
  onChange,
  stats
}: {
  active: RSVPStatus | "all",
  onChange: (id: RSVPStatus | "all") => void,
  stats: Record<string, number>
}) {
  return (
    <div className="flex items-center gap-1 bg-neutral-100/50 p-1 rounded-full w-full sm:w-auto overflow-x-auto no-scrollbar">
      {RSVP_FILTERS.map(f => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={cn(
              "relative px-4 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
              isActive ? "bg-[#1a1a1a] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            {f.label}
            <span className={cn(
              "text-[11px] font-bold",
              isActive ? "text-white/60" : "text-neutral-300"
            )}>
              {stats[f.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

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

export function GuestManager() {
  const qc = useQueryClient();
  const [hasMounted, setHasMounted] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<GuestTag | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
  }>({ isOpen: false, ids: [] });
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const transition = {
    duration: 0.45,
    ease: [0.32, 0.72, 0, 1] as const
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition }
  };

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: fetchGuests,
  });



  const allGuests = resolveGuestTableData(data);

  const stats = useMemo(() => {
    return {
      all: allGuests.length,
      confirmed: allGuests.filter(g => g.rsvpStatus === "confirmed").length,
      pending: allGuests.filter(g => g.rsvpStatus === "pending").length,
      declined: allGuests.filter(g => g.rsvpStatus === "declined").length,
    };
  }, [allGuests]);

  const confirmedGuests = useMemo(() => allGuests.filter(g => g.rsvpStatus === "confirmed"), [allGuests]);
  const pendingGuests = useMemo(() => allGuests.filter(g => g.rsvpStatus === "pending"), [allGuests]);
  const declinedGuests = useMemo(() => allGuests.filter(g => g.rsvpStatus === "declined"), [allGuests]);
  const totalAttendees = useMemo(() => confirmedGuests.reduce((s, g) => s + g.partySize, 0), [confirmedGuests]);
  const responseRate = allGuests.length > 0
    ? Math.round(((confirmedGuests.length + declinedGuests.length) / allGuests.length) * 100)
    : 0;
  // Premium filtering logic
  const filteredGuests = useMemo(() => {
    return allGuests.filter((guest) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        guest.name.toLowerCase().includes(q) ||
        guest.email.toLowerCase().includes(q) ||
        guest.tag.toLowerCase().includes(q) ||
        guest.notes.toLowerCase().includes(q);

      const matchesTag = tagFilter === "all" || guest.tag === tagFilter;
      const matchesRSVP = rsvpFilter === "all" || guest.rsvpStatus === rsvpFilter;

      return matchesSearch && matchesTag && matchesRSVP;
    });
  }, [allGuests, searchQuery, tagFilter, rsvpFilter]);

  const withMessages = useMemo(
    () => filteredGuests.filter(g => g.notes.trim() !== "").sort((a, b) => b.respondedAt.localeCompare(a.respondedAt)),
    [filteredGuests],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteGuests,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guests"] });
      setRowSelection({});
    },
  });

  const tagMutation = useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: GuestTag }) =>
      updateGuestTag(id, tag),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  });

  const importMutation = useMutation({
    mutationFn: importGuests,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["guests"] }),
  });

  const columns = useMemo<ColumnDef<Guest>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-1">
            <Checkbox
              size="sm"
              checked={
                table.getIsAllRowsSelected() ||
                (table.getIsSomeRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <Checkbox
              size="sm"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-bold transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <AltArrowDown
              size={12}
              className={cn(
                "text-neutral-300 transition-transform duration-200",
                column.getIsSorted() === "asc" && "rotate-180 text-bold"
              )}
              weight="BoldDuotone"
            />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col py-1">
            <span className="text-[14px] font-medium text-bold leading-tight">{row.original.name}</span>
            <span className="text-[12px] font-regular text-neutral-400">{row.original.email || row.original.phone}</span>
          </div>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        enableSorting: false,
        cell: ({ row }) => {
          const cfg = METHOD_CONFIG[row.original.method] ?? FALLBACK_METHOD;
          const Icon = cfg.Icon as React.ComponentType<{ size?: number; weight?: string }>;
          return (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", cfg.bg, cfg.text)}>
              <Icon size={11} weight="Bold" />
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Message",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.notes ? (
            <p className="text-[12px] text-neutral-500 italic truncate max-w-[200px]">
              &ldquo;{row.original.notes}&rdquo;
            </p>
          ) : (
            <span className="text-[12px] text-neutral-300">—</span>
          ),
      },
      {
        accessorKey: "partySize",
        header: "Attending",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.rsvpStatus === "confirmed" ? (
            <div className="flex items-center gap-1">
              <UsersGroupRounded size={13} className="text-neutral-400" weight="BoldDuotone" />
              <span className="text-[13px] font-semibold text-bold">{row.original.partySize}</span>
            </div>
          ) : (
            <span className="text-[12px] text-neutral-300">—</span>
          ),
      },
      {
        accessorKey: "respondedAt",
        header: "Date",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.respondedAt ? (
            <span className="text-[12px] text-neutral-400">
              {new Date(row.original.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          ) : (
            <span className="text-[12px] text-neutral-300">Pending</span>
          ),
      },
      {
        accessorKey: "rsvpStatus",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.rsvpStatus} />,
      },
      {
        accessorKey: "tag",
        header: "Group",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white ring-1 ring-black/5 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                <span className="text-neutral-400">
                  {TAG_ICONS[row.original.tag]}
                </span>
                {row.original.tag.charAt(0).toUpperCase() + row.original.tag.slice(1)}
                <AltArrowDown size={12} className="text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl ring-1 ring-black/5">
              {TAGS.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => tagMutation.mutate({ id: row.original.id, tag })}
                  className="text-[12px] font-semibold gap-2"
                >
                  <span className="text-neutral-400">
                    {TAG_ICONS[tag]}
                  </span>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-bold">
                  <Pen size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl ring-1 ring-foreground/10">
                <DropdownMenuItem className="text-[12px] font-semibold gap-2">
                  <Pen size={14} className="text-neutral-400" weight="BoldDuotone" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-[12px] font-semibold text-red-500 focus:text-red-500 focus:bg-red-50 gap-2"
                  onClick={() => handleOpenDeleteModal([row.original.id])}
                >
                  <TrashBinMinimalistic size={14} className="text-red-500" weight="BoldDuotone" />
                  Delete Guest
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [tagMutation, deleteMutation]
  );

  const table = useReactTable({
    data: filteredGuests,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  function handleOpenDeleteModal(ids: string[]) {
    setDeleteModal({ isOpen: true, ids });
  }

  async function handleConfirmDelete() {
    await deleteMutation.mutateAsync(deleteModal.ids);
    setDeleteModal({ isOpen: false, ids: [] });
    if (deleteModal.ids.length > 1) {
      setRowSelection({});
    }
  }

  async function handleBulkDelete() {
    handleOpenDeleteModal(selectedIds);
  }

  async function handleImport(file: File) {
    await importMutation.mutateAsync(file);
    setIsImportOpen(false);
  }

  if (!hasMounted) return null;

  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex-1 w-full bg-white min-h-screen pb-32"
    >
      <div className="max-w-[1400px] mx-auto pt-8 md:pt-12 px-4 md:px-8">

        {/* ── METRICS STRIP (real data) ── */}
        <motion.div variants={itemVariants} className="mb-7">
          <div className="grid grid-cols-2 md:grid-cols-5 border border-neutral-100 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            {[
              { label: "TOTAL INVITED", value: allGuests.length, sub: "guests on list" },
              { label: "CONFIRMED", value: confirmedGuests.length, sub: `${totalAttendees} attending` },
              { label: "AWAITING REPLY", value: pendingGuests.length, sub: "not responded" },
              { label: "DECLINED", value: declinedGuests.length, sub: "can't make it" },
              { label: "RESPONSE RATE", value: `${responseRate}%`, sub: "of total invited" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col gap-1 px-5 py-4 md:py-5">
                <span className="text-[9px] font-bold uppercase text-neutral-400">{m.label}</span>
                <span className="text-2xl md:text-3xl font-bold text-bold leading-none mt-1">{m.value}</span>
                <span className="text-[11px] text-neutral-400 mt-0.5">{m.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>
        {/* ── TOOLBAR SECTION ── */}
        <motion.div variants={itemVariants} className="space-y-6 mb-10">
          {/* Row 1: Search (Full Width) */}
          <div className="relative w-full group">
            <Magnifer
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors"
            />
            <Input
              placeholder="Search guests by name or phone..."
              className="h-12 pl-12 pr-4 rounded-2xl bg-white ring-1 ring-foreground/10 focus:border-primary focus:ring-primary/5 transition-all text-[14px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Row 2: RSVP Segment (Scrollable) */}
          <div className="flex items-center justify-between gap-4">
            <RSVPSegment active={rsvpFilter} onChange={setRsvpFilter} stats={stats} />
          </div>

          {/* Row 3: Secondary Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-11 px-5 rounded-full bg-white border border-neutral-200 flex items-center justify-between gap-2 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-all w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <UsersGroupRounded size={18} className="text-neutral-400" weight="BoldDuotone" />
                      {tagFilter === "all" ? "All Groups" : tagFilter.charAt(0).toUpperCase() + tagFilter.slice(1)}
                    </div>
                    <AltArrowDown size={14} className="text-neutral-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-2xl ring-1 ring-black/5 min-w-[200px] p-2">
                  <DropdownMenuItem onClick={() => setTagFilter("all")} className="rounded-xl h-10 px-3 text-[13px] font-medium gap-2">
                    <span className="text-neutral-400"><UsersGroupRounded size={14} weight="BoldDuotone" /></span>
                    All Groups
                  </DropdownMenuItem>
                  {TAGS.map(t => (
                    <DropdownMenuItem key={t} onClick={() => setTagFilter(t)} className="rounded-xl h-10 px-3 text-[13px] font-medium gap-2">
                      <span className="text-neutral-400">{TAG_ICONS[t]}</span>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <TextureButton
                variant="outline"
                size="sm"
                className="h-11 rounded-full px-5 text-[13px] font-semibold gap-2 flex-1 sm:flex-initial"
              >
                <Export size={18} weight="BoldDuotone" />
                Export
              </TextureButton>
              <TextureButton
                variant={showMessages ? "primary" : "outline"}
                size="sm"
                className="h-11 rounded-full px-5 text-[13px] font-semibold gap-2 flex-1 sm:flex-initial"
                onClick={() => setShowMessages(v => !v)}
              >
                <Letter size={18} weight={showMessages ? "Bold" : "Linear"} />
                Messages
                <span className="text-[11px] font-bold opacity-60 ml-0.5">{withMessages.length}</span>
              </TextureButton>
            </div>
          </div>
        </motion.div>

        {/* ── BULK ACTIONS BAR ── */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40, x: "-50%", scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: 40, x: "-50%", scale: 0.9 }}
              className="fixed bottom-6 left-1/2 z-[100] w-full max-w-2xl px-4 pointer-events-none"
            >
              <div className="bg-white/95 text-bold px-2 py-1.5 md:px-4 md:py-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-between ring-1 ring-black/5 backdrop-blur-xl pointer-events-auto">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center justify-center size-7 ring ring-foreground/10 rounded-full text-bold text-[11px] font-bold overflow-hidden">
                    <Counter value={selectedIds.length} fontSize={11} gap={0} horizontalPadding={0} gradientHeight={0} fontWeight={700} />
                  </div>
                  <div className="flex flex-col -space-y-0.5">
                    <span className="text-[12px] md:text-[13px] font-bold tracking-tight text-bold">Selected</span>
                    <span className="text-[10px] font-medium text-neutral-400 hidden md:block">Bulk Actions</span>
                  </div>
                  <div className="w-px h-5 bg-neutral-100 mx-1 md:mx-2" />
                  <div className="flex items-center gap-0.5">
                    <TextureButton variant="minimal" size="sm" className="h-8 rounded-full px-2 md:px-3 text-[12px]">
                      <span className="hidden md:inline">Export</span>
                      <Export className="md:hidden" size={18} weight="BoldDuotone" />
                    </TextureButton>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TextureButton
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-none shadow-none text-neutral-400 hover:text-bold px-2 md:px-3 text-[12px]"
                    onClick={() => setRowSelection({})}
                  >
                    <span className="hidden md:inline">Cancel</span>
                    <span className="md:hidden">Cancel</span>
                  </TextureButton>
                  <TextureButton
                    variant="destructive"
                    size="sm"
                    className="h-8 rounded-full px-3 md:px-4"
                    onClick={handleBulkDelete}
                  >
                    <TrashBinMinimalistic size={14} weight="BoldDuotone" className="md:mr-1.5" />
                    <span className="hidden md:inline">Delete</span>
                  </TextureButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTENT: table or messages view ── */}
        <AnimatePresence mode="wait">
          {showMessages ? (
            /* ── MESSAGES FEED ── */
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 12, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(12px)", transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{
                duration: 0.35,
                ease: EASE_OUT,
              }}
              className="mt-8"
            >
              <div className="grid grid-cols-[1fr_120px] gap-4 h-12 items-center border-b border-neutral-100 mb-0">
                <span className="text-[13px] font-medium text-neutral-500">Guest</span>
                <span className="text-[13px] font-medium text-neutral-500 text-right">Date</span>
              </div>
              {withMessages.map((g, idx) => {
                const statusCfg = {
                  confirmed: { label: "Confirmed", bg: "bg-[#edfce9]", text: "text-[#2d6a30]", Icon: CheckCircle },
                  pending: { label: "Awaiting", bg: "bg-[#f1f5ff]", text: "text-[#1863dc]", Icon: ClockCircle },
                  declined: { label: "Declined", bg: "bg-[#fff8f7]", text: "text-[#b30000]", Icon: CloseCircle },
                }[g.rsvpStatus] ?? { label: "Awaiting", bg: "bg-[#f1f5ff]", text: "text-[#1863dc]", Icon: ClockCircle };
                const StatusIcon = statusCfg.Icon as React.ComponentType<{ size?: number; weight?: string }>;
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.35, ease: EASE_OUT, delay: idx * 0.015 }}
                    className="group py-5 border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="size-8 rounded-full bg-[#edfce9] flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-[#346739] mt-0.5">
                          {g.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-[14px] font-semibold text-bold">{g.name}</span>
                            <span className="text-[11px] text-neutral-400">{g.tag.charAt(0).toUpperCase() + g.tag.slice(1)}</span>
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", statusCfg.bg, statusCfg.text)}>
                              <StatusIcon size={10} weight="Bold" />
                              {statusCfg.label}
                            </span>
                          </div>
                          <p className="text-[13px] text-neutral-600 leading-relaxed mt-1.5">
                            &ldquo;{g.notes}&rdquo;
                          </p>
                        </div>
                      </div>
                      <span className="text-[12px] text-neutral-400 flex-shrink-0 mt-1">
                        {g.respondedAt
                          ? new Date(g.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
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
            /* ── TABLE VIEW ── */
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 12, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(12px)", transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{
                duration: 0.35,
                ease: EASE_OUT,
              }}
              className="mt-8 -mx-4 md:mx-0 overflow-x-auto scrollbar-hide"
            >
              <div className="min-w-[900px] md:min-w-full px-4 md:px-0">
                {isLoading ? (
                  <div className="py-32 text-center space-y-4">
                    <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-[11px] font-bold text-neutral-400 uppercase">Loading database...</p>
                  </div>
                ) : filteredGuests.length === 0 ? (
                  <div className="py-32 text-center flex flex-col items-center">
                    <div className="size-16 rounded-full bg-neutral-50 flex items-center justify-center mb-6 ring-1 ring-black/5">
                      <UsersGroupRounded size={32} className="text-neutral-200" />
                    </div>
                    <h3 className="text-xl font-bold text-bold mb-2">No guests found</h3>
                    <p className="text-neutral-400 text-sm max-w-xs mx-auto mb-8">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-transparent border-b border-neutral-100">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-neutral-100">
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="h-12 px-0 text-[13px] font-medium text-neutral-500">
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {table.getRowModel().rows.map((row, idx) => (
                          <motion.tr
                            key={row.id}
                            layout="position"
                            initial={{ opacity: 0, y: 12, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.99 }}
                            transition={{ duration: 0.35, ease: EASE_OUT, delay: idx * 0.015 }}
                            data-state={row.getIsSelected() ? "selected" : undefined}
                            className={cn(
                              "group border-b border-neutral-100 transition-colors",
                              row.getIsSelected() ? "bg-primary/[0.02]" : "hover:bg-neutral-50/50"
                            )}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-0 py-5 align-middle">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CsvImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onConfirm={handleImport}
      />
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        count={deleteModal.ids.length}
        isLoading={deleteMutation.isPending}
      />
    </motion.main>
  );
}

function StatusBadge({ status }: { status: RSVPStatus }) {
  const configs = {
    confirmed: {
      label: "Confirmed",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      icon: <CheckCircle size={12} weight="Bold" />
    },
    pending: {
      label: "Pending",
      text: "text-amber-700",
      bg: "bg-amber-50",
      icon: <ClockCircle size={12} weight="Bold" />
    },
    declined: {
      label: "Declined",
      text: "text-red-700",
      bg: "bg-red-50",
      icon: <CloseCircle size={12} weight="Bold" />
    }
  };

  const config = configs[status] || configs.pending;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-medium", config.bg, config.text)}>
      {config.label}
    </div>
  );
}
