import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import SectionHeader from "@/components/shared/SectionHeader";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig } from "@/lib/config-types";

export default function TurutMengundangSection({
  turutMengundang,
}: {
  turutMengundang: InvitationConfig["turutMengundang"];
}) {
  const preset = kelirFor("turut");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent maxWidth={340}>
          <SectionHeader eyebrow="Turut Mengundang" title="Keluarga & Kerabat" />
          <p className="font-body mb-7 mt-5 leading-relaxed text-[var(--text-muted)]" style={{ fontSize: "clamp(12px, 3vw, 14px)" }}>
            Terima kasih kepada keluarga dan kerabat yang turut mengundang serta
            mendoakan kebahagiaan kami.
          </p>
          <div className="flex w-full flex-col gap-5">
            {turutMengundang.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-display" style={{ color: "var(--text)", fontSize: "clamp(16px, 4.4vw, 19px)", lineHeight: 1.25 }}>
                  {item.name}
                </span>
                {item.note && (
                  <span className="font-label" style={{ color: "var(--text-dim)", fontSize: 11, letterSpacing: "0.08em" }}>
                    {item.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
