# R2 Image Storage — Developer Guide

How to set up, use, and manage image assets stored on Cloudflare R2 for the Rimba invitation platform.

---

## Overview

All image assets are stored on two Cloudflare R2 buckets:

| Bucket | Public URL | Purpose |
|---|---|---|
| `rimba-themes` | `pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev` | Shared decorative assets per theme (flowers, borders, frames) |
| `rimba-invitations` | `pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev` | Per-invitation user uploads (couple photos, gallery, love story) |

**Future custom domains** (once DNS is configured):
- `rimba-themes` → `themes.rimba.io`
- `rimba-invitations` → `photos.rimba.io`

Cloudflare account: `developers.storages@gmail.com` (account ID: `71ccc6ef9280a866a3c01d8d202a091f`)

---

## Local Development Setup

### 1. Environment variables

Each theme needs a `.env.local` file in its root directory. Copy from the example below:

```bash
# invitation/themes/adat/kenangan/warm-narrative/.env.local
NEXT_PUBLIC_THEMES_CDN=https://pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev
NEXT_PUBLIC_PHOTOS_CDN=https://pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev
```

> These `.env.local` files are gitignored. Every developer needs to create their own.
> When custom domains go live, update the values to `https://themes.rimba.io` and `https://photos.rimba.io`.

### 2. Authenticate Wrangler (first time only)

```bash
npx wrangler login
```

This opens a browser for OAuth. Required before running any upload or management commands.

---

## Bucket Structure

### `rimba-themes` — Theme decorative assets

```
rimba-themes/
  adat/
    kenangan/
      warm-narrative/
        AwanPink.webp
        Badge.webp
        BintangBintang.webp
        Borderbawah.webp
        BulannBintang.webp
        BungaBerjatuhan.webp
        BungaJatuh1.webp
        BungaJatuh2.webp
        BungaJatuh3.webp
        BungaJatuh4.webp
        BungaJatuh5.webp
        BungaJatuh6.webp
        BungaPutihBorder.webp
        CincinEmas.webp
        FrameEmas.webp
        InisialNama.webp
        JadjalKalendar.webp
        Letter.webp
        PinLokasi.webp
        RangkaBunga.webp
        RoadBunga.webp
        Sparkle.webp
        Surat.webp
        TempatPernikahan.webp
        Timeline.webp
      sacred-luxe/         ← add assets here when building this theme
    kisah/
      sinema-kisah/         ← add assets here when building this theme
```

**Rules:**
- WebP format only — never upload PNG to R2 (keep PNG originals locally in `public/images_backup/`)
- Path must mirror the codebase theme folder structure
- File names use PascalCase (match existing convention)

### `rimba-invitations` — Per-invitation user uploads

```
rimba-invitations/
  {invitation-slug}/
    couple/
      groom.webp
      bride.webp
    gallery/
      1.webp
      2.webp
      3.webp
    love-story/
      chapter-1.webp
      chapter-2.webp
```

- `{invitation-slug}` matches the subdomain (e.g., `pangky-radit` from `pangky-radit.rimba.io`)
- All uploads converted to WebP before storing

---

## Using Assets in Components

### Theme decorative assets

```tsx
// Option A: inline (for single use)
<img
  src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/FrameEmas.webp`}
  alt="Frame Emas"
/>

// Option B: define BASE constant (for multiple assets in the same file)
const BASE = `${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative`;

const FLOWERS = [
  `${BASE}/BungaJatuh1.webp`,
  `${BASE}/BungaJatuh2.webp`,
  // ...
];
```

### User-uploaded photos (per-invitation)

```tsx
// Built from the invitation slug
<img src={`${process.env.NEXT_PUBLIC_PHOTOS_CDN}/${slug}/couple/groom.webp`} />
<img src={`${process.env.NEXT_PUBLIC_PHOTOS_CDN}/${slug}/gallery/1.webp`} />
```

---

## Adding New Theme Assets

When designing a new theme or adding decorative assets to an existing one:

### 1. Prepare the file

Convert to WebP first (keep the original PNG in `public/images_backup/`):

```bash
# Using cwebp (install via brew or scoop)
cwebp input.png -o OutputName.webp -q 85

