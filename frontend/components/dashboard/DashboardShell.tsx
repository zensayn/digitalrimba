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
  Widget,
  UserCircle,
  Chart2,
  Compass,
  Notes,
  AltArrowRight,
  AltArrowDown,
  AddCircle,
  ChatDots,
} from '@solar-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TextureButton } from '@/components/ui/texture-button';

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
      { href: '/dashboard/invitation', label: 'Invitations', Icon: Letter },
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
    label: 'SYSTEM',
    items: [
      { href: '/dashboard/checkin-qr', label: 'Check-in QR', Icon: QrCode },
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
          <SidebarHeader className="px-4 group-data-[collapsible=icon]:px-2 py-6 space-y-6">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
              <span className="font-poppins font-bold text-2xl tracking-tighter text-black flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <span className="w-4 h-4 bg-black rounded-sm" />
                rimba
              </span>
              <SidebarTrigger className="h-8 w-8 text-neutral-400 hover:text-black" />
            </div>

            {/* Workspace Switcher */}
            <div className="flex items-center gap-3 p-2 rounded-[22px] ring-1 ring-foreground/10 hover:bg-neutral-50 transition-all cursor-pointer group
                            group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={displayName}
                  className="w-10 h-10 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6 rounded-full object-cover shrink-0 aspect-square transition-all"
                />
              ) : (
                <div className="w-10 h-10 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold shrink-0 aspect-square transition-all">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-[13px] font-semibold text-black truncate leading-tight">
                  Independent workspace
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {displayName}
                </p>
              </div>
              <AltArrowRight size={16} className="text-neutral-300 group-data-[collapsible=icon]:hidden" />
              <AltArrowDown size={14} className="hidden group-data-[collapsible=icon]:block text-neutral-400" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            {navGroups.map((group, idx) => (
              <SidebarGroup key={idx}>
                {group.label && (
                  <SidebarGroupLabel className="px-2 mb-1 text-[10px] font-bold  text-neutral-400 group-data-[collapsible=icon]:hidden uppercase">
                    {group.label}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
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

          <SidebarFooter className="p-4 pt-2">
            <SidebarMenu className="mt-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  tooltip="Sign out"
                  className="gap-3 h-10 rounded-full px-4 text-[13px] text-neutral-400 hover:text-red-600 hover:bg-red-50 focus:text-neutral-400 focus:bg-transparent group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all duration-100"
                >
                  <Logout size={20} weight="Linear" />
                  <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
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
                <button className="relative p-2 text-neutral-400 hover:text-black transition-colors">
                  <Bell size={22} weight="Linear" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    9+
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-neutral-50/30">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
