# Warm Narrative Performance Optimisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate scroll jank and main-thread congestion in Warm Narrative without flattening its painterly art direction or breaking the envelope, section seams, and reduced-motion behavior.

**Architecture:** Keep the existing section API, `sceneFrame()` composition, visual
layer count, ornament count, and particle count. Split scene presence from active
animation so only scenes near the viewport mount their image layers and scroll
subscriptions. Static layers must not allocate MotionValues. Initial-load changes
are handled after runtime accumulation is fixed.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Framer Motion 12, Tailwind CSS 4, Cloudflare Workers/R2.

---

## Execution constraint

Per user direction on 2026-07-09:

- Do not remove sections, layers, ornaments, or petals.
- Do not reduce the visible component count of an active section.
- Tasks 4 and 5 below are **not authorized** where they reduce motion or particle
  counts. They remain historical audit options only.
- Current execution scope is Tasks 1–3 plus desktop/mobile verification.

## Baseline and success criteria

Measured on the deployed desktop page at 1280×720:

| State | Elements | Images | Inline styles | Transform styles | `will-change` |
|---|---:|---:|---:|---:|---:|
| Envelope closed | 547 | 86 | 424 | 163 | 16 |
| Opened at top | 529 | 81 | 406 | 151 | 16 |
| Deep scroll | 725 | 150 | 602 | 280 | 53 |
| Bottom | 761 | 163 | 638 | 304 | 59 |

Reference trace supplied by the user:

- LCP: 1,962 ms
- LCP render delay: 1,264 ms
- Long task: 413 ms
- Layout activity inside the long task: 365 ms

Required outcome:

- Full-scroll DOM element growth from opened-top to bottom: no more than 10%.
- Full-scroll image element growth: no more than 15%.
- `will-change` elements at any position: no more than 16.
- No blank scene during normal or fast reverse scrolling.
- Reduced-motion output remains fully readable and visually complete.
- LCP must remain below 2.5 seconds under the same trace conditions.
- No scroll task longer than 200 ms in the post-envelope scroll trace.
- Typecheck and source-only ESLint pass with zero errors.

## Files in scope

Primary:

- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/ParallaxScene.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/sceneFrame.ts`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/FallingFlowers.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/DesktopCover.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/app/layout.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/eslint.config.mjs`
- Modify: `themes/adat/kenangan/warm-narrative/package.json`

Possible section-specific follow-up:

- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/CoverSection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/GreetingSection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/EventSection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/DressCodeSection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/GallerySection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/RSVPSection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/GiftSection.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/ClosingSection.tsx`

## Task 1: Establish a repeatable performance gate

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/package.json`
- Modify: `themes/adat/kenangan/warm-narrative/eslint.config.mjs`
- Create: `themes/adat/kenangan/warm-narrative/docs/performance-checklist.md`

- [ ] **Step 1: Add source-only quality commands**

Add scripts:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint:source": "eslint src"
  }
}
```

- [ ] **Step 2: Exclude generated output from the default lint scope**

Ensure the flat ESLint config ignores:

```ts
{
  ignores: [
    ".next/**",
    ".open-next/**",
    "node_modules/**",
    "asset-archive/**"
  ]
}
```

- [ ] **Step 3: Document the two required traces**

The checklist must define:

1. Cold reload trace for LCP.
2. Post-envelope trace starting at Cover and ending at Closing.
3. Desktop viewport 1280×720.
4. Mobile viewport 390×844.
5. A second scroll trace with reduced motion enabled.
6. DOM counters at top and bottom.

Use this read-only DevTools console expression for DOM counters:

```js
({
  elements: document.querySelectorAll("*").length,
  images: document.images.length,
  inlineStyles: document.querySelectorAll("[style]").length,
  transforms: [...document.querySelectorAll("[style]")].filter(
    (el) => (el.getAttribute("style") || "").includes("transform")
  ).length,
  willChange: [...document.querySelectorAll("[style]")].filter(
    (el) => (el.getAttribute("style") || "").includes("will-change")
  ).length,
})
```

- [ ] **Step 4: Run the quality baseline**

Run:

```powershell
npm run typecheck
npm run lint:source
```

Expected: both exit 0; existing `<img>` warnings may remain but no errors.

- [ ] **Step 5: Commit the performance gate**

```bash
git add themes/adat/kenangan/warm-narrative/package.json themes/adat/kenangan/warm-narrative/eslint.config.mjs themes/adat/kenangan/warm-narrative/docs/performance-checklist.md
git commit -m "chore: add warm narrative performance gate"
```

## Task 2: Bound the lifecycle of scene layers

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/ParallaxScene.tsx`

