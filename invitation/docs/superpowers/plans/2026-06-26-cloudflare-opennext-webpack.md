# Cloudflare OpenNext Webpack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all three Next.js themes produce OpenNext-compatible Cloudflare Worker bundles without removing Turbopack from local development.

**Architecture:** OpenNext continues to call each package's existing `build` script. The scripts explicitly select Webpack for production, while the Next.js configs retain a Turbopack root for `next dev`.

**Tech Stack:** Next.js 16.2.5, OpenNext Cloudflare 1.20.0, Wrangler 4.105.0, Bun

---

### Task 1: Add a failing configuration regression check

**Files:**
- Test: inline PowerShell assertion

- [x] **Step 1: Assert the required build scripts and Turbopack roots**

Check that each package uses `"build": "next build --webpack"` and that each `next.config.ts` contains:

```ts
turbopack: {
  root: __dirname,
},
```

- [x] **Step 2: Run the assertion and verify it fails**

Expected: failures for three build scripts and the two configs where the Turbopack block was removed.

### Task 2: Apply the minimal configuration fix

**Files:**
- Modify: `themes/adat/kenangan/warm-narrative/package.json`
- Modify: `themes/adat/kenangan/warm-narrative/next.config.ts`
- Modify: `themes/adat/kenangan/sacred-luxe/package.json`
- Modify: `themes/adat/kisah/sinema-kisah/package.json`
- Modify: `themes/adat/kisah/sinema-kisah/next.config.ts`

- [x] **Step 1: Select Webpack in every production build**

```json
"build": "next build --webpack"
```

- [x] **Step 2: Restore explicit Turbopack roots**

```ts
turbopack: {
  root: __dirname,
},
```

### Task 3: Verify the fix

**Files:**
- No additional files

- [x] **Step 1: Re-run the configuration assertion**

Expected: exit code 0.

- [x] **Step 2: Run OpenNext builds**

Run `bunx opennextjs-cloudflare build` from each theme directory.

Expected: each command exits with code 0 and writes `.open-next/worker.js`.

- [x] **Step 3: Verify the Worker runtime**

Start the warm-narrative preview, request `http://127.0.0.1:8791/`, and stop the preview process.

Expected: HTTP 200.
