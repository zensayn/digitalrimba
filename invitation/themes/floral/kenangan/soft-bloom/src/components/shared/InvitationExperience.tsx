"use client";

import { Fragment, useState } from "react";
import MusicPlayer from "@/components/shared/MusicPlayer";
import OpeningGate from "@/components/shared/OpeningGate";
import DesktopCover from "@/components/shared/DesktopCover";
import PaperBackdrop from "@/components/shared/PaperBackdrop";
import RevealController from "@/components/shared/RevealController";
import SectionSeam from "@/components/shared/SectionSeam";
import CoverSection from "@/components/sections/CoverSection";
import GreetingSection from "@/components/sections/GreetingSection";
import CoupleSection from "@/components/sections/CoupleSection";
import EventSection from "@/components/sections/EventSection";
import DressCodeSection from "@/components/sections/DressCodeSection";
import GallerySection from "@/components/sections/GallerySection";
import RSVPSection from "@/components/sections/RSVPSection";
import GiftSection from "@/components/sections/GiftSection";
import ClosingSection from "@/components/sections/ClosingSection";
import type { InvitationConfig } from "@/lib/config-types";

// Section ids this theme ships. Studio drafts carry the full editor order
// (incl. lovestory, which soft-bloom doesn't have) — unknown ids must be
// skipped here, or they'd render as empty slots with doubled seams.
const KNOWN_SECTIONS = new Set([
  "cover", "greeting", "couple", "akad", "resepsi",
  "dresscode", "gallery", "rsvp", "gift", "closing",
]);

export default function InvitationExperience({
  config,
  initiallyOpen = false,
}: {
  config: InvitationConfig;
  // Studio /preview skips the opening gate — it would block live editing.
  initiallyOpen?: boolean;
}) {
  const [gateClosed, setGateClosed] = useState(!initiallyOpen);
  const sectionIds = config.sections.order.filter(
    (id) => KNOWN_SECTIONS.has(id) && config.sections.enabled[id],
  );

  function renderSection(id: string) {
    switch (id) {
      case "cover":
        return <CoverSection key="cover" couple={config.couple} weddingDate={config.weddingDate} />;
      case "greeting":
        return <GreetingSection key="greeting" couple={config.couple} />;
      case "couple":
        return <CoupleSection key="couple" couple={config.couple} />;
      case "akad":
        return <EventSection key="akad" couple={config.couple} event={config.events.akad} index={0} sectionId="akad" />;
      case "resepsi":
        return <EventSection key="resepsi" couple={config.couple} event={config.events.resepsi} index={1} sectionId="resepsi" />;
      case "dresscode":
        return <DressCodeSection key="dresscode" dressCode={config.dressCode} />;
      case "gallery":
        return <GallerySection key="gallery" gallery={config.gallery} />;
      case "rsvp":
        return <RSVPSection key="rsvp" />;
      case "gift":
        return <GiftSection key="gift" bankAccounts={config.bankAccounts} />;
      case "closing":
        return <ClosingSection key="closing" couple={config.couple} />;
      default:
        return null;
    }
  }

  return (
    <div className="app-shell">
      {/* Gerbang pembuka: sapaan tamu + tombol "Buka Undangan" → klik = gesture
          yang mengizinkan musik autoplay (event `invitation-open`) */}
      <OpeningGate couple={config.couple} open={gateClosed} onOpen={() => setGateClosed(false)} />

      <div
        id="invitation-content"
        aria-hidden={gateClosed ? true : undefined}
        inert={gateClosed ? true : undefined}
        style={{ display: "contents" }}
      >
        {/* Panel cover dekoratif — hanya tampil di layar lebar (PC/laptop) */}
        <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />

        {/* Undangan: kolom sempit fokus-HP; di desktop discroll di sisi kanan */}
        <main className="content-scroll">
          <MusicPlayer
            src={config.music?.src}
            title={config.music?.title}
            artist={config.music?.artist}
            start={config.music?.startSec}
            end={config.music?.endSec}
          />
          <div className="snap-container">
            {/* Latar kertas menerus — menyatukan seluruh section jadi satu dunia */}
            <PaperBackdrop />
            {/* Pemicu entrance dekorasi saat tiap section pertama masuk viewport */}
            <RevealController />
            {sectionIds.map((id, i) => (
              <Fragment key={id}>
                {renderSection(id)}
                {/* Jahitan bunga menyambung ke section berikutnya */}
                {i < sectionIds.length - 1 && <SectionSeam index={i} />}
              </Fragment>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
