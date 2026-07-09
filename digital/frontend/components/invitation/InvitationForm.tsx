"use client";

import { ChangeEvent, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GalleryMinimalistic, MusicNote, AddCircle, TrashBinMinimalistic } from "@solar-icons/react";
import type {
  BankAccount,
  DressCodeColor,
  EventConfig,
  GalleryItem,
  InvitationConfig,
  LoveStoryChapter,
  PersonConfig,
  ThemeSectionId,
} from "@/lib/invitation-config";

// The editor rail mirrors the theme sections 1:1, plus "music" (a player
// setting, not a theme section).
export type EditorSectionId = ThemeSectionId | "music";

type InvitationFormProps = {
  section: EditorSectionId;
  config: InvitationConfig;
  onChange: (next: InvitationConfig) => void;
  isUploading: boolean;
  uploadFile: (file: File) => Promise<string | null>;
};

const labelClass = "font-poppins text-xs font-semibold uppercase text-[#6a6a6a]";
const inputClass =
  "font-poppins h-12 w-full rounded-[12px] border border-[#d9d9dd] bg-white px-4 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5";
const textareaClass =
  "font-poppins w-full resize-none rounded-[12px] border border-[#d9d9dd] bg-white px-4 py-3 text-sm leading-6 outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#346739] focus:ring-4 focus:ring-[#346739]/5";

