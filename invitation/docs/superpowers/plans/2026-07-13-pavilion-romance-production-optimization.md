# Pavilion Romance Production Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Pavilion Romance production-ready with R2-managed customer media, deferred media loading, accessible interactions, D1-backed RSVP persistence, reduced-motion support, share metadata, and validated invitation configuration.

**Architecture:** The template remains a config-driven Next.js App Router application deployed as an OpenNext Cloudflare Worker. Theme media and invitation media are resolved by separate R2 URL helpers; a single route handler validates and persists RSVP submissions with a Cloudflare D1 binding; client sections consume only typed props and server responses. Media optimization deliberately keeps animated decorative images as plain `<img>` elements while prioritizing only first-view media and delaying below-the-fold backgrounds, gallery images, maps, and YouTube.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Framer Motion 12, Cloudflare Workers, OpenNext Cloudflare, Cloudflare R2, Cloudflare D1, Wrangler 4, ESLint 9.

## Global Constraints

- Preserve the existing Garden Pavilion Storybook visual direction and section ordering.
- Use `https://assets-themes.rimba.io` for decorative theme assets and `https://assets-invitations.rimba.io` for customer media.
- Do not replace every decorative `<img>` with `next/image`; preserve plain `<img>` where CSS layering/animation requires it.
- D1 RSVP data is write-only for public users; do not add a public wish/RSVP listing endpoint or admin dashboard.
- RSVP success UI may appear only after D1 confirms a successful insert.
- Use Cloudflare D1 prepared statements; do not concatenate user input into SQL.
- Do not place a guessed D1 `database_id` into `wrangler.jsonc`; create the database first and use the generated ID.
- Respect `prefers-reduced-motion` for both CSS animation and Framer Motion behavior.
- Keep the current `invitation.config.json` as the single content source.
- Run lint and production build before declaring the implementation complete.

---

## File Structure

### New files

- `themes/floral/kisah/pavilion-romance/src/lib/invitation-media.ts` — R2 photo URL helper, absolute URL passthrough, and social image resolver.
- `themes/floral/kisah/pavilion-romance/src/lib/invitation-config.ts` — validated config loader and lightweight runtime config invariants.
- `themes/floral/kisah/pavilion-romance/src/lib/rsvp.ts` — request schema-free parsing/validation shared by the route handler and tests.
- `themes/floral/kisah/pavilion-romance/src/app/api/rsvp/route.ts` — JSON-only POST endpoint that writes validated RSVP records to D1.
- `themes/floral/kisah/pavilion-romance/migrations/0001_create_rsvps.sql` — first D1 migration.
- `themes/floral/kisah/pavilion-romance/cloudflare-env.d.ts` — generated Cloudflare environment binding type declaration.
- `themes/floral/kisah/pavilion-romance/docs/DEPLOYMENT.md` — Pavilion-specific R2/D1 environment, migration, cache, and deployment instructions.

### Modified files

- `themes/floral/kisah/pavilion-romance/invitation.config.json` — add invitation identity/media paths and change example customer images to R2 photo paths.
- `themes/floral/kisah/pavilion-romance/src/lib/assets.ts` — rename/expose theme URL helper while retaining `asset` compatibility.
- `themes/floral/kisah/pavilion-romance/src/lib/config-types.ts` — add `SectionId`, invitation media identity, and strict section config typing.
- `themes/floral/kisah/pavilion-romance/src/data/invitation.ts` — load config through runtime validator instead of a type assertion.
- `themes/floral/kisah/pavilion-romance/src/app/layout.tsx` — complete metadata and use validated config/media helpers.
- `themes/floral/kisah/pavilion-romance/src/app/globals.css` — shared focus, disabled, radio, dialog, visually-hidden, and reduced-motion rules.
- `themes/floral/kisah/pavilion-romance/src/app/page.tsx` — use validated config only through the data module.
- `themes/floral/kisah/pavilion-romance/src/components/shared/SceneBackground.tsx` — accept loading priority and decoding props.
- `themes/floral/kisah/pavilion-romance/src/components/shared/MusicPlayer.tsx` — native accessible button and reduced-motion transition behavior.
- `themes/floral/kisah/pavilion-romance/src/components/shared/FallingFlowers.tsx` — reduced-motion-aware falling-petal rendering.
- `themes/floral/kisah/pavilion-romance/src/components/shared/InvitationExperience.tsx` — preserve typed `SectionId` rendering and pass only relevant props.
- `themes/floral/kisah/pavilion-romance/src/components/sections/CoverSection.tsx` — priority media, R2 photo resolving, and reduced-motion scroll hint.
- `themes/floral/kisah/pavilion-romance/src/components/sections/CoupleSection.tsx` — deferred portrait images and R2 photo resolving.
- `themes/floral/kisah/pavilion-romance/src/components/sections/EventSection.tsx` — accessible map dialog, focus management, Escape handling, lazy map preview.
- `themes/floral/kisah/pavilion-romance/src/components/sections/GallerySection.tsx` — async decode, dynamic photo-count copy, and R2 photo resolving.
- `themes/floral/kisah/pavilion-romance/src/components/sections/VideoSection.tsx` — poster-first, click-to-load privacy-enhanced video.
- `themes/floral/kisah/pavilion-romance/src/components/sections/RSVPSection.tsx` — accessible real submission states and POST client.
- `themes/floral/kisah/pavilion-romance/src/components/sections/GiftSection.tsx` — awaited clipboard writes and live status.
- `themes/floral/kisah/pavilion-romance/src/components/sections/ClosingSection.tsx` — lazy closing background/image if not covered by shared scene behavior.
- `themes/floral/kisah/pavilion-romance/next.config.ts` — initialize OpenNext Cloudflare bindings for local `next dev` if required by the installed adapter.
- `themes/floral/kisah/pavilion-romance/wrangler.jsonc` — add D1 binding after actual D1 provisioning.
- `themes/floral/kisah/pavilion-romance/package.json` — add Cloudflare type generation and D1 migration scripts.
- `themes/floral/kisah/pavilion-romance/README.md` — document fixed typography behavior and link the deployment guide.

