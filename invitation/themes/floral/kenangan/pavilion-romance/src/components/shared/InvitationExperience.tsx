"use client";

import { Fragment, useState } from "react";
import MusicPlayer from "@/components/shared/MusicPlayer";
import EnvelopeOverlay from "@/components/shared/EnvelopeOverlay";
import DesktopCover from "@/components/shared/DesktopCover";
import PaperBackdrop from "@/components/shared/PaperBackdrop";
import RevealController from "@/components/shared/RevealController";
import SectionSeam from "@/components/shared/SectionSeam";
import CoverSection from "@/components/sections/CoverSection";
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
import type { InvitationConfig, SectionId } from "@/lib/config-types";

function assertNever(value: never): never {
  throw new Error(`Unsupported invitation section: ${value}`);
}

export default function InvitationExperience({ config }: { config: InvitationConfig }) {
  const [gateClosed, setGateClosed] = useState(true);
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  function renderSection(id: SectionId) {
    switch (id) {
      case "cover":
        return <CoverSection key="cover" couple={config.couple} weddingDate={config.weddingDate} />;
      case "greeting":
        return <GreetingSection key="greeting" couple={config.couple} />;
      case "couple":
        return <CoupleSection key="couple" couple={config.couple} />;
      case "lovestory":
        return <LoveStorySection key="lovestory" loveStory={config.loveStory} />;
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
        return <RundownSection key="rundown" rundown={config.rundown} />;
      case "turut":
        return <TurutMengundangSection key="turut" turutMengundang={config.turutMengundang} />;
      case "closing":
        return <ClosingSection key="closing" couple={config.couple} />;
    }

    return assertNever(id);
  }

  return (
    <div className="app-shell">
      {/* Amplop pembuka: ketuk untuk membuka → gesture yang mengizinkan musik
          autoplay (event `invitation-open`); lifecycle animasinya mandiri,
          onOpen hanya melepas inert/aria-hidden konten di bawahnya */}
      <EnvelopeOverlay onOpen={() => setGateClosed(false)} />

      <div
        id="invitation-content"
        data-invitation-content="true"
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
            {/* Batas antar-section dilarutkan dua arah: edgeFade dari dalam tiap
                SceneBackground + jahitan awan-bunga yang menumpuk di garis batas */}
            {sectionIds.map((id, i) => (
              <Fragment key={id}>
                {renderSection(id)}
                {i < sectionIds.length - 1 && <SectionSeam index={i} />}
              </Fragment>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
