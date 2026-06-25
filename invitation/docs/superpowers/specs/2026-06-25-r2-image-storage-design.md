# R2 Image Storage Design

**Date:** 2026-06-25  
**Status:** Implemented

## Context

Theme decorative assets were stored locally in `warm-narrative/public/images/`, and user-specific photos used Unsplash placeholder URLs. As the platform scales to serve real wedding invitations per subdomain slug (e.g., `pangky-radit.rimba.io`), images are migrated to Cloudflare R2 for CDN delivery, zero egress cost, and clean separation between shared theme assets and per-invitation user uploads.

---

## Two-Bucket Architecture

| Bucket | r2.dev URL (temporary) | Future custom domain | Purpose |
|---|---|---|---|
| `rimba-themes` | `pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev` | `themes.rimba.io` | Shared decorative assets per theme |
| `rimba-invitations` | `pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev` | `photos.rimba.io` | Per-invitation user uploads |

Both buckets are in the **APAC** region, public access enabled.

---

## Bucket Structure

### `rimba-themes`
Mirrors the codebase theme path structure. WebP only — no PNG duplicates.

```
adat/kenangan/warm-narrative/
  AwanPink.webp
  Badge.webp
  BintangBintang.webp
  Borderbawah.webp
  BulannBintang.webp
  BungaBerjatuhan.webp
  BungaJatuh1.webp  →  BungaJatuh6.webp
  BungaPutihBorder.webp
  CincinEmas.webp
  FrameEmas.webp
  InisialNama.webp
  JadwalKalendar.webp
  Letter.webp
  PinLokasi.webp
  RangkaBunga.webp
  RoadBunga.webp
  Sparkle.webp
  Surat.webp
  TempatPernikahan.webp
  Timeline.webp
adat/kenangan/sacred-luxe/   ← future assets
adat/kisah/sinema-kisah/     ← future assets
```

### `rimba-invitations`
Organized by invitation slug + asset type.

```
{slug}/
  couple/
    groom.webp
    bride.webp
  gallery/
    1.webp
    2.webp
    ...
  love-story/
    chapter-1.webp
    chapter-2.webp
    ...
```

---

## Cache Strategy

Set via **Cloudflare Cache Rules** on each bucket's custom domain:

| Bucket | Cache-Control |
|---|---|
| `rimba-themes` | `public, max-age=31536000, immutable` (1 year) |
| `rimba-invitations` | `public, max-age=86400` (1 day, purgeable per slug) |

---

## Environment Variables

Each theme's `.env.local` (committed as `.env.local.example` for reference):

```
NEXT_PUBLIC_THEMES_CDN=https://pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev
NEXT_PUBLIC_PHOTOS_CDN=https://pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev
```

Update values to custom domains once `themes.rimba.io` and `photos.rimba.io` DNS records are configured.

---

## Code Pattern

### Theme decorative assets
```tsx
// In component files (warm-narrative)
const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

src={`${BASE}/BungaJatuh1.webp`}
src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/FrameEmas.webp`}
```

### User-uploaded photos (future)
```tsx
// Built from invitation slug + asset type
src={`${process.env.NEXT_PUBLIC_PHOTOS_CDN}/${slug}/couple/groom.webp`}
```

---

## Remaining Manual Steps

1. **Custom domains** — Bind `themes.rimba.io` and `photos.rimba.io` to the respective R2 buckets once `rimba.io` is added to the same Cloudflare account (`developers.storages@gmail.com`) or the bucket is transferred.
2. **Cache Rules** — Configure Cloudflare Cache Rules per bucket after custom domains are live.
3. **Upload script for new themes** — When adding assets to `sacred-luxe` or `sinema-kisah`, run:
   ```bash
   for f in public/images/*.webp; do
     npx wrangler r2 object put rimba-themes/adat/kenangan/sacred-luxe/$(basename $f) --file "$f"
   done
   ```
4. **Remove `public/images/`** from `warm-narrative` after confirming CDN URLs serve correctly in production. Keep `public/images_backup/` locally (not committed).
