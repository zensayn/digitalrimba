import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import SectionHeader from "@/components/shared/SectionHeader";
import KendangAccent from "@/components/shared/KendangAccent";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig, RundownItem } from "@/lib/config-types";

function Timeline({ title, items }: { title: string; items: RundownItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="w-full">
      <p className="font-label" style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase" }}>
        {title}
      </p>
      {/* Card gelap (pola sama dgn venue EventSection): angkat baris waktu/acara
          dari kain batik ramai di belakangnya supaya terbaca tanpa halo per-baris. */}
      <div
        className="mt-3 flex w-full flex-col text-left"
        style={{ border: "1px solid var(--border)", background: "rgba(20,12,6,0.5)", padding: "2px 18px" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4"
            style={{ padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
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
          <SectionHeader eyebrow="Rundown Acara" title="Susunan Acara" divider="modang" />
          {/* Jarak antar-timeline pakai inline rowGap (bukan arbitrary Tailwind
              class) agar selalu terpasang — hindari kasus CSS JIT nyangkut di
              dev. rowGap hanya berlaku DI ANTARA Akad & Resepsi. */}
          <div
            className="mt-6 w-full"
            style={{ display: "flex", flexDirection: "column", rowGap: "clamp(38px, 7svh, 70px)" }}
          >
            <Timeline title="Akad" items={rundown.akad} />
            <Timeline title="Resepsi" items={rundown.resepsi} />
          </div>
          {/* Kendang emas — aksen gamelan menutup section, di bawah timeline. */}
          <KendangAccent width={140} style={{ marginTop: 28 }} />
        </SceneContent>
      </KelirScene>
    </section>
  );
}
