"use client";

import { useRef, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useInView,
  type MotionValue,
} from "framer-motion";
import { useParallaxContainer } from "./parallax-context";

export interface ParallaxLayer {
  /** Full image URL (CDN). */
  src: string;
  /** 0..1 — fraction of viewport height the layer travels each way. Larger = closer. */
  depth: number;
  opacity?: number;
  /** Preload eagerly (use only for above-the-fold Cover layers). */
  priority?: boolean;
  zIndex?: number;
  /** Entrance animation duration in seconds (box layers only). Default 1.1. */
  enterDuration?: number;
  /**
   * Explicit entrance delay in seconds (box layers only), overriding the default
   * index-based stagger. Used to choreograph the "assembled one-by-one" build
   * order in dense scenes (see sceneFrame). Ambient wind also starts after this.
   */
  enterDelay?: number;
  /**
   * Ambient wind loop (box layers only). After the entrance settles, the piece
   * sways gently from its anchor edge instead of freezing. Defaults are derived
   * from `depth` + index; pass an object to tune or `false` to keep it still.
   */
  wind?:
    | false
    | {
        /**
         * "sway" (default): rotate + drift from the anchor edge — for corners,
         * columns, sprigs. "float": vertical bob only — for full-width drapes,
         * where a rotating sway swings the far edge and reads as a wobble.
         * Full-width pieces (`box.width === "100%"`) default to "float".
         */
        motion?: "sway" | "float";
        /** Peak sway rotation in degrees. Default derived from depth (~0.8–2°). */
        amp?: number;
        /** Loop duration in seconds. Default varies per piece (~6.5–11s). */
        durationSec?: number;
        /** Peak drift in px (horizontal for sway, vertical for float). Default ~2.5–5px. */
        driftPx?: number;
      };
  /**
   * Escape the scene's `overflow: hidden` and lie across the section seam
   * (box layers only). Overhang layers render in a sibling un-clipped wrapper
   * at z-index 5 — above both neighbouring scenes, paper overlays and
   * watermarks (z 0–2) but below section content (z 10) — so a bottom garland
   * can hang over the boundary instead of being chopped flat at the edge.
   */
  overhang?: boolean;
  /** Cover mode (default): full-bleed `object-fit: cover` background. */
  objectFit?: CSSProperties["objectFit"];
  objectPosition?: string;
  /**
   * Element mode: a positioned foreground piece (corner / side / drape).
   * When set, the layer is placed by these offsets instead of full-bleed.
   */
  box?: {
    width?: string;
    height?: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    flipX?: boolean;
    rotate?: number;
    /** Override the entrance slide offset (px). Defaults derive from the anchor edge. */
    enterX?: number;
    enterY?: number;
  };
}

