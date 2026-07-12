// src/app/page.tsx
// Server-first: baca config, render section yang enabled lewat RenderSection.

import MusicPlayer from "@/components/MusicPlayer";
import GoldDust from "@/components/shared/GoldDust";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
import type { InvitationConfig } from "@/lib/config-types";
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <>
      <MusicPlayer />
      <GoldDust />
      <SnapContainer>
        {sectionIds.map((id) => renderSection(id, config))}
      </SnapContainer>
    </>
  );
}
