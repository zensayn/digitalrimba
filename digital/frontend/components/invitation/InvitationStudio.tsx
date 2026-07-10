"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  AltArrowLeft,
  SquareTopUp,
  Hearts,
  Calendar,
  Confetti,
  NotebookMinimalistic,
  GalleryMinimalistic,
  Crown,
  ChatRound,
  Palette,
  ChecklistMinimalistic,
  Gift,
  MusicNote,
  HandHeart,
} from "@solar-icons/react";
import { InvitationPreview } from "./InvitationPreview";
import { TemplateSelector, templates, type Template } from "./TemplateSelector";
import { InvitationForm, type EditorSectionId } from "./InvitationForm";
import { MUSIC_MAX_BYTES } from "./MusicPicker";
import { fetchInvitation, checkSlug, errorStatus } from "@/lib/api/invitations";
import {
  emptyInvitationConfig,
  fromLegacyContent,
  type InvitationConfig,
  type ThemeSectionId,
} from "@/lib/invitation-config";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";
const INVITE_DOMAIN = process.env.NEXT_PUBLIC_INVITE_DOMAIN ?? "rimba.io";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Mirrors the warm-narrative theme sections 1:1 (plus "music", a player
// setting rather than a theme section). Toggleable entries write
// sections.enabled[id].
const sections: { id: EditorSectionId; label: string; hint: string; Icon: typeof Hearts; toggleable: boolean }[] = [
  { id: "cover", label: "Cover", hint: "The opening screen with your names and date.", Icon: Crown, toggleable: true },
  { id: "greeting", label: "Greeting", hint: "A short welcome for your guests.", Icon: ChatRound, toggleable: true },
  { id: "couple", label: "Couple", hint: "Bride and groom details as they'll appear.", Icon: Hearts, toggleable: true },
  { id: "lovestory", label: "Love Story", hint: "Chapters of your journey together.", Icon: NotebookMinimalistic, toggleable: true },
  { id: "akad", label: "Akad", hint: "When and where the akad takes place.", Icon: Calendar, toggleable: true },
  { id: "resepsi", label: "Resepsi", hint: "When and where the reception happens.", Icon: Confetti, toggleable: true },
  { id: "dresscode", label: "Dress Code", hint: "Guide guests on what to wear.", Icon: Palette, toggleable: true },
  { id: "gallery", label: "Gallery", hint: "Photos of the two of you.", Icon: GalleryMinimalistic, toggleable: true },
  { id: "rsvp", label: "RSVP", hint: "Let guests confirm their attendance.", Icon: ChecklistMinimalistic, toggleable: true },
  { id: "gift", label: "Gifts", hint: "Bank accounts for digital envelopes.", Icon: Gift, toggleable: true },
  { id: "closing", label: "Closing", hint: "A warm thank-you to close the invitation.", Icon: HandHeart, toggleable: true },
  { id: "music", label: "Music", hint: "Background music for the invitation.", Icon: MusicNote, toggleable: false },
];

// Client-side mirror of the backend slug rules (validSlugRe in invitation.go).
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function coupleNamesOf(config: InvitationConfig): string {
  return `${config.couple.bride.name || "Bride"} & ${config.couple.groom.name || "Groom"}`;
}

// Starter content so the create-flow preview isn't empty.
function starterConfig(): InvitationConfig {
  const config = emptyInvitationConfig();
  config.couple.bride.name = "Alya";
  config.couple.groom.name = "Bima";
  config.weddingDate = "2026-08-08";
  config.events.resepsi.venue = "Rimba Glass House";
  return config;
}

// Fetches a short-lived JWT from the Better-Auth JWT plugin endpoint.
async function getBearerToken(): Promise<string> {
  const res = await fetch("/api/auth/token");
  if (!res.ok) throw new Error("Not signed in");
  const { token } = (await res.json()) as { token: string };
  return token;
}

export function InvitationStudio({ invitationId }: { invitationId?: string }) {
  if (invitationId) {
    return <EditInvitationLoader invitationId={invitationId} />;
  }
  return (
    <InvitationStudioEditor
      initialStep="select"
      initialDraft={starterConfig()}
      initialTemplate={null}
      initialInvitationId={null}
      initialSlug={null}
      initialPublishedAt={null}
    />
  );
}

// Fetches the invitation, then hands it to the editor once as initial props —
// never synced into editor state after mount.
function EditInvitationLoader({ invitationId }: { invitationId: string }) {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["invitations", "by-id", invitationId],
    queryFn: () => fetchInvitation(invitationId),
  });

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-poppins text-sm text-[#616161]">Loading invitation…</p>
      </main>
    );
  }

  if (error) {
    const status = errorStatus(error);
    const notFound = status === 403 || status === 404;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white">
        <p className="font-poppins text-sm font-medium text-[#212121]">
          {notFound ? "Invitation not found" : "Couldn't load invitation"}
        </p>
        <div className="flex items-center gap-4">
          {!notFound && (
            <button
              type="button"
              onClick={() => refetch()}
              className="font-poppins text-xs font-semibold text-[#346739] underline"
            >
              Retry
            </button>
          )}
          <Link
            href="/dashboard/invitations"
            className="font-poppins text-xs font-semibold text-[#346739] underline"
          >
            Back to invitations
          </Link>
        </div>
      </main>
    );
  }

  const draft = fromLegacyContent(data.content);
  let template = templates.find((t) => t.id === draft.templateId);
  if (!template) {
    console.warn(`Unknown templateId ${draft.templateId}; falling back to ${templates[0].id}`);
    template = templates[0];
  }

  return (
    // key: navigating between two invitation ids remounts the editor with fresh state.
    <InvitationStudioEditor
      key={data.id}
      initialStep="edit"
      initialDraft={draft}
      initialTemplate={template}
      initialInvitationId={data.id}
      initialSlug={data.slug}
      initialPublishedAt={data.published_at}
    />
  );
}