- [ ] **Step 1: Record the failing baseline**

Open the deployed or local production build, dismiss the envelope, record the DOM counters at the top, scroll to Closing, and record them again.

Expected before the fix: image and element counts grow substantially; current deployed evidence is 81→163 images and 529→761 elements.

- [ ] **Step 2: Separate the persistent scene anchor from the mounted scene body**

Keep `sceneRef` in `ParallaxScene`, but move `useScroll`, layer grouping, and layer rendering into a child component named `ActiveScene`.

Target structure:

```tsx
function ActiveScene({
  sceneRef,
  layers,
  children,
  fadeTop,
  fadeBottom,
  inView,
}: ActiveSceneProps) {
  const container = useParallaxContainer();
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    container: container ?? undefined,
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  // Existing layer grouping and rendering moves here.
}

export default function ParallaxScene(props: ParallaxSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const nearView = useInView(sceneRef, {
    once: false,
    margin: "120% 0px 120% 0px",
  });
  const inView = useInView(sceneRef, {
    once: false,
    margin: "60% 0px 60% 0px",
  });

  return (
    <div ref={sceneRef} className="parallax-scene-anchor">
      {nearView ? (
        <ActiveScene
          {...props}
          sceneRef={sceneRef}
          inView={inView}
        />
      ) : null}
    </div>
  );
}
```

The anchor must retain the current absolute positioning and section dimensions. Only layer DOM and its MotionValues may unmount.

- [ ] **Step 3: Preserve seam overhang behavior**

Keep the overhang wrapper inside `ActiveScene`. Confirm its z-index remains above neighbouring scene decoration and below section content.

- [ ] **Step 4: Verify reverse scrolling**

Scroll quickly Cover→Closing→Cover.

Expected:

- scenes remount before entering the viewport;
- no beige/empty flash;
- entrance choreography does not block content;
- images are served from browser cache on remount.

- [ ] **Step 5: Verify DOM growth**

Repeat the top/bottom counters.

Expected:

- element growth ≤10%;
- image growth ≤15%;
- top counts approximately return after reverse scrolling.

- [ ] **Step 6: Run static verification**

```powershell
npm run typecheck
npm run lint:source
```

- [ ] **Step 7: Commit bounded scene lifecycle**

```bash
git add themes/adat/kenangan/warm-narrative/src/components/shared/ParallaxScene.tsx
git commit -m "perf: bound warm narrative scene lifecycle"
```

## Task 3: Remove MotionValues from static layers

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/ParallaxScene.tsx`

- [ ] **Step 1: Split static and parallax image renderers**

Do not call `useTransform` in the generic `Layer` component. Create a dedicated child used only when `depth > 0`.

```tsx
function ParallaxImage({
  progress,
  depth,
  style,
  ...imageProps
}: ParallaxImageProps) {
  const range = depth * 100;
  const y = useTransform(progress, [0, 1], [range, -range]);

  return (
    <motion.img
      {...imageProps}
      style={{ ...style, y, willChange: "transform" }}
    />
  );
}

function StaticImage({
  style,
  ...imageProps
}: StaticImageProps) {
  return <img {...imageProps} style={style} />;
}
```

- [ ] **Step 2: Route depth-zero layers to `StaticImage`**

```tsx
const image = !reduced && layer.depth > 0 ? (
  <ParallaxImage
    {...common}
    progress={progress}
    depth={layer.depth}
    style={imageStyle}
  />
) : (
  <StaticImage {...common} style={imageStyle} />
);
```

Static images must not receive `will-change`.

- [ ] **Step 3: Keep entrance motion on the wrapper only**

Do not duplicate transform animation on both wrapper and image. Wrapper owns entrance; image owns scroll parallax only when `depth > 0`.

- [ ] **Step 4: Re-measure compositor promotion**

Expected: `will-change` remains bounded and no longer grows to the current bottom-page value of 59.

- [ ] **Step 5: Run checks and commit**

```powershell
npm run typecheck
npm run lint:source
```

```bash
git add themes/adat/kenangan/warm-narrative/src/components/shared/ParallaxScene.tsx
git commit -m "perf: avoid motion values for static scene layers"
```

## Task 4: Reduce parallax fan-out while preserving scene density

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/sceneFrame.ts`
- Modify section files only where they declare custom layer arrays.

