import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig } from "@/lib/config-types";

export default function ClosingSection({ couple }: { couple: InvitationConfig["couple"] }) {
  const preset = kelirFor("closing")!;

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent maxWidth={340}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Terima Kasih</p>
          <h2
            className="font-display text-gold-gradient mt-4"
            style={{ fontSize: "clamp(40px, 12vw, 66px)", lineHeight: 1.05 }}
          >
            {couple.groom.name}
          </h2>
          <div className="my-2 flex items-center justify-center gap-3">
            <div className="gold-divider" />
            <span className="font-display" style={{ color: "var(--gold)", fontSize: 22 }}>&amp;</span>
            <div className="gold-divider" />
          </div>
          <h2
            className="font-display text-gold-gradient"
            style={{ fontSize: "clamp(40px, 12vw, 66px)", lineHeight: 1.05 }}
          >
            {couple.bride.name}
          </h2>
          <p
            className="font-body mx-auto mt-6 italic leading-relaxed text-[var(--text-muted)]"
            style={{ fontSize: "clamp(12px, 3.2vw, 14px)", maxWidth: 300 }}
          >
            &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan
            pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung
            dan merasa tenteram kepadanya.&rdquo;
            <span className="font-label mt-2 block not-italic" style={{ color: "var(--text)", fontSize: 12, letterSpacing: "0.04em" }}>
              — QS. Ar-Rum: 21
            </span>
          </p>
          <div className="gold-divider-full mx-auto mt-8" style={{ maxWidth: 220 }} />
          <p className="font-label mt-4" style={{ color: "var(--gold)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {couple.hashtag}
          </p>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
