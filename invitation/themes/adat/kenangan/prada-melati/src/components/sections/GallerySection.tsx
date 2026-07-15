"use client";

import KelirScene from "@/components/shared/KelirScene";
import SceneContent from "@/components/shared/SceneContent";
import GiltDivider from "@/components/shared/GiltDivider";
import { kelirFor } from "@/components/shared/sceneKelir";
import { hideOnError } from "@/lib/assets";
import type { InvitationConfig } from "@/lib/config-types";

export default function GallerySection({ gallery }: { gallery: InvitationConfig["gallery"] }) {
  const preset = kelirFor("gallery");

  return (
    <section className="snap-section">
      <KelirScene preset={preset} kain="KainBadan">
        <SceneContent scroll maxWidth={360}>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Galeri</p>
          <h2 className="font-display mt-2 text-[var(--text)]" style={{ fontSize: "clamp(28px, 8.5vw, 44px)" }}>
            Momen
          </h2>
          <GiltDivider className="my-4" />
          <div className="grid w-full grid-cols-2 gap-2">
            {gallery.map((item, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: i === 0 ? "2 / 1" : "1 / 1",
                  gridColumn: i === 0 ? "span 2" : undefined,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  onError={hideOnError}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }}
                />
              </div>
            ))}
          </div>
        </SceneContent>
      </KelirScene>
    </section>
  );
}