type InvitationStudioEditorProps = {
  initialStep: "select" | "edit";
  initialDraft: InvitationConfig;
  initialTemplate: Template | null;
  initialInvitationId: string | null;
  initialSlug: string | null;
  initialPublishedAt: string | null;
};

function InvitationStudioEditor(props: InvitationStudioEditorProps) {
  const [step, setStep] = useState<"select" | "edit">(props.initialStep);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(props.initialTemplate);
  const [activeSection, setActiveSection] = useState<EditorSectionId>("cover");
  const [previewLoaded, setPreviewLoaded] = useState(false);
  // Below lg the editor shows one pane at a time; the iframe stays mounted
  // (just display:none) so switching never reloads the theme or drops the
  // postMessage bridge.
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [draft, setDraft] = useState<InvitationConfig>(props.initialDraft);
  const [isPublishing, setIsPublishing] = useState(false);
  // "processing" while converting to webp/mp3 (audio can take seconds on a
  // slow phone), "uploading" during the R2 PUT — so the UI can say which.
  const [uploadStage, setUploadStage] = useState<"processing" | "uploading" | null>(null);
  const isUploading = uploadStage !== null;
  const [invitationId, setInvitationId] = useState<string | null>(props.initialInvitationId);
  const [slug, setSlug] = useState<string | null>(props.initialSlug);
  const [publishedAt, setPublishedAt] = useState<string | null>(props.initialPublishedAt);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const queryClient = useQueryClient();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const themeOrigin = selectedTemplate ? new URL(selectedTemplate.demoUrl).origin : null;
  const previewUrl = selectedTemplate ? `${selectedTemplate.demoUrl.replace(/\/$/, "")}/preview` : null;

  function postDraft(config: InvitationConfig) {
    if (!themeOrigin) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "RIMBA_DRAFT_UPDATE", config }, themeOrigin);
  }

  // The theme's /preview route announces itself when mounted; reply with the
  // current draft so the iframe never renders stale demo content.
  useEffect(() => {
    if (!themeOrigin) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== themeOrigin) return;
      if ((event.data as { type?: string } | null)?.type === "RIMBA_DRAFT_READY") {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "RIMBA_DRAFT_UPDATE", config: draftRef.current },
          themeOrigin,
        );
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [themeOrigin]);

  // Debounced live updates so keystrokes don't flood the bridge.
  useEffect(() => {
    if (!themeOrigin) return;
    const timer = setTimeout(() => postDraft(draft), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, themeOrigin]);

  async function toWebp(file: File): Promise<File> {
    // Only raster stills worth converting. Skip audio, existing webp,
    // svg (vector), gif (animation would be flattened).
    if (!/^image\/(png|jpe?g)$/.test(file.type)) return file;
    if (typeof OffscreenCanvas === "undefined") return file;
    // Pre-decode cap mirrors toMp3: decoding a giant still balloons to
    // width×height×4 bytes of pixels and can OOM mobile Safari. Pass through
    // so the post-conversion size cap rejects it with a clear message.
    if (file.size > 20 * 1024 * 1024) return file;
    let worker: Worker;
    try {
      worker = new Worker(new URL("./webp.worker.ts", import.meta.url));
    } catch {
      return file; // CSP/embed context blocks workers → upload the original
    }
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        // A hung worker resolves null after 30s → upload the original file.
        const timer = setTimeout(() => resolve(null), 30_000);
        worker.onmessage = (e: MessageEvent<Blob | null>) => {
          clearTimeout(timer);
          resolve(e.data);
        };
        worker.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        worker.postMessage(file);
      });
      if (!blob || blob.size >= file.size) return file; // conversion failed or lost
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
    } finally {
      worker.terminate();
    }
  }

  async function encodeMp3InWorker(buf: AudioBuffer): Promise<Blob | null> {
    // Hand the PCM to the worker as transferred ArrayBuffers — structured
    // cloning would duplicate hundreds of MB of decoded audio in RAM.
    const channels: ArrayBuffer[] = [];
    for (let c = 0; c < Math.min(buf.numberOfChannels, 2); c++) {
      channels.push(buf.getChannelData(c).buffer as ArrayBuffer);
    }
    const worker = new Worker(new URL("./mp3.worker.ts", import.meta.url));
    try {
      return await new Promise<Blob | null>((resolve) => {
        // mp3 encoding is slow on long tracks; 60s before giving up → null
        // falls back to uploading the original file.
        const timer = setTimeout(() => resolve(null), 60_000);
        worker.onmessage = (e: MessageEvent<Blob | null>) => {
          clearTimeout(timer);
          resolve(e.data);
        };
        worker.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        worker.postMessage({ channels, sampleRate: buf.sampleRate }, channels);
      });
    } finally {
      worker.terminate();
    }
  }

  async function toMp3(file: File, maxBytes: number): Promise<File> {
    if (!file.type.startsWith("audio/")) return file;
    // Generation-loss guard: an mp3 already under the caller's cap uploads
    // as-is — re-encoding mp3→mp3 causes audible artifacts. Format + final
    // size decide, not bitrate.
    if (file.type === "audio/mpeg" && file.size <= maxBytes) return file;
    // Pre-decode cap: decodeAudioData expands compressed audio to raw PCM
    // (~10 MB per stereo minute); a 30 MB AAC could balloon past 300 MB and
    // crash mobile Safari, wiping studio progress. Pass through so the music
    // cap rejects it with a clear message instead.
    if (file.size > 20 * 1024 * 1024) return file;
    try {
      // OfflineAudioContext pins the rate to 44.1 kHz — decodeAudioData
      // resamples for us, and lamejs is happiest at 44100.
      const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await file.arrayBuffer());
      const blob = await encodeMp3InWorker(buf);
      if (!blob || blob.size >= file.size) return file; // conversion failed or lost
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".mp3", { type: "audio/mpeg" });
    } catch {
      return file; // undecodable → upload original, the size cap still applies
    }
  }

  async function uploadToR2(file: File): Promise<string> {
    const presignRes = await fetch(
      `/api/upload/presign?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
    );
    if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.status}`);
    const { uploadUrl, uploadToken, publicUrl } = (await presignRes.json()) as {
      uploadUrl: string;
      uploadToken: string;
      publicUrl: string;
    };

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "X-Upload-Token": uploadToken,
      },
      body: file,
    });
    if (!uploadRes.ok) throw new Error(`R2 upload failed: ${uploadRes.status}`);
    return publicUrl;
  }

  async function uploadFile(file: File, maxBytes = 15 * 1024 * 1024): Promise<string | null> {
    // Files go straight from the browser to R2; only the URL is stored in the
    // DB. Cap size so a stray huge file doesn't hammer the upload worker
    // (images 15 MB default; music passes 5 MB).
    setUploadStage("processing");
    setNotice(null);
    try {
      // Images become WebP and heavy audio becomes 128 kbps MP3 first, so the
      // size cap applies to the bytes that actually go to R2.
      file = await toWebp(file);
      file = await toMp3(file, maxBytes);
      if (file.size > maxBytes) {
        setNotice({ type: "err", text: `File is too large — keep it under ${Math.round(maxBytes / (1024 * 1024))} MB.` });
        return null;
      }
      setUploadStage("uploading");
      const url = await uploadToR2(file);
      setNotice({ type: "ok", text: "File uploaded." });
      return url;
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Upload failed." });
      return null;
    } finally {
      setUploadStage(null);
    }
  }

  async function publishInvitation(currentDraft: InvitationConfig, chosenSlug: string | null): Promise<void> {
    const token = await getBearerToken();

    const content = { ...currentDraft, templateId: selectedTemplate?.id };
    const coupleNames = coupleNamesOf(currentDraft);

    let id = invitationId;
    if (!id) {
      const createRes = await fetch(`${API_URL}/api/invitations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ couple_names: coupleNames, content }),
      });
      if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
      const created = (await createRes.json()) as { id: string; slug: string };
      id = created.id;
      setInvitationId(id);
      setSlug(created.slug);
    }

    const patchRes = await fetch(`${API_URL}/api/invitations/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        published: true,
        couple_names: coupleNames,
        ...(chosenSlug ? { slug: chosenSlug } : {}),
      }),
    });
    if (!patchRes.ok) {
      if (patchRes.status === 409) throw new Error("That domain name was just taken — pick another.");
      throw new Error(`Publish failed: ${patchRes.status}`);
    }
    const updated = (await patchRes.json()) as { slug: string; published_at: string | null };
    setSlug(updated.slug);
    setPublishedAt(updated.published_at ?? new Date().toISOString());

    // The list page and edit loader read through React Query; these raw
    // mutations bypass it, so invalidate the cache to avoid serving stale data.
    queryClient.invalidateQueries({ queryKey: ["invitations"] });
  }

  async function handlePublish(chosenSlug: string | null) {
    // An in-flight upload will mutate the draft when it resolves — publishing
    // now would persist a stale asset URL.
    if (isUploading) {
      setNotice({ type: "err", text: "Wait for the upload to finish before publishing." });
      return;
    }
    setIsPublishing(true);
    setNotice(null);
    try {
      await publishInvitation(draft, chosenSlug);
      setShowPublish(false);
      setNotice({
        type: "ok",
        text: "Published — changes may take up to a minute to appear on your live website.",
      });
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Publish failed." });
    } finally {
      setIsPublishing(false);
    }
  }

  function toggleSection(id: ThemeSectionId) {
    setDraft((current) => {
      // A missing flag renders as enabled (see the rail's `?? true`), so the
      // first toggle must flip from that effective state, not from undefined.
      const effective = current.sections.enabled[id] ?? true;
      return {
        ...current,
        sections: {
          ...current.sections,
          enabled: { ...current.sections.enabled, [id]: !effective },
        },
      };
    });
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewLoaded(false);
    setActiveSection("cover");
    setMobilePane("edit");
    setStep("edit");
  };

  const activeMeta = sections.find((s) => s.id === activeSection) ?? sections[0];
  const isPublished = publishedAt !== null;
  const liveSlug = slug && !slug.startsWith("draft-") ? slug : null;

  if (step === "select") {
    return (
      <main className="min-h-screen bg-white text-[#212121]">
        <div className="p-5 sm:p-8 lg:p-12">
          <TemplateSelector onSelect={handleTemplateSelect} />
        </div>
      </main>
    );
  }

  return (
    // Full-screen takeover: covers the dashboard shell so the studio owns the whole viewport.
    <main className="fixed inset-0 z-50 flex flex-col bg-white text-[#212121]">
      {/* Top bar — breadcrumb left, actions right */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setStep("select")}
            className="font-poppins flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#616161] transition-[background-color,transform] duration-150 hover:bg-neutral-100 hover:text-[#212121] active:scale-[0.97]"
          >
            <AltArrowLeft size={15} />
            Templates
          </button>
          <span className="hidden h-4 w-px bg-[#d9d9dd] sm:block" />
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <span className="font-poppins truncate text-sm font-medium">{selectedTemplate?.name}</span>
            <span className="font-poppins shrink-0 rounded-full bg-[#edfce9] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[#346739]">
              {selectedTemplate?.theme}
            </span>
            {liveSlug && isPublished && (
              <a
                href={`https://${liveSlug}.${INVITE_DOMAIN}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins hidden shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-[#616161] transition-colors hover:text-[#212121] md:block"
              >
                {liveSlug}.{INVITE_DOMAIN}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {notice && (
              <motion.p
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className={cn(
                  "font-poppins hidden rounded-full px-3.5 py-1.5 text-xs font-medium md:block",
                  notice.type === "ok" ? "bg-[#edfce9] text-[#346739]" : "bg-[#fce8e6] text-[#b30000]",
                )}
              >
                {notice.text}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => {
              // Any saved invitation opens at its own domain — the chosen
              // name once published, the unguessable draft-… preview link
              // before that. Only a brand-new unsaved draft falls back to
              // the template demo (nothing of the user's exists yet).
              const target = slug ? `https://${slug}.${INVITE_DOMAIN}` : selectedTemplate?.demoUrl;
              if (target) window.open(target, "_blank", "noopener");
            }}
            className="font-poppins flex h-10 items-center gap-1.5 rounded-full border border-[#d9d9dd] px-4 text-xs font-semibold text-[#212121] transition-[background-color,transform] duration-150 hover:bg-neutral-50 active:scale-[0.97]"
          >
            {slug ? (isPublished ? "View live" : "Preview link") : "Live demo"}
            <SquareTopUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowPublish(true)}
            disabled={isPublishing || isUploading}
            className="font-poppins h-10 rounded-full bg-[#346739] px-5 text-xs font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#2d5a32] active:scale-[0.97] disabled:bg-[#e5e5e5] disabled:text-[#6a6a6a]"
          >
            {isPublishing ? "Publishing…" : isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      {/* Preview column is fixed at phone width so themes render their mobile layout; form takes the rest. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[248px_1fr_min(430px,34vw)] lg:overflow-visible">
        {/* Section rail */}
        <nav
          className={cn(
            "border-b border-[#e5e7eb] bg-white px-3 py-3 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-4 lg:py-6",
            mobilePane === "preview" && "hidden lg:block",
          )}
        >
          <p className="font-poppins mb-2 hidden px-3 text-[11px] font-semibold uppercase text-[#93939f] lg:block">
            Customize
          </p>
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {sections.map(({ id, label, Icon, toggleable }) => {
              const enabled = !toggleable || (draft.sections.enabled[id] ?? true);
              return (
                <div
                  key={id}
                  className={cn(
                    "flex shrink-0 items-center rounded-[12px] transition-colors",
                    activeSection === id && "bg-[#eeece7]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      "font-poppins flex flex-1 items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[13px] transition-[color,transform] duration-150 active:scale-[0.98]",
                      activeSection === id ? "font-medium text-[#212121]" : "font-normal text-[#616161] hover:text-[#212121]",
                      !enabled && "opacity-45",
                    )}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                  {toggleable && (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`${enabled ? "Disable" : "Enable"} ${label} section`}
                      onClick={() => toggleSection(id as ThemeSectionId)}
                      className={cn(
                        "relative mr-2 h-4 w-7 shrink-0 rounded-full transition-colors",
                        enabled ? "bg-[#346739]" : "bg-[#d9d9dd]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-3 rounded-full bg-white transition-[left] duration-150",
                          enabled ? "left-[14px]" : "left-0.5",
                        )}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Form panel */}
        <section
          className={cn(
            // pb-24 keeps the last field clear of the mobile pane switcher.
            "border-b border-[#e5e7eb] bg-white px-5 py-6 pb-24 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-8 lg:py-8 lg:pb-8",
            mobilePane === "preview" && "hidden lg:block",
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className="mx-auto w-full max-w-xl"
              key={activeSection}
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 8,
                filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6, filter: "blur(0px)" }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              <h2 className="font-poppins text-2xl font-semibold tracking-tight">{activeMeta.label}</h2>
              <p className="font-poppins mt-1.5 text-sm text-[#616161]">{activeMeta.hint}</p>
              <div className="mt-6">
                <InvitationForm
                  section={activeSection}
                  config={draft}
                  onChange={setDraft}
                  isUploading={isUploading}
                  uploadStage={uploadStage}
                  uploadFile={uploadFile}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Live theme preview — full-bleed canvas */}
        <section
          className={cn(
            "relative bg-[#04241e] lg:block lg:min-h-0",
            mobilePane === "edit" ? "hidden" : "min-h-0 flex-1",
          )}
        >
          {!previewLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-white/10 to-transparent" />
              <p className="font-poppins relative text-xs text-white/60">Loading theme…</p>
            </div>
          )}
          {previewUrl ? (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              title={selectedTemplate?.name}
              onLoad={() => setPreviewLoaded(true)}
              style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-300",
                previewLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          ) : (
            <InvitationPreview config={draft} />
          )}
        </section>
      </div>

      {/* Mobile pane switcher — desktop shows all three columns at once. */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 rounded-full border border-[#d9d9dd] bg-white p-1 shadow-[0_10px_36px_rgba(10,10,10,0.18)] lg:hidden">
        {(["edit", "preview"] as const).map((pane) => (
          <button
            key={pane}
            type="button"
            onClick={() => setMobilePane(pane)}
            aria-pressed={mobilePane === pane}
            className={cn(
              "font-poppins rounded-full px-5 py-2 text-xs font-semibold capitalize transition-colors duration-150",
              mobilePane === pane ? "bg-[#346739] text-white" : "text-[#616161]",
            )}
          >
            {pane}
          </button>
        ))}
      </div>

      {/* Mobile notice toast — the header notice is md+ only. */}
      <AnimatePresence>
        {notice && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={cn(
              "font-poppins absolute bottom-20 left-1/2 z-20 w-max max-w-[85vw] -translate-x-1/2 truncate rounded-full px-4 py-2 text-xs font-medium shadow-[0_10px_36px_rgba(10,10,10,0.14)] md:hidden",
              notice.type === "ok" ? "bg-[#edfce9] text-[#346739]" : "bg-[#fce8e6] text-[#b30000]",
            )}
          >
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>

      {showPublish && (
        <PublishDialog
          initialValue={liveSlug ?? slugify(coupleNamesOf(draft))}
          currentSlug={liveSlug}
          locked={isPublished}
          isPublishing={isPublishing}
          onCancel={() => setShowPublish(false)}
          onConfirm={(chosenSlug) => void handlePublish(isPublished ? null : chosenSlug)}
        />
      )}
    </main>
  );
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "reserved" | "error";

function PublishDialog({
  initialValue,
  currentSlug,
  locked,
  isPublishing,
  onCancel,
  onConfirm,
}: {
  initialValue: string;
  currentSlug: string | null;
  locked: boolean;
  isPublishing: boolean;
  onCancel: () => void;
  onConfirm: (slug: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  // Result of the last remote availability check, keyed by the value it was
  // for — anything else derives during render (no setState-in-effect).
  const [remote, setRemote] = useState<{ for: string; status: SlugStatus } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Dialog behavior: focus moves in on open, stays trapped, Escape closes,
  // and focus returns to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button, input") ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientInvalid = !value || !SLUG_RE.test(value) || value.startsWith("draft-");
  const isOwnSlug = currentSlug !== null && value === currentSlug;
  const needsRemoteCheck = !locked && !clientInvalid && !isOwnSlug;

  const status: SlugStatus = locked
    ? "available"
    : clientInvalid
      ? "invalid"
      : isOwnSlug
        ? "available"
        : remote?.for === value
          ? remote.status
          : "checking";

  useEffect(() => {
    if (!needsRemoteCheck) return;
    const timer = setTimeout(() => {
      checkSlug(value)
        .then((res) =>
          setRemote({ for: value, status: res.available ? "available" : ((res.reason || "taken") as SlugStatus) }),
        )
        .catch(() => setRemote({ for: value, status: "error" }));
    }, 400);
    return () => clearTimeout(timer);
  }, [value, needsRemoteCheck]);

  const statusLine: Record<SlugStatus, { text: string; ok: boolean }> = {
    idle: { text: " ", ok: true },
    checking: { text: "Checking availability…", ok: true },
    available: { text: "This domain is available.", ok: true },
    taken: { text: "This domain is already taken.", ok: false },
    invalid: { text: "Use lowercase letters, numbers, and hyphens only.", ok: false },
    reserved: { text: "This name is reserved.", ok: false },
    error: { text: "Couldn't check availability — try again.", ok: false },
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-dialog-title"
        aria-describedby="publish-dialog-desc"
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_28px_80px_rgba(10,10,10,0.25)]"
      >
        <h3 id="publish-dialog-title" className="font-poppins text-lg font-semibold tracking-tight">
          {locked ? "Update your invitation" : "Publish your invitation"}
        </h3>
        <p id="publish-dialog-desc" className="font-poppins mt-1 text-sm text-[#616161]">
          {locked
            ? "Your invitation stays at the same address."
            : "Pick the web address your guests will visit. It can't be changed after publishing."}
        </p>

        <div className="mt-5">
          <label className="font-poppins text-xs font-semibold uppercase text-[#6a6a6a]" htmlFor="invite-slug">
            Your domain
          </label>
          <div className="mt-2 flex items-center overflow-hidden rounded-[12px] border border-[#d9d9dd] bg-white focus-within:border-[#346739] focus-within:ring-4 focus-within:ring-[#346739]/5">
            <input
              id="invite-slug"
              value={value}
              disabled={locked}
              onChange={(event) => setValue(slugify(event.target.value))}
              className="font-poppins h-12 min-w-0 flex-1 px-4 text-sm outline-none disabled:bg-neutral-50 disabled:text-[#616161]"
            />
            <span className="font-poppins shrink-0 border-l border-[#e5e7eb] bg-neutral-50 px-3 text-sm text-[#93939f]">
              .{INVITE_DOMAIN}
            </span>
          </div>
          {!locked && (
            <p
              className={cn(
                "font-poppins mt-2 min-h-4 text-xs",
                statusLine[status].ok ? "text-[#346739]" : "text-[#b30000]",
              )}
            >
              {statusLine[status].text}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="font-poppins h-10 rounded-full border border-[#d9d9dd] px-4 text-xs font-semibold text-[#212121] transition-[background-color,transform] duration-150 hover:bg-neutral-50 active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(value)}
            disabled={isPublishing || (!locked && status !== "available")}
            className="font-poppins h-10 rounded-full bg-[#346739] px-5 text-xs font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#2d5a32] active:scale-[0.97] disabled:bg-[#e5e5e5] disabled:text-[#6a6a6a]"
          >
            {isPublishing ? "Publishing…" : locked ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