### Test strategy

The current template has no test runner. Add no new test framework unless the repository establishes one during implementation. Extract pure logic to `src/lib` and verify it with TypeScript, route-level local D1 smoke checks, lint/build, and browser-driven behavior checks. If a lightweight runner is added, use it only for `invitation-config.ts` and `rsvp.ts` pure functions; do not introduce broad component snapshots.

## Task 1: Separate R2 theme and invitation-media URL resolution

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/lib/assets.ts`
- Create: `themes/floral/kisah/pavilion-romance/src/lib/invitation-media.ts`
- Modify: `themes/floral/kisah/pavilion-romance/invitation.config.json`
- Modify: `themes/floral/kisah/pavilion-romance/src/lib/config-types.ts`
- Modify: `themes/floral/kisah/pavilion-romance/wrangler.jsonc`
- Modify: `themes/floral/kisah/pavilion-romance/README.md`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_THEMES_CDN`, `NEXT_PUBLIC_PHOTOS_CDN`, the existing `asset(file: string): string` callers, and customer-photo values in invitation config.
- Produces: `themeAsset(file: string): string`, `asset(file: string): string`, `invitationPhoto(pathOrUrl: string): string`, `invitationSocialImage(pathOrUrl: string): string`, and `InvitationMediaConfig`.

- [ ] **Step 1: Define a deterministic media URL contract in `config-types.ts`**

Add exact types near the other config interfaces:

```ts
export interface InvitationMediaConfig {
  slug: string;
  socialImage: string;
}

export type SectionId =
  | "cover"
  | "greeting"
  | "couple"
  | "love-story"
  | "akad"
  | "resepsi"
  | "dresscode"
  | "gallery"
  | "video"
  | "rsvp"
  | "gift"
  | "closing";
```

Change `InvitationConfig` to include `media: InvitationMediaConfig`, `sections.order: SectionId[]`, and `sections.enabled: Record<SectionId, boolean>`.

- [ ] **Step 2: Add the two URL helpers**

Replace `src/lib/assets.ts` with a theme-specific helper that preserves current callers:

```ts
const THEME_CDN = process.env.NEXT_PUBLIC_THEMES_CDN ?? "https://assets-themes.rimba.io";

export const THEME_ASSET_BASE = `${THEME_CDN}/floral/kisah/pavilion-romance`;

export const themeAsset = (file: string) => `${THEME_ASSET_BASE}/${file}`;

export const asset = themeAsset;
```

Create `src/lib/invitation-media.ts`:

```ts
const PHOTO_CDN = process.env.NEXT_PUBLIC_PHOTOS_CDN ?? "https://assets-invitations.rimba.io";

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const invitationPhoto = (pathOrUrl: string) =>
  isAbsoluteUrl(pathOrUrl) ? pathOrUrl : `${PHOTO_CDN}/${pathOrUrl.replace(/^\/+/, "")}`;

export const invitationSocialImage = invitationPhoto;
```

- [ ] **Step 3: Change the sample config to R2-relative customer paths**

At the root of `invitation.config.json`, add:

```json
"media": {
  "slug": "pavilion-romance",
  "socialImage": "pavilion-romance/social/og.webp"
},
```

Replace Unsplash URLs with R2-relative example paths:

```json
"photo": "pavilion-romance/couple/groom.webp"
"photo": "pavilion-romance/couple/bride.webp"
```

Use paths `pavilion-romance/gallery/01.webp` through `pavilion-romance/gallery/25.webp` for gallery items and `pavilion-romance/video/poster.webp` for `video.poster`.

- [ ] **Step 4: Document configured CDN roots**

Add this Wrangler variable alongside the existing theme variable:

```jsonc
"NEXT_PUBLIC_PHOTOS_CDN": "https://assets-invitations.rimba.io"
```

In `README.md`, document that theme assets are loaded from `NEXT_PUBLIC_THEMES_CDN`, customer assets are loaded from `NEXT_PUBLIC_PHOTOS_CDN`, and final production uploads must use versioned filenames with `Cache-Control: public, max-age=31536000, immutable`.

- [ ] **Step 5: Validate static compilation**

Run:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run lint
```

Expected: no new TypeScript/ESLint errors. Existing `<img>` optimization warnings may remain until the media tasks are complete.

- [ ] **Step 6: Commit the R2 media contract**

```bash
git add themes/floral/kisah/pavilion-romance/src/lib/assets.ts themes/floral/kisah/pavilion-romance/src/lib/invitation-media.ts themes/floral/kisah/pavilion-romance/src/lib/config-types.ts themes/floral/kisah/pavilion-romance/invitation.config.json themes/floral/kisah/pavilion-romance/wrangler.jsonc themes/floral/kisah/pavilion-romance/README.md
git commit -m "feat(pavilion-romance): separate R2 theme and photo media"
```

## Task 2: Validate invitation config and section IDs at startup

**Files:**
- Create: `themes/floral/kisah/pavilion-romance/src/lib/invitation-config.ts`
- Modify: `themes/floral/kisah/pavilion-romance/src/data/invitation.ts`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/shared/InvitationExperience.tsx`

**Interfaces:**
- Consumes: JSON-shaped config values and `InvitationConfig`, `SectionId` from `config-types.ts`.
- Produces: `validateInvitationConfig(value: unknown): InvitationConfig` and `sectionIds` with no unknown section values.

- [ ] **Step 1: Write the pure validator with explicit failure messages**

Create `src/lib/invitation-config.ts` with a constant list and validation helpers:

