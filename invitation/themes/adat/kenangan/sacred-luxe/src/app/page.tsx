"use client";

import { useEffect, useState } from "react";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";

import CoverSection from "@/components/sections/CoverSection";
import GreetingSection from "@/components/sections/GreetingSection";
import CoupleSection from "@/components/sections/CoupleSection";
import LoveStorySection from "@/components/sections/LoveStorySection";
import EventSection from "@/components/sections/EventSection";
import DressCodeSection from "@/components/sections/DressCodeSection";
import GallerySection from "@/components/sections/GallerySection";
import RSVPSection from "@/components/sections/RSVPSection";
import GiftSection from "@/components/sections/GiftSection";
import ClosingSection from "@/components/sections/ClosingSection";
import MusicPlayer from "@/components/shared/MusicPlayer";
import type { EventConfig } from "@/lib/config-types";

// ─── Section renderer ──────────────────────────────────────────────────────────
function renderSection(
  id: string,
  events: { akad: EventConfig; resepsi: EventConfig },
  guestName?: string
) {
  switch (id) {
    case "cover":     return <CoverSection key="cover" />;
    case "greeting":  return <GreetingSection key="greeting" guestName={guestName} />;
    case "couple":    return <CoupleSection key="couple" />;
    case "lovestory": return <LoveStorySection key="lovestory" />;
    case "akad":      return <EventSection key="akad" event={events.akad} index={0} sectionId="akad" />;
    case "resepsi":   return <EventSection key="resepsi" event={events.resepsi} index={1} sectionId="resepsi" />;
    case "dresscode": return <DressCodeSection key="dresscode" />;
    case "gallery":   return <GallerySection key="gallery" />;
    case "rsvp":      return <RSVPSection key="rsvp" />;
    case "gift":      return <GiftSection key="gift" />;
    case "closing":   return <ClosingSection key="closing" />;
    default:          return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function InvitationContent() {
  const config = useInvitationConfig();
  const [guestName, setGuestName] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("to");
    if (name) setGuestName(name);
  }, []);

  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <>
      <MusicPlayer />
      <div className="snap-container">
        {sectionIds.map((id) => renderSection(id, config.events, guestName))}
      </div>
    </>
  );
}

export default function Page() {
  return <InvitationContent />;
}