- [ ] **Step 1: Define the motion budget**

Each normal section may have at most:

- one parallax background;
- one parallax focus/arch layer;
- two parallax foreground pieces;
- two ambient CSS loops.

All remaining ornaments stay static.

- [ ] **Step 2: Set structural frame pieces to depth zero**

In `sceneFrame()`:

```ts
const STRUCTURAL_DEPTH = 0;

{ src: src("SakuraColumnL"), depth: STRUCTURAL_DEPTH, ... }
{ src: src("SakuraColumnR"), depth: STRUCTURAL_DEPTH, ... }
{ src: src(cornerL), depth: STRUCTURAL_DEPTH, ... }
{ src: src(cornerR), depth: STRUCTURAL_DEPTH, ... }
```

Keep parallax only on the background, optional arch, and at most two signature foreground pieces.

- [ ] **Step 3: Disable ambient wind by default**

Set `wind: false` for columns, base clusters, and scatter pieces. Enable it explicitly for no more than two signature ornaments per section.

- [ ] **Step 4: Apply the same budget to custom scenes**

Update Cover, Greeting, Gallery, and Love Story arrays so that decorative density remains, but no more than four images per section respond to scroll.

- [ ] **Step 5: Visual regression pass**

Verify:

- Cover still feels layered.
- Akad and Resepsi retain foreground/background separation.
- Seam garlands remain continuous.
- Static ornaments do not appear detached from the page.

- [ ] **Step 6: Record the post-envelope scroll trace**

Expected:

- fewer Animation Frame and Composite Layers tasks;
- no scroll long task over 200 ms;
- no visual change to content hierarchy.

- [ ] **Step 7: Run checks and commit**

```powershell
npm run typecheck
npm run lint:source
```

```bash
git add themes/adat/kenangan/warm-narrative/src/components/shared/sceneFrame.ts themes/adat/kenangan/warm-narrative/src/components/sections
git commit -m "perf: reduce warm narrative parallax fan-out"
```

## Task 5: Bound particle animation

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/FallingFlowers.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/DesktopCover.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/CoverSection.tsx`

- [ ] **Step 1: Establish particle budgets**

- Mobile Cover: maximum 12 petals.
- Desktop Cover panel: maximum 8 petals.
- Other sections: maximum 6 petals.

- [ ] **Step 2: Use a shared stylesheet instead of one keyframe per petal**

Replace generated `@keyframes pf_<index>` rules with one `petal-fall` keyframe. Individual variation moves to CSS custom properties:

```css
@keyframes petal-fall {
  0% {
    transform: translate3d(0, -80px, 0) rotate(var(--rot-start));
    opacity: 0;
  }
  8% { opacity: 0.82; }
  45% {
    transform: translate3d(var(--sway), 60vh, 0)
      rotate(calc(var(--rot-start) + 180deg));
  }
  100% {
    transform: translate3d(var(--drift-end), 145vh, 0)
      rotate(calc(var(--rot-start) + 360deg));
    opacity: 0.82;
  }
}
```

Each petal sets only:

```tsx
style={{
  "--rot-start": `${p.rotStart}deg`,
  "--sway": `${p.sway}px`,
  "--drift-end": `${p.driftEnd}px`,
  animationDuration: p.duration,
  animationDelay: p.delay,
}}
```

- [ ] **Step 3: Keep viewport pausing**

Retain `animationPlayState: inView ? "running" : "paused"`.

- [ ] **Step 4: Verify visual randomness**

Confirm petal paths do not become visibly synchronized.

- [ ] **Step 5: Run checks and commit**

```powershell
npm run typecheck
npm run lint:source
```

```bash
git add themes/adat/kenangan/warm-narrative/src/components/shared/FallingFlowers.tsx themes/adat/kenangan/warm-narrative/src/components/shared/DesktopCover.tsx themes/adat/kenangan/warm-narrative/src/components/sections/CoverSection.tsx
git commit -m "perf: bound warm narrative particle animation"
```

## Task 6: Reduce initial hydration and hidden work

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/src/app/page.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/DesktopCover.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/app/layout.tsx`
- Modify section files if client boundaries can be removed safely.

- [ ] **Step 1: Audit actual client boundaries**

For every `"use client"` file, record the hook/browser API requiring it. Do not convert files that use state, refs, clipboard, audio, iframe interaction, or scroll hooks.

- [ ] **Step 2: Convert static animated sections to server components**

