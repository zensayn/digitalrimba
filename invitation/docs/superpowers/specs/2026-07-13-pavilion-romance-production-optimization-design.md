# Pavilion Romance Production Optimization Design

Date: 2026-07-13

Target: `themes/floral/kisah/pavilion-romance`

## Summary

Pavilion Romance is visually complete but needs production hardening before it is safe to ship as a paid invitation template. This design keeps the current Garden Pavilion Storybook identity and focuses on production readiness: Cloudflare R2 media organization, Cloudflare D1-backed RSVP storage, lighter media loading, accessible controls, reduced-motion compliance, social metadata, and safer configuration.

The implementation should not redesign the template. It should preserve the existing visual direction while making the invitation reliable, measurable, and usable in real guest flows.

## Decisions

- Theme/decorative assets live in Cloudflare R2 behind `assets-themes.rimba.io`.
- Customer photos live in Cloudflare R2 behind `assets-invitations.rimba.io`.
- RSVP and wedding wishes are stored in Cloudflare D1.
- Wedding wishes are not shown publicly in the first production pass; they are stored for admin/back-office use.
- The current OpenNext Cloudflare Worker remains the deployment target.
- The template remains config-driven through `invitation.config.json`.

## Goals

1. Make RSVP real: no success state unless the submission is persisted.
2. Reduce initial network cost by deferring below-the-fold media and YouTube.
3. Keep R2 asset domains explicit and easy to migrate across customers.
4. Improve keyboard and screen-reader accessibility for interactive controls.
5. Respect `prefers-reduced-motion` across CSS and Framer Motion animations.
6. Add share-ready Open Graph metadata.
7. Add lightweight validation around invitation config so invalid templates fail clearly.

## Non-goals

- Building a full admin dashboard.
- Displaying public wedding wishes.
- Replacing all decorative `<img>` elements with `next/image` blindly.
- Reworking the visual direction or section order.
- Building a multi-template platform API beyond the pieces needed by this template.

## Asset architecture

Use two CDN roots:

```text
NEXT_PUBLIC_THEMES_CDN=https://assets-themes.rimba.io
NEXT_PUBLIC_PHOTOS_CDN=https://assets-invitations.rimba.io
```

Theme assets:

```text
assets-themes.rimba.io/floral/kisah/pavilion-romance/{asset-file}
```

Customer media:

```text
assets-invitations.rimba.io/{invitation-slug}/couple/groom.webp
assets-invitations.rimba.io/{invitation-slug}/couple/bride.webp
assets-invitations.rimba.io/{invitation-slug}/gallery/01.webp
assets-invitations.rimba.io/{invitation-slug}/social/og.webp
```

Add helpers with clear responsibilities:

- `themeAsset(file)` returns a URL under the theme CDN.
- `invitationPhoto(path)` returns a URL under the photo CDN.
- `asset(file)` may remain as an alias for backwards compatibility if needed.
- Absolute URLs remain supported so development can still point at temporary external sources, but the shipped example config should use R2 photo URLs.

Recommended cache policy:

- Immutable/versioned files: `public, max-age=31536000, immutable`.
- Mutable files without hashes: `public, max-age=3600, stale-while-revalidate=86400`.

Prefer versioned filenames or content-hashed uploads for final production media.

## Media loading design

Do not convert every image to `next/image`. Some transparent decorative assets are easier to animate and layer as plain `<img>`. Instead classify media by loading priority.

### Critical media

Only media visible in the opening/cover path should load eagerly:

- Opening/cover background.
- Main hero pavilion frame.
- Couple portraits used in the cover.
- Top canopy if visible immediately.

Only one or two LCP candidates should use `fetchPriority="high"`.

### Deferred media

The following should be lazy or delayed:

- Section backgrounds after the cover.
- Couple section portraits.
- Event decorations and map previews.
- Gallery photos and frames.
- Closing scene.
- YouTube iframe.

`SceneBackground` should accept a priority/loading prop so cover/opening backgrounds are eager and below-the-fold backgrounds are lazy.

Gallery images should use stable aspect ratios, lazy loading, async decoding, and R2 image sizes appropriate to their rendered size. Target dimensions:

- Square gallery tiles: about 480-720 px.
- Wide gallery tiles: about 900 px.
- Couple portraits: about 600-800 px.
- Hero mobile/desktop image: about 900-1200 px.

## Video design

Use the existing `video.poster` config. `VideoSection` should initially render a poster image inside the existing frame, plus a native button with a clear play label. The YouTube iframe should only mount after the user activates Play.

If possible, normalize YouTube embed URLs to the privacy-enhanced host:

```text
https://www.youtube-nocookie.com/embed/<id>
```

The poster-first design reduces initial JavaScript/network cost and avoids loading YouTube resources before consent-like user action.

## RSVP and D1 design

### Wrangler binding

