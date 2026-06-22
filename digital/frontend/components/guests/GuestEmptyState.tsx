"use client";

import { UsersGroupRounded } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";

export function GuestEmptyState() {
  return (
    <div
      data-testid="guest-empty-state"
      className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border border-dashed border-neutral-200 bg-neutral-50/30 px-6 text-center"
    >
      <div className="size-16 rounded-full bg-white flex items-center justify-center mb-6 ring-1 ring-black/5 shadow-sm">
        <UsersGroupRounded size={32} className="text-neutral-200" />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-2">
        Database Empty
      </p>
      <h2 className="text-2xl font-bold text-black tracking-tight mb-3">No guests found</h2>
      <p className="max-w-xs text-[14px] font-medium leading-relaxed text-neutral-500 mb-8">
        Import a CSV or add guests manually to start building your wedding guest list and tracking RSVPs.
      </p>
      <div className="flex items-center gap-3">
        <TextureButton variant="outline" className="h-10 rounded-full px-6 text-[13px] font-medium">Learn more</TextureButton>
        <TextureButton variant="primary" className="h-10 rounded-full px-6 text-[13px] font-medium">Add First Guest</TextureButton>
      </div>
    </div>
  );
}
