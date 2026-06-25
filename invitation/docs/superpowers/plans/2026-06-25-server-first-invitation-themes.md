# Server-First Invitation Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert all active invitation themes and the boilerplate to server-first rendering, remove provider/Studio integration, preserve Framer Motion, and reduce route client JavaScript.

**Architecture:** Theme pages import static JSON on the server and pass focused config slices as serializable props. Static animated sections use `framer-motion/client` with `whileInView`; stateful controls remain small Client Components. Shared sync and boilerplate enforce the same architecture for future themes.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, Framer Motion 12, TypeScript, PowerShell architecture checks.

---

### Task 1: Add the architecture regression check

**Files:**
- Create: `scripts/check-server-first-themes.ps1`
- Modify: `package.json`

- [ ] **Step 1: Write the failing architecture check**

Create a script that scans active theme pages, theme source, shared sync, and boilerplate for:

```powershell
$forbidden = @(
  'RimbaConfigProvider',
  'useInvitationConfig',
  'RIMBA_CONFIG_UPDATE',
  'RIMBA_TEMPLATE_READY',
  'preview=1'
)
```

It must also reject `"use client"` in active `page.tsx` files and `useInView` in files classified as static reveal sections.

- [ ] **Step 2: Run the check and verify it fails**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-server-first-themes.ps1
```

Expected: non-zero exit with current provider, client page, Studio, and `useInView` violations.

- [ ] **Step 3: Add a root package script**

Add:

```json
"check:server-first": "powershell -ExecutionPolicy Bypass -File scripts/check-server-first-themes.ps1"
```

- [ ] **Step 4: Do not commit**

The user explicitly requested no commit.

### Task 2: Remove provider and Studio infrastructure

**Files:**
- Delete: `_shared/components/RimbaConfigProvider.tsx`
- Delete: `_boilerplate/src/components/RimbaConfigProvider.tsx`
- Delete: `themes/adat/kenangan/warm-narrative/src/components/shared/RimbaConfigProvider.tsx`
- Delete: `themes/adat/kenangan/sacred-luxe/src/components/shared/RimbaConfigProvider.tsx`
- Delete: `themes/adat/kisah/sinema-kisah/components/shared/RimbaConfigProvider.tsx`
- Delete: `themes/adat/kenangan/sacred-luxe/src/lib/use-config.ts`
- Modify: `scripts/sync-shared.ts`
- Modify: `_shared/README.md`
- Modify: `_boilerplate/README.md`

- [ ] **Step 1: Remove provider generation from sync**

Delete `configJsonPath()` and the provider copy block from `scripts/sync-shared.ts`.

- [ ] **Step 2: Remove obsolete provider and Studio files**

Delete all files listed above.

- [ ] **Step 3: Update documentation**

Document direct server imports:

```tsx
import configJson from "../../invitation.config.json";
import type { InvitationConfig } from "@/lib/config-types";

const config = configJson as InvitationConfig;
```

- [ ] **Step 4: Re-run architecture check**

Expected: provider and Studio violations disappear; client-page and section violations remain.

### Task 3: Refactor `warm-narrative`

**Files:**
- Modify: `themes/adat/kenangan/warm-narrative/src/app/layout.tsx`
- Modify: `themes/adat/kenangan/warm-narrative/src/app/page.tsx`
- Modify: all files under `src/components/sections`
- Modify: `src/components/shared/FallingFlowers.tsx`
- Create: focused client control files under `src/components/client` when section-level state cannot be removed cleanly

- [ ] **Step 1: Make layout provider-free**

Render `{children}` directly in `<body>`.

- [ ] **Step 2: Make page server-first**

Use the Next.js 16 page signature:

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ to?: string | string[] }>;
}) {
  const params = await searchParams;
  const guestName = Array.isArray(params.to) ? params.to[0] : params.to;
}
```

Import config JSON and pass config slices to sections.

- [ ] **Step 3: Convert static reveal sections**

Remove `"use client"`, refs, and `useInView` from static sections. Replace:

```tsx
animate={isInView ? "visible" : "hidden"}
```

with:

```tsx
whileInView="visible"
viewport={{ once: true, margin: "-15%" }}
```

Import:

```tsx
import * as motion from "framer-motion/client";
```

- [ ] **Step 4: Pass config through props**

