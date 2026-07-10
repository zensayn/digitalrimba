import { headers } from "next/headers";
import MotionProvider from "@/components/shared/MotionProvider";
import EnvelopeOverlay from "@/components/shared/EnvelopeOverlay";
import MusicPlayer from "@/components/shared/MusicPlayer";
import DesktopCover from "@/components/shared/DesktopCover";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
import { resolveConfig } from "@/lib/resolve-config";

export default async function Page() {
  const config = await resolveConfig((await headers()).get("x-rimba-slug"));
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <MotionProvider>
      <EnvelopeOverlay />
      <MusicPlayer src={config.music?.src} start={config.music?.startSec} end={config.music?.endSec} />
      <div className="app-shell">
        {/* Panel cover dekoratif — hanya tampil di layar lebar (PC/laptop) */}
        <DesktopCover couple={config.couple} weddingDate={config.weddingDate} />
        <SnapContainer>
          {sectionIds.map((id) => renderSection(id, config))}
        </SnapContainer>
      </div>
    </MotionProvider>
  );
}
