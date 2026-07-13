"use client";

import { useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig } from "@/lib/config-types";

export default function GiftSection({ bankAccounts }: { bankAccounts: InvitationConfig["bankAccounts"] }) {
  const preset = kelirFor("gift");
  const [copied, setCopied] = useState<number | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = (num: string, i: number) => {
    const clean = num.replace(/\s/g, "");
    // Optional chaining pendek-sirkuit: kalau clipboard tak ada, .catch tak dipanggil.
    navigator.clipboard?.writeText(clean).catch(() => {});
    setCopied(i);
    // Reset satu timer saja — salin cepat antar-rekening tak saling memotong.
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent maxWidth={340}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Amplop Digital</p>
          <h2 className="font-display mt-2 text-[var(--text)]" style={{ fontSize: "clamp(30px, 8.5vw, 44px)" }}>
            Hadiah
          </h2>
          <div className="gold-divider mx-auto my-4" />
          <p className="font-body mb-6 leading-relaxed text-[var(--text-muted)]" style={{ fontSize: "clamp(12px, 3vw, 14px)" }}>
            Doa dan kehadiran Anda adalah hadiah terbesar bagi kami. Namun jika
            Anda ingin memberi tanda kasih, berikut rekening kami.
          </p>
          <div className="flex w-full flex-col gap-3 text-left">
            {bankAccounts.map((acc, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{ padding: "16px 18px", border: "1px solid var(--border)", background: "rgba(20,12,6,0.5)" }}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-label" style={{ color: "var(--gold)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    {acc.bank}
                  </span>
                  <span className="font-body" style={{ color: "var(--text)", fontSize: 14, letterSpacing: "0.03em" }}>
                    {acc.number}
                  </span>
                  <span className="font-label" style={{ color: "var(--text-dim)", fontSize: 11 }}>a.n. {acc.name}</span>
                </div>
                <button
                  onClick={() => copy(acc.number, i)}
                  aria-label="Salin nomor rekening"
                  style={{
                    padding: 10,
                    border: "1px solid var(--border)",
                    color: copied === i ? "var(--gold)" : "var(--text-dim)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {copied === i ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
