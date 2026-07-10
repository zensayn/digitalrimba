"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MusicNote, Pause, Play, TrashBinMinimalistic } from "@solar-icons/react";
import { fetchMusicTracks, type MusicTrack } from "@/lib/api/music";
import type { InvitationConfig } from "@/lib/invitation-config";

type MusicValue = InvitationConfig["music"];

type MusicPickerProps = {
  value: MusicValue;
  onChange: (music: MusicValue) => void;
  isUploading: boolean;
  uploadStage?: "processing" | "uploading" | null;
  uploadFile: (file: File, maxBytes?: number) => Promise<string | null>;
};

export const MUSIC_MAX_BYTES = 5 * 1024 * 1024;
const MIN_TRIM_WINDOW = 3; // seconds

const chipClass = (active: boolean) =>
  `font-poppins rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-150 ${
    active
      ? "border-[#346739] bg-[#346739] text-white"
      : "border-[#d9d9dd] bg-white text-[#616161] hover:bg-neutral-50"
  }`;

// Dual-range slider thumbs must receive pointer events while their tracks
// (stacked on top of each other) must not — the standard two-input technique.
const rangeClass =
  "pointer-events-none absolute inset-0 w-full appearance-none bg-transparent outline-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border " +
  "[&::-webkit-slider-thumb]:border-[#346739] [&::-webkit-slider-thumb]:bg-white " +
  "[&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(10,10,10,0.25)] " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#346739] " +
  "[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(10,10,10,0.25)]";