# Or use Squoosh / Sharp / any WebP converter
```

### 2. Upload to R2

```bash
# Single file
npx wrangler r2 object put rimba-themes/adat/kenangan/warm-narrative/NewAsset.webp \
  --file ./public/images/NewAsset.webp \
  --content-type image/webp \
  --remote

# Bulk upload all WebP files in a folder (PowerShell)
$imagesPath = ".\public\images"
Get-ChildItem -Path $imagesPath -Filter "*.webp" | ForEach-Object {
  npx wrangler r2 object put "rimba-themes/adat/kenangan/warm-narrative/$($_.Name)" `
    --file $_.FullName `
    --content-type "image/webp" `
    --remote
}

# Bulk upload (bash)
for f in public/images/*.webp; do
  npx wrangler r2 object put "rimba-themes/adat/kenangan/warm-narrative/$(basename $f)" \
    --file "$f" --content-type "image/webp" --remote
done
```

> **Always include `--remote`** — without it, wrangler writes to a local emulator and nothing reaches R2.

### 3. Reference in code

```tsx
src={`${process.env.NEXT_PUBLIC_THEMES_CDN}/adat/kenangan/warm-narrative/NewAsset.webp`}
```

---

## Managing Per-Invitation User Photos

Upload user photos under the invitation's slug:

```bash
npx wrangler r2 object put rimba-invitations/pangky-radit/couple/groom.webp \
  --file ./groom.webp \
  --content-type image/webp \
  --remote

npx wrangler r2 object put rimba-invitations/pangky-radit/gallery/1.webp \
  --file ./photo1.webp \
  --content-type image/webp \
  --remote
```

To delete all photos for an invitation (e.g., order cancelled):

```bash
# List first to confirm
npx wrangler r2 object list rimba-invitations --prefix pangky-radit/ --remote

# Delete one by one (no bulk delete in wrangler CLI)
npx wrangler r2 object delete rimba-invitations/pangky-radit/couple/groom.webp --remote
```

---

## Verifying What's in the Bucket

```bash
# List all objects in rimba-themes
npx wrangler r2 object list rimba-themes --remote

# List objects for a specific theme
npx wrangler r2 object list rimba-themes --prefix adat/kenangan/warm-narrative/ --remote

# List all objects for one invitation
npx wrangler r2 object list rimba-invitations --prefix pangky-radit/ --remote
```

Or check directly in the browser:
```
https://pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev/adat/kenangan/warm-narrative/FrameEmas.webp
```

---

## Switching to Custom Domains

Once `themes.rimba.io` and `photos.rimba.io` are live:

1. In each theme's `.env.local`, update the values:
   ```
   NEXT_PUBLIC_THEMES_CDN=https://themes.rimba.io
   NEXT_PUBLIC_PHOTOS_CDN=https://photos.rimba.io
   ```

2. In production environment variables (Cloudflare Pages / Vercel / wherever deployed), update the same two vars.

3. No code changes needed — components read from the env var.

To attach the custom domain to the bucket (requires `rimba.io` zone in the same Cloudflare account):

```bash
# Via Cloudflare dashboard: R2 → rimba-themes → Settings → Custom Domains → Add domain → themes.rimba.io
# Or via API (needs zone ID of rimba.io)
```

---

## Wrangler Quick Reference

| Task | Command |
|---|---|
| Login | `npx wrangler login` |
| Check who you are | `npx wrangler whoami` |
| Upload a file | `npx wrangler r2 object put {bucket}/{key} --file {path} --content-type image/webp --remote` |
| List objects | `npx wrangler r2 object list {bucket} --remote` |
| List with prefix | `npx wrangler r2 object list {bucket} --prefix {path/} --remote` |
| Delete an object | `npx wrangler r2 object delete {bucket}/{key} --remote` |
| Download an object | `npx wrangler r2 object get {bucket}/{key} --file {dest} --remote` |

> Always add `--remote` to target the real R2 bucket. Without it, wrangler uses a local emulator.