```ts
import type { InvitationConfig, SectionId } from "@/lib/config-types";

export const SECTION_IDS = [
  "cover", "greeting", "couple", "love-story", "akad", "resepsi",
  "dresscode", "gallery", "video", "rsvp", "gift", "closing",
] as const satisfies readonly SectionId[];

const isSectionId = (value: unknown): value is SectionId =>
  typeof value === "string" && SECTION_IDS.includes(value as SectionId);

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(`Invalid invitation config: ${message}`);
};

const isHttpUrl = (value: unknown) => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export function validateInvitationConfig(value: unknown): InvitationConfig {
  const config = value as Partial<InvitationConfig>;
  assert(config.couple?.groom?.name?.trim(), "couple.groom.name is required");
  assert(config.couple?.bride?.name?.trim(), "couple.bride.name is required");
  assert(config.media?.slug?.trim(), "media.slug is required");
  assert(config.media?.socialImage?.trim(), "media.socialImage is required");
  assert(typeof config.weddingDate === "string" && !Number.isNaN(Date.parse(config.weddingDate)), "weddingDate must be a valid date");
  assert(isHttpUrl(config.events?.akad?.mapsUrl), "events.akad.mapsUrl must be an http(s) URL");
  assert(isHttpUrl(config.events?.akad?.embedUrl), "events.akad.embedUrl must be an http(s) URL");
  assert(isHttpUrl(config.events?.resepsi?.mapsUrl), "events.resepsi.mapsUrl must be an http(s) URL");
  assert(isHttpUrl(config.events?.resepsi?.embedUrl), "events.resepsi.embedUrl must be an http(s) URL");
  assert(Array.isArray(config.sections?.order) && config.sections.order.every(isSectionId), "sections.order contains an unknown section id");
  assert(config.sections?.enabled && SECTION_IDS.every((id) => typeof config.sections?.enabled?.[id] === "boolean"), "sections.enabled must define every section id");
  if (config.sections.enabled.gallery) {
    assert(Array.isArray(config.gallery) && config.gallery.length > 0, "gallery must contain at least one image when enabled");
  }
  return value as InvitationConfig;
}
```

- [ ] **Step 2: Load JSON through the validator**

Update `src/data/invitation.ts`:

```ts
import rawConfig from "../../invitation.config.json";
import { validateInvitationConfig } from "@/lib/invitation-config";

export const config = validateInvitationConfig(rawConfig);
```

Keep existing named exports only if consumers still use them; otherwise remove unused re-exports in the same change.

- [ ] **Step 3: Make the section renderer exhaustively typed**

Change `InvitationExperience.renderSection` to accept `SectionId`, remove the silent string default path, and include a compile-time exhaustive fallback:

```ts
function assertNever(value: never): never {
  throw new Error(`Unsupported invitation section: ${value}`);
}
```

Use `return assertNever(id)` after all cases. `sectionIds` should remain:

```ts
const sectionIds = config.sections.order.filter((id) => config.sections.enabled[id]);
```

- [ ] **Step 4: Run lint and build to verify invalid IDs cannot compile through**

Run:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run lint
npm --prefix themes/floral/kisah/pavilion-romance run build
```

Expected: both commands exit 0. Temporarily changing one known `sections.order` value to `"invalid"` should make TypeScript/config validation fail; restore the valid value before continuing.

- [ ] **Step 5: Commit config validation**

```bash
git add themes/floral/kisah/pavilion-romance/src/lib/invitation-config.ts themes/floral/kisah/pavilion-romance/src/lib/config-types.ts themes/floral/kisah/pavilion-romance/src/data/invitation.ts themes/floral/kisah/pavilion-romance/src/components/shared/InvitationExperience.tsx
git commit -m "feat(pavilion-romance): validate invitation configuration"
```

## Task 3: Add production metadata and clarify fixed template typography

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/app/layout.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/README.md`

**Interfaces:**
- Consumes: `config.couple`, `config.media.socialImage`, `invitationSocialImage`.
- Produces: canonical, Open Graph, and Twitter metadata that resolves to R2.

- [ ] **Step 1: Build complete metadata from the validated config**

Update the imports:

```ts
import { config } from "@/data/invitation";
import { invitationSocialImage } from "@/lib/invitation-media";
```

Replace individual `couple` imports with `config.couple`. Define:

```ts
const siteUrl = new URL("https://pavilion-romance.rimba.io");
const socialImage = invitationSocialImage(config.media.socialImage);
const title = `${config.couple.groom.name} & ${config.couple.bride.name} — The Wedding`;
const description = `Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan ${config.couple.groom.name} & ${config.couple.bride.name}.`;
```

Set metadata to:

```ts
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `${title} | Rimba Digital`,
  description,
  alternates: { canonical: "/" },
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Rimba Digital",
    title,
    description,
    images: [{ url: socialImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};
```

- [ ] **Step 2: Make typography scope explicit in documentation**

In `README.md`, state that display/body/script fonts are fixed components of the Pavilion Romance identity because they are loaded through `next/font`; color tokens are configurable, but changing `theme.typography` in JSON does not change loaded font files. Remove `theme.typography` from the configuration documentation if it remains unused, or mark it as descriptive metadata only.

- [ ] **Step 3: Verify metadata build output**

Run:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run build
```

Expected: build exits 0 and does not report invalid metadata URL errors.

- [ ] **Step 4: Commit metadata work**

```bash
git add themes/floral/kisah/pavilion-romance/src/app/layout.tsx themes/floral/kisah/pavilion-romance/README.md
git commit -m "feat(pavilion-romance): add social sharing metadata"
```

## Task 4: Defer non-critical imagery and make gallery media data-driven

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/components/shared/SceneBackground.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/CoverSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/CoupleSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/GallerySection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/EventSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/ClosingSection.tsx`

**Interfaces:**
- Consumes: `invitationPhoto(pathOrUrl: string): string`, `themeAsset(file: string): string` and `SceneBackground` props.
- Produces: `SceneBackground({ file, scrim, edgeFade, priority })`, where `priority=true` emits eager/high-priority image behavior and the default is lazy/async.