function fmt(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function MusicPicker({ value, onChange, isUploading, uploadStage, uploadFile }: MusicPickerProps) {
  const { data: tracks, isPending, error } = useQuery({
    queryKey: ["music-tracks"],
    queryFn: fetchMusicTracks,
    staleTime: 5 * 60 * 1000,
  });

  const [category, setCategory] = useState("all");
  // Rights declaration must be ticked before the upload button unlocks.
  const [consent, setConsent] = useState(false);
  // Track id while a row previews, or "trim" while the trim preview loops.
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trimLoopCleanup = useRef<(() => void) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fully release the shared audio element on unmount — pause, drop the
  // source, abort any in-flight buffering, null the ref — so nothing keeps
  // playing invisibly after leaving the Music section or closing the studio.
  useEffect(() => {
    return () => {
      trimLoopCleanup.current?.();
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.src = "";
      audio.load();
      audioRef.current = null;
    };
  }, []);

  // Read the selected track's duration (metadata only, no playback) so the
  // trim bar knows its scale. Re-runs whenever the selection changes.
  useEffect(() => {
    setDuration(null);
    if (!value.src) return;
    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = value.src;
    const onMeta = () => {
      if (Number.isFinite(probe.duration)) setDuration(probe.duration);
    };
    probe.addEventListener("loadedmetadata", onMeta);
    return () => {
      probe.removeEventListener("loadedmetadata", onMeta);
      probe.src = "";
      probe.load();
    };
  }, [value.src]);

  function ensureAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.addEventListener("ended", () => setPlayingId(null));
      audioRef.current = audio;
    }
    return audioRef.current;
  }

  function stopPreview() {
    trimLoopCleanup.current?.();
    trimLoopCleanup.current = null;
    audioRef.current?.pause();
    setPlayingId(null);
  }

  function togglePreview(track: MusicTrack) {
    if (playingId === track.id) {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = ensureAudio();
    audio.src = track.src;
    void audio.play().catch(() => setPlayingId(null));
    setPlayingId(track.id);
  }

  const trimStart = value.startSec ?? 0;
  const trimEnd = value.endSec ?? duration ?? 0;
  // Live bounds for the preview loop — a plain closure would keep looping
  // against the window that was active when preview started.
  const trimBoundsRef = useRef({ start: trimStart, end: value.endSec ?? null });
  trimBoundsRef.current = { start: trimStart, end: value.endSec ?? null };

  // Loops the trimmed window exactly like the published invitation will.
  function toggleTrimPreview() {
    if (playingId === "trim") {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = ensureAudio();
    if (!audio.src || !audio.src.includes(value.src)) audio.src = value.src;
    const start = trimStart;
    const onTime = () => {
      const { start, end } = trimBoundsRef.current;
      if (end !== null && audio.currentTime >= end) audio.currentTime = start;
    };
    audio.addEventListener("timeupdate", onTime);
    trimLoopCleanup.current = () => audio.removeEventListener("timeupdate", onTime);
    audio.currentTime = start;
    void audio.play().catch(() => setPlayingId(null));
    setPlayingId("trim");
  }

  function setTrim(start: number, end: number) {
    if (!duration) return;
    // Normalize the untrimmed edges back to "absent" so a full-length
    // selection stores no trim at all.
    onChange({
      ...value,
      startSec: start <= 0 ? undefined : Math.round(start),
      endSec: end >= Math.floor(duration) ? undefined : Math.round(end),
    });
    // Live-adjust an in-flight trim preview instead of silently drifting.
    if (playingId === "trim" && audioRef.current) {
      const audio = audioRef.current;
      if (audio.currentTime < start || audio.currentTime >= end) audio.currentTime = start;
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    stopPreview();
    const url = await uploadFile(file, MUSIC_MAX_BYTES);
    if (url) {
      // consentAt records when the rights declaration below was accepted for
      // this specific upload.
      onChange({ src: url, title: file.name.replace(/\.[^.]+$/, ""), consentAt: new Date().toISOString() });
    }
  }

  const categories = useMemo(
    () => ["all", ...new Set((tracks ?? []).map((t) => t.category))],
    [tracks],
  );
  const visibleTracks = (tracks ?? []).filter((t) => category === "all" || t.category === category);
  const isCustomSelection = Boolean(value.src) && !value.trackId;

  return (
    <div className="flex flex-col gap-4">
      {value.src && (
        <div className="flex flex-col gap-3 rounded-[16px] border border-[#346739]/30 bg-[#346739]/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-poppins min-w-0 truncate text-sm text-[#2c2c2c]">
              ♪ {value.title || value.src}
              {value.artist ? <span className="text-[#6a6a6a]"> — {value.artist}</span> : null}
              {isCustomSelection ? <span className="text-[#6a6a6a]"> (your upload)</span> : null}
            </p>
            <button
              type="button"
              onClick={() => {
                stopPreview();
                onChange({ src: "" });
              }}
              className="font-poppins flex shrink-0 items-center gap-1 text-xs font-medium text-[#8a4b3c] hover:underline"
            >
              <TrashBinMinimalistic size={14} />
              Remove
            </button>
          </div>

          {/* Trim editor — pick where the song starts and ends, IG-style. */}
          {duration !== null && duration > MIN_TRIM_WINDOW && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTrimPreview}
                aria-label={playingId === "trim" ? "Pause trimmed preview" : "Preview trimmed selection"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#346739] text-white transition-transform duration-150 active:scale-[0.95]"
              >
                {playingId === "trim" ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="relative h-9">
                  <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[#dcd9d2]" />
                  <div
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[#346739]/60"
                    style={{
                      left: `${(trimStart / duration) * 100}%`,
                      width: `${(Math.max(trimEnd - trimStart, 0) / duration) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    aria-label="Song start"
                    min={0}
                    max={Math.floor(duration)}
                    step={1}
                    value={Math.round(trimStart)}
                    onChange={(e) =>
                      setTrim(Math.min(Number(e.target.value), trimEnd - MIN_TRIM_WINDOW), trimEnd)
                    }
                    className={rangeClass}
                  />
                  <input
                    type="range"
                    aria-label="Song end"
                    min={0}
                    max={Math.floor(duration)}
                    step={1}
                    value={Math.round(trimEnd)}
                    onChange={(e) =>
                      setTrim(trimStart, Math.max(Number(e.target.value), trimStart + MIN_TRIM_WINDOW))
                    }
                    className={rangeClass}
                  />
                </div>
                <div className="font-poppins flex justify-between text-[11px] text-[#6a6a6a]">
                  <span>
                    Starts {fmt(trimStart)} · Ends {fmt(trimEnd)}
                  </span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isPending && (
        <p className="font-poppins text-sm text-[#6a6a6a]">Loading music catalog…</p>
      )}
      {Boolean(error) && !isPending && (
        <p className="font-poppins text-sm text-[#8a4b3c]">
          Couldn&apos;t load the music catalog — you can still upload your own track below.
        </p>
      )}

      {(tracks?.length ?? 0) > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={chipClass(category === c)}>
                {c}
              </button>
            ))}
          </div>

          <ul className="flex flex-col gap-2">
            {visibleTracks.map((track) => {
              const selected = value.trackId === track.id || (Boolean(value.src) && value.src === track.src);
              return (
                <li
                  key={track.id}
                  className={`flex items-center gap-3 rounded-[12px] border px-3 py-2.5 transition-colors duration-150 ${
                    selected ? "border-[#346739] bg-[#346739]/5" : "border-[#e5e7eb] bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => togglePreview(track)}
                    aria-label={playingId === track.id ? `Pause ${track.title}` : `Play ${track.title}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9d9dd] bg-[#eeece7] transition-transform duration-150 active:scale-[0.95]"
                  >
                    {playingId === track.id ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-poppins truncate text-sm font-medium text-[#2c2c2c]">{track.title}</p>
                    <p className="font-poppins truncate text-xs text-[#6a6a6a]">
                      {track.artist}
                      <span className="capitalize"> · {track.category}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopPreview();
                      onChange({ src: track.src, title: track.title, artist: track.artist, trackId: track.id });
                    }}
                    disabled={selected}
                    className="font-poppins shrink-0 rounded-full border border-[#d9d9dd] px-3 py-1.5 text-xs font-medium transition-colors duration-150 enabled:hover:bg-neutral-50 disabled:border-[#346739] disabled:text-[#346739]"
                  >
                    {selected ? "Selected" : "Use"}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-[#e5e7eb] pt-4">
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => void handleUpload(e)} />
        <label className="font-poppins flex cursor-pointer items-start gap-2.5 text-xs text-[#6a6a6a]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#346739]"
          />
          <span>
            I confirm I own the rights or have permission to use this music, and I accept
            responsibility for this upload under the terms of service.
          </span>
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading || !consent}
          className="font-poppins flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9d9dd] bg-[#eeece7] px-4 text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-[#e5e2db] active:scale-[0.98] disabled:opacity-60"
        >
          <MusicNote size={16} />
          {uploadStage === "processing" ? "Processing audio…" : isUploading ? "Uploading…" : "Upload your own music"}
        </button>
        <p className="font-poppins text-[11px] text-[#8a8a8a]">
          Large files are compressed automatically (max 20 MB source, 5 MB after compression).
        </p>
      </div>
    </div>
  );
}