function Layer({
  layer,
  progress,
  reduced,
  delay = 0,
  index = 0,
}: {
  layer: ParallaxLayer;
  progress: MotionValue<number>;
  reduced: boolean;
  delay?: number;
  index?: number;
}) {
  const range = layer.depth * 100; // vh of travel each direction
  const y = useTransform(progress, [0, 1], [range, -range]);
  // Each foreground piece watches its OWN visibility, so it animates in only
  // when it is actually scrolled to (not when the section top first appears),
  // and replays every time it re-enters view.
  const boxRef = useRef<HTMLDivElement>(null);
  // Positive margin = pre-trigger: the piece starts its entrance a bit BEFORE it
  // scrolls into view, so it's already appearing the moment it becomes visible
  // (instead of waiting until you've scrolled ~halfway through the section).
  const boxInView = useInView(boxRef, { once: false, margin: "18% 0px 18% 0px" });

  const common = {
    src: layer.src,
    alt: "",
    "aria-hidden": true as const,
    draggable: false,
    loading: (layer.priority ? "eager" : "lazy") as "eager" | "lazy",
    decoding: "async" as const,
    fetchPriority: (layer.priority ? "high" : "low") as "high" | "low",
    onError: (e: SyntheticEvent<HTMLImageElement>) => {
      // Asset missing → hide gracefully, fall back to section background.
      e.currentTarget.style.display = "none";
    },
  };

  // Element mode — positioned foreground piece.
  // Wrapper plays the entrance (slides in from the nearest edge), inner image
  // carries the scroll parallax so the two transforms never conflict.
  if (layer.box) {
    const b = layer.box;
    const targetOpacity = layer.opacity ?? 1;
    // Explicit choreography wins over the default index stagger (assembled build).
    const enterDelay = layer.enterDelay ?? delay;
    // Scroll parallax is per-frame work; skip it for pieces marked depth 0 (small
    // scatter, big base clusters) — they still get the cheap CSS ambient motion.
    const applyParallax = !reduced && layer.depth > 0;
    // Enter direction derived from the anchor edge, overridable per layer.
    const enterX = b.enterX ?? (b.left !== undefined ? -70 : b.right !== undefined ? 70 : 0);
    const enterY = b.enterY ?? (b.top !== undefined ? -70 : b.bottom !== undefined ? 70 : 0);
    const start = reduced
      ? { opacity: targetOpacity }
      : { opacity: 0, x: enterX, y: enterY, scale: 0.9 };
    const rest = { opacity: targetOpacity, x: 0, y: 0, scale: 1 };
    // Height-driven sizing when a height (and no width) is given — used for the
    // full-height side columns so they span the section, width following aspect.
    const heightDriven = b.height !== undefined && b.width === undefined;

    // Ambient wind — once the entrance settles (it ends neutral), the piece keeps
    // swaying gently from its anchor edge instead of freezing. Driven by pure CSS
    // (.ambient-wind + wind-sway) so it adds no JS loop and is auto-disabled under
    // prefers-reduced-motion. Parameters vary per-piece for an organic feel.
    const windOn = !reduced && layer.wind !== false;
    const w = typeof layer.wind === "object" ? layer.wind : {};
    // Full-width drapes/banners can't rotate without the far edge wobbling, so
    // they bob vertically ("float") instead of swaying; everything else sways.
    const windMotion = w.motion ?? (b.width === "100%" ? "float" : "sway");
    // Pivot at the anchor edge: a corner branch swings from its corner, a side
    // column from its top — like something pressed to the page edge in a breeze.
    const originX = b.left !== undefined ? "left" : b.right !== undefined ? "right" : "center";
    const originY = b.top !== undefined ? "top" : b.bottom !== undefined ? "bottom" : "center";
    const windAmp = w.amp ?? Math.min(2, 0.8 + layer.depth * 9); // ~0.8–2°
    const windDrift = w.driftPx ?? Math.round(2 + layer.depth * 20); // ~2.5–5px
    const windDur = w.durationSec ?? 6.5 + ((index * 37) % 45) / 10; // ~6.5–11s, per-piece
    // Start only after the entrance has finished, then desync each piece's phase.
    const windDelay = (layer.enterDuration ?? 1.1) + enterDelay + ((index * 53) % 30) / 10;
    const windClass = windOn
      ? windMotion === "float"
        ? "ambient-float"
        : "ambient-wind"
      : undefined;
    const windStyle: CSSProperties = windOn
      ? {
          width: heightDriven ? "auto" : "100%",
          height: heightDriven ? "100%" : "auto",
          ["--wind-origin" as string]: `${originX} ${originY}`,
          ["--wind-amp" as string]: `${windAmp}deg`,
          ["--wind-drift" as string]: `${windDrift}px`,
          ["--wind-dur" as string]: `${windDur}s`,
          ["--wind-delay" as string]: `${windDelay}s`,
        }
      : { width: heightDriven ? "auto" : "100%", height: heightDriven ? "100%" : "auto" };
    return (
      <motion.div
        ref={boxRef}
        initial={start}
        animate={boxInView ? rest : start}
        transition={{ duration: layer.enterDuration ?? 1.1, ease: [0.22, 1, 0.36, 1], delay: enterDelay }}
        style={{
          position: "absolute",
          top: b.top,
          bottom: b.bottom,
          left: b.left,
          right: b.right,
          width: b.width ?? "auto",
          height: b.height ?? "auto",
          zIndex: layer.zIndex ?? 1,
          pointerEvents: "none",
        }}
      >
        <div className={windClass} style={windStyle}>
          <motion.img
            {...common}
            style={{
              display: "block",
              width: heightDriven ? "auto" : "100%",
              height: heightDriven ? "100%" : "auto",
              y: applyParallax ? y : 0,
              scaleX: b.flipX ? -1 : 1,
              rotate: b.rotate ?? 0,
              willChange: applyParallax ? "transform" : undefined,
            }}
          />
        </div>
      </motion.div>
    );
  }

  // Cover mode — full-bleed background. Oversize + offset so parallax travel
  // never exposes an empty edge.
  return (
    <motion.img
      {...common}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: reduced ? 0 : `-${range}vh`,
        width: "100%",
        height: reduced ? "100%" : `calc(100% + ${range * 2}vh)`,
        objectFit: layer.objectFit ?? "cover",
        objectPosition: layer.objectPosition ?? "center",
        opacity: layer.opacity ?? 1,
        zIndex: layer.zIndex ?? 0,
        pointerEvents: "none",
        y: reduced ? 0 : y,
        willChange: reduced ? undefined : "transform",
      }}
    />
  );
}

