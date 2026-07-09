# Cloudflare Workers Deploy Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bake a standardized OpenNext-on-Cloudflare-Workers deploy setup into `_boilerplate` so every new floral theme inherits a one-command deploy to `rimba-<template>` Worker on `<template>.rimba.io`.

**Architecture:** Add OpenNext adapter config (`wrangler.jsonc`, `open-next.config.ts`), deploy scripts, and dev-binding init to the `_boilerplate` Next.js template. New theme instances are scaffolded by copying `_boilerplate`, so they get the deploy flow for free. R2 stays accessed via public CDN env vars (no binding). Verified locally with OpenNext build + `wrangler deploy --dry-run` — no live deploy in this plan.

**Tech Stack:** Next.js 16.2.5, React 19, Bun, `@opennextjs/cloudflare`, Wrangler 4, Cloudflare Workers.

## Global Constraints

- Next.js version: `16.2.5` (OpenNext Cloudflare supports Next 16 — verified at https://opennext.js.org/cloudflare).
- Package manager: **Bun** (`bun install`, `bunx`). Do not introduce npm/pnpm lockfiles.
- Worker name pattern: `rimba-<nama-template>`; boilerplate placeholder value is `rimba-NAMA-TEMA` (mirrors existing `"name": "NAMA-TEMA"` in `_boilerplate/package.json`).
- Subdomain pattern: `<nama-template>.rimba.io` (e.g. `warm-narrative.rimba.io`), bound manually in the dashboard per theme.
- `compatibility_date`: `2026-06-28`. `compatibility_flags`: `["nodejs_compat"]`.
- R2 access: **no R2 binding**. Use build-time env `NEXT_PUBLIC_THEMES_CDN` / `NEXT_PUBLIC_PHOTOS_CDN` from each theme's `.env.local`, per `docs/r2-image-storage.md`.
- Scope: only `_boilerplate` + a new doc. Do **not** modify `themes/adat` (already live on this pattern).
- Spec: `docs/superpowers/specs/2026-06-28-cloudflare-workers-deploy-flow-design.md`.

---

## File Structure

- `_boilerplate/wrangler.jsonc` (create) — Worker + assets config, the single per-theme edit point (`name`).
- `_boilerplate/open-next.config.ts` (create) — OpenNext Cloudflare adapter config.
- `_boilerplate/package.json` (modify) — add `@opennextjs/cloudflare` + `wrangler` devDeps and `preview`/`deploy`/`upload`/`cf-typegen` scripts.
- `_boilerplate/next.config.ts` (modify) — init OpenNext dev bindings.
- `_boilerplate/.gitignore` (modify) — ignore `.open-next/`, `.wrangler/`, `cloudflare-env.d.ts`.
- `docs/cloudflare-deploy.md` (create) — developer guide for the deploy flow.

---

### Task 1: Add OpenNext deploy config to `_boilerplate`

**Files:**
- Create: `_boilerplate/wrangler.jsonc`
- Create: `_boilerplate/open-next.config.ts`
- Modify: `_boilerplate/package.json`
- Modify: `_boilerplate/next.config.ts`
- Modify: `_boilerplate/.gitignore`

**Interfaces:**
- Consumes: existing `_boilerplate/package.json` (`"name": "NAMA-TEMA"`), `_boilerplate/next.config.ts` (vanilla `NextConfig`).
- Produces: `bun run deploy` / `bun run preview` / `bun run cf-typegen` scripts; a buildable OpenNext Worker output at `.open-next/worker.js`; `wrangler.jsonc` whose `name` field is the per-theme edit point.

- [ ] **Step 1: Create `_boilerplate/wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "rimba-NAMA-TEMA",
  "compatibility_date": "2026-06-28",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

- [ ] **Step 2: Create `_boilerplate/open-next.config.ts`**

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: no incremental cache / queue yet.
// Add R2/KV-backed caches here later if a theme needs ISR.
export default defineCloudflareConfig({});
```

- [ ] **Step 3: Add deps + scripts to `_boilerplate/package.json`**

Replace the `"scripts"` block and add the two devDependencies. Resulting file:

```json
{
  "name": "NAMA-TEMA",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  },
  "dependencies": {
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.14.0",
    "next": "16.2.5",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@opennextjs/cloudflare": "^1",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.5",
    "tailwindcss": "^4",
    "typescript": "^5",
    "wrangler": "^4"
  }
}
```

- [ ] **Step 4: Init OpenNext dev bindings in `_boilerplate/next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan IP local dev jika perlu test dari device lain di jaringan yang sama
  // allowedDevOrigins: ["192.168.x.x"],
};

export default nextConfig;

// Enables Cloudflare bindings (R2/KV/etc.) during `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
```

- [ ] **Step 5: Ignore build artifacts in `_boilerplate/.gitignore`**

Append to the end of `_boilerplate/.gitignore`:

```
# Cloudflare / OpenNext build artifacts
.open-next/
.wrangler/
cloudflare-env.d.ts
```

- [ ] **Step 6: Install dependencies**

Run: `cd _boilerplate && bun install`
Expected: completes without errors; `@opennextjs/cloudflare` and `wrangler` appear in `bun.lock`.

- [ ] **Step 7: Verify OpenNext build succeeds**

Run: `cd _boilerplate && bunx opennextjs-cloudflare build`
Expected: build completes; file `_boilerplate/.open-next/worker.js` exists afterward.
Check: `ls _boilerplate/.open-next/worker.js`

> If the build fails on a future `compatibility_date`, note it for review but do not change the date — it matches the spec. A live deploy is out of scope here.

- [ ] **Step 8: Validate the Worker config without deploying**

Run: `cd _boilerplate && bunx wrangler deploy --dry-run`
Expected: prints an upload summary (e.g. "Total Upload: …") and exits 0 with no config/schema errors. Nothing is uploaded to Cloudflare.

- [ ] **Step 9: Commit**

```bash
git add _boilerplate/wrangler.jsonc _boilerplate/open-next.config.ts _boilerplate/package.json _boilerplate/next.config.ts _boilerplate/.gitignore _boilerplate/bun.lock
git commit -m "feat(boilerplate): add OpenNext Cloudflare Workers deploy config

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Write the Cloudflare deploy developer guide

**Files:**
- Create: `docs/cloudflare-deploy.md`

**Interfaces:**
- Consumes: the scripts and `wrangler.jsonc` from Task 1 (referenced in the guide).
- Produces: `docs/cloudflare-deploy.md` — the canonical how-to for deploying any theme.

- [ ] **Step 1: Create `docs/cloudflare-deploy.md`**

```markdown
# Cloudflare Workers Deploy — Developer Guide

How to deploy a Rimba invitation theme (Next.js) to Cloudflare Workers via OpenNext.
Each theme becomes its own Worker `rimba-<template>` served at `<template>.rimba.io`.

> Companion guide for image assets: `docs/r2-image-storage.md`.
> Design rationale: `docs/superpowers/specs/2026-06-28-cloudflare-workers-deploy-flow-design.md`.

---

## Overview

| Item | Value |
|---|---|
| Platform | Cloudflare **Workers** (via OpenNext `@opennextjs/cloudflare`) |
| Unit | 1 theme = 1 Worker = 1 subdomain |
| Worker name | `rimba-<template>` (e.g. `rimba-warm-narrative`) |
| Subdomain | `<template>.rimba.io` (e.g. `warm-narrative.rimba.io`) |
| Images | Public R2 CDN via `NEXT_PUBLIC_THEMES_CDN` / `NEXT_PUBLIC_PHOTOS_CDN` (no R2 binding) |
| Cloudflare account | `developers.storages@gmail.com` (account ID `71ccc6ef9280a866a3c01d8d202a091f`) |

Every theme scaffolded from `_boilerplate` already includes `wrangler.jsonc`,
`open-next.config.ts`, and the deploy scripts.

---

## Prerequisites (first time only)

```bash
# Authenticate Wrangler against the Rimba Cloudflare account
bunx wrangler login

# Confirm the right account
bunx wrangler whoami
```

The `rimba.io` zone must live in the same Cloudflare account for the custom domain step.

---

## Per-Theme Deploy

```bash
cd themes/floral/<tier>/<template>      # e.g. themes/floral/kisah/rose-garden

# 1. Set the Worker name: edit wrangler.jsonc "name" -> "rimba-<template>"
# 2. Ensure .env.local has the CDN vars (see docs/r2-image-storage.md):
#    NEXT_PUBLIC_THEMES_CDN=https://pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev
#    NEXT_PUBLIC_PHOTOS_CDN=https://pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev

bun install
bun run preview      # optional: run locally in the Workers runtime
bun run deploy       # build with OpenNext + deploy the Worker
```

> `NEXT_PUBLIC_*` are inlined at **build time**, so `.env.local` must be present
> when you run `bun run deploy` — they are not set in `wrangler.jsonc`.

---

## Bind the Custom Domain (once per theme)

In the Cloudflare dashboard:

1. **Workers & Pages** → `rimba-<template>` → **Settings** → **Domains & Routes**
2. **Add** → **Custom Domain** → `<template>.rimba.io` → **Add domain**

DNS is created automatically because `rimba.io` is in the same account.

---

## Verify Without Deploying

```bash
bunx opennextjs-cloudflare build     # produces .open-next/worker.js
bunx wrangler deploy --dry-run        # validates config, uploads nothing
```

---

## Quick Reference

| Task | Command |
|---|---|
| Login | `bunx wrangler login` |
| Who am I | `bunx wrangler whoami` |
| Local Workers preview | `bun run preview` |
| Build only | `bunx opennextjs-cloudflare build` |
| Dry-run validate | `bunx wrangler deploy --dry-run` |
| Deploy | `bun run deploy` |
| New version (no promote) | `bun run upload` |
| Generate CF types | `bun run cf-typegen` |

---

## Troubleshooting

- **`nodejs_compat` error** — confirm `compatibility_flags: ["nodejs_compat"]` in `wrangler.jsonc`.
- **Images 404 in production** — `.env.local` was missing at build time; rebuild + redeploy.
- **Wrong account** — run `bunx wrangler logout` then `bunx wrangler login` with the Rimba account.
```

- [ ] **Step 2: Commit**

```bash
git add docs/cloudflare-deploy.md
git commit -m "docs: add Cloudflare Workers deploy guide

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Platform Workers/OpenNext → Task 1 (wrangler.jsonc, open-next.config.ts). ✅
- Worker name `rimba-<template>` + subdomain → Task 1 wrangler.jsonc `name`; Task 2 custom-domain step. ✅
- No R2 binding, env CDN → Global Constraints + Task 2 deploy steps. ✅
- Config baked into `_boilerplate` → Task 1. ✅
- Next 16 support verified → Global Constraints. ✅
- Build-time env note → Task 2 + Global Constraints. ✅
- Developer guide → Task 2. ✅
- Don't touch `themes/adat` → Global Constraints (no adat files in any task). ✅

**Placeholder scan:** `NAMA-TEMA` / `<template>` are intentional template tokens, not plan gaps. No TBD/TODO. ✅

**Type/name consistency:** Worker name `rimba-NAMA-TEMA`, scripts `preview`/`deploy`/`upload`/`cf-typegen`, artifact `.open-next/worker.js` — consistent across both tasks. ✅
