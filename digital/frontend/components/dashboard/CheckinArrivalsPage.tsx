'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getCheckinGuests, type CheckinGuest } from '@/lib/api/checkin-events'
import { fuzzySearchGuests } from '@/lib/checkin/fuzzy-search'

const POLL_MS = 20_000

type Filter = 'all' | 'arrived' | 'expected' | 'walkin'

const isWalkIn = (g: CheckinGuest) => g.tag === 'Walk-in'
const paxOf = (g: CheckinGuest) => g.actual_pax ?? g.party_size

export default function CheckinArrivalsPage() {
  const [guests, setGuests] = useState<CheckinGuest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // Initial load + polling, same contract as CheckinQrPage: poll failures
  // are silent, only the first load surfaces an error. Self-scheduling (not
  // setInterval) so requests never overlap and a slow, older response can't
  // overwrite a newer roster.
  useEffect(() => {
    let alive = true
    let firstLoad = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const load = () =>
      getCheckinGuests()
        .then((g) => {
          if (alive) setGuests(g)
        })
        .catch((err: unknown) => {
          if (alive && firstLoad)
            setError(err instanceof Error ? err.message : 'Failed to load guests')
        })
        .finally(() => {
          firstLoad = false
          if (alive) timer = setTimeout(() => void load(), POLL_MS)
        })
    void load()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [])

  const stats = useMemo(() => {
    if (!guests) return null
    const arrived = guests.filter((g) => g.arrived_at)
    return {
      // party_size only, matching the backend's GetCheckinStats total —
      // actual_pax counts toward arrivals, not the expected total
      totalPax: guests.reduce((n, g) => n + g.party_size, 0),
      invitedArrivedPax: arrived.filter((g) => !isWalkIn(g)).reduce((n, g) => n + paxOf(g), 0),
      walkInPax: arrived.filter(isWalkIn).reduce((n, g) => n + paxOf(g), 0),
      counts: {
        all: guests.length,
        arrived: arrived.length,
        expected: guests.length - arrived.length,
        walkin: guests.filter(isWalkIn).length,
      },
    }
  }, [guests])

  const visible = useMemo(() => {
    if (!guests) return []
    const q = query.trim()
    const filtered = guests.filter((g) => {
      if (filter === 'arrived' && !g.arrived_at) return false
      if (filter === 'expected' && g.arrived_at) return false
      if (filter === 'walkin' && !isWalkIn(g)) return false
      return true
    })

    const searched = q
      ? fuzzySearchGuests(filtered, q, filtered.length, [(g) => g.name, (g) => g.tag])
      : filtered

    return searched
      .sort((a, b) => {
        // Latest arrivals first, then expected guests alphabetically.
        if (a.arrived_at && b.arrived_at) return b.arrived_at.localeCompare(a.arrived_at)
        if (a.arrived_at !== b.arrived_at) return a.arrived_at ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }, [guests, query, filter])

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10 pb-24">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Link
        href="/dashboard/checkin-qr"
        className="inline-flex items-center gap-1.5 text-sm text-[#616161] hover:text-[#212121] mb-3"
      >
        <BackIcon className="w-4 h-4" />
        Check-in
      </Link>
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-[#212121]">Guests</h1>
      <p className="mt-1.5 text-sm text-[#616161]">
        Who has arrived, their envelope tags, and who checked them in — updates every 20s
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-[#fef2f2] border border-red-200 rounded-xl px-4 py-2.5 mt-6">
          <span className="text-xs font-medium text-[#b30000]">{error}</span>
        </div>
      )}

      {!guests && !error && (
        <div className="mt-8 space-y-4">
          <Skeleton className="h-24 rounded-[22px]" />
          <Skeleton className="h-96 rounded-[32px]" />
        </div>
      )}

      {guests && stats && (
        <>
          {/* ── At a glance: pax progress bar + legend (Luma layout) ─────── */}
          <section className="mt-8">
            <h2 className="text-lg font-bold text-[#212121] mb-3">At a glance</h2>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-2xl font-bold text-[#346739] tabular-nums">
                {stats.invitedArrivedPax + stats.walkInPax}
                <span className="text-sm font-normal text-[#616161] ml-1.5">pax arrived</span>
              </p>
              <p className="text-sm text-[#93939f] tabular-nums">of {stats.totalPax} expected</p>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-[#eeece7]">
              <div
                className="bg-[#346739] transition-[width] duration-500 ease-out"
                style={{ width: pct(stats.invitedArrivedPax, stats.totalPax) }}
              />
              <div
                className="bg-[#1863dc] transition-[width] duration-500 ease-out"
                style={{
                  width: pct(
                    Math.min(stats.walkInPax, Math.max(0, stats.totalPax - stats.invitedArrivedPax)),
                    stats.totalPax
                  ),
                }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#616161]">
              <LegendDot color="#346739" label={`${stats.invitedArrivedPax} invited arrived`} />
              <LegendDot color="#1863dc" label={`${stats.walkInPax} walk-in pax`} />
              <LegendDot color="#eeece7" label={`${Math.max(0, stats.totalPax - stats.invitedArrivedPax - stats.walkInPax)} still expected`} />
            </div>
          </section>

          {/* ── Guest list: search + filter chips + rows (Luma layout) ───── */}
          <section className="mt-10">
            <h2 className="text-lg font-bold text-[#212121] mb-3">Guest list</h2>

            <div className="relative mb-3">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93939f]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or group"
                className="w-full bg-white border border-[#e5e7eb] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#212121] placeholder:text-[#93939f] outline-none focus:border-[#4c6ee6]"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(
                [
                  ['all', 'All'],
                  ['arrived', 'Arrived'],
                  ['expected', 'Expected'],
                  ['walkin', 'Walk-ins'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.97] ${
                    filter === key
                      ? 'bg-[#346739] border-[#346739] text-white'
                      : 'bg-transparent border-[#d9d9dd] text-[#616161] hover:bg-[#eeece7]'
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 tabular-nums ${filter === key ? 'text-white/70' : 'text-[#93939f]'}`}>
                    {stats.counts[key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-[22px] border border-[#e5e7eb] bg-white divide-y divide-[#f2f2f2]">
              {visible.length === 0 && (
                <p className="px-6 py-10 text-sm text-[#93939f] text-center">
                  {query ? `No guests match “${query.trim()}”` : 'No guests in this view yet'}
                </p>
              )}
              {visible.map((g) => (
                <GuestRow key={g.id} guest={g} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

// ── Pieces ─────────────────────────────────────────────────────────────────────

function pct(part: number, total: number) {
  return total > 0 ? `${Math.min(100, (part / total) * 100)}%` : '0%'
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function GuestRow({ guest }: { guest: CheckinGuest }) {
  const arrived = Boolean(guest.arrived_at)
  const walkIn = isWalkIn(guest)
  const subtitle = [
    `${paxOf(guest)} pax`,
    guest.tag && !walkIn ? guest.tag : null,
    guest.proxy_name ? `represented by ${guest.proxy_name}` : null,
    arrived && guest.souvenir_given ? 'souvenir given' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5">
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          arrived ? 'bg-[#edfce9] text-[#346739]' : 'bg-[#eeece7] text-[#75758a]'
        }`}
      >
        {initials(guest.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#212121] truncate">{guest.name}</p>
        <p className="text-xs text-[#93939f] truncate">{subtitle}</p>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0 ${
          walkIn
            ? 'bg-[#f1f5ff] text-[#1863dc]'
            : arrived
              ? 'bg-[#edfce9] text-[#346739]'
              : 'bg-[#eeece7] text-[#75758a]'
        }`}
      >
        {walkIn ? 'Walk-in' : arrived ? 'Arrived' : 'Expected'}
      </span>
      <div className="hidden sm:block w-28 text-right shrink-0">
        {arrived && (
          <>
            <p className="text-xs text-[#616161] tabular-nums">{formatTime(guest.arrived_at!)}</p>
            {guest.checked_in_by_label && (
              <p className="text-[11px] text-[#93939f] truncate">by {guest.checked_in_by_label}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5m0 0 6 6m-6-6 6-6" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
