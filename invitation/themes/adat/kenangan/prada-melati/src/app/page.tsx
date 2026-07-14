// src/app/page.tsx
// Server-first: baca config, render section yang enabled lewat RenderSection.
// Desktop: panel cover kelir kiri + kolom undangan kanan (.app-shell).

import MotionProvider from "@/components/shared/MotionProvider";
import EnvelopeOverlay from "@/components/shared/EnvelopeOverlay";
import MusicPlayer from "@/components/MusicPlayer";
import GoldDust from "@/components/shared/GoldDust";
import RevealController from "@/components/shared/RevealController";
import DesktopCover from "@/components/shared/DesktopCover";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
import type { InvitationConfig } from "@/lib/config-types";
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

export default function Page() {
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <MotionProvider>
      <EnvelopeOverlay />
      {config.music && <MusicPlayer music={config.music} />}
      <GoldDust />
      <RevealController />
      <div className="app-shell">
        <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />
        <SnapContainer>
          {sectionIds.map((id) => renderSection(id, config))}
        </SnapContainer>
      </div>
    </MotionProvider>
  );
}
