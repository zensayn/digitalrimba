"use client";

import { memo, useEffect, useState } from "react";
import MotionProvider from "@/components/shared/MotionProvider";
import DesktopCover from "@/components/shared/DesktopCover";
import MusicPlayer from "@/components/shared/MusicPlayer";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
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

// Which top-level config slices each section reads — powers the memo
// comparator so typing in one field only re-renders its own section.
const SECTION_DEPS: Record<string, (keyof InvitationConfig)[]> = {
  cover: ["couple", "weddingDate"],
  greeting: ["couple"],
  couple: ["couple"],
  lovestory: ["loveStory"],
  akad: ["couple", "events"],
  resepsi: ["couple", "events"],
  dresscode: ["dressCode"],
  gallery: ["gallery"],
  rsvp: [],
  gift: ["bankAccounts"],
  closing: ["couple", "gallery"],
};

const Section = memo(
  function Section({ id, config }: { id: string; config: InvitationConfig }) {
    return <>{renderSection(id, config)}</>;
  },
  (prev, next) =>
    prev.id === next.id &&
    (SECTION_DEPS[prev.id] ?? []).every((key) => prev.config[key] === next.config[key]),
);

// Applies an incoming draft while preserving object identity for unchanged
// top-level slices, so the memoized sections above actually skip re-renders.
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

  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    // Mirrors the production page structure (minus the envelope overlay,
    // which would block live editing).
    <MotionProvider>
      <div className="app-shell">
        {/* Same music wiring as production so config.music edits are audible here. */}
        <MusicPlayer src={config.music?.src} start={config.music?.startSec} end={config.music?.endSec} />
        <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />
        <SnapContainer>
          {sectionIds.map((id) => (
            <Section key={id} id={id} config={config} />
          ))}
        </SnapContainer>
      </div>
    </MotionProvider>
  );
}
