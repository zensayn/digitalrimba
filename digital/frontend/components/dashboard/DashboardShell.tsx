"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  Home2,
  Letter,
  UsersGroupRounded,
  QrCode,
  Wallet,
  CalendarMark,
  Settings,
  Logout,
  Bell,
  Chart2,
  AltArrowRight,
  AltArrowDown,
  AddCircle,
  ChatDots,
} from '@solar-icons/react';
import { motion } from 'framer-motion';
import type { IconProps } from '@solar-icons/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type NavItem = {
  href: string;
  label: string;
  Icon: React.ForwardRefExoticComponent<Omit<IconProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
  badge?: string;
  hasAction?: boolean;
  detail?: string;
};

const navGroups: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [
      { href: '/dashboard', label: 'Overview', Icon: Home2, badge: 'BETA' },
      { href: '/dashboard/guests', label: 'Guests', Icon: UsersGroupRounded },
    ],
  },
  {
    label: 'PLANNING',
    items: [
      { href: '/dashboard/budget', label: 'Budget Tracker', Icon: Wallet },
      { href: '/dashboard/timeline', label: 'Event Timeline', Icon: CalendarMark },
    ],
  },
  {
    label: 'DESIGN',
    items: [
      { href: '/dashboard/invitations', label: 'Invitations', Icon: Letter },
      { href: '/dashboard/qr-passes', label: 'QR & Passes', Icon: QrCode },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { href: '/dashboard/checkin-qr', label: 'Check-in Console', Icon: Chart2 },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
    ],
  },
];

function isActive(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

function MobileSidebarBackHandler() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const name = session?.user.name ?? '';
  const displayName = name.split(' ')[0] || session?.user.email?.split('@')[0] || '…';
  const imageUrl = session?.user.image ?? null;

  const activeLabel =
    navGroups
      .flatMap(g => g.items)
      .find((item) => isActive(item.href, pathname))?.label ?? 'Dashboard';

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push('/') },
    });
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <MobileSidebarBackHandler />
        {/* ── Sidebar ── */}
        <Sidebar collapsible="icon" className="border-r border-neutral-200 bg-white [&_[data-slot=sidebar-inner]]:bg-white">
          <SidebarHeader className="px-4 group-data-[collapsible=icon]:px-2 py-6">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
              <span className="font-poppins font-bold text-2xl tracking-tighter text-black flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <span className="w-4 h-4 bg-black rounded-sm" />
                rimba
              </span>
              <SidebarTrigger className="h-8 w-8 text-neutral-400 hover:text-black" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            {navGroups.map((group, idx) => (
              <SidebarGroup key={idx} className="py-1">
                {group.label && (
                  <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold  text-neutral-400 group-data-[collapsible=icon]:hidden uppercase">
                    {group.label}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {group.items.map(({ href, label, Icon, badge, hasAction, detail }, i) => {
                      const active = isActive(href, pathname);
                      return (
                        <motion.div
                          key={href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.04,
                            duration: 0.35,
                            ease: [0.32, 0.72, 0, 1]
                          }}
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              tooltip={label}
                              className={`gap-3 h-10 rounded-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all duration-200 ${active
                                ? 'bg-[#346739]/10 text-[#346739] font-semibold'
                                : 'text-neutral-500 hover:text-[#346739] hover:bg-[#346739]/5'
                                }`}
                            >
                              <Link href={href} className="flex items-center w-full">
                                <Icon size={20} weight={active ? 'BoldDuotone' : 'Linear'} />
                                <span className="flex-1 group-data-[collapsible=icon]:hidden">{label}</span>
                                {badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#eff6ff] text-[#3b82f6] group-data-[collapsible=icon]:hidden uppercase">
                                    {badge}
                                  </span>
                                )}
                                {hasAction && (
                                  <AddCircle size={16} className="text-neutral-300 group-data-[collapsible=icon]:hidden" />
                                )}
                                {detail && (
                                  <span className="text-[11px] text-neutral-400 group-data-[collapsible=icon]:hidden font-medium">
                                    {detail}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </motion.div>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarRail />
        </Sidebar>

        {/* ── Main area ── */}
        <SidebarInset className="bg-white">
          <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 h-[72px] bg-white border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <div className="h-6 w-px bg-neutral-100 md:hidden" />
              <h1 className="text-xl md:text-2xl font-semibold text-black tracking-tight flex items-center gap-2">
                {activeLabel}
                <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#346739]/10 text-[#346739] uppercase">
                  BETA
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1.5 text-[12px] font-medium text-neutral-400 hover:text-black cursor-pointer group transition-colors">
                <Chart2 size={16} className="text-neutral-300 group-hover:text-black" />
                Get discovered
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 pl-2 border-l border-neutral-100">
                <button className="relative p-2 text-neutral-400 hover:text-black transition-colors">
                  <ChatDots size={22} weight="Linear" />
                </button>
                <button className="relative p-2 text-neutral-400 hover:text-black transition-colors mr-1">
                  <Bell size={22} weight="Linear" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    9+
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none focus:ring-2 focus:ring-[#346739]/20 rounded-full shrink-0 select-none cursor-pointer">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#edfce9] flex items-center justify-center text-xs font-semibold text-[#346739] border border-neutral-200">
                          {displayName[0]?.toUpperCase()}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-1 bg-white border border-neutral-200 shadow-lg">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2 w-full text-neutral-700 hover:text-black">
                        <Settings size={16} />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 border-t border-neutral-100" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    >
                      <Logout size={16} />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-neutral-50/30">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
