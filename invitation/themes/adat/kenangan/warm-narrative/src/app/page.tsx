import { headers } from "next/headers";
import MotionProvider from "@/components/shared/MotionProvider";
import EnvelopeOverlay from "@/components/shared/EnvelopeOverlay";
import MusicPlayer from "@/components/shared/MusicPlayer";
import DesktopCover from "@/components/shared/DesktopCover";
import SnapContainer from "@/components/shared/SnapContainer";
import { renderSection } from "@/components/RenderSection";
import { resolveConfig } from "@/lib/resolve-config";

export default async function Page() {
  const h = await headers();
  // The demo custom domain routes straight to this worker, so a client there
  // controls every header — honoring x-rimba-slug would let anyone render an
  // arbitrary tenant's invitation here. Router-forwarded requests keep the
  // invitation's own host (host-based routing can't deliver those here
  // directly), so any other host means the header came from the router.
  const host = (h.get("host") ?? "").split(":")[0];
  const slug = host === "warm-narrative.rimba.io" ? null : h.get("x-rimba-slug");
  const config = await resolveConfig(slug);
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