function Field({ index, children }: { index: number; children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 6) * 0.05, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col gap-2"
    >
      {children}
    </motion.div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function UploadButton({
  label,
  value,
  accept,
  preview,
  isUploading,
  uploadFile,
  onUploaded,
}: {
  label: string;
  value: string;
  accept: string;
  preview: "image" | "text";
  isUploading: boolean;
  uploadFile: (file: File) => Promise<string | null>;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await uploadFile(file);
    if (url) onUploaded(url);
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => void handleChange(event)} />
      {value &&
        (preview === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Uploaded file" className="h-32 w-full rounded-[16px] border border-[#e5e7eb] object-cover" />
        ) : (
          <p className="font-poppins truncate rounded-[12px] border border-[#e5e7eb] bg-neutral-50 px-4 py-3 text-xs text-[#616161]">
            {value}
          </p>
        ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="font-poppins flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9d9dd] bg-[#eeece7] px-4 text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-[#e5e2db] active:scale-[0.98] disabled:opacity-60"
      >
        {accept.startsWith("audio") ? <MusicNote size={16} /> : <GalleryMinimalistic size={16} />}
        {isUploading ? "Uploading…" : value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
      </button>
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  makeEmpty,
  addLabel,
  renderItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  addLabel: string;
  renderItem: (item: T, update: (next: T) => void, index: number) => React.ReactNode;
}) {
  return (
    <div className="grid gap-4">
      {items.map((item, index) => (
        <div key={index} className="relative grid gap-3 rounded-[16px] border border-[#e5e7eb] bg-neutral-50/60 p-4">
          <button
            type="button"
            aria-label="Remove item"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-[#93939f] transition-colors hover:bg-[#fce8e6] hover:text-[#b30000]"
          >
            <TrashBinMinimalistic size={15} />
          </button>
          {renderItem(item, (next) => onChange(items.map((existing, i) => (i === index ? next : existing))), index)}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeEmpty()])}
        className="font-poppins flex h-11 items-center justify-center gap-2 rounded-full border border-dashed border-[#d9d9dd] px-4 text-sm font-medium text-[#616161] transition-colors hover:border-[#346739]/40 hover:text-[#212121]"
      >
        <AddCircle size={16} />
        {addLabel}
      </button>
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-poppins rounded-[16px] border border-dashed border-[#d9d9dd] bg-neutral-50/60 px-4 py-4 text-sm leading-6 text-[#616161]">
      {children}
    </p>
  );
}

function PersonFields({
  title,
  person,
  onChange,
  isUploading,
  uploadFile,
}: {
  title: string;
  person: PersonConfig;
  onChange: (next: PersonConfig) => void;
  isUploading: boolean;
  uploadFile: (file: File) => Promise<string | null>;
}) {
  return (
    <div className="grid gap-4 rounded-[16px] border border-[#e5e7eb] p-4">
      <p className="font-poppins text-sm font-semibold">{title}</p>
      <TextInput label="Name" value={person.name} onChange={(v) => onChange({ ...person, name: v })} placeholder="Alya" />
      <TextInput
        label="Full name"
        value={person.fullName}
        onChange={(v) => onChange({ ...person, fullName: v })}
        placeholder="Alya Paramitha Santoso"
      />
      <TextInput
        label="Parents"
        value={person.parents}
        onChange={(v) => onChange({ ...person, parents: v })}
        placeholder="Putri dari Bpk. … & Ibu …"
      />
      <TextInput
        label="Instagram"
        value={person.instagram}
        onChange={(v) => onChange({ ...person, instagram: v })}
        placeholder="@alya"
      />
      <div className="flex flex-col gap-2">
        <span className={labelClass}>Photo</span>
        <UploadButton
          label="photo"
          value={person.photo}
          accept="image/*"
          preview="image"
          isUploading={isUploading}
          uploadFile={uploadFile}
          onUploaded={(url) => onChange({ ...person, photo: url })}
        />
      </div>
    </div>
  );
}

function EventFields({
  event,
  onChange,
}: {
  event: EventConfig;
  onChange: (next: EventConfig) => void;
}) {
  return (
    <>
      <Field index={0}>
        <TextInput label="Title" value={event.title} onChange={(v) => onChange({ ...event, title: v })} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <TextInput label="Day" value={event.day} onChange={(v) => onChange({ ...event, day: v })} placeholder="Sabtu" />
        <TextInput label="Date" value={event.date} onChange={(v) => onChange({ ...event, date: v })} placeholder="8 Agustus 2026" />
        <TextInput label="Time" value={event.time} onChange={(v) => onChange({ ...event, time: v })} placeholder="08.00 – 10.00 WIB" />
      </div>
      <Field index={1}>
        <TextInput label="Venue" value={event.venue} onChange={(v) => onChange({ ...event, venue: v })} />
      </Field>
      <Field index={2}>
        <TextInput label="Address" value={event.address} onChange={(v) => onChange({ ...event, address: v })} />
      </Field>
      <Field index={3}>
        <TextInput label="Google Maps link" value={event.mapsUrl} onChange={(v) => onChange({ ...event, mapsUrl: v })} />
      </Field>
      <Field index={4}>
        <TextInput label="Maps embed URL" value={event.embedUrl} onChange={(v) => onChange({ ...event, embedUrl: v })} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Starts (for calendar)"
          type="datetime-local"
          value={event.startISO}
          onChange={(v) => onChange({ ...event, startISO: v })}
        />
        <TextInput
          label="Ends (for calendar)"
          type="datetime-local"
          value={event.endISO}
          onChange={(v) => onChange({ ...event, endISO: v })}
        />
      </div>
    </>
  );
}

export function InvitationForm({ section, config, onChange, isUploading, uploadFile }: InvitationFormProps) {
  const set = <K extends keyof InvitationConfig>(key: K, value: InvitationConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
      {section === "cover" && (
        <>
          <Field index={0}>
            <TextInput label="Wedding date" type="date" value={config.weddingDate} onChange={(v) => set("weddingDate", v)} />
          </Field>
          <InfoNote>
            The cover shows the couple names from the Couple section over this date.
          </InfoNote>
        </>
      )}

      {section === "greeting" && (
        <InfoNote>This section greets your guests using the couple details — nothing extra to fill in.</InfoNote>
      )}

      {section === "couple" && (
        <>
          <Field index={0}>
            <PersonFields
              title="Bride"
              person={config.couple.bride}
              onChange={(bride) => set("couple", { ...config.couple, bride })}
              isUploading={isUploading}
              uploadFile={uploadFile}
            />
          </Field>
          <Field index={1}>
            <PersonFields
              title="Groom"
              person={config.couple.groom}
              onChange={(groom) => set("couple", { ...config.couple, groom })}
              isUploading={isUploading}
              uploadFile={uploadFile}
            />
          </Field>
          <Field index={2}>
            <TextInput
              label="Hashtag"
              value={config.couple.hashtag}
              onChange={(v) => set("couple", { ...config.couple, hashtag: v })}
              placeholder="#AlyaBimaForever"
            />
          </Field>
          <Field index={3}>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Quote</span>
              <textarea
                rows={4}
                value={config.couple.quote}
                onChange={(event) => set("couple", { ...config.couple, quote: event.target.value })}
                className={textareaClass}
              />
            </label>
          </Field>
        </>
      )}

      {section === "lovestory" && (
        <ListEditor
          items={config.loveStory}
          onChange={(loveStory) => set("loveStory", loveStory)}
          makeEmpty={(): LoveStoryChapter => ({ chapter: "", year: "", description: "", image: "" })}
          addLabel="Add chapter"
          renderItem={(chapter, update) => (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <TextInput label="Chapter" value={chapter.chapter} onChange={(v) => update({ ...chapter, chapter: v })} placeholder="First met" />
                <TextInput label="Year" value={chapter.year} onChange={(v) => update({ ...chapter, year: v })} placeholder="2019" />
              </div>
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Story</span>
                <textarea
                  rows={4}
                  value={chapter.description}
                  onChange={(event) => update({ ...chapter, description: event.target.value })}
                  className={textareaClass}
                />
              </label>
              <UploadButton
                label="photo"
                value={chapter.image}
                accept="image/*"
                preview="image"
                isUploading={isUploading}
                uploadFile={uploadFile}
                onUploaded={(url) => update({ ...chapter, image: url })}
              />
            </>
          )}
        />
      )}

      {section === "akad" && (
        <EventFields event={config.events.akad} onChange={(akad) => set("events", { ...config.events, akad })} />
      )}

      {section === "resepsi" && (
        <EventFields event={config.events.resepsi} onChange={(resepsi) => set("events", { ...config.events, resepsi })} />
      )}

      {section === "dresscode" && (
        <>
          <Field index={0}>
            <TextInput
              label="Theme"
              value={config.dressCode.theme}
              onChange={(v) => set("dressCode", { ...config.dressCode, theme: v })}
              placeholder="Earthy formal"
            />
          </Field>
          <Field index={1}>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Description</span>
              <textarea
                rows={4}
                value={config.dressCode.description}
                onChange={(event) => set("dressCode", { ...config.dressCode, description: event.target.value })}
                className={textareaClass}
              />
            </label>
          </Field>
          <Field index={2}>
            <span className={labelClass}>Palette</span>
            <ListEditor
              items={config.dressCode.colors}
              onChange={(colors) => set("dressCode", { ...config.dressCode, colors })}
              makeEmpty={(): DressCodeColor => ({ hex: "#346739", name: "" })}
              addLabel="Add color"
              renderItem={(color, update) => (
                <div className="grid grid-cols-[64px_1fr] items-end gap-3">
                  <label className="flex flex-col gap-2">
                    <span className={labelClass}>Color</span>
                    <input
                      type="color"
                      value={color.hex || "#346739"}
                      onChange={(event) => update({ ...color, hex: event.target.value })}
                      className="h-12 w-full cursor-pointer rounded-[12px] border border-[#d9d9dd] bg-white p-1"
                    />
                  </label>
                  <TextInput label="Name" value={color.name} onChange={(v) => update({ ...color, name: v })} placeholder="Forest green" />
                </div>
              )}
            />
          </Field>
          <Field index={3}>
            <TextInput
              label="Please avoid (comma-separated)"
              value={config.dressCode.avoid.join(", ")}
              onChange={(v) =>
                set("dressCode", {
                  ...config.dressCode,
                  avoid: v
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Putih, Hitam polos"
            />
          </Field>
        </>
      )}

      {section === "gallery" && (
        <ListEditor
          items={config.gallery}
          onChange={(gallery) => set("gallery", gallery)}
          makeEmpty={(): GalleryItem => ({ src: "", alt: "" })}
          addLabel="Add photo"
          renderItem={(item, update) => (
            <>
              <UploadButton
                label="photo"
                value={item.src}
                accept="image/*"
                preview="image"
                isUploading={isUploading}
                uploadFile={uploadFile}
                onUploaded={(url) => update({ ...item, src: url })}
              />
              <TextInput label="Caption" value={item.alt} onChange={(v) => update({ ...item, alt: v })} placeholder="Prewedding at the lake" />
            </>
          )}
        />
      )}

      {section === "rsvp" && (
        <InfoNote>Guests RSVP directly on the invitation — responses appear in your dashboard.</InfoNote>
      )}

      {section === "gift" && (
        <ListEditor
          items={config.bankAccounts}
          onChange={(bankAccounts) => set("bankAccounts", bankAccounts)}
          makeEmpty={(): BankAccount => ({ bank: "", name: "", number: "" })}
          addLabel="Add account"
          renderItem={(account, update) => (
            <div className="grid gap-3 sm:grid-cols-3">
              <TextInput label="Bank" value={account.bank} onChange={(v) => update({ ...account, bank: v })} placeholder="BCA" />
              <TextInput label="Account name" value={account.name} onChange={(v) => update({ ...account, name: v })} />
              <TextInput label="Number" value={account.number} onChange={(v) => update({ ...account, number: v })} />
            </div>
          )}
        />
      )}

      {section === "closing" && (
        <InfoNote>The closing thanks your guests with the couple names and a photo from the gallery.</InfoNote>
      )}

      {section === "music" && (
        <Field index={0}>
          <span className={labelClass}>Background music</span>
          <UploadButton
            label="music"
            value={config.music.src}
            accept="audio/*"
            preview="text"
            isUploading={isUploading}
            uploadFile={uploadFile}
            onUploaded={(url) => set("music", { src: url })}
          />
        </Field>
      )}
    </form>
  );
}
