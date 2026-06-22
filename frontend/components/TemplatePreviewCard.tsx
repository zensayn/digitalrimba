"use client";

// ─── TemplatePreviewCard ───────────────────────────────────────────────────────
// Portrait invitation-card preview. Renders the product's cover photo from R2
// (contents.rimba.app) via next/image. Used by the catalog grid, the home
// carousel, the mobile rails and the recommendation grid.

import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** `sizes` hint for responsive loading; defaults to a card-width estimate. */
  sizes?: string;
  priority?: boolean;
}

export default function TemplatePreviewCard({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 340px, (min-width: 640px) 50vw, 90vw",
  priority = false,
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-[#f2f2f2] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {/* Subtle glass shimmer to match the previous card treatment */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
    </div>
  );
}