- [ ] **Step 1: Extend `SceneBackground` with explicit priority behavior**

Use this interface and image attributes:

```tsx
export default function SceneBackground({
  file = "LatarPavilionGarden.webp",
  scrim = 0.5,
  edgeFade = false,
  priority = false,
}: {
  file?: string;
  scrim?: number;
  edgeFade?: boolean;
  priority?: boolean;
}) {
  // existing wrapper and layers
  <img
    src={themeAsset(file)}
    alt=""
    aria-hidden="true"
    onError={hideBrokenImage}
    loading={priority ? "eager" : "lazy"}
    fetchPriority={priority ? "high" : "auto"}
    decoding={priority ? "sync" : "async"}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
  />
}
```

Keep the existing scrim and edge-fade layers unchanged.

- [ ] **Step 2: Mark only opening and cover backgrounds as priority**

Pass `priority` in `OpeningGate`, `CoverSection`, and `DesktopCover` only. Do not pass it in gallery, events, RSVP, gift, or closing. In `CoverSection`, resolve couple photos with `invitationPhoto()` and add `decoding="async"` to the two image elements. Keep only the hero frame as a high-priority decorative candidate; do not give all three images `fetchPriority="high"`.

- [ ] **Step 3: Defer portraits, gallery images, maps, and closing media**

In `CoupleSection`, resolve `person.photo` through `invitationPhoto`, set `loading="lazy"` and `decoding="async"`.

In `GallerySection`, resolve each `item.src` through `invitationPhoto`, keep `loading="lazy"`, add `decoding="async"`, and replace hardcoded copy with:

```tsx
<p className="type-caption" style={{ maxWidth: 280, marginTop: 4 }}>
  {gallery.length} foto pilihan untuk merangkum perjalanan sebelum hari bahagia.
</p>
```

In `EventSection`, keep `loading="lazy"` on preview iframe and add `title`; do not create the full-screen map iframe until the dialog is opened.

In `ClosingSection`, add `loading="lazy"` and `decoding="async"` to the bottom garden image.

- [ ] **Step 4: Run a browser network smoke check**

Start the template:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run dev
```

Open the page in a browser with network logging. Before scrolling, verify that gallery images and non-cover `SceneBackground` images do not start downloading. Scroll through Gallery and Closing and verify their media begins loading when approaching viewport.

- [ ] **Step 5: Run lint and build**

Run:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run lint
npm --prefix themes/floral/kisah/pavilion-romance run build
```

Expected: no errors. Review remaining `<img>` warnings and confirm each is decorative or needs CSS layering/animation.

- [ ] **Step 6: Commit media loading changes**

```bash
git add themes/floral/kisah/pavilion-romance/src/components/shared/SceneBackground.tsx themes/floral/kisah/pavilion-romance/src/components/sections/CoverSection.tsx themes/floral/kisah/pavilion-romance/src/components/sections/CoupleSection.tsx themes/floral/kisah/pavilion-romance/src/components/sections/GallerySection.tsx themes/floral/kisah/pavilion-romance/src/components/sections/EventSection.tsx themes/floral/kisah/pavilion-romance/src/components/sections/ClosingSection.tsx
git commit -m "perf(pavilion-romance): defer noncritical invitation media"
```

