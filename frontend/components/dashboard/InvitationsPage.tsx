"use client";

import { useTranslations } from 'next-intl';
import { AddCircle, Eye, LinkMinimalistic, MenuDots, Magnifer } from '@solar-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardUser } from './types';

const MOCK_INVITATIONS = [
  {
    id: '1',
    name: 'Heartwood Elegance',
  tier: 'Heartwood',
    tierColor: 'bg-clay-ochre',
    status: 'draft',
    guests: 0,
    views: 0,
    createdAt: '2026-05-08',
  },
  {
    id: '2',
    name: 'Timber Classic',
    tier: 'Timber',
    tierColor: 'bg-clay-teal',
    status: 'draft',
    guests: 0,
    views: 0,
    createdAt: '2026-05-09',
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-clay-surface-strong text-clay-ink/60',
    published: 'bg-clay-teal/15 text-clay-teal',
    archived: 'bg-clay-ink/10 text-clay-ink/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase  ${colors[status] ?? colors.draft}`}
    >
      {status}
    </span>
  );
}

function TierBadge({ tier, color }: { tier: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase  ${color}/15 text-clay-ink/70`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {tier}
    </span>
  );
}

export default function InvitationsPage({ user }: { user: DashboardUser }) {
  const t = useTranslations('Dashboard');

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-amoria text-3xl md:text-4xl text-clay-ink tracking-tight mb-1">
            {t('invitations')}
          </h1>
          <p className="font-poppins text-sm text-clay-ink/40">
            {t('invitationsDesc')}
          </p>
        </div>
        <Button size="sm" className="gap-2 self-start">
          <AddCircle size={14} weight="Bold" />
          {t('newInvitation')}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Magnifer size={14} weight="Linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-ink/30" />
          <Input
            placeholder={t('searchInvitations')}
            className="pl-9 h-[40px] rounded-[12px] bg-clay-surface-card border-[#0a0a0a]/8 font-poppins text-sm"
          />
        </div>
        {/* Tier filter pills */}
        <div className="hidden md:flex items-center gap-2">
          {['all', 'Leaf', 'Timber', 'Heartwood'].map((tier) => (
            <button
              key={tier}
              className={`px-3 py-1.5 rounded-full font-poppins text-[11px] font-medium transition-colors ${
                tier === 'all'
                  ? 'bg-clay-ink text-white'
                  : 'bg-clay-surface-card text-clay-ink/50 hover:text-clay-ink hover:bg-clay-surface-strong'
              }`}
            >
              {tier === 'all' ? t('allTiers') : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations Grid */}
      {MOCK_INVITATIONS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MOCK_INVITATIONS.map((inv) => (
            <div
              key={inv.id}
              className="bg-clay-surface-card rounded-[24px] border border-[#0a0a0a]/8 overflow-hidden group hover:border-clay-teal/20 transition-all"
            >
              {/* Preview area */}
              <div className={`h-32 ${inv.tierColor}/10 flex items-center justify-center relative`}>
                <span className="font-amoria text-2xl text-clay-ink/15 tracking-tight">
                  {inv.name}
                </span>
                <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-clay-ink/40 hover:text-clay-ink opacity-0 group-hover:opacity-100 transition-opacity">
                  <MenuDots size={14} weight="Bold" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TierBadge tier={inv.tier} color={inv.tierColor} />
                  <StatusBadge status={inv.status} />
                </div>

                <h3 className="font-poppins font-semibold text-sm text-clay-ink mb-1">
                  {inv.name}
                </h3>
                <p className="font-poppins text-[11px] text-clay-ink/40 mb-4">
                  {t('createdOn')} {new Date(inv.createdAt).toLocaleDateString()}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 pt-3 border-t border-[#0a0a0a]/6">
                  <div className="flex items-center gap-1.5 text-clay-ink/40">
                    <Eye size={13} weight="Linear" />
                    <span className="font-poppins text-[11px] font-medium">{inv.views}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-clay-ink/40">
                    <LinkMinimalistic size={13} weight="Linear" />
                    <span className="font-poppins text-[11px] font-medium">{inv.guests} {t('guestsLinked')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Card */}
          <button className="bg-clay-canvas rounded-[24px] border-2 border-dashed border-[#0a0a0a]/10 flex flex-col items-center justify-center min-h-[260px] gap-3 hover:border-clay-teal/30 hover:bg-clay-surface-card/50 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-clay-surface-card flex items-center justify-center group-hover:bg-clay-teal/10 transition-colors">
              <AddCircle size={20} weight="Bold" className="text-clay-ink/30 group-hover:text-clay-teal transition-colors" />
            </div>
            <span className="font-poppins text-sm font-medium text-clay-ink/30 group-hover:text-clay-ink/60 transition-colors">
              {t('newInvitation')}
            </span>
          </button>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-[24px] bg-clay-surface-card flex items-center justify-center mb-6">
            <span className="text-3xl">✉</span>
          </div>
          <h3 className="font-poppins font-semibold text-lg text-clay-ink mb-2">
            {t('noInvitationsTitle')}
          </h3>
          <p className="font-poppins text-sm text-clay-ink/40 mb-6 text-center max-w-sm">
            {t('noInvitationsDesc')}
          </p>
          <Button size="sm" className="gap-2">
            <AddCircle size={14} weight="Bold" />
            {t('createFirstInvitation')}
          </Button>
        </div>
      )}
    </div>
  );
}
