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
import type { InvitationConfig } from "@/lib/config-types";

// Registry server-first: tiap section menerima hanya potongan config yang ia
// butuh sebagai props serializable.
export function renderSection(id: string, config: InvitationConfig) {
  switch (id) {
    case "cover":
      return <CoverSection key="cover" couple={config.couple} weddingDate={config.weddingDate} />;
    case "greeting":
      return <GreetingSection key="greeting" />;
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
    default:
      return null;
  }
}
