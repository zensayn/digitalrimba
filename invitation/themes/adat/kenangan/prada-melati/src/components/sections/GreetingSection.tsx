import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import { kelirFor } from "@/components/shared/sceneKelir";

export default function GreetingSection() {
  const preset = kelirFor("greeting")!;

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent align="bottom" maxWidth={300}>
          <p className="font-label text-xs uppercase tracking-[0.28em] text-[var(--text-dim)]">
            Bismillahirrahmanirrahim
          </p>
          <div className="gold-divider mx-auto my-4" />
          <p
            className="font-body leading-relaxed text-[var(--text-muted)]"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
          >
            Assalamu&apos;alaikum Warahmatullahi Wabarakatuh. Dengan memohon
            rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan
            pernikahan putra-putri kami.
          </p>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
