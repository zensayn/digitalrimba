// src/app/page.tsx
// Server-first section registry. Import invitation.config.json here and pass
// only the config slice each section needs through serializable props.

import MusicPlayer from "@/components/MusicPlayer";
import type { EventConfig, InvitationConfig } from "@/lib/config-types";
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

// Import section components created for the theme:
// import CoverSection from "@/components/sections/CoverSection";
// import GreetingSection from "@/components/sections/GreetingSection";

function renderSection(
  id: string,
  events: { akad: EventConfig; resepsi: EventConfig }
) {
  switch (id) {
    // Pass plain config data as props:
    // case "cover":
    //   return <CoverSection key="cover" couple={config.couple} weddingDate={config.weddingDate} />;
    // case "greeting":
    //   return <GreetingSection key="greeting" couple={config.couple} />;
    case "akad":
    case "resepsi":
      void events;
      return null;
    default:
      return null;
  }
}

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <>
      <MusicPlayer />
      <div className="snap-container">
        {sectionIds.map((id) => renderSection(id, config.events))}
      </div>
    </>
  );
}