Where entrance motion is declarative and has no hooks, use:

```ts
import * as motion from "framer-motion/client";
```

Remove `"use client"` from those sections.

- [ ] **Step 3: Avoid duplicated desktop animation work**

Keep the Desktop Cover visual, but cap it at static decorations plus at most eight petals. It must not duplicate parallax or observers from the mobile invitation column.

- [ ] **Step 4: Review preload competition**

Keep high priority for the actual LCP asset. Change cover-scene decoration preloads to normal priority or remove them if they are already ready before the user can dismiss the envelope.

Do not change the envelope composition in this task.

- [ ] **Step 5: Move date formatting off the client critical path**

Format the display date in server-owned invitation data or pass a preformatted string. Do not use `useMemo`; it does not remove first-render locale initialization.

- [ ] **Step 6: Verify cold-load trace**

Expected:

- LCP stays under 2.5 seconds;
- render delay decreases;
- no regression when opening the invitation immediately after load.

- [ ] **Step 7: Run checks and commit**

```powershell
npm run typecheck
npm run lint:source
npm run build
```

```bash
git add themes/adat/kenangan/warm-narrative/src/app themes/adat/kenangan/warm-narrative/src/components
git commit -m "perf: reduce warm narrative initial hydration"
```

## Task 7: Image and iframe hygiene

**Files:**

- Modify: `themes/adat/kenangan/warm-narrative/src/components/shared/ParallaxScene.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/components/sections/EventSection.tsx`
- Modify: content-image sections identified by source-only ESLint.

- [ ] **Step 1: Add intrinsic dimensions to decorative image metadata**

Extend `ParallaxLayer` with aspect-ratio or intrinsic-dimension metadata where available:

```ts
interface ParallaxLayer {
  width?: number;
  height?: number;
  // existing fields
}
```

Pass `width` and `height` to `<img>` so decoding does not introduce uncertain intrinsic sizing.

- [ ] **Step 2: Keep raw `<img>` for theme decoration deliberately**

Do not mechanically replace all R2 decoration with `next/image`. `next/image` is most useful for content photography; transparent ornaments already have controlled CDN assets and CSS sizing.

- [ ] **Step 3: Convert content photography first**

Use `next/image` or an explicit Cloudflare image loader for couple and gallery photos, with accurate `sizes`. Decorative imagery remains raw `<img>` with intrinsic dimensions.

- [ ] **Step 4: Confirm iframe lazy loading**

Both maps must use:

```tsx
loading="lazy"
```

and remain non-interactive until explicitly activated.

- [ ] **Step 5: Run checks and commit**

```powershell
npm run typecheck
npm run lint:source
npm run build
```

```bash
git add themes/adat/kenangan/warm-narrative/src
git commit -m "perf: tighten warm narrative media loading"
```

## Task 8: Final verification

**Files:**

- Update: `themes/adat/kenangan/warm-narrative/docs/performance-checklist.md`

- [ ] **Step 1: Run full static verification**

```powershell
npm run typecheck
npm run lint:source
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Run desktop traces**

At 1280×720:

- cold-load trace;
- post-envelope full-scroll trace;
- reduced-motion full-scroll trace.

- [ ] **Step 3: Run mobile traces**

At 390×844:

- cold-load trace;
- post-envelope full-scroll trace;
- reduced-motion full-scroll trace.

- [ ] **Step 4: Compare against acceptance criteria**

Record:

- LCP and render delay;
- longest main-thread task;
- longest Layout task;
- DOM/image/`will-change` counts at top and bottom;
- screenshots of Cover, Event, Gallery, and Closing;
- any visual or interaction regressions.

- [ ] **Step 5: Do not ship if runtime growth remains unbounded**

If element or image growth exceeds the budget, return to Task 2. Do not compensate by merely lowering particle counts or removing visual effects.

- [ ] **Step 6: Commit verified results**

```bash
git add themes/adat/kenangan/warm-narrative/docs/performance-checklist.md
git commit -m "docs: record warm narrative performance results"
```

## Explicitly deferred

These are not first-line fixes:

- redesigning or removing the envelope;
- inlining the entire 26.4 KB stylesheet;
- manually splitting the React DOM runtime chunk;
- memoizing `toLocaleDateString`;
- replacing every `<img>` with `next/image`;
- removing the painterly scene system;
- changing copy, package features, or section order.

They may be revisited only if Tasks 2–7 do not meet the measured budgets.
