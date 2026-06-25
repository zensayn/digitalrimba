# Server-First Invitation Themes Design

## Objective

Refactor all active invitation themes so static invitation content is rendered as React Server Components while preserving Framer Motion animations and the existing interactive experience. Remove the production config provider and all Rimba Studio or iframe-preview integration.

Active themes:

- `themes/adat/kenangan/warm-narrative`
- `themes/adat/kenangan/sacred-luxe`
- `themes/adat/kisah/sinema-kisah`

The refactor must preserve current local visual changes in `warm-narrative`.

## Architecture

Each theme's `page.tsx` becomes a Server Component. It imports `invitation.config.json`, filters the configured section order, reads the guest name from the server-side `searchParams`, and passes serializable data to sections through props.

Static sections remain Server Components. They use the React Server Components-compatible Framer Motion entry point:

```tsx
import * as motion from "framer-motion/client";
```

Viewport reveal animations use `whileInView` and `viewport` instead of React refs and `useInView`. This preserves Framer Motion animation behavior without requiring the section module itself to be marked `"use client"`.

Stateful browser behavior remains in focused Client Components:

- music playback;
- countdown updates and invitation-open interaction;
- RSVP controls;
- bank-account clipboard controls;
- love-story carousel and auto-progress;
- map activation where required;
- gallery WebGL interaction;
- `sinema-kisah` horizontal slide controller and active chapter indicator.

Server Components may compose these client islands and pass plain JSON-compatible props to them.

## Config Data Flow

`invitation.config.json` is the production source of truth. Components receive only the config slice they need:

- couple data;
- event data;
- gallery data;
- love-story data;
- dress-code data;
- bank-account data;
- wedding date.

The following production abstractions are removed:

- `RimbaConfigProvider`;
- `useInvitationConfig`;
- the unused `useConfig` hook;
- `RIMBA_CONFIG_UPDATE`;
- `RIMBA_TEMPLATE_READY`;
- iframe `postMessage` listeners;
- `preview=1` gallery behavior.

The `_shared` synchronization script no longer copies a provider into themes. `_shared` documentation and the boilerplate are updated so new themes use direct server imports and props instead of client context.

## Framer Motion Strategy

Framer Motion remains part of every existing animated experience.

For static reveal sections:

- replace `useRef` plus `useInView` with `whileInView`;
- retain existing variants, duration, easing, delay, and stagger values;
- use `viewport={{ once: true, margin: "..." }}` to match current behavior;
- import motion primitives from `framer-motion/client`.

For components that use state, effects, animation controls, or gesture logic:

- retain `"use client"`;
- retain existing Framer Motion imports and behavior;
- split static wrappers from interactive controls only when this materially reduces the client boundary without making the component harder to maintain.

No CSS replacement of Framer Motion animations is included.

## Gallery Loading

`InfiniteMenu` remains a Client Component because it requires canvas, WebGL, browser APIs, animation frames, and pointer input.

The gallery shell is rendered server-side. The WebGL menu is loaded through a client-side lazy boundary only when the gallery is near or inside the viewport. A stable placeholder preserves layout while the module loads. The removed Studio preview branch is not replaced.

## Image Delivery

Existing Cloudflare R2 WebP URLs remain the image source. This change does not migrate those assets or alter their formats.

Optimization focuses on:

- explicit dimensions or stable aspect-ratio containers to prevent layout shift;
- eager loading only for the LCP/cover image;
- lazy loading for below-the-fold decorative and gallery images;
- avoiding duplicate image downloads;
- preserving CDN URLs already introduced by local `warm-narrative` changes.

`next/image` is used only where its generated responsive sizing provides a clear benefit and the remote host can be safely configured. Decorative assets that already have fixed CSS sizing may remain native images with explicit loading and decoding behavior.

## Shared and Boilerplate Changes

`scripts/sync-shared.ts` stops generating `RimbaConfigProvider.tsx`.

Provider files are deleted from:

- `_shared/components`;
- `_boilerplate/src/components`;
- every active theme.

Boilerplate `page.tsx`, layout, documentation, and examples are converted to the same server-first contract so future themes do not restore the removed architecture.

## Error and Compatibility Handling

- Missing optional config arrays render no section rather than throwing.
- Guest names are decoded from `searchParams.to` and fall back to the existing generic guest label.
- Props crossing the server/client boundary remain plain objects, arrays, strings, numbers, booleans, or null.
- Browser APIs are referenced only inside Client Components or effects.
- Existing section order and enabled flags remain authoritative.

## Verification

Add a repository-level architecture check that fails when:

- an active theme `page.tsx` starts with `"use client"`;
- `RimbaConfigProvider`, `useInvitationConfig`, Studio message constants, or `preview=1` remain in production theme source;
- `scripts/sync-shared.ts` attempts to copy the removed provider;
- a static reveal section imports `useInView`.

Verification sequence:

1. Run the architecture check before implementation and confirm it fails.
2. Refactor each theme and boilerplate.
3. Run lint and type checking where available.
4. Run production builds for installed themes.
5. Install or restore `sinema-kisah` dependencies only if explicitly authorized; otherwise report its source-level verification separately.
6. Compare route client JavaScript for `warm-narrative` and `sacred-luxe` against the measured baselines of approximately 284 KB and 276 KB.
7. Confirm existing working-tree changes remain present.

## Success Criteria

- All three production pages are Server Components.
- Production provider and Studio integration are removed.
- Framer Motion visual behavior is retained.
- Static reveal sections no longer require `useInView`.
- Interactive features continue to work through focused client islands.
- Existing Cloudflare WebP delivery remains intact.
- Production builds pass for themes with installed dependencies.
- Route client JavaScript is lower than the recorded baseline for both buildable themes.
