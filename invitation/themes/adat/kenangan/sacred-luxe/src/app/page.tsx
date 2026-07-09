import { headers } from "next/headers";
import MusicPlayer from "@/components/shared/MusicPlayer";
import { renderSection } from "@/components/RenderSection";
import { resolveConfig } from "@/lib/resolve-config";

export default async function Page() {
  const config = await resolveConfig((await headers()).get("x-rimba-slug"));
  const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);

  return (
    <>
      <MusicPlayer src={config.music?.src} />
      <div className="snap-container">
        {sectionIds.map((id) => renderSection(id, config))}
      </div>
    </>
  );
}
