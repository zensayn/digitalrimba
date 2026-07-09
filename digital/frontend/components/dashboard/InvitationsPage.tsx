"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { AddCircle, Eye, LinkMinimalistic, MenuDots, Magnifer } from '@solar-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchInvitations } from '@/lib/api/invitations';

const INVITE_DOMAIN = process.env.NEXT_PUBLIC_INVITE_DOMAIN ?? 'rimba.io';

// One CTA component for every "create a new invitation" affordance so the
// icon, copy source, and destination can't drift apart.
function NewInvitationButton({ label, className }: { label: string; className?: string }) {
  return (
    <Button size="sm" className={`gap-2 ${className ?? ''}`} asChild>
      <Link href="/dashboard/invitation">
        <AddCircle size={14} weight="Bold" />
        {label}
      </Link>
    </Button>
  );
}

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

export default function InvitationsPage() {
  const t = useTranslations('Dashboard');
  const [search, setSearch] = useState('');

  const { data: invitations, isLoading, error } = useQuery({
    queryKey: ['invitations', 'list'],
    queryFn: fetchInvitations,
  });

  const filtered = (invitations ?? []).filter((inv) =>
    inv.couple_names.toLowerCase().includes(search.toLowerCase()),
  );

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
        <NewInvitationButton label={t('newInvitation')} className="self-start" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Magnifer size={14} weight="Linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-clay-ink/30" />
          <Input
            placeholder={t('searchInvitations')}
            className="pl-9 h-[40px] rounded-[12px] bg-clay-surface-card border-[#0a0a0a]/8 font-poppins text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin size-8 border-2 border-clay-teal border-t-transparent rounded-full mx-auto" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="font-poppins text-sm text-clay-ink/60">
            {error instanceof Error ? error.message : 'Failed to load invitations.'}
          </p>
        </div>
      ) : (invitations ?? []).length === 0 ? (
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
          <NewInvitationButton label={t('createFirstInvitation')} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-poppins text-sm text-clay-ink/40">{t('noSearchMatches')}</p>
        </div>
      ) : (
        /* Invitations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="relative bg-clay-surface-card rounded-[24px] border border-[#0a0a0a]/8 overflow-hidden group hover:border-clay-teal/20 transition-all"
            >
              {/* Stretched link: whole card navigates to the editor. */}
              <Link
                href={`/dashboard/invitations/${inv.id}`}
                className="absolute inset-0 z-[1]"
                aria-label={inv.couple_names}
              />
              {/* Preview area */}
              <div className="h-32 bg-clay-teal/10 flex items-center justify-center relative">
                <span className="font-amoria text-2xl text-clay-ink/15 tracking-tight">
                  {inv.couple_names}
                </span>
                <button className="absolute top-3 right-3 z-[2] w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-clay-ink/40 hover:text-clay-ink opacity-0 group-hover:opacity-100 transition-opacity">
                  <MenuDots size={14} weight="Bold" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {/* Tier is a static placeholder — nothing in the data model backs it yet. */}
                  <TierBadge tier="Timber" color="bg-clay-teal" />
                  <StatusBadge status={inv.published_at ? 'published' : 'draft'} />
                </div>

                <h3 className="font-poppins font-semibold text-sm text-clay-ink mb-1">
                  {inv.couple_names}
                </h3>
                <p className="font-poppins text-[11px] text-clay-ink/40 mb-4">
                  {t('createdOn')} {new Date(inv.created_at).toLocaleDateString()}
                </p>
                {inv.published_at && !inv.slug.startsWith('draft-') && (
                  <a
                    href={`https://${inv.slug}.${INVITE_DOMAIN}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-poppins relative z-[2] mb-4 inline-block truncate max-w-full text-[11px] font-medium text-clay-teal hover:underline"
                  >
                    {inv.slug}.{INVITE_DOMAIN}
                  </a>
                )}

                {/* Stats row — views/guests are static placeholders for now. */}
                <div className="flex items-center gap-4 pt-3 border-t border-[#0a0a0a]/6">
                  <div className="flex items-center gap-1.5 text-clay-ink/40">
                    <Eye size={13} weight="Linear" />
                    <span className="font-poppins text-[11px] font-medium">0</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-clay-ink/40">
                    <LinkMinimalistic size={13} weight="Linear" />
                    <span className="font-poppins text-[11px] font-medium">0 {t('guestsLinked')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Card */}
          <Link
            href="/dashboard/invitation"
            className="bg-clay-canvas rounded-[24px] border-2 border-dashed border-[#0a0a0a]/10 flex flex-col items-center justify-center min-h-[260px] gap-3 hover:border-clay-teal/30 hover:bg-clay-surface-card/50 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-clay-surface-card flex items-center justify-center group-hover:bg-clay-teal/10 transition-colors">
              <AddCircle size={20} weight="Bold" className="text-clay-ink/30 group-hover:text-clay-teal transition-colors" />
            </div>
            <span className="font-poppins text-sm font-medium text-clay-ink/30 group-hover:text-clay-ink/60 transition-colors">
              {t('newInvitation')}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
