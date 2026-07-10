"use client";

import type { InvitationConfig } from "@/lib/invitation-config";

type InvitationPreviewProps = {
  config: InvitationConfig;
};

// Fallback preview used only when no template is selected — the real preview
// is the theme's /preview iframe.
export function InvitationPreview({ config }: InvitationPreviewProps) {
  const brideName = config.couple.bride.name;
  const groomName = config.couple.groom.name;
  const coupleNames =
    brideName || groomName ? `${brideName || "Bride"} & ${groomName || "Groom"}` : "Bride & Groom";
  const story = config.loveStory[0]?.description ?? "";
  const coverImage = config.gallery[0]?.src ?? "";

  return (
    <article
      data-testid="invitation-preview"
      className="relative min-h-[680px] overflow-hidden rounded-[28px] border border-[#0a0a0a]/10 bg-[#fffaf0] shadow-[0_28px_80px_rgba(10,10,10,0.18)]"
    >
      <div className="absolute inset-x-0 top-0 h-48 bg-[#1a3a3a]" />
      <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#ff4d8b]" />
      <div className="absolute left-8 top-24 h-20 w-20 rounded-full bg-[#e8b94a]" />
      <div className="absolute bottom-10 right-10 h-28 w-28 rounded-full bg-[#b8a4ed]" />

      <div className="relative flex min-h-[680px] flex-col px-8 py-10 text-[#0a0a0a]">
        <div className="rounded-[22px] border border-[#0a0a0a]/10 bg-white/85 p-5 shadow-[0_16px_48px_rgba(10,10,10,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1a3a3a]">
            Rimba Digital Invitation
          </p>
          <h2 className="mt-5 text-5xl font-semibold leading-none text-[#0a0a0a]">
            {coupleNames}
          </h2>
          <div className="mt-6 grid gap-3 text-sm text-[#3a3a3a] sm:grid-cols-2">
            <p>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
                Date
              </span>
              {config.weddingDate || "Select a date"}
            </p>
            <p>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
                Venue
              </span>
              {config.events.resepsi.venue || "Add venue"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid flex-1 gap-5">
          <div className="overflow-hidden rounded-[22px] border border-[#0a0a0a]/10 bg-[#f5f0e0]">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="Couple" className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center bg-[#1a3a3a] px-6 text-center text-sm font-semibold text-[#fffaf0]">
                Couple image preview
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-[#0a0a0a]/10 bg-white/85 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff4d8b]">
              Our Story
            </p>
            <p className="mt-3 text-sm leading-7 text-[#3a3a3a]">
              {story || "Write a warm story for guests. The preview refreshes as the studio form changes."}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#0a0a0a]/10 bg-[#0a1a1a] p-5 text-[#fffaf0]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8b94a]">
              Music
            </p>
            <p className="mt-2 text-sm text-[#fffaf0]/75">
              {config.music.src
                ? config.music.title
                  ? `♪ ${config.music.title}${config.music.artist ? ` — ${config.music.artist}` : ""}`
                  : `Music uploaded: ${config.music.src}`
                : "No music selected"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
