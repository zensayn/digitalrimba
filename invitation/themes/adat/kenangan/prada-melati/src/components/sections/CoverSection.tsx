import KelirScene from "@/components/shared/KelirScene";
import RonceanMelati from "@/components/shared/RonceanMelati";
import SceneContent from "@/components/shared/SceneContent";
import Countdown from "@/components/shared/Countdown";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig } from "@/lib/config-types";

export default function CoverSection({
  couple,
  weddingDate,
}: {
  couple: InvitationConfig["couple"];
  weddingDate: string;
}) {
  const preset = kelirFor("cover")!;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <RonceanMelati zIndex={3} />
        <SceneContent align="bottom">
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--text-dim)]">
            Undangan Pernikahan
          </p>
          <h1
            className="font-display mt-4 text-[var(--text)]"
            style={{ fontSize: "clamp(34px, 9vw, 58px)", lineHeight: 1.08, textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}
          >
            {couple.groom.name} &amp; {couple.bride.name}
          </h1>
          <div className="gold-divider mx-auto my-4" />
          <p className="font-body text-[var(--text-muted)]">{dateStr}</p>
          <div className="mt-6">
            <Countdown targetDate={weddingDate} />
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