/**
 * Layered painterly background for a section. Renders image layers absolutely
 * behind the section content and drives each layer's vertical offset from the
 * section's scroll progress within the snap container.
 *
 * Layers mount only once the section nears the viewport (lazy network), and
 * parallax is disabled entirely under prefers-reduced-motion.
 */
export default function ParallaxScene({
  layers,
  children,
  fadeTop = 12,
  fadeBottom = 12,
}: {
  layers: ParallaxLayer[];
  children?: ReactNode;
  /** % of height the scene feathers into the page background at the top edge. */
  fadeTop?: number;
  /** % of height the scene feathers into the page background at the bottom edge. */
  fadeBottom?: number;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const container = useParallaxContainer();
  const reduced = useReducedMotion() ?? false;
  // Mount early (network lead time) and keep mounted. Each foreground piece
  // then gates its own entrance on its own position (see Layer), so top and
  // bottom pieces animate at the moment they are each reached.
  const mounted = useInView(sceneRef, { once: true, margin: "300px 0px" });

  const { scrollYProgress } = useScroll({
    container: container ?? undefined,
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  // Feather the top & bottom edges so each scene dissolves into the continuous
  // cream page background — removes the hard seam where two scenes meet.
  // Applied ONLY to the full-bleed background layers; foreground kit pieces
  // sit in a separate un-masked group so they stay fully visible at the edges.
  const mask = `linear-gradient(to bottom, transparent 0%, #000 ${fadeTop}%, #000 ${100 - fadeBottom}%, transparent 100%)`;

  const coverLayers = layers.filter((l) => !l.box);
  const boxLayers = layers.filter((l) => l.box && !l.overhang);
  const overhangLayers = layers.filter((l) => l.box && l.overhang);

  return (
    <>
      <div
        ref={sceneRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {mounted && (
          <>
            {/* Full-bleed background layers — feathered into the page background */}
            <div style={{ position: "absolute", inset: 0, maskImage: mask, WebkitMaskImage: mask }}>
              {coverLayers.map((layer, i) => (
                <Layer key={i} layer={layer} progress={scrollYProgress} reduced={reduced} index={i} />
              ))}
            </div>
            {/* Foreground kit pieces — not feathered, shown fully at the corners.
                Each slides in from its edge (once reached) with a slight stagger. */}
            {boxLayers.map((layer, i) => (
              <Layer
                key={i}
                layer={layer}
                progress={scrollYProgress}
                reduced={reduced}
                delay={i * 0.08}
                index={i}
              />
            ))}
          </>
        )}
        {children}
      </div>
      {/* Seam overhang — un-clipped sibling so the bottom garland can hang over
          the section boundary as ONE continuous piece instead of being chopped
          flat by the scene's overflow. z 5 keeps it above both neighbouring
          scenes/paper overlays (z 0–2) yet below any section content (z 10). */}
      {overhangLayers.length > 0 && (
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}
        >
          {mounted &&
            overhangLayers.map((layer, i) => (
              <Layer
                key={i}
                layer={layer}
                progress={scrollYProgress}
                reduced={reduced}
                delay={(boxLayers.length + i) * 0.08}
                index={boxLayers.length + i}
              />
            ))}
        </div>
      )}
    </>
  );
}
