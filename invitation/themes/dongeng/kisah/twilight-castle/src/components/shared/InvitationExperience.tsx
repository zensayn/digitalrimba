"use client";

import { Fragment, useState } from "react";
import MusicPlayer from "@/components/shared/MusicPlayer";
import EnvelopeOverlay from "@/components/shared/EnvelopeOverlay";
import DesktopCover from "@/components/shared/DesktopCover";
import PaperBackdrop from "@/components/shared/PaperBackdrop";
import RevealController from "@/components/shared/RevealController";
import SectionSeam from "@/components/shared/SectionSeam";
import RoyalGate from "@/components/shared/RoyalGate";
import GreetingSection from "@/components/sections/GreetingSection";
import CoupleSection from "@/components/sections/CoupleSection";
import LoveStorySection from "@/components/sections/LoveStorySection";
import EventSection from "@/components/sections/EventSection";
import DressCodeSection from "@/components/sections/DressCodeSection";
import GallerySection from "@/components/sections/GallerySection";
import RSVPSection from "@/components/sections/RSVPSection";
import GiftSection from "@/components/sections/GiftSection";
import RundownSection from "@/components/sections/RundownSection";
import TurutMengundangSection from "@/components/sections/TurutMengundangSection";
import ClosingSection from "@/components/sections/ClosingSection";
import type { InvitationConfig } from "@/lib/config-types";

// Section ids this theme ships. Studio drafts may carry ids from other
// templates — unknown ids must be skipped here, or they'd render as empty
// slots with doubled seams.
const KNOWN_SECTIONS = new Set([
  "cover", "greeting", "couple", "lovestory", "akad", "resepsi",
  "dresscode", "gallery", "rsvp", "gift", "rundown", "turut", "closing",
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

  // Tiga section terbaru (lovestory/rundown/turut) belum ada di draft studio
  // lama: id-nya bisa aktif sementara datanya kosong. Saring DI SINI, bukan
  // dengan me-return null di renderSection — jumlah sectionIds yang menentukan
  // jahitan antar-section, jadi slot kosong akan meninggalkan seam dobel.
  const hasContent = (id: string) => {
    switch (id) {
      case "lovestory":
        return (config.loveStory?.length ?? 0) > 0;
      case "rundown":
        return (config.rundown?.akad.length ?? 0) + (config.rundown?.resepsi.length ?? 0) > 0;
      case "turut":
        return (config.turutMengundang?.length ?? 0) > 0;
      default:
        return true;
    }
  };

  const sectionIds = config.sections.order.filter(
    (id) => KNOWN_SECTIONS.has(id) && config.sections.enabled[id] && hasContent(id),
  );

  function renderSection(id: string) {
    switch (id) {
      case "cover":
        return <RoyalGate key="cover" couple={config.couple} weddingDate={config.weddingDate} />;
      case "greeting":
        return <GreetingSection key="greeting" couple={config.couple} />;
      case "couple":
        return <CoupleSection key="couple" couple={config.couple} />;
      case "lovestory":
        return <LoveStorySection key="lovestory" loveStory={config.loveStory ?? []} />;
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
      case "rundown":
        return <RundownSection key="rundown" rundown={config.rundown ?? { akad: [], resepsi: [] }} />;
      case "turut":
        return <TurutMengundangSection key="turut" turutMengundang={config.turutMengundang ?? []} />;
      case "closing":
        return <ClosingSection key="closing" couple={config.couple} />;
      default:
        return null;
    }
  }

  return (
    <div className="app-shell">
      {/* Amplop pembuka: ketuk untuk membuka → gesture yang mengizinkan musik
          autoplay (event `invitation-open`); lifecycle animasinya mandiri,
          onOpen hanya melepas inert/aria-hidden konten. Studio /preview
          (initiallyOpen) tidak merender amplop sama sekali. */}
      {!initiallyOpen && <EnvelopeOverlay onOpen={() => setGateClosed(false)} />}

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
          <MusicPlayer music={config.music} />
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
