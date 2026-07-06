import MotionProvider from "@/components/shared/MotionProvider";
import EnvelopeOverlay from "@/components/shared/EnvelopeOverlay";
import MusicPlayer from "@/components/shared/MusicPlayer";
import SnapContainer from "@/components/shared/SnapContainer";
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
    case "closing":
      return <ClosingSection key="closing" couple={config.couple} gallery={config.gallery} />;
    default:
      return null;
  }
}

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <MotionProvider>
      <EnvelopeOverlay />
      <MusicPlayer />
      <SnapContainer>
        {sectionIds.map((id) => renderSection(id))}
      </SnapContainer>
    </MotionProvider>
  );
}
