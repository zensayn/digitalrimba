"use client";

import { Suspense, useEffect, useState } from "react";
import SinemaExperience from "@/components/SinemaExperience";
import { demoConfig, EDITABLE_KEYS } from "@/lib/resolve-config";
import type { InvitationConfig } from "@/lib/config-types";

// Studio live-preview route. The dashboard embeds this page in an iframe and
// streams the draft over postMessage; the production page (/) stays fully
// server-rendered and never loads this code.
//
// Message contract:
//   preview → parent  { type: "RIMBA_DRAFT_READY" }
//   parent → preview  { type: "RIMBA_DRAFT_UPDATE", config: Partial<InvitationConfig> }

// Exact-match origin allowlist. Never substring/startsWith — a lazy prefix
// check is defeated by e.g. http://localhost:3000.evil.com.
const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_STUDIO_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Applies an incoming draft while preserving object identity for unchanged
// top-level slices, so unchanged slides keep referentially-equal props.
function applyDraft(prev: InvitationConfig, incoming: Partial<InvitationConfig>): InvitationConfig {
  const next: InvitationConfig = { ...prev };
  let changed = false;
  for (const key of EDITABLE_KEYS) {
    const value = incoming[key];
    if (value === undefined) continue;
    if (JSON.stringify(value) !== JSON.stringify(prev[key])) {
      (next as unknown as Record<string, unknown>)[key] = value;
      changed = true;
    }
  }
  return changed ? next : prev;
}

export default function PreviewPage() {
  const [config, setConfig] = useState<InvitationConfig>(demoConfig);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!ALLOWED_ORIGINS.includes(event.origin)) return;
      const data = event.data as { type?: string; config?: Partial<InvitationConfig> } | null;
      if (data?.type !== "RIMBA_DRAFT_UPDATE" || !data.config) return;
      const incoming = data.config;
      setConfig((prev) => applyDraft(prev, incoming));
    }

    window.addEventListener("message", onMessage);
    // Announce readiness; the payload-free READY may go to any parent — the
    // draft itself only flows the other way, gated by the origin check above.
    window.parent.postMessage({ type: "RIMBA_DRAFT_READY" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    // ponytail: the whole experience re-renders per draft update (no
    // per-slide memo like the kenangan themes) — split if editing feels slow.
    <Suspense fallback={null}>
      <SinemaExperience config={config} />
    </Suspense>
  );
}