## Task 5: Replace eager YouTube embed with an accessible poster-first player

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/VideoSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/app/globals.css`

**Interfaces:**
- Consumes: `video.title`, `video.embedUrl`, `video.poster`, `invitationPhoto()`.
- Produces: a `VideoSection` that does not mount an iframe until its native play button is activated.

- [ ] **Step 1: Normalize the YouTube embed host without changing video identity**

Add a pure local helper in `VideoSection.tsx`:

```ts
function privacyEmbedUrl(embedUrl: string) {
  try {
    const url = new URL(embedUrl);
    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      url.hostname = "www.youtube-nocookie.com";
    }
    return url.toString();
  } catch {
    return embedUrl;
  }
}
```

- [ ] **Step 2: Add explicit playback state and poster-only initial render**

Mark the component `"use client"`, import `useState`, and initialize:

```ts
const [playing, setPlaying] = useState(false);
const poster = video.poster ? invitationPhoto(video.poster) : undefined;
```

Inside the existing 16:9 opening, render:

```tsx
{playing ? (
  <iframe
    src={privacyEmbedUrl(video.embedUrl)}
    title={video.title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
    style={{ width: "100%", height: "100%", border: 0, display: "block" }}
  />
) : (
  <button
    type="button"
    className="video-play-button"
    onClick={() => setPlaying(true)}
    aria-label={`Putar ${video.title}`}
  >
    {poster ? <img src={poster} alt="" aria-hidden="true" loading="lazy" decoding="async" className="video-poster" /> : null}
    <span className="video-play-icon" aria-hidden="true"><Play size={16} fill="currentColor" /></span>
    <span className="sr-only">Putar {video.title}</span>
  </button>
)}
```

If `poster` is absent, the button must still display the existing surface background and play icon.

- [ ] **Step 3: Add focused visual treatment without changing frame geometry**

Add CSS:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.video-play-button {
  position: relative;
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--surface-2);
  color: var(--bg);
  cursor: pointer;
  overflow: hidden;
}

.video-play-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -3px;
}

.video-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-play-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 42px;
  height: 42px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(122, 41, 64, 0.9);
  box-shadow: 0 8px 18px rgba(62, 51, 40, 0.18);
}
```

Remove the old non-interactive overlay play icon to prevent duplicate visual controls.

- [ ] **Step 4: Verify iframe deferral**

With the browser DevTools Elements/Network panel, load the invitation and verify there is no YouTube iframe or `youtube-nocookie.com` request before pressing Play. Press Play and verify exactly one iframe mounts and starts loading.

- [ ] **Step 5: Commit poster-first video loading**

```bash
git add themes/floral/kisah/pavilion-romance/src/components/sections/VideoSection.tsx themes/floral/kisah/pavilion-romance/src/app/globals.css
git commit -m "perf(pavilion-romance): defer video player until guest action"
```

## Task 6: Make music, map, and gift actions keyboard-safe and truthful

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/components/shared/MusicPlayer.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/EventSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/GiftSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/app/globals.css`

**Interfaces:**
- Consumes: browser media, focus, clipboard, and dialog APIs.
- Produces: native controls; `MapDialog` behavior with Escape/focus return; `copyStatus: string` announced via `aria-live`.

- [ ] **Step 1: Replace the music `<div role="button">` with native button semantics**

In `MusicPlayer.tsx`, replace the outer clickable div with:

```tsx
<button
  id="music-toggle-btn"
  type="button"
  aria-label={playing ? "Jeda musik" : "Putar musik"}
  aria-pressed={playing}
  disabled={!ready}
  onClick={toggle}
  onMouseEnter={() => setShowTooltip(true)}
  onMouseLeave={() => setShowTooltip(false)}
  className="music-toggle"
>
  <Music size={18} strokeWidth={1.5} />
</button>
```

Move the existing visual styles into `.music-toggle`, including explicit `:focus-visible` and `:disabled` rules. In `toggle`, only set `playing` after `await audio.play()` succeeds:

```ts
const toggle = async () => {
  const audio = audioRef.current;
  if (!audio || !ready) return;
  if (playing) {
    audio.pause();
    setPlaying(false);
    return;
  }
  try {
    await audio.play();
    setPlaying(true);
  } catch {
    setPlaying(false);
  }
};
```

- [ ] **Step 2: Implement an accessible map dialog**

In `EventSection.tsx`, add refs:

```ts
const mapTriggerRef = useRef<HTMLButtonElement>(null);
const closeButtonRef = useRef<HTMLButtonElement>(null);
```

When `mapOpen` becomes true, save `document.body.style.overflow`, set it to `hidden`, focus `closeButtonRef`, and attach an Escape handler. On cleanup, restore overflow and return focus to `mapTriggerRef.current` only if the dialog had been open.

Wrap the portal content with:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={`map-dialog-title-${sectionId}`}
  onKeyDown={(event) => {
    if (event.key === "Tab") event.preventDefault();
    closeButtonRef.current?.focus();
  }}
  style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", background: "var(--bg)" }}
>
```

Set the existing venue label ID to `map-dialog-title-${sectionId}` and attach `ref={closeButtonRef}` to the close button.

Replace the map-preview overlay div with:

```tsx
<button
  ref={mapTriggerRef}
  type="button"
  className="map-preview-trigger"
  onClick={() => setMapOpen(true)}
  aria-label={`Buka peta interaktif ${event.venue}`}
/>
```

The full map iframe must stay inside the dialog and only exist while `mapOpen` is true.

- [ ] **Step 3: Make copy-to-clipboard await actual success**

In `GiftSection.tsx`, add:

```ts
const [copyStatus, setCopyStatus] = useState("");
```

Replace `handleCopy` with an async function that only calls `setCopiedIdx(idx)` after the Clipboard API succeeds. Use the legacy textarea fallback only when Clipboard API is unavailable, and set failure state if either path fails:

```ts
const handleCopy = async (text: string, idx: number, bank: string) => {
  const clean = text.replace(/\s/g, "");
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(clean);
    } else {
      const el = document.createElement("textarea");
      el.value = clean;
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(el);
      if (!copied) throw new Error("Copy command was rejected");
    }
    setCopiedIdx(idx);
    setCopyStatus(`Nomor rekening ${bank} berhasil disalin.`);
    window.setTimeout(() => setCopiedIdx(null), 2000);
  } catch {
    setCopyStatus(`Nomor rekening ${bank} belum dapat disalin. Salin secara manual.`);
  }
};
```

Call it with `handleCopy(acc.number, i, acc.bank)` and add `<p className="sr-only" role="status" aria-live="polite">{copyStatus}</p>` after the account list.

- [ ] **Step 4: Add shared native-control focus styles**

Add CSS for `.music-toggle:focus-visible`, `.map-preview-trigger:focus-visible`, `.music-toggle:disabled`, and `.map-preview-trigger` so the map trigger fills the preview area without reintroducing a generic clickable div.

- [ ] **Step 5: Manually verify keyboard behavior**

Run the dev server and verify:

1. Tab reaches the music button and Enter/Space toggles audio.
2. Tab reaches map preview; Enter and Space open the dialog.
3. Dialog close button receives focus.
4. Escape closes the dialog.
5. Focus returns to map trigger.
6. Copy success is announced only after actual copy.

- [ ] **Step 6: Commit accessible interactive controls**

```bash
git add themes/floral/kisah/pavilion-romance/src/components/shared/MusicPlayer.tsx themes/floral/kisah/pavilion-romance/src/components/sections/EventSection.tsx themes/floral/kisah/pavilion-romance/src/components/sections/GiftSection.tsx themes/floral/kisah/pavilion-romance/src/app/globals.css
git commit -m "fix(pavilion-romance): make invitation controls accessible"
```

## Task 7: Respect reduced motion in CSS and Framer Motion

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/components/shared/FallingFlowers.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/CoverSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/shared/OpeningGate.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/components/shared/MusicPlayer.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/app/globals.css`

**Interfaces:**
- Consumes: Framer Motion `useReducedMotion()` and browser `prefers-reduced-motion` CSS query.
- Produces: no infinite petal/scroll-hint motion when a user requests reduced motion.

- [ ] **Step 1: Hide decorative falling petals when reduced motion is requested**

In `FallingFlowers.tsx`, import `useReducedMotion` and return `null` before calculating petals:

```ts
const shouldReduceMotion = useReducedMotion();
if (shouldReduceMotion) return null;
```

Because the component is decorative, removing it is preferable to preserving a still layer of random petals.

- [ ] **Step 2: Stop Framer Motion’s infinite scroll hint**

In `CoverSection.tsx`, import `useReducedMotion`, set `const shouldReduceMotion = useReducedMotion();`, and replace the scroll-hint animation with:

```tsx
animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [0, 0.6, 0] }}
transition={shouldReduceMotion ? { duration: 0 } : { duration: 2.5, delay: 2, repeat: Infinity, ease: "easeInOut" }}
```

Pass `priority` to the cover `SceneBackground` in the same component if Task 4 has not already done so.

- [ ] **Step 3: Short-circuit gate and music appearance transitions**

In `OpeningGate.tsx` and `MusicPlayer.tsx`, read `const shouldReduceMotion = useReducedMotion();`. For animated containers use a 0-duration transition when true, such as:

```ts
const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.4, 0, 0.2, 1] };
```

Do not hide content when motion is reduced.

- [ ] **Step 4: Strengthen CSS fallback for runtime animation classes**

Inside the existing reduced-motion block in `globals.css`, add:

```css
.music-toggle,
.video-play-icon,
.map-preview-trigger {
  transition-duration: 0ms !important;
}
```

Retain the existing `[data-enter]` and `.ambient-anim` rules.

- [ ] **Step 5: Verify the preference in browser emulation**

Enable `prefers-reduced-motion: reduce` in browser rendering emulation. Confirm falling flowers are absent, scroll hint is static, opening gate does not slide/fade for a visible duration, and all invitation content remains available.

- [ ] **Step 6: Commit reduced-motion coverage**

```bash
git add themes/floral/kisah/pavilion-romance/src/components/shared/FallingFlowers.tsx themes/floral/kisah/pavilion-romance/src/components/sections/CoverSection.tsx themes/floral/kisah/pavilion-romance/src/components/shared/OpeningGate.tsx themes/floral/kisah/pavilion-romance/src/components/shared/MusicPlayer.tsx themes/floral/kisah/pavilion-romance/src/app/globals.css
git commit -m "fix(pavilion-romance): honor reduced motion preferences"
```

## Task 8: Add D1 schema, binding types, and local development support

**Files:**
- Create: `themes/floral/kisah/pavilion-romance/migrations/0001_create_rsvps.sql`
- Modify: `themes/floral/kisah/pavilion-romance/wrangler.jsonc`
- Create: `themes/floral/kisah/pavilion-romance/cloudflare-env.d.ts`
- Modify: `themes/floral/kisah/pavilion-romance/next.config.ts`
- Modify: `themes/floral/kisah/pavilion-romance/package.json`
- Create: `themes/floral/kisah/pavilion-romance/docs/DEPLOYMENT.md`

**Interfaces:**
- Consumes: Cloudflare D1 provisioned database ID and `@opennextjs/cloudflare` local-dev initializer.
- Produces: `CloudflareEnv` with `DB: D1Database`, an applied `rsvps` table, `cf-typegen`, `db:migrate:local`, and `db:migrate:remote` scripts.

- [ ] **Step 1: Create the D1 migration**

Create `migrations/0001_create_rsvps.sql` with exactly:

```sql
CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_slug TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('hadir', 'tidak_hadir')),
  pax INTEGER NOT NULL CHECK (pax BETWEEN 0 AND 5),
  message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_created
