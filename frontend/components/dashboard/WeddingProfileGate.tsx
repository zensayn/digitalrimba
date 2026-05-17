"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddCircle, CalendarMark, MapPoint, UsersGroupRounded } from "@solar-icons/react";
import { TextureButton } from "@/components/ui/texture-button";
import { Input } from "@/components/ui/input";
import { fetchWeddingProfile, saveWeddingProfile } from "@/lib/api/weddings";

export default function WeddingProfileGate({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [coupleName, setCoupleName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["wedding", "profile"],
    queryFn: fetchWeddingProfile,
  });

  const saveMutation = useMutation({
    mutationFn: saveWeddingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
  });

  if (profileQuery.isLoading) {
    return <GateStatus title="Loading workspace" description="Checking wedding profile." />;
  }

  if (profileQuery.isError) {
    return (
      <GateStatus
        title="Wedding profile unavailable"
        description={profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
      />
    );
  }

  if (profileQuery.data) {
    return <>{children}</>;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCoupleName = coupleName.trim();
    if (!trimmedCoupleName) {
      setFormError("Couple name required.");
      return;
    }

    setFormError(null);
    try {
      await saveMutation.mutateAsync({
        couple_name: trimmedCoupleName,
        event_date: eventDate.trim(),
        venue_name: venueName.trim(),
        venue_address: venueAddress.trim(),
      });
    } catch {
      // Error is already reflected via saveMutation.isError UI state.
    }
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-white px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#346739]/15 bg-[#346739]/5 px-3 py-1 text-[11px] font-bold uppercase text-[#346739]">
            <UsersGroupRounded size={14} weight="BoldDuotone" />
            Wedding profile
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">Create wedding profile</h2>
            <p className="max-w-2xl text-sm leading-6 text-neutral-500">
              Add core wedding details before opening dashboard overview.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase text-neutral-500">
                <UsersGroupRounded size={14} />
                Couple name
              </span>
              <Input
                required
                value={coupleName}
                onChange={(event) => setCoupleName(event.target.value)}
                placeholder="Alya & Bima"
                className="h-12 rounded-xl"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase text-neutral-500">
                <CalendarMark size={14} />
                Event date
              </span>
              <Input
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className="h-12 rounded-xl"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase text-neutral-500">
                <MapPoint size={14} />
                Venue
              </span>
              <Input
                value={venueName}
                onChange={(event) => setVenueName(event.target.value)}
                placeholder="Rimba Glass House"
                className="h-12 rounded-xl"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase text-neutral-500">
                <MapPoint size={14} />
                Venue address
              </span>
              <Input
                value={venueAddress}
                onChange={(event) => setVenueAddress(event.target.value)}
                placeholder="Jakarta"
                className="h-12 rounded-xl"
              />
            </label>
          </div>

          {(formError || saveMutation.isError) && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError ??
                (saveMutation.error instanceof Error ? saveMutation.error.message : "Unable to save wedding profile.")}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <TextureButton
              type="submit"
              variant="primary"
              disabled={saveMutation.isPending}
              className="h-11 rounded-full px-5 text-xs"
            >
              <AddCircle size={16} />
              {saveMutation.isPending ? "Saving" : "Create profile"}
            </TextureButton>
          </div>
        </form>
      </div>
    </section>
  );
}

function GateStatus({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-black">{title}</h2>
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