Replace every `useInvitationConfig()` call with typed props from `InvitationConfig`.

- [ ] **Step 5: Keep focused client interactions**

Retain client boundaries for countdown/open, love-story carousel, RSVP, clipboard, map activation, music, and WebGL.

- [ ] **Step 6: Make falling flowers server-renderable**

Remove `"use client"` and `useMemo`; compute deterministic petals during render.

- [ ] **Step 7: Remove gallery preview mode and lazy-load WebGL**

Render no Studio placeholder. Use a lazy client wrapper that reserves the existing gallery dimensions.

- [ ] **Step 8: Run lint and build**

Run:

```powershell
cmd /c npm run lint
cmd /c npm run build
```

Expected: both commands exit zero.

### Task 4: Refactor `sacred-luxe`

**Files:**
- Modify: `themes/adat/kenangan/sacred-luxe/src/app/layout.tsx`
- Modify: `themes/adat/kenangan/sacred-luxe/src/app/page.tsx`
- Modify: all files under `src/components/sections`
- Create: focused client control files under `src/components/client` as needed

- [ ] **Step 1: Apply the same server data-flow contract**

Remove provider usage from layout/page and pass typed config slices as props.

- [ ] **Step 2: Convert static Framer Motion sections**

Use `framer-motion/client`, `whileInView`, and `viewport` while preserving animation timing.

- [ ] **Step 3: Keep stateful controls as client islands**

Preserve countdown/open, carousel, RSVP, clipboard, gallery WebGL, and music behavior.

- [ ] **Step 4: Remove gallery preview branch and lazy-load WebGL**

Match the `warm-narrative` gallery loading boundary.

- [ ] **Step 5: Run lint and build**

Run:

```powershell
cmd /c npm run lint
cmd /c npm run build
```

Expected: both commands exit zero.

### Task 5: Refactor `sinema-kisah`

**Files:**
- Modify: `themes/adat/kisah/sinema-kisah/app/layout.tsx`
- Modify: `themes/adat/kisah/sinema-kisah/app/page.tsx`
- Create: `themes/adat/kisah/sinema-kisah/components/SinemaExperience.tsx`
- Modify: files under `components/slides`

- [ ] **Step 1: Make page server-first**

Read config and guest name on the server, build slide JSX on the server, and pass it as `children` to the horizontal client controller.

- [ ] **Step 2: Isolate horizontal navigation**

Move wheel/touch/keyboard state into `SinemaExperience.tsx`. It accepts rendered slide children and serializable chapter metadata.

- [ ] **Step 3: Convert eligible slides to server components**

Use `framer-motion/client` with `whileInView` for slides without local state. Keep RSVP and clipboard controls as client islands.

- [ ] **Step 4: Verify source**

Run:

```powershell
cmd /c npm run typecheck
```

If dependencies remain unavailable, run the root architecture check and report the missing installation separately without installing packages.

### Task 6: Convert the boilerplate

**Files:**
- Modify: `_boilerplate/src/app/layout.tsx`
- Modify: `_boilerplate/src/app/page.tsx`
- Modify: `_boilerplate/src/components/sections/.gitkeep`

- [ ] **Step 1: Remove client page and provider**

Use direct config import and server `searchParams`.

- [ ] **Step 2: Update section guidance**

Document that static sections are Server Components and only interactive islands use `"use client"`.

- [ ] **Step 3: Run architecture check**

Expected: zero violations across active themes, shared sync, and boilerplate.

### Task 7: Final verification and bundle comparison

**Files:**
- Modify only if verification finds a defect.

- [ ] **Step 1: Run root architecture check**

Run:

```powershell
cmd /c npm run check:server-first
```

Expected: PASS.

- [ ] **Step 2: Build installed themes**

Run production builds for `warm-narrative` and `sacred-luxe`.

- [ ] **Step 3: Measure route client chunks**

Read each `.next/server/app/page_client-reference-manifest.js`, resolve unique route chunks, and sum their raw byte sizes.

Expected:

- `warm-narrative` below the recorded 284 KB baseline;
- `sacred-luxe` below the recorded 276 KB baseline.

- [ ] **Step 4: Check working tree preservation**

Review `git diff` and verify existing Cloudflare asset changes and visual edits remain present.

- [ ] **Step 5: Do not stage or commit**

Report changed files, verification output, remaining limitations, and measured bundle changes.