ON rsvps(invitation_slug, created_at DESC);
```

- [ ] **Step 2: Provision D1 and record the real generated ID**

From `themes/floral/kisah/pavilion-romance`, run:

```bash
npx wrangler d1 create rimba-pavilion-romance
```

Expected: Wrangler prints a `database_id`. Copy that exact ID into `wrangler.jsonc`; never commit a guessed value.

Add this root-level field to `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "rimba-pavilion-romance",
    "database_id": "copy the database_id emitted by the create command in this step",
    "migrations_dir": "migrations"
  }
],
```

Replace that explanatory string with the command’s actual `database_id` output before saving.

- [ ] **Step 3: Generate typed Cloudflare bindings**

Add scripts to `package.json`:

```json
"cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
"db:migrate:local": "wrangler d1 migrations apply DB --local",
"db:migrate:remote": "wrangler d1 migrations apply DB --remote"
```

Run:

```bash
npm run cf-typegen
```

Expected: `cloudflare-env.d.ts` is generated and contains `interface CloudflareEnv` with `DB: D1Database`.

- [ ] **Step 4: Enable binding access for local Next development**

Update `next.config.ts` to initialize OpenNext’s local binding support before exporting config:

```ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
};

export default nextConfig;
```

This follows the current OpenNext Cloudflare binding guidance so `getCloudflareContext()` has local bindings while `next dev` runs.

- [ ] **Step 5: Apply and inspect local migration**

Run:

```bash
npm run db:migrate:local
npx wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name='rsvps';"
```

Expected: migration succeeds and query returns `rsvps`.

- [ ] **Step 6: Write deployment guidance**

Create `docs/DEPLOYMENT.md` documenting exact commands:

```bash
npx wrangler d1 create rimba-pavilion-romance
npm run cf-typegen
npm run db:migrate:local
npm run db:migrate:remote
npm run deploy
```

Document the two R2 CDN environment variables, R2 cache headers, required `media.socialImage` dimensions of 1200×630, and the requirement that migrations run before deploying code that writes RSVP.

- [ ] **Step 7: Commit Cloudflare persistence setup**

```bash
git add themes/floral/kisah/pavilion-romance/migrations/0001_create_rsvps.sql themes/floral/kisah/pavilion-romance/wrangler.jsonc themes/floral/kisah/pavilion-romance/cloudflare-env.d.ts themes/floral/kisah/pavilion-romance/next.config.ts themes/floral/kisah/pavilion-romance/package.json themes/floral/kisah/pavilion-romance/docs/DEPLOYMENT.md
git commit -m "feat(pavilion-romance): configure D1 RSVP storage"
```

## Task 9: Implement validated D1 RSVP route handler

**Files:**
- Create: `themes/floral/kisah/pavilion-romance/src/lib/rsvp.ts`
- Create: `themes/floral/kisah/pavilion-romance/src/app/api/rsvp/route.ts`

**Interfaces:**
- Consumes: `getCloudflareContext().env.DB`, `config.media.slug`, JSON request body.
- Produces: `parseRsvpPayload(value: unknown): RsvpPayload`, `RsvpValidationError`, and `POST(request: Request): Promise<Response>`.

- [ ] **Step 1: Define the pure RSVP parser and limits**

Create `src/lib/rsvp.ts`:

```ts
export type Attendance = "hadir" | "tidak_hadir";

