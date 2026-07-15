import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import GiltDivider from "@/components/shared/GiltDivider";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig, RundownItem } from "@/lib/config-types";

function Timeline({ title, items }: { title: string; items: RundownItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-7 first:mt-0">
      <p className="font-label" style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase" }}>
        {title}
      </p>
      <div className="mt-3 flex flex-col text-left">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline gap-4"
            style={{ padding: "12px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
          >
            <span
              className="font-label shrink-0"
              style={{ color: "var(--gold)", fontSize: 12, letterSpacing: "0.06em", minWidth: 56 }}
            >
              {item.time}
            </span>
            <span className="font-body" style={{ color: "var(--text)", fontSize: "clamp(13px, 3.4vw, 15px)", lineHeight: 1.4 }}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RundownSection({ rundown }: { rundown: InvitationConfig["rundown"] }) {
  const preset = kelirFor("rundown");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent maxWidth={360}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Rundown Acara</p>
          <h2 className="font-display mt-2 text-[var(--text)]" style={{ fontSize: "clamp(28px, 8vw, 42px)" }}>
            Susunan Acara
          </h2>
          <GiltDivider className="my-4" variant="modang" />
          <div className="w-full">
            <Timeline title="Akad" items={rundown.akad} />
            <Timeline title="Resepsi" items={rundown.resepsi} />
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
