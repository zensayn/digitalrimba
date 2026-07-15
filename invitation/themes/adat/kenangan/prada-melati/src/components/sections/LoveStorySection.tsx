"use client";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import GiltDivider from "@/components/shared/GiltDivider";
import { kelirFor } from "@/components/shared/sceneKelir";
import { hideOnError } from "@/lib/assets";
import type { InvitationConfig } from "@/lib/config-types";

export default function LoveStorySection({ loveStory }: { loveStory: InvitationConfig["loveStory"] }) {
  const preset = kelirFor("lovestory");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent scroll maxWidth={360}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Perjalanan</p>
          <h2 className="font-display mt-2 text-[var(--text)]" style={{ fontSize: "clamp(28px, 8.5vw, 44px)" }}>
            Kisah Kami
          </h2>
          <GiltDivider className="my-4" variant="truntum" />
          <div className="flex w-full flex-col gap-5 text-left">
            {loveStory.map((ch, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  style={{
                    width: 68,
                    height: 68,
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ch.image}
                    alt={ch.chapter}
                    loading="lazy"
                    decoding="async"
                    onError={hideOnError}
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="font-label" style={{ color: "var(--gold-dim)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    {ch.year}
                  </span>
                  <h3 className="font-display" style={{ color: "var(--text)", fontSize: "clamp(16px, 4.6vw, 20px)", lineHeight: 1.15, margin: "2px 0 4px" }}>
                    {ch.chapter}
                  </h3>
                  <p className="font-body" style={{ color: "var(--text-muted)", fontSize: "clamp(11px, 2.8vw, 12.5px)", lineHeight: 1.55 }}>
                    {ch.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