export interface RsvpPayload {
  name: string;
  attendance: Attendance;
  pax: number;
  message: string | null;
  website: string;
}

export class RsvpValidationError extends Error {}

const asTrimmedString = (value: unknown) => typeof value === "string" ? value.trim() : "";

export function parseRsvpPayload(value: unknown): RsvpPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RsvpValidationError("Payload RSVP tidak valid.");
  }
  const input = value as Record<string, unknown>;
  const name = asTrimmedString(input.name);
  const attendance = input.attendance;
  const messageValue = asTrimmedString(input.message);
  const website = asTrimmedString(input.website);
  const rawPax = typeof input.pax === "number" ? input.pax : Number(input.pax);

  if (name.length < 2 || name.length > 100) {
    throw new RsvpValidationError("Nama harus terdiri dari 2 sampai 100 karakter.");
  }
  if (attendance !== "hadir" && attendance !== "tidak_hadir") {
    throw new RsvpValidationError("Pilih konfirmasi kehadiran yang valid.");
  }
  if (messageValue.length > 500) {
    throw new RsvpValidationError("Ucapan maksimal 500 karakter.");
  }
  if (attendance === "tidak_hadir") {
    return { name, attendance, pax: 0, message: messageValue || null, website };
  }
  if (!Number.isInteger(rawPax) || rawPax < 1 || rawPax > 5) {
    throw new RsvpValidationError("Jumlah tamu harus antara 1 dan 5.");
  }
  return { name, attendance, pax: rawPax, message: messageValue || null, website };
}
```

- [ ] **Step 2: Implement JSON-only D1 insertion route**

Create `src/app/api/rsvp/route.ts`:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { config } from "@/data/invitation";
import { parseRsvpPayload, RsvpValidationError } from "@/lib/rsvp";

export const runtime = "edge";

const MAX_BODY_BYTES = 8_192;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!contentType.includes("application/json")) {
    return Response.json({ error: "Gunakan format JSON." }, { status: 415 });
  }
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Data konfirmasi terlalu besar." }, { status: 413 });
  }

  try {
    const payload = parseRsvpPayload(await request.json());
    if (payload.website) {
      return Response.json({ ok: true });
    }

    const { env } = getCloudflareContext();
    await env.DB
      .prepare("INSERT INTO rsvps (invitation_slug, guest_name, attendance, pax, message) VALUES (?, ?, ?, ?, ?)")
      .bind(config.media.slug, payload.name, payload.attendance, payload.pax, payload.message)
      .run();

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof RsvpValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Data konfirmasi tidak dapat dibaca." }, { status: 400 });
    }
    console.error("RSVP insert failed", error);
    return Response.json({ error: "Konfirmasi belum dapat diproses. Coba lagi." }, { status: 500 });
  }
}
```

- [ ] **Step 3: Test the parser and route against local D1**

Start local development after applying migrations:

```bash
npm run db:migrate:local
npm run dev
```

In a second terminal, submit a valid record:

```bash
curl -i -X POST http://localhost:3000/api/rsvp -H "Content-Type: application/json" -d '{"name":"Tamu Uji","attendance":"hadir","pax":2,"message":"Semoga lancar","website":""}'
```

Expected: HTTP 201 and `{ "ok": true }`.

Then inspect local D1:

```bash
npx wrangler d1 execute DB --local --command "SELECT invitation_slug, guest_name, attendance, pax, message FROM rsvps;"
```

Expected: exactly one row with `pavilion-romance`, `Tamu Uji`, `hadir`, `2`, and `Semoga lancar`.

Submit invalid payload:

```bash
curl -i -X POST http://localhost:3000/api/rsvp -H "Content-Type: application/json" -d '{"name":"A","attendance":"hadir","pax":8,"message":"","website":""}'
```

Expected: HTTP 400, no additional D1 row.

- [ ] **Step 4: Commit D1 route handler**

```bash
git add themes/floral/kisah/pavilion-romance/src/lib/rsvp.ts themes/floral/kisah/pavilion-romance/src/app/api/rsvp/route.ts
git commit -m "feat(pavilion-romance): persist RSVP submissions in D1"
```

