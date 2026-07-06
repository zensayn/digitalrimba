'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createCheckinEvent,
  fetchQRPdfBlob,
  getCheckinEvent,
  triggerQREmail,
  type CheckinEventConfig,
} from '@/lib/api/checkin-events'

const POLL_MS = 20_000

export default function CheckinQrPage() {
  const [config, setConfig] = useState<CheckinEventConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plainPin, setPlainPin] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<string | null>(null)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [copied, setCopied] = useState<'url' | 'pin' | null>(null)
  const [isPending, startTransition] = useTransition()

  // Initial load + live polling so "arrived" tracks the operator station.
  // Poll failures are silent; only the first load surfaces an error.
  useEffect(() => {
    let alive = true
    let firstLoad = true
    const load = () =>
      getCheckinEvent()
        .then((c) => {
          if (alive) setConfig(c)
        })
        .catch((err: unknown) => {
          if (alive && firstLoad)
            setError(err instanceof Error ? err.message : 'Failed to load check-in config')
        })
        .finally(() => {
          if (alive) setLoading(false)
          firstLoad = false
        })
    void load()
    const interval = setInterval(load, POLL_MS)
    return () => {
      alive = false
      clearInterval(interval)
    }
  }, [])

  function handleSetupOrRegeneratePin() {
    setError(null)
    setConfirmRegen(false)
    startTransition(async () => {
      try {
        const result = await createCheckinEvent()
        setPlainPin(result.pin)
        const updated = await getCheckinEvent()
        setConfig(updated)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to set up check-in')
      }
    })
  }

  function copyToClipboard(kind: 'url' | 'pin', value: string) {
    void navigator.clipboard.writeText(value)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDownloadPdf() {
    setError(null)
    try {
      const objectUrl = await fetchQRPdfBlob()
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = 'guest-qr-codes.pdf'
      a.click()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'PDF download failed')
    }
  }

  function handleEmailAll() {
    setError(null)
    startTransition(async () => {
      try {
        const { queued } = await triggerQREmail()
        setEmailStatus(`Sent to ${queued} guests`)
        setTimeout(() => setEmailStatus(null), 4000)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to send emails')
      }
    })
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const operatorFullUrl = config ? origin + config.operatorUrl : ''

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-14 rounded-full w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-[32px] lg:col-span-2" />
          <Skeleton className="h-80 rounded-[32px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10 pb-24">
      {/* ── Header: title + live status line (Posh event-overview layout) ── */}
      <div className="mb-6">
        <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-[#212121]">
          Check-in
        </h1>
        {config ? (
          <p className="flex items-center gap-2 mt-1.5 text-sm text-[#616161]">
            <span className="flex items-center gap-1.5 text-[#346739] font-medium">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#346739] opacity-40 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[#346739]" />
              </span>
              Live
            </span>
            <span className="text-[#d9d9dd]">·</span>
            {config.arrivedPax} of {config.totalPax} pax arrived
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-[#93939f]">
            Distribute guest QR codes, set up the door station, and watch arrivals live
          </p>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-[#fef2f2] border border-red-200 rounded-xl px-4 py-2.5 mb-6">
          <span className="text-xs font-medium text-[#b30000]">{error}</span>
          <button
            className="ml-auto text-[10px] font-semibold text-[#b30000] underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* First-time setup prompt */}
      {!config && !error && (
        <div className="rounded-[32px] border border-[#e5e7eb] bg-white p-10 md:p-14 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#edfce9] flex items-center justify-center">
            <QrIcon className="w-7 h-7 text-[#346739]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#212121]">Check-in not set up yet</p>
            <p className="text-sm text-[#616161] mt-2 max-w-md leading-relaxed">
              Generate an event code and PIN. Operators open the station on their phone,
              log in with the PIN, and scan guest QR codes at the door — it keeps working
              even if the venue Wi-Fi drops.
            </p>
          </div>
          <PillButton variant="primary" onClick={handleSetupOrRegeneratePin} disabled={isPending}>
            {isPending ? 'Setting up…' : 'Set up check-in'}
          </PillButton>
        </div>
      )}

      {config && (
        <div className="space-y-6">
          {/* ── Station link bar: URL + inline copy + prominent CTA ──────── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-full pl-5 pr-2 py-2">
              <span className="flex-1 min-w-0 truncate text-sm text-[#616161]">
                {operatorFullUrl}
              </span>
              <button
                type="button"
                aria-label="Copy station link"
                onClick={() => copyToClipboard('url', operatorFullUrl)}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[#616161] hover:bg-[#eeece7] transition-[transform,background-color] duration-150 ease-out active:scale-[0.94]"
              >
                {copied === 'url' ? (
                  <CheckIcon className="w-4 h-4 text-[#346739]" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            <PillButton
              variant="primary"
              onClick={() => window.open(config.operatorUrl, '_blank', 'noopener')}
            >
              Open station
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </PillButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── Left: arrivals gauge + distribute ─────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Arrivals: donut gauge + breakdown rows (Posh analytics / Luma insights) */}
              <section className="rounded-[32px] border border-[#e5e7eb] bg-white p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#212121]">Arrivals</h2>
                  <Link
                    href="/dashboard/checkin-qr/arrivals"
                    className="group inline-flex items-center gap-1 text-sm font-medium text-[#346739] hover:underline"
                  >
                    See all guests
                    <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <ArrivalDonut arrived={config.arrivedPax} total={config.totalPax} />

                  <div className="w-full flex-1 divide-y divide-[#f2f2f2]">
                    <BreakdownRow
                      color="#346739"
                      label="Invitations arrived"
                      value={`${config.arrivedGuests} / ${config.totalGuests}`}
                    />
                    <BreakdownRow
                      color="#1863dc"
                      label="Walk-ins added at the door"
                      value={String(config.walkIns)}
                    />
                    <BreakdownRow
                      color="#ff7759"
                      label="Souvenirs given"
                      value={String(config.souvenirCount)}
                    />
                    <BreakdownRow
                      color="#93939f"
                      label="Pax still expected"
                      value={String(Math.max(0, config.totalPax - config.arrivedPax))}
                    />
                  </div>
                </div>
              </section>

              {/* Distribute QR codes */}
              <section>
                <h2 className="text-2xl font-bold text-[#212121] mb-4">Distribute QR codes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <WideActionCard
                    title="Download QR PDF"
                    subtitle={`${config.totalGuests} printable codes, one page per guest`}
                    onClick={() => void handleDownloadPdf()}
                  >
                    <DownloadIcon className="w-5 h-5 text-[#346739]" />
                  </WideActionCard>
                  <WideActionCard
                    title="Email QR codes"
                    subtitle={emailStatus ?? 'Send to every guest with an email address'}
                    highlight={Boolean(emailStatus)}
                    disabled={isPending}
                    onClick={handleEmailAll}
                  >
                    <MailIcon className="w-5 h-5 text-[#346739]" />
                  </WideActionCard>
                </div>
              </section>
            </div>

            {/* ── Right: station access + operator activity ─────────────── */}
            <div className="space-y-6">
            <section className="rounded-[32px] border border-[#e5e7eb] bg-white divide-y divide-[#f2f2f2]">
              <div className="px-6 py-5">
                <h2 className="text-lg font-bold text-[#212121]">Station access</h2>
                <p className="text-sm text-[#93939f] mt-1">
                  Share the link and PIN with whoever works the door
                </p>
              </div>

              <AccessRow label="Event code">
                <span className="text-base font-medium text-[#212121] tabular-nums tracking-[0.15em]">
                  {config.eventCode}
                </span>
              </AccessRow>

              <AccessRow
                label="Operator PIN"
                hint={plainPin ? 'Save it now — shown only once' : 'Shown once at generation — regenerate if lost'}
                actions={
                  <>
                    {plainPin && (
                      <PillButton
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard('pin', plainPin)}
                      >
                        {copied === 'pin' ? '✓ Copied' : 'Copy PIN'}
                      </PillButton>
                    )}
                    {confirmRegen ? (
                      <PillButton
                        variant="destructive"
                        size="sm"
                        onClick={handleSetupOrRegeneratePin}
                        disabled={isPending}
                      >
                        {isPending ? '…' : 'Confirm — old PIN stops working'}
                      </PillButton>
                    ) : (
                      <PillButton variant="outline" size="sm" onClick={() => setConfirmRegen(true)}>
                        Regenerate
                      </PillButton>
                    )}
                  </>
                }
              >
                {plainPin ? (
                  <span className="flex gap-1.5">
                    {plainPin.split('').map((d, i) => (
                      <span
                        key={i}
                        className="w-8 h-10 bg-[#edfce9] rounded-lg flex items-center justify-center text-sm font-bold text-[#346739]"
                      >
                        {d}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-lg text-[#93939f] tracking-[0.3em] leading-none select-none">
                    ••••••
                  </span>
                )}
              </AccessRow>

              {/* How the station works */}
              <div className="px-6 py-5">
                <p className="text-xs font-medium uppercase text-[#93939f] mb-2">
                  How the station works
                </p>
                <ul className="text-sm text-[#616161] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    Operators log in with the PIN and can add their name — duplicate scans
                    show who checked the guest in
                  </li>
                  <li>
                    Scans keep working offline and sync automatically when the connection
                    returns
                  </li>
                  <li>
                    Walk-in guests can be added at the door; each arrival gets a sequential
                    envelope tag number
                  </li>
                </ul>
              </div>
            </section>

            {/* Operator activity: ranked rows (Circle leaderboard layout) */}
            <section className="rounded-[32px] border border-[#e5e7eb] bg-white">
              <div className="px-6 py-5 border-b border-[#f2f2f2] flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-[#212121]">Operator activity</h2>
                <span className="text-xs text-[#93939f]">ranked by scans</span>
              </div>
              {config.operators?.length ? (
                <div className="p-3">
                  {config.operators.map((op, i) => (
                    <div
                      key={op.label}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl ${
                        i % 2 === 1 ? 'bg-[#faf9f7]' : ''
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0
                            ? 'bg-[#edfce9] text-[#346739]'
                            : 'bg-[#eeece7] text-[#75758a]'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="w-9 h-9 rounded-full bg-[#eeece7] flex items-center justify-center text-xs font-bold text-[#616161] shrink-0">
                        {initials(op.label)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#212121] truncate">{op.label}</p>
                        <p className="text-xs text-[#93939f]">
                          {op.pax} pax · last scan {formatTime(op.lastScanAt)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#346739] tabular-nums shrink-0">
                        +{op.scans}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-6 py-8 text-sm text-[#93939f] text-center">
                  No scans yet — operators appear here once they start checking guests in
                </p>
              )}
            </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pieces ─────────────────────────────────────────────────────────────────────

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

function PillButton({
  variant,
  size = 'md',
  onClick,
  disabled,
  children,
}: {
  variant: 'primary' | 'outline' | 'destructive'
  size?: 'sm' | 'md'
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const styles = {
    primary: 'bg-[#346739] text-white hover:bg-[#2b5730]',
    outline: 'bg-transparent text-[#212121] border border-[#d9d9dd] hover:bg-[#eeece7]',
    destructive: 'bg-[#b30000] text-white hover:bg-[#990000]',
  }[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${
        size === 'sm' ? 'text-xs px-4 py-2' : 'text-sm px-6 py-3'
      } ${styles}`}
    >
      {children}
    </button>
  )
}

function ArrivalDonut({ arrived, total }: { arrived: number; total: number }) {
  const pct = total > 0 ? Math.min(1, arrived / total) : 0
  const overCapacity = total > 0 && arrived > total
  const size = 200
  const stroke = 18
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#eeece7"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={overCapacity ? '#ff7759' : '#346739'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-bold text-[#212121] leading-none tabular-nums">{arrived}</p>
        <p className="text-xs text-[#93939f] mt-1.5">
          of {total} pax
          <br />
          {Math.round(pct * 100)}% arrived
        </p>
      </div>
    </div>
  )
}

function BreakdownRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2.5 text-sm text-[#616161]">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="text-sm font-bold text-[#212121] tabular-nums">{value}</span>
    </div>
  )
}

function WideActionCard({
  title,
  subtitle,
  onClick,
  disabled,
  highlight,
  children,
}: {
  title: string
  subtitle: string
  onClick: () => void
  disabled?: boolean
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group text-left bg-white rounded-[22px] border border-[#e5e7eb] p-6 flex items-center gap-4 transition-[transform,border-color] duration-150 ease-out hover:border-[#346739]/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
    >
      <div className="w-11 h-11 rounded-xl bg-[#edfce9] flex items-center justify-center flex-shrink-0">
        {children}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-[#212121]">{title}</p>
        <p className={`text-sm truncate ${highlight ? 'text-[#346739] font-medium' : 'text-[#93939f]'}`}>
          {subtitle}
        </p>
      </div>
      <ArrowUpRightIcon className="w-4 h-4 text-[#93939f] flex-shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  )
}

function AccessRow({
  label,
  hint,
  actions,
  children,
}: {
  label: string
  hint?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-5">
      <p className="text-xs font-medium uppercase text-[#93939f] mb-2">{label}</p>
      {children}
      {hint && <p className="text-[11px] text-[#93939f] mt-1.5">{hint}</p>}
      {actions && <div className="flex gap-2 flex-wrap mt-3">{actions}</div>}
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function QrIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="5" width="3" height="3" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" fill="currentColor" />
      <rect x="18" y="14" width="3" height="3" fill="currentColor" />
      <rect x="14" y="18" width="3" height="3" fill="currentColor" />
      <rect x="18" y="18" width="3" height="3" fill="currentColor" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
