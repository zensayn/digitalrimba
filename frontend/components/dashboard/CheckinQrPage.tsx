"use client";

import { useState } from 'react';
import { QrCode, Copy, Link, Key, CheckCircle } from '@solar-icons/react';

export default function CheckinQrPage() {
  const [copied, setCopied] = useState<'url' | 'pin' | null>(null);

  const eventCode = 'TEST01';
  const operatorUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/checkin/${eventCode}`;
  const pin = '••••••';

  function copyToClipboard(text: string, type: 'url' | 'pin') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-amoria text-4xl text-clay-ink tracking-tight mb-1">Check-in Setup</h1>
        <p className="font-poppins text-sm text-clay-ink/40">
          Share the operator link and PIN with your check-in team.
        </p>
      </div>

      <div className="space-y-4">
        {/* Operator URL card */}
        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_4px_24px_rgba(27,27,23,0.05)]">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-clay-teal/10 flex items-center justify-center">
              <Link size={18} weight="Bold" className="text-clay-teal" />
            </span>
            <div>
              <p className="font-poppins text-sm font-semibold text-clay-ink">Operator Check-in URL</p>
              <p className="font-poppins text-xs text-clay-ink/40">Share this link with your check-in operators</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-clay-canvas rounded-xl px-4 py-3">
            <span className="font-mono text-xs text-clay-ink/70 flex-1 truncate">/checkin/{eventCode}</span>
            <button
              onClick={() => copyToClipboard(operatorUrl, 'url')}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-clay-teal hover:text-clay-teal/80 transition-colors"
            >
              {copied === 'url' ? (
                <><CheckCircle size={14} weight="Bold" /> Copied</>
              ) : (
                <><Copy size={14} weight="Linear" /> Copy</>
              )}
            </button>
          </div>
        </div>

        {/* PIN card */}
        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_4px_24px_rgba(27,27,23,0.05)]">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-full bg-clay-ochre/10 flex items-center justify-center">
              <Key size={18} weight="Bold" className="text-clay-ochre" />
            </span>
            <div>
              <p className="font-poppins text-sm font-semibold text-clay-ink">Operator PIN</p>
              <p className="font-poppins text-xs text-clay-ink/40">6-digit PIN for operator authentication</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-clay-canvas rounded-xl px-4 py-3">
            <span className="font-mono text-2xl tracking-[0.32em] text-clay-ink/40 flex-1">{pin}</span>
            <button className="shrink-0 text-xs font-semibold text-clay-ochre hover:text-clay-ochre/80 transition-colors">
              Reveal & Copy
            </button>
          </div>
          <p className="mt-2 text-xs text-clay-ink/30 font-poppins">
            PIN is set by your administrator. Contact support to rotate it.
          </p>
        </div>

        {/* QR code card */}
        <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_4px_24px_rgba(27,27,23,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 rounded-full bg-clay-lavender/20 flex items-center justify-center">
              <QrCode size={18} weight="Bold" className="text-clay-lavender" />
            </span>
            <div>
              <p className="font-poppins text-sm font-semibold text-clay-ink">QR Code</p>
              <p className="font-poppins text-xs text-clay-ink/40">Print or display to let operators scan-to-open</p>
            </div>
          </div>
          <div className="w-40 h-40 rounded-xl bg-clay-canvas border border-black/8 flex items-center justify-center">
            <QrCode size={80} weight="Linear" className="text-clay-ink/20" />
          </div>
          <p className="mt-3 text-xs text-clay-ink/30 font-poppins">
            QR code generation coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
