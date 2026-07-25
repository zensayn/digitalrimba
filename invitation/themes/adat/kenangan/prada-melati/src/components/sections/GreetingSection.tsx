import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import GiltDivider from "@/components/shared/GiltDivider";
import { kelirFor } from "@/components/shared/sceneKelir";

export default function GreetingSection() {
  const preset = kelirFor("greeting");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent align="top" maxWidth={300}>
          <p
            className="font-display text-[var(--gold)]"
            dir="rtl"
            lang="ar"
            style={{ fontSize: "clamp(24px, 8vw, 38px)", lineHeight: 1.7, textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <GiltDivider className="my-4" />
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
