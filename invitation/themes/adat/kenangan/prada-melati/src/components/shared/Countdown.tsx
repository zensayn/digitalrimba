"use client";

// src/components/shared/Countdown.tsx
// Hitung mundur ke hari-H. Komponen client terpisah supaya tick per-detik hanya
// me-render ulang digit, bukan seluruh cover/kelir scene. (Pola warm-narrative.)

import { useEffect, useState } from "react";

function useCountdown(target: string) {
  const [diff, setDiff] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const gap = Math.max(0, new Date(target).getTime() - Date.now());
      setDiff({
        d: Math.floor(gap / 86_400_000),
        h: Math.floor((gap % 86_400_000) / 3_600_000),
        m: Math.floor((gap % 3_600_000) / 60_000),
        s: Math.floor((gap % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);

  return diff;
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  const c = useCountdown(targetDate);
  if (!c) return null;

  const items = [
    { val: c.d, label: "Hari" },
    { val: c.h, label: "Jam" },
    { val: c.m, label: "Menit" },
    { val: c.s, label: "Detik" },
  ];

  return (
    <div className="flex items-start justify-center" style={{ gap: "clamp(14px, 5vw, 22px)" }}>
      {items.map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center" style={{ gap: 4, minWidth: 40 }}>
          <span
            className="font-display"
            style={{
              fontSize: "clamp(24px, 6.5vw, 34px)",
              lineHeight: 1,
              color: "var(--gold)",
              textShadow: "0 2px 14px rgba(0,0,0,0.75)",
            }}
          >
            {String(val).padStart(2, "0")}
          </span>
          <span
            className="font-label uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "var(--text-muted)",
              textShadow: "0 2px 10px rgba(0,0,0,0.7)",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
