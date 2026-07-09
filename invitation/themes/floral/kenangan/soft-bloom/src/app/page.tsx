import { Fragment } from "react";
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
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

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

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <div className="app-shell">
      {/* Gerbang pembuka: sapaan tamu + tombol "Buka Undangan" → klik = gesture
          yang mengizinkan musik autoplay (event `invitation-open`) */}
      <OpeningGate couple={config.couple} />
      {/* Panel cover dekoratif — hanya tampil di layar lebar (PC/laptop) */}
      <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />

      {/* Undangan: kolom sempit fokus-HP; di desktop discroll di sisi kanan */}
      <main className="content-scroll">
        <MusicPlayer />
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
  );
}