Add a D1 binding to `wrangler.jsonc` after a real Cloudflare D1 database is created:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "rimba-pavilion-romance",
    "database_id": "REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID",
    "migrations_dir": "migrations"
  }
]
```

Do not invent the database ID. The implementation should either leave a clear placeholder and document the command to create the DB, or fill the real ID only after Wrangler/Cloudflare returns it.

### Migration

Initial schema:

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

### API

Add:

```text
POST /api/rsvp
```

Request body:

```json
{
  "name": "Nama Tamu",
  "attendance": "hadir",
  "pax": 2,
  "message": "Semoga lancar",
  "website": ""
}
```

`website` is a hidden honeypot field. Non-empty values should be treated as spam. The response may still be generic to avoid teaching bots.

Server behavior:

1. Accept only JSON.
2. Reject payloads that are too large.
3. Trim string fields.
4. Validate `name` length: 2-100 characters.
5. Validate `message` length: max 500 characters.
6. Validate `attendance`: `hadir` or `tidak_hadir`.
7. If `attendance` is `tidak_hadir`, force `pax` to 0.
8. If `attendance` is `hadir`, require `pax` between 1 and 5.
9. Insert with a D1 prepared statement.
10. Return success only after the insert succeeds.

The public API must not expose all RSVP records. Admin viewing/export can be designed later.

### RSVP client states

The form must represent real server state:

- Idle.
- Submitting.
- Success after D1 insert.
- Error if validation or network/server insert fails.

On error, keep user-entered values and show a clear message:

> Konfirmasi belum terkirim. Periksa koneksi lalu coba lagi.

The current simulated wait-and-success behavior must be removed.

## Accessibility design

### Music player

Replace the clickable `<div role="button">` with a native `<button type="button">`.

Add:

- `aria-label` reflecting Play/Pause.
- `aria-pressed={playing}`.
- `disabled={!ready}`.
- visible focus state.

### Map modal

The map trigger should be a native button, not a generic div. The overlay should behave like a dialog:

- `role="dialog"`.
- `aria-modal="true"`.
- accessible label/title.
- Escape closes the dialog.
- focus moves to the close button or dialog on open.
- focus returns to the trigger on close.
- background scroll is locked while open.

A full focus trap is preferred. If scope needs to stay small, at minimum keep focus within the modal controls and iframe wrapper as much as practical.

### RSVP form

- Associate labels with fields using `htmlFor` and `id`.
- Represent attendance as native radio controls or an equivalent segmented radio group.
- Add `aria-pressed` only if using buttons, but native radios are preferred.
- Add labels for the pax buttons: “Kurangi jumlah tamu” and “Tambah jumlah tamu”.
- Add `aria-live` status text for submission, success, error, and copy-to-clipboard feedback.

### Gift copy

`navigator.clipboard.writeText()` must be awaited and errors caught. Show success only after copy succeeds. If copy fails, show a short failure message instead of a false success state.

## Reduced-motion design

Use `prefers-reduced-motion` consistently across CSS and Framer Motion.

Required behavior when reduced motion is enabled:

- Falling flowers do not animate.
- Scroll hint does not pulse infinitely.
- Ambient sway/breathe animations stop.
- Section entrance animations resolve immediately to visible content.
- Dialog/opening transitions are shortened or removed.

Implementation may use Framer Motion’s `useReducedMotion()` plus existing CSS media queries.

## Metadata and sharing

Add share-ready metadata:

- `metadataBase` for `https://pavilion-romance.rimba.io`.
- Open Graph image from `assets-invitations.rimba.io/{invitation-slug}/social/og.webp`.
- Twitter card metadata.
- Canonical URL.
- Indonesian locale.

Target OG image size: 1200×630.

Metadata should still derive names and descriptions from invitation config.

## Config safety

Add stricter types and runtime checks without overbuilding.

Introduce:

```ts
type SectionId =
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

Then use:

```ts
order: SectionId[];
enabled: Record<SectionId, boolean>;
```

Runtime validation should check:

- Required couple fields.
- Valid event URLs.
- Valid wedding date.
- At least one gallery image if gallery is enabled.
- Known section IDs only.
- Valid attendance-related limits if represented in config later.

Typography config currently does not control `next/font`. Either remove it from the claim of dynamic configuration or document that typography is part of this template’s fixed identity.

## Implementation sequencing

Recommended order:

1. Add asset/photo helper separation and update config example URLs.
2. Add metadata/social image support.
3. Improve image/video loading, including poster-first video.
4. Add accessibility fixes for music, map modal, RSVP fields, and gift copy.
5. Add reduced-motion coverage.
6. Add config section typing and lightweight validation.
7. Add D1 migration, binding documentation, API route, and RSVP client integration.
8. Run lint, build, local D1 test, and browser smoke checks.

D1 work is late in the sequence because it touches deployment resources and should be isolated from visual/accessibility changes.

## Verification plan

Run:

- `npm --prefix themes/floral/kisah/pavilion-romance run lint`
- `npm --prefix themes/floral/kisah/pavilion-romance run build`
- local D1 migration and insert test once binding/migration exists

Manual/browser checks:

1. Opening gate still works.
2. Music can be toggled by mouse and keyboard.
3. Map can open, close via button, close via Escape, and return focus.
4. RSVP valid submission reaches D1 and then shows success.
5. RSVP invalid submission is rejected without losing input.
6. Gift copy shows success only after real copy.
7. Reduced-motion removes falling petals and infinite pulse.
8. YouTube iframe is not mounted before Play.
9. Below-the-fold backgrounds/gallery are not eager-loaded during initial view.
10. Desktop split layout and mobile layout remain visually intact.
11. Social preview metadata resolves to the configured OG image.

## Risks

- A missing D1 database ID blocks remote deployment until the DB is created and bound.
- R2 cache policy must match filename strategy; mutable filenames with immutable cache can serve stale images.
- Over-optimizing decorative images could break the carefully tuned layering and animation.
- A full focus trap can add complexity; keep the map modal implementation focused and testable.
- Local development must have a clear D1 path so RSVP does not silently fail.

## Open implementation note

The spec assumes this template owns a single `invitation_slug`, likely `pavilion-romance` for the sample. If the same deployed worker will serve many invitations later, slug resolution should become a platform-level concern and should not be improvised inside this implementation.
