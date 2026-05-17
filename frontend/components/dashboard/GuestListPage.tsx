"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AddCircle,
  Magnifer,
  Filters,
  DownloadMinimalistic,
  MenuDots,
  User,
  Phone,
  Letter,
  MapPoint,
} from '@solar-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardUser } from './types';

type Guest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  group: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  plusOne: boolean;
  table: string;
};

const MOCK_GUESTS: Guest[] = [
  {
    id: '1',
    name: 'Ahmad Rizaldi',
    phone: '+62 812-3456-7890',
    email: 'ahmad@email.com',
    group: 'Family',
    rsvpStatus: 'confirmed',
    plusOne: true,
    table: 'A1',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    phone: '+62 813-9876-5432',
    email: 'siti@email.com',
    group: 'Friends',
    rsvpStatus: 'pending',
    plusOne: false,
    table: '-',
  },
  {
    id: '3',
    name: 'Budi Hartono',
    phone: '+62 821-1111-2222',
    email: 'budi@email.com',
    group: 'Colleagues',
    rsvpStatus: 'declined',
    plusOne: false,
    table: '-',
  },
  {
    id: '4',
    name: 'Dewi Anggraeni',
    phone: '+62 856-3333-4444',
    email: 'dewi@email.com',
    group: 'Family',
    rsvpStatus: 'confirmed',
    plusOne: true,
    table: 'A2',
  },
];

const GROUP_FILTERS = ['all', 'Family', 'Friends', 'Colleagues', 'VIP'];

function RsvpBadge({ status }: { status: Guest['rsvpStatus'] }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-[#22c55e]/12 text-[#22c55e]',
    pending: 'bg-clay-ochre/12 text-clay-ochre',
    declined: 'bg-[#ef4444]/12 text-[#ef4444]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase  ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function GuestListPage({ user }: { user: DashboardUser }) {
  const t = useTranslations('Dashboard');
  const [activeGroup, setActiveGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuests = MOCK_GUESTS.filter((guest) => {
    const matchGroup = activeGroup === 'all' || guest.group === activeGroup;
    const matchSearch =
      searchQuery === '' ||
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGroup && matchSearch;
  });

  const stats = {
    total: MOCK_GUESTS.length,
    confirmed: MOCK_GUESTS.filter((g) => g.rsvpStatus === 'confirmed').length,
    pending: MOCK_GUESTS.filter((g) => g.rsvpStatus === 'pending').length,
    declined: MOCK_GUESTS.filter((g) => g.rsvpStatus === 'declined').length,
  };

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins text-[40px] font-bold text-[#0a0a0a] tracking-tight leading-tight mb-1">
            {t('guestList')}
          </h1>
          <p className="font-poppins text-[16px] text-neutral-400">
            {t('guestListDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button variant="outline" size="sm" className="gap-2">
            <DownloadMinimalistic size={14} weight="Linear" />
            {t('export')}
          </Button>
          <Button size="sm" className="gap-2">
            <AddCircle size={14} weight="Bold" />
            {t('addGuest')}
          </Button>
        </div>
      </div>

      {/* Mini Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('totalLabel'), value: stats.total, color: 'bg-clay-teal' },
          { label: t('confirmedLabel'), value: stats.confirmed, color: 'bg-[#22c55e]' },
          { label: t('pendingLabel'), value: stats.pending, color: 'bg-clay-ochre' },
          { label: t('declinedLabel'), value: stats.declined, color: 'bg-[#ef4444]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-[12px] p-5 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <p className="font-poppins text-[11px] font-medium uppercase tracking-wider text-neutral-400">{label}</p>
            </div>
            <p className="font-poppins text-2xl font-bold text-[#0a0a0a]">{value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Magnifer size={14} weight="Linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-ink/30" />
          <Input
            placeholder={t('searchGuests')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-[44px] rounded-[12px] bg-white border-neutral-100 font-poppins text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {GROUP_FILTERS.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-3 py-1.5 rounded-full font-poppins text-[11px] font-medium transition-colors ${
                activeGroup === group
                  ? 'bg-clay-ink text-white'
                  : 'bg-clay-surface-card text-clay-ink/50 hover:text-clay-ink hover:bg-clay-surface-strong'
              }`}
            >
              {group === 'all' ? t('allGroups') : group}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-[32px] border border-neutral-100 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_140px_140px_80px_70px_60px] gap-4 px-6 py-3 border-b border-[#0a0a0a]/6 bg-clay-surface-strong/40">
          <span className="font-poppins text-[10px] uppercase  text-clay-ink/40">{t('guestName')}</span>
          <span className="font-poppins text-[10px] uppercase  text-clay-ink/40">{t('contact')}</span>
          <span className="font-poppins text-[10px] uppercase  text-clay-ink/40">{t('group')}</span>
          <span className="font-poppins text-[10px] uppercase  text-clay-ink/40">{t('rsvpLabel')}</span>
          <span className="font-poppins text-[10px] uppercase  text-clay-ink/40">{t('tableLabel')}</span>
          <span />
        </div>

        {/* Rows */}
        {filteredGuests.length > 0 ? (
          filteredGuests.map((guest, idx) => (
            <div
              key={guest.id}
              className={`grid grid-cols-1 md:grid-cols-[1fr_140px_140px_80px_70px_60px] gap-2 md:gap-4 px-6 py-4 items-center hover:bg-clay-surface-strong/20 transition-colors ${
                idx < filteredGuests.length - 1 ? 'border-b border-[#0a0a0a]/4' : ''
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-clay-ochre/15 flex items-center justify-center flex-shrink-0">
                  <span className="font-poppins text-xs font-semibold text-clay-ochre">
                    {guest.name[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-poppins text-sm font-medium text-clay-ink truncate">{guest.name}</p>
                  <p className="font-poppins text-[11px] text-clay-ink/40 truncate md:hidden">{guest.email}</p>
                </div>
              </div>

              {/* Contact - hidden on mobile (shown inline above) */}
              <div className="hidden md:block">
                <p className="font-poppins text-[11px] text-clay-ink/60 truncate">{guest.email}</p>
              </div>

              {/* Group */}
              <div>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-clay-surface-strong/60 font-poppins text-[10px] font-medium text-clay-ink/60">
                  {guest.group}
                </span>
              </div>

              {/* RSVP */}
              <div>
                <RsvpBadge status={guest.rsvpStatus} />
              </div>

              {/* Table */}
              <div>
                <span className="font-poppins text-xs text-clay-ink/50 font-medium">{guest.table}</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button className="w-7 h-7 rounded-full flex items-center justify-center text-clay-ink/30 hover:text-clay-ink hover:bg-clay-surface-strong transition-colors">
                  <MenuDots size={14} weight="Bold" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <User size={32} weight="Linear" className="text-clay-ink/15 mb-3" />
            <p className="font-poppins text-sm text-clay-ink/40">{t('noGuestsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
