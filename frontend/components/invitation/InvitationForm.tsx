"use client";

import { ChangeEvent, useRef } from "react";
import type { InvitationDraft } from "./InvitationPreview";

type InvitationFormProps = {
  draft: InvitationDraft;
  updateDraft: (field: keyof InvitationDraft, value: string) => void;
  handlePublish: () => Promise<void>;
  isPublishing: boolean;
  isUploading: boolean;
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>, field: "imageUrl" | "musicUrl") => void;
  notice: { type: "ok" | "err"; text: string } | null;
  onBack: () => void;
};

export function InvitationForm({
  draft,
  updateDraft,
  handlePublish,
  isPublishing,
  isUploading,
  handleFileUpload,
  notice,
  onBack,
}: InvitationFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-7">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <button 
             onClick={onBack}
             className="font-poppins text-xs font-bold text-neutral-400 hover:text-black transition-colors uppercase "
           >
             ← Back to templates
           </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-poppins text-4xl font-semibold leading-tight tracking-tight">
              Design your invitation.
            </h1>
            <p className="font-poppins mt-2 max-w-xl text-sm leading-6 text-[#3a3a3a]">
              Edit couple details, assets, and story while preview stays in sync.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="font-poppins h-11 rounded-full bg-[#346739] px-6 text-sm font-semibold text-white transition hover:bg-[#2d5a32] disabled:bg-[#e5e5e5] disabled:text-[#6a6a6a] shadow-sm"
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </button>
        </div>
        {notice && (
          <p
            className={`font-poppins rounded-[12px] px-4 py-2 text-sm font-medium ${
              notice.type === "ok"
                ? "bg-[#edfce9] text-[#346739]"
                : "bg-[#fce8e6] text-[#b30000]"
            }`}
          >
            {notice.text}
          </p>
        )}
      </header>

      <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
              Bride name
            </span>
            <input
              value={draft.brideName}
              onChange={(event) => updateDraft("brideName", event.target.value)}
              className="font-poppins h-12 rounded-[12px] border border-[#d9d9dd] bg-white px-4 text-sm outline-none transition focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
              Groom name
            </span>
            <input
              value={draft.groomName}
              onChange={(event) => updateDraft("groomName", event.target.value)}
              className="font-poppins h-12 rounded-[12px] border border-[#d9d9dd] bg-white px-4 text-sm outline-none transition focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
              Date
            </span>
            <input
              type="date"
              value={draft.date}
              onChange={(event) => updateDraft("date", event.target.value)}
              className="font-poppins h-12 rounded-[12px] border border-[#d9d9dd] bg-white px-4 text-sm outline-none transition focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
              Venue
            </span>
            <input
              value={draft.venue}
              onChange={(event) => updateDraft("venue", event.target.value)}
              className="font-poppins h-12 rounded-[12px] border border-[#d9d9dd] bg-white px-4 text-sm outline-none transition focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6a6a]">
            Story
          </span>
          <textarea
            value={draft.story}
            onChange={(event) => updateDraft("story", event.target.value)}
            rows={7}
            className="font-poppins resize-none rounded-[12px] border border-[#d9d9dd] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handleFileUpload(event, "imageUrl")}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            className="font-poppins h-12 rounded-full border border-[#d9d9dd] bg-[#eeece7] px-4 text-sm font-semibold transition hover:bg-[#e5e2db] disabled:opacity-60"
          >
            {isUploading ? "Uploading…" : "Upload image"}
          </button>

          <input
            ref={musicInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(event) => void handleFileUpload(event, "musicUrl")}
          />
          <button
            type="button"
            onClick={() => musicInputRef.current?.click()}
            disabled={isUploading}
            className="font-poppins h-12 rounded-full border border-[#d9d9dd] bg-[#eeece7] px-4 text-sm font-semibold transition hover:bg-[#e5e2db] disabled:opacity-60"
          >
            {isUploading ? "Uploading…" : "Upload music"}
          </button>
        </div>
      </form>
    </div>
  );
}
