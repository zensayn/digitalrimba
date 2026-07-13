import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig } from "@/lib/config-types";

export default function DressCodeSection({ dressCode }: { dressCode: InvitationConfig["dressCode"] }) {
  const preset = kelirFor("dresscode");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent maxWidth={340}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Dress Code</p>
          <h2 className="font-display mt-2 text-[var(--text)]" style={{ fontSize: "clamp(26px, 8vw, 40px)", lineHeight: 1.15 }}>
            {dressCode.theme}
          </h2>
          <div className="gold-divider mx-auto my-4" />
          <p className="font-body leading-relaxed text-[var(--text-muted)]" style={{ fontSize: "clamp(12px, 3vw, 14px)" }}>
            {dressCode.description}
          </p>

          <div className="mt-7 flex items-start justify-center gap-4">
            {dressCode.colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: c.hex,
                    border: "1px solid var(--border)",
                    boxShadow: "inset 0 0 0 2px rgba(20,12,6,0.35)",
                  }}
                />
                <span className="font-label" style={{ color: "var(--text-muted)", fontSize: 9, letterSpacing: "0.08em" }}>
                  {c.name}
                </span>
              </div>
            ))}
          </div>

          {dressCode.avoid.length > 0 && (
            <p className="font-label mx-auto mt-7" style={{ color: "var(--text-dim)", fontSize: 11, letterSpacing: "0.06em", lineHeight: 1.6, maxWidth: 280 }}>
              Mohon hindari: {dressCode.avoid.join(", ")}
            </p>
          )}
        </SceneContent>
      </KelirScene>
    </section>
  );
}
