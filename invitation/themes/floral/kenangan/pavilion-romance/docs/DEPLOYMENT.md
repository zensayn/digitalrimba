# Pavilion Romance Deployment Guide

## 1. Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_THEMES_CDN` | Decorative theme assets R2 public base | `https://assets-themes.rimba.io` |
| `NEXT_PUBLIC_PHOTOS_CDN` | Customer invitation media R2 public base | `https://assets-invitations.rimba.io` |

Production uploads for customer media should use versioned filenames and immutable caching:

```
Cache-Control: public, max-age=31536000, immutable
```

Do not use immutable caching for filenames that are overwritten after deployment.

## 2. Local Development Setup

Run from `themes/floral/kenangan/pavilion-romance`.

```bash
npm install
npm run cf-typegen
npm run dev
```

`initOpenNextCloudflareForDev()` is enabled in `next.config.ts`, so local `next dev` exposes Cloudflare bindings (e.g. `ASSETS`) through `getCloudflareContext()` without provisioning remote resources.

## 3. Production Deployment Order

```bash
npm run cf-typegen
npm run build
npm run deploy
```

RSVP is cosmetic (client-side only) — there is no database to provision or migrate.

## 4. Media Configuration Notes

`invitation.config.json.media.socialImage` must resolve to a 1200×630 image for Open Graph previews.

Customer photos, video poster, gallery images, and social image are resolved through the configured customer photo CDN. Absolute URLs are passed through unchanged.
