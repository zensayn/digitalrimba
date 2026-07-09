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

// Shared by the production page (server-rendered) and the studio /preview
// route (client-rendered from postMessage drafts).
export function renderSection(id: string, config: InvitationConfig) {
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
      return <EventSection key="akad" event={config.events.akad} index={0} sectionId="akad" />;
    case "resepsi":
      return <EventSection key="resepsi" event={config.events.resepsi} index={1} sectionId="resepsi" />;
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
