'use client'

import { useEffect, useState, useTransition } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TextureButton } from '@/components/ui/texture-button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createCheckinEvent,
  getCheckinEvent,
  triggerQREmail,
  getQRPdfUrl,
  type CheckinEventConfig,
} from '@/lib/api/checkin-events'

export default function CheckinQrPage() {
  const [config, setConfig] = useState<CheckinEventConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [plainPin, setPlainPin] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getCheckinEvent()
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  function handleSetupOrRegeneratePin() {
    startTransition(async () => {
      const result = await createCheckinEvent()
      setPlainPin(result.pin)
      const updated = await getCheckinEvent()
      setConfig(updated)
    })
  }

  function handleCopyUrl() {
    if (config) {
      const full = (typeof window !== 'undefined' ? window.location.origin : '') + config.operatorUrl
      navigator.clipboard.writeText(full)
    }
  }

  function handleCopyPin() {
    if (plainPin) navigator.clipboard.writeText(plainPin)
  }

  function handleDownloadPdf() {
    const a = document.createElement('a')
    a.href = getQRPdfUrl()
    a.download = 'guest-qr-codes.pdf'
    a.click()
  }

  function handleEmailAll() {
    startTransition(async () => {
      const { queued } = await triggerQREmail()
      setEmailStatus(`Sent to ${queued} guests`)
      setTimeout(() => setEmailStatus(null), 4000)
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 space-y-4">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-12 rounded-2xl w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-24 space-y-3">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-3xl md:text-4xl font-bold text-[#212121] tracking-tight">
          Check-in Setup
        </h1>
        <p className="text-sm text-[#93939f] mt-1">
          Configure operator login and distribute guest QR codes
        </p>
      </div>

      {/* First-time setup prompt */}
      {!config && (
        <Card className="rounded-2xl ring-1 ring-foreground/10">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#edfce9] flex items-center justify-center">
              <QrIcon className="w-6 h-6 text-[#346739]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#212121]">Check-in not set up yet</p>
              <p className="text-xs text-[#93939f] mt-1">
                Generate an event code and PIN for your operators
              </p>
            </div>
            <TextureButton variant="primary" onClick={handleSetupOrRegeneratePin} disabled={isPending}>
              {isPending ? 'Setting up…' : 'Set Up Check-in'}
            </TextureButton>
          </CardContent>
        </Card>
      )}

      {config && (
        <>
          {/* Live status banner */}
          <div className="flex items-center gap-2 bg-[#edfce9] border border-[#c5e8c9] rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-[#346739] animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium text-[#346739]">
              Check-in active — operators can scan now
            </span>
            <span className="ml-auto text-xs font-bold text-[#346739]">
              {config.arrivedGuests} / {config.totalGuests} arrived
            </span>
          </div>

          {/* Event code + PIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="rounded-2xl ring-1 ring-foreground/10">
              <CardHeader className="pb-0 pt-4 px-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#93939f]">
                  Event Code
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <p className="text-2xl font-bold text-[#212121] font-mono tracking-widest">
                  {config.eventCode}
                </p>
                <div className="bg-[#faf8f5] rounded-lg px-3 py-1.5 text-xs text-[#346739] break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}{config.operatorUrl}
                </div>
                <TextureButton variant="primary" size="sm" onClick={handleCopyUrl}>
                  Copy URL
                </TextureButton>
              </CardContent>
            </Card>

            <Card className="rounded-2xl ring-1 ring-foreground/10">
              <CardHeader className="pb-0 pt-4 px-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#93939f]">
                  Operator PIN
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex gap-1.5">
                  {plainPin
                    ? plainPin.split('').map((d, i) => (
                        <div
                          key={i}
                          className="w-8 h-10 bg-[#edfce9] rounded-md flex items-center justify-center text-sm font-bold text-[#346739]"
                        >
                          {d}
                        </div>
                      ))
                    : Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-8 h-10 bg-[#212121] rounded-md" />
                      ))}
                </div>
                {!plainPin && (
                  <p className="text-[11px] text-[#93939f]">
                    PIN hidden — regenerate to reveal a new one
                  </p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {plainPin && (
                    <TextureButton variant="primary" size="sm" onClick={handleCopyPin}>
                      Copy PIN
                    </TextureButton>
                  )}
                  <TextureButton
                    variant="outline"
                    size="sm"
                    onClick={handleSetupOrRegeneratePin}
                    disabled={isPending}
                  >
                    {isPending ? '…' : 'Regenerate PIN'}
                  </TextureButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR distribution */}
          <Card className="rounded-2xl ring-1 ring-foreground/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#faf8f5] flex items-center justify-center flex-shrink-0">
                <QrIcon className="w-5 h-5 text-[#346739]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#212121]">
                  {config.totalGuests} unique QR codes ready
                </p>
                <p className="text-xs text-[#93939f]">
                  Each guest has a personal token linked to their record
                </p>
                {emailStatus && (
                  <p className="text-xs text-[#346739] mt-0.5 font-medium">{emailStatus}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <TextureButton variant="primary" size="sm" onClick={handleDownloadPdf}>
                  Download PDF
                </TextureButton>
                <TextureButton
                  variant="outline"
                  size="sm"
                  onClick={handleEmailAll}
                  disabled={isPending}
                >
                  {isPending ? 'Sending…' : 'Email All'}
                </TextureButton>
              </div>
            </CardContent>
          </Card>

          {/* Live stats */}
          <Card className="rounded-2xl ring-1 ring-foreground/10">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-[#f2f2f2]">
                {[
                  { label: 'Arrived', value: config.arrivedGuests, color: 'text-[#346739]' },
                  {
                    label: 'Pending',
                    value: config.totalGuests - config.arrivedGuests,
                    color: 'text-[#212121]',
                  },
                  { label: 'Souvenirs', value: config.souvenirCount, color: 'text-[#ff7759]' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="py-4 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#93939f] mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

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
