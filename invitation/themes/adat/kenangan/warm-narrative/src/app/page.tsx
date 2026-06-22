"use client";

// src/app/page.tsx
// ─── TEMPLATE: Section registry + scroll controller ──────────────────────────
// Yang perlu diubah saat membuat tema baru:
//   1. Import section components yang ada di components/sections/
//   2. Daftarkan di fungsi renderSection() sesuai id-nya
// Sisanya (scroll logic, guest name, section toggle) TIDAK perlu diubah.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useInvitationConfig } from "@/components/shared/RimbaConfigProvider";
import MusicPlayer from "@/components/shared/MusicPlayer";
import type { EventConfig } from "@/lib/config-types";

// ── IMPORT SECTIONS ───────────────────────────────────────────────────────────
import CoverSection     from "@/components/sections/CoverSection";
import GreetingSection  from "@/components/sections/GreetingSection";
import CoupleSection    from "@/components/sections/CoupleSection";
import LoveStorySection from "@/components/sections/LoveStorySection";
import EventSection     from "@/components/sections/EventSection";
import DressCodeSection from "@/components/sections/DressCodeSection";
import GallerySection   from "@/components/sections/GallerySection";
import RSVPSection      from "@/components/sections/RSVPSection";
import GiftSection      from "@/components/sections/GiftSection";
import ClosingSection   from "@/components/sections/ClosingSection";
// ─────────────────────────────────────────────────────────────────────────────

// ── Section renderer ──────────────────────────────────────────────────────────
// TEMPLATE: Uncomment dan tambahkan case sesuai section yang dibuat
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

// ── Main page ─────────────────────────────────────────────────────────────────
function InvitationContent() {
  const config = useInvitationConfig();
  const [guestName, setGuestName] = useState<string | undefined>();

  // Baca nama tamu dari query string: ?to=NamaTamu
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
