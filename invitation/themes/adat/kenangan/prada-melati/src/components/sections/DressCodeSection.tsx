import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import SectionHeader from "@/components/shared/SectionHeader";
import { kelirFor } from "@/components/shared/sceneKelir";
import type { InvitationConfig } from "@/lib/config-types";

export default function DressCodeSection({ dressCode }: { dressCode: InvitationConfig["dressCode"] }) {
  const preset = kelirFor("dresscode");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent maxWidth={340}>
          <SectionHeader eyebrow="Dress Code" title={dressCode.theme} />
          <p
            className="font-body mt-5 italic leading-relaxed text-[var(--text-muted)]"
            style={{ fontSize: "clamp(12px, 3vw, 14px)", lineHeight: 1.85, maxWidth: "32ch", textAlign: "center", margin: "8px auto 0" }}
          >
            {dressCode.description}
          </p>

          {/* Swatch kain — pola warm-narrative: blok persegi opak + plate nama & hex
              di bawahnya, tersusun grid. Tiap swatch berdiri sendiri (blok opak +
              plate gelap) jadi tegak di atas batik tanpa kartu besar pembungkus.
              Hairline emas di dalam blok menjaga swatch gelap (Sogan/Kayu Jati)
              tetap kelihatan bentuknya di latar yang senada. */}
          <div className="flex flex-wrap justify-center" style={{ gap: "clamp(10px, 2.5vw, 14px)", marginTop: 36 }}>
            {dressCode.colors.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", width: 72 }}>
                {/* Blok warna */}
                <div
                  style={{
                    width: 72,
                    height: 80,
                    background: c.hex,
                    boxShadow: "inset 0 0 0 1px rgba(227,199,102,0.22), 0 4px 14px rgba(0,0,0,0.35)",
                  }}
                />
                {/* Plate nama + hex */}
                <div
                  style={{
                    padding: "5px 6px 6px",
                    border: "1px solid var(--border)",
                    borderTop: "none",
                    background: "rgba(20,12,6,0.6)",
                  }}
                >
                  <p
                    className="font-label"
                    style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.3, marginBottom: 2 }}
                  >
                    {c.name}
                  </p>
                  <p
                    className="font-label"
                    style={{ fontSize: 7, color: "var(--gold-dim)", letterSpacing: "0.04em", opacity: 0.85 }}
                  >
                    {c.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Hindari — pola warm-narrative: label + chip bergaris-coret. */}
          {dressCode.avoid.length > 0 && (
            <div className="flex flex-col items-center" style={{ gap: 8, marginTop: 48 }}>
              <p
                className="font-label"
                style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase" }}
              >
                Hindari
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {dressCode.avoid.map((item) => (
                  <span
                    key={item}
                    className="font-label"
                    style={{
                      fontSize: "clamp(10px, 2.8vw, 12px)",
                      color: "var(--text-muted)",
                      padding: "4px 12px",
                      border: "1px solid var(--border)",
                      background: "rgba(20,12,6,0.6)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SceneContent>
      </KelirScene>
    </section>
  );
}
