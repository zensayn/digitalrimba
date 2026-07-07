"use client";

import { ChangeEvent, useRef, useState } from "react";
import { InvitationPreview } from "./InvitationPreview";
import type { InvitationDraft } from "./InvitationPreview";
import { TemplateSelector, type Template } from "./TemplateSelector";
import { InvitationForm } from "./InvitationForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

const initialDraft: InvitationDraft = {
  brideName: "Alya",
  groomName: "Bima",
  date: "2026-08-08",
  venue: "Rimba Glass House",
  story:
    "From quiet first meetings to a shared table full of family, every step has felt deeply rooted.",
  imageUrl: "",
  musicUrl: "",
  updatedAt: "0",
};

// Fetches a short-lived JWT from the Better-Auth JWT plugin endpoint.
async function getBearerToken(): Promise<string> {
  const res = await fetch("/api/auth/token");
  if (!res.ok) throw new Error("Not signed in");
  const { token } = (await res.json()) as { token: string };
  return token;
}

export function InvitationStudio() {
  const [step, setStep] = useState<"select" | "edit">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [draft, setDraft] = useState<InvitationDraft>(initialDraft);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const updateCount = useRef(0);

  function updateDraft(field: keyof InvitationDraft, value: string) {
    updateCount.current += 1;
    setDraft((current) => ({
      ...current,
      [field]: value,
      updatedAt: `${Date.now()}-${updateCount.current}`,
    }));
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

  async function publishInvitation(currentDraft: InvitationDraft): Promise<void> {
    const token = await getBearerToken();

    const content = {
      brideName: currentDraft.brideName,
      groomName: currentDraft.groomName,
      date: currentDraft.date,
      venue: currentDraft.venue,
      story: currentDraft.story,
      imageUrl: currentDraft.imageUrl,
      musicUrl: currentDraft.musicUrl,
      templateId: selectedTemplate?.id,
    };
    const coupleNames = `${currentDraft.brideName || "Bride"} & ${currentDraft.groomName || "Groom"}`;

    let id = invitationId;
    if (!id) {
      const createRes = await fetch(`${API_URL}/api/invitations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ couple_names: coupleNames, content }),
      });
      if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
      const created = (await createRes.json()) as { id: string };
      id = created.id;
      setInvitationId(id);
    }

    const patchRes = await fetch(`${API_URL}/api/invitations/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content, published: true }),
    });
    if (!patchRes.ok) throw new Error(`Publish failed: ${patchRes.status}`);
  }

  async function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "musicUrl",
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setNotice(null);
    try {
      const url = await uploadToR2(file);
      updateDraft(field, url);
      setNotice({ type: "ok", text: "File uploaded." });
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handlePublish() {
    setIsPublishing(true);
    setNotice(null);
    try {
      await publishInvitation(draft);
      setNotice({ type: "ok", text: "Published! Check psql for published_at." });
    } catch (err) {
      setNotice({ type: "err", text: err instanceof Error ? err.message : "Publish failed." });
    } finally {
      setIsPublishing(false);
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setStep("edit");
  };

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      {step === "select" ? (
        <div className="p-8 lg:p-12">
          <TemplateSelector onSelect={handleTemplateSelect} />
        </div>
      ) : (
        <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
          <section className="border-b border-[#0a0a0a]/10 px-5 py-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
            <InvitationForm
              draft={draft}
              updateDraft={updateDraft}
              handlePublish={handlePublish}
              isPublishing={isPublishing}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              notice={notice}
              onBack={() => setStep("select")}
            />
          </section>

          <section className="bg-[#1a3a3a] px-5 py-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center justify-between text-[#fffaf0]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8b94a]">
                  Live Preview
                </p>
                <p className="text-xs text-[#fffaf0]/70">Updated {draft.updatedAt}</p>
              </div>
              <InvitationPreview draft={draft} />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
