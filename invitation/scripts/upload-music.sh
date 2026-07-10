#!/usr/bin/env bash
# Upload curated catalog mp3s to R2 and print the public URL + seed values.
#
# Usage: ./scripts/upload-music.sh <dir-of-mp3s>
# Run from invitation/ (wrangler is installed there).
#
# Keys are content-hashed (slug-<sha256-8>.mp3) so replacing a track always
# produces a new key/URL — the Cloudflare edge cache can never serve a stale
# file. Add the printed URLs to digital/db/seed/seed_music_tracks.sql.
set -euo pipefail

DIR="${1:?usage: upload-music.sh <dir-of-mp3s>}"
BUCKET="rimba-invitations"
PUBLIC_BASE="https://assets-invitations.rimba.io"

for f in "$DIR"/*.mp3; do
  [ -e "$f" ] || { echo "no .mp3 files in $DIR" >&2; exit 1; }
  name="$(basename "$f" .mp3)"
  slug="$(echo "$name" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"
  hash="$(shasum -a 256 "$f" | cut -c1-8)"
  key="music/catalog/${slug}-${hash}.mp3"

  npx wrangler r2 object put "${BUCKET}/${key}" \
    --file "$f" --content-type audio/mpeg --remote

  echo "slug=${slug}  src=${PUBLIC_BASE}/${key}"
done
