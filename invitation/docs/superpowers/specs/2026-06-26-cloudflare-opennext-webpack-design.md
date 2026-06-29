# Cloudflare OpenNext Webpack Design

## Goal

Prevent the OpenNext Cloudflare Worker preview from failing with a Turbopack `ChunkLoadError` while preserving Turbopack for local Next.js development.

## Design

- Production builds use `next build --webpack` in all three theme packages.
- Local development remains `next dev`, which continues to use Next.js 16 Turbopack.
- Each theme keeps `turbopack.root = __dirname` in `next.config.ts` so monorepo root inference remains explicit during development.
- OpenNext preview and deploy commands remain unchanged because they invoke each package's `build` script.

## Verification

- Assert all three package build scripts use `--webpack`.
- Assert all three Next.js configs contain `turbopack.root`.
- Run OpenNext builds for all themes.
- Start the warm-narrative Worker preview and verify `/` returns HTTP 200.