## Task 10: Connect the RSVP UI to the real endpoint with accessible form semantics

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/src/components/sections/RSVPSection.tsx`
- Modify: `themes/floral/kisah/pavilion-romance/src/app/globals.css`

**Interfaces:**
- Consumes: `POST /api/rsvp` response `{ ok: true } | { error: string }` and Rsvp field limits.
- Produces: idle/submitting/success/error states; native radio attendance group; honeypot field; live status feedback.

- [ ] **Step 1: Replace the artificial delay with an actual POST submission**

Add states:

```ts
const [error, setError] = useState("");
const [website, setWebsite] = useState("");
```

Replace `handleSubmit` with:

```ts
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!attendance || !name.trim()) return;
  setLoading(true);
  setError("");
  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        attendance,
        pax: attendance === "hadir" ? pax : 0,
        message: message.trim(),
        website,
      }),
    });
    const result = await response.json() as { ok?: boolean; error?: string };
    if (!response.ok || !result.ok) throw new Error(result.error ?? "Konfirmasi belum dapat diproses.");
    setSubmitted(true);
  } catch (submissionError) {
    setError(submissionError instanceof Error ? submissionError.message : "Konfirmasi belum terkirim. Periksa koneksi lalu coba lagi.");
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 2: Associate labels and replace attendance buttons with radios**

Use IDs:

```tsx
<label htmlFor="rsvp-name" className="type-label">Nama Tamu</label>
<input id="rsvp-name" name="name" type="text" maxLength={100} ... />
```

Replace attendance button group with:

```tsx
<fieldset className="rsvp-attendance-fieldset">
  <legend className="type-label">Konfirmasi</legend>
  <div className="rsvp-attendance-options">
    <label className={`rsvp-attendance-option ${attendance === "hadir" ? "is-selected" : ""}`}>
      <input type="radio" name="attendance" value="hadir" checked={attendance === "hadir"} onChange={() => setAttendance("hadir")} />
      Hadir
    </label>
    <label className={`rsvp-attendance-option ${attendance === "tidak_hadir" ? "is-selected" : ""}`}>
      <input type="radio" name="attendance" value="tidak_hadir" checked={attendance === "tidak_hadir"} onChange={() => setAttendance("tidak_hadir")} />
      Tidak Hadir
    </label>
  </div>
</fieldset>
```

Add `aria-label="Kurangi jumlah tamu"` and `aria-label="Tambah jumlah tamu"` to pax buttons.

- [ ] **Step 3: Add an invisible honeypot and live feedback**

Inside the form, add:

```tsx
<div className="rsvp-honeypot" aria-hidden="true">
  <label htmlFor="rsvp-website">Website</label>
  <input id="rsvp-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
</div>
```

Before the submit button add:

```tsx
<p role="status" aria-live="polite" className="rsvp-status">
  {loading ? "Mengirim konfirmasi..." : error}
</p>
```

On success, add `role="status" aria-live="polite"` to the success container so the confirmation is announced.

- [ ] **Step 4: Add form-specific CSS without visual redesign**

Add:

```css
.rsvp-honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.rsvp-attendance-fieldset {
  border: 0;
  padding: 0;
  min-width: 0;
}

.rsvp-attendance-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rsvp-attendance-option {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  text-align: center;
}

.rsvp-attendance-option.is-selected {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(126, 105, 150, 0.08);
}

.rsvp-attendance-option input {
  position: absolute;
  opacity: 0;
}

.rsvp-attendance-option:has(input:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.rsvp-status {
  min-height: 1.5em;
  color: var(--accent);
  font-size: 12px;
  text-align: center;
}
```

- [ ] **Step 5: Verify actual submission states**

Verify in a browser:

1. Invalid form cannot submit without name and attendance.
2. A valid submission displays success only after local D1 contains a new row.
3. Stop the dev server before submit; verify the error message appears and form values remain intact.
4. Set attendance to `tidak_hadir`; verify the request contains `pax: 0`.
5. Tab through each field, radio choice, pax control, textarea, and submit button.

- [ ] **Step 6: Commit real RSVP UI integration**

```bash
git add themes/floral/kisah/pavilion-romance/src/components/sections/RSVPSection.tsx themes/floral/kisah/pavilion-romance/src/app/globals.css
git commit -m "fix(pavilion-romance): submit RSVP through D1 API"
```

## Task 11: Run end-to-end verification and update operator documentation

**Files:**
- Modify: `themes/floral/kisah/pavilion-romance/README.md`
- Modify: `themes/floral/kisah/pavilion-romance/docs/DEPLOYMENT.md`

**Interfaces:**
- Consumes: all completed implementation interfaces and Cloudflare deployment configuration.
- Produces: release-ready operational instructions and verified build state.

- [ ] **Step 1: Document explicit deployment order**

Ensure `docs/DEPLOYMENT.md` says production deployment order is:

```bash
npm install
npm run cf-typegen
npm run db:migrate:remote
npm run build
npm run deploy
```

Add a warning that `db:migrate:remote` must complete before a release containing the RSVP route is deployed.

- [ ] **Step 2: Run static verification**

Run:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run lint
npm --prefix themes/floral/kisah/pavilion-romance run build
```

Expected: both exit 0. Record any remaining no-img-element warnings in the final handoff and ensure they are limited to intentional decorative/static layering cases.

- [ ] **Step 3: Run local D1 API verification**

Run:

```bash
npm --prefix themes/floral/kisah/pavilion-romance run db:migrate:local
npx --prefix themes/floral/kisah/pavilion-romance wrangler d1 execute DB --local --command "DELETE FROM rsvps;"
```

Start the app, submit one valid RSVP by browser and one valid RSVP via curl. Then verify:

```bash
npx --prefix themes/floral/kisah/pavilion-romance wrangler d1 execute DB --local --command "SELECT guest_name, attendance, pax FROM rsvps ORDER BY id;"
```

Expected: both records have the correct values; no row is created for an invalid or honeypot request.

- [ ] **Step 4: Perform browser accessibility and media smoke checks**

Use desktop and mobile viewport checks to verify:

1. Opening gate opens invitation and allows music autoplay after user gesture.
2. Music control works with Tab, Enter, and Space.
3. Map dialog opens, traps focus at the close affordance, closes on Escape, and returns focus.
4. Gift copy does not report success when Clipboard permission is denied.
5. Reduced-motion mode removes petals and infinite scroll-hint motion.
6. YouTube does not load before Play.
7. Gallery and below-fold backgrounds delay loading until close to viewport.
8. Desktop split layout and mobile single-column layout retain their prior composition.
9. Social metadata contains canonical URL and a 1200×630 OG R2 image URL.

- [ ] **Step 5: Commit verification documentation**

```bash
git add themes/floral/kisah/pavilion-romance/README.md themes/floral/kisah/pavilion-romance/docs/DEPLOYMENT.md
git commit -m "docs(pavilion-romance): document production operations"
```
