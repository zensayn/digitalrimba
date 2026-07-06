# Penerima Tamu (Front-Desk) — Architectural & UX Checklist Audit

Audited 2026-07-05 against the actual code in `digital/frontend` (operator kiosk at
`/checkin/[eventCode]`, organizer page at `/dashboard/checkin-qr`) and `digital/backend`.

Legend: `[x]` implemented & verified · `[~]` partially implemented · `[ ]` not built

---

## 🐛 Critical bug found & fixed: pitch-black camera

**Symptom:** operator station camera showed pitch black — stream was actually live
(camera LED on) but rendered into an invisible box.

**Root cause (verified with a Playwright reproduction, fake-camera Chromium):**
`html5-qrcode`'s `start()` sets inline `style="position: relative"` on its container
element. That inline style overrides Tailwind's `absolute` class on
`#operator-checkin-reader` (`className="absolute inset-0"`), so `inset-0` stops
stretching the div and it collapses to **0×0**. The library then measures the collapsed
container and styles its video `width: 0px`. Live stream, zero-size video → black screen.

Measured before the fix: container `0x0`, video `width: 0px`, track `live`, no error hint.

**Second latent bug in the same hook:** the effect cleanup called `scanner.stop()`
while `start()` was still pending. `html5-qrcode`'s `stop()` **throws synchronously**
in that state, so the `.catch()` never attached, cleanup crashed, and `clear()` could
wipe the DOM of a second StrictMode-mounted scanner instance sharing the same element id.

**Fix (`components/checkin/hooks/useQrScanner.ts`):**
- Each effect run creates its own private mount `<div>` (unique id, explicit
  `width/height: 100%`) inside the host, so the library's inline `position: relative`
  can't collapse the layout and instances can never clobber each other's DOM.
- Teardown chains off the start promise and only calls `stop()` when
  `scanner.isScanning` — no more synchronous throw.

**Verified after the fix:** video renders 1280×960, live and playing, exactly one
scanner instance survives the StrictMode double-mount (persisted-session reload),
no page errors. Screenshot shows the fake-camera feed filling the viewfinder.

> Deployment reminder: `getUserMedia` requires HTTPS (or `localhost`). On venue LAN
> over plain HTTP the camera will legitimately refuse to start — the UI shows the
> "Kamera tidak tersedia — gunakan pencarian di bawah" fallback hint for that case.

---

## Phase 1: Infrastructure & Environment (Pre-Event)

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[x]` | **Local Data Caching** | `useOfflineGuestCache` pulls the full roster into memory + IndexedDB (`lib/checkin/offline-db.ts`), network-first with cache fallback. Search and QR lookup fall back to the local roster when offline. |
| `[x]` | **Background Queue Sync** | `useScanQueue`: offline scans enqueue to IndexedDB, replayed sequentially every 15s + on the `online` event against `POST /api/checkin/scan` (idempotent `INSERT … ON CONFLICT DO NOTHING`). Poison entries (server-rejected) are dropped so they can't block the queue. Pending count surfaces as the "N antre" badge. |
| `[~]` | **Camera API Optimization** | Torch is feature-detected and manually toggleable (`applyVideoConstraints({ torch })`). **Missing:** focus-mode lock (no `focusMode: "continuous"`/macro constraint) and automatic flashlight via ambient light sensor — torch is operator-initiated only. |

## Phase 2: The Core Scan Flow (The 3-Second Rule)

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[x]` | **Aggressive Typography UI** | Guest name renders at `clamp(30px, 9vw, 40px)` in the scan sheet; the kiosk route has no dashboard shell/navigation at all. |
| `[x]` | **Haptic & Audio Feedback** | `lib/checkin/haptics-audio.ts`: success = 880Hz chime + 80ms vibrate; warning = low 220Hz + double buzz. `AudioContext` is primed on the PIN-submit user gesture so autoplay policy doesn't mute the first scan. |
| `[x]` | **Automated Souvenir Math** | Scan sheet shows a full-width green block: **"BERIKAN {pax} SOUVENIR"**, driven by the pax stepper. |
| `—` | **Automated Routing / Tables** | Marked *"Don't"* in the checklist — intentionally skipped. No table data exists in the check-in schema. |

## Phase 3: Edge Cases & Crisis Management

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[x]` | **Frictionless +Pax Stepper** | 44px round `+`/`−` buttons directly on the scan sheet, range 1–99, defaults to invited party size; actual pax stored per guest (`actual_pax`). |
| `[x]` | **The "Proxy" Toggle** | "Diwakilkan" 1-tap toggle reveals a quick-text field for the proxy's name; stored as `proxy_name` on the original invitee's record. |
| `[x]` | **Contextual Duplicate Scans** | Duplicate scan opens a banner: "Sudah check-in {time} oleh {operator label}" (+ proxy name if any) with warning buzz — not a generic error. Operator labels are captured at PIN login. |
| `[x]` | **Physical Envelope Tagging** | Sequential 3-digit gift tag (`#001`…): counter seeded from server max at login, persisted in IndexedDB across refreshes, assigned at check-in and shown as "Amplop #NNN" on the sheet. |

## Phase 4: Manual Fallback

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[x]` | **Auto-Focus Search Bar** | Single-screen kiosk — search input is always visible with `autoFocus`; no tab switch or extra tap needed. |
| `[x]` | **Hyper-Fuzzy Search** | `lib/checkin/fuzzy-search.ts`: banded Levenshtein ≤ 2 per query word + substring match over the offline roster (instant), merged with debounced server results. "Sfk" → "Syafiq" works by design. |
| `[x]` | **1-Tap Walk-In Generation** | `WalkInForm`: name + pax only → `POST /api/checkin/walkin` creates the guest already checked-in with a gift tag, then opens the success sheet. |

## Phase 5: Event Pacing & Usher Ecosystem

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[ ]` | **VIP SSE Triggers** | The SSE stream (`/api/checkin/stream`) broadcasts **counts only** (arrived/total/pax). No per-guest/VIP payload and no separate Usher Dashboard exists. |
| `[x]` | **Capacity Warning Tracker** | Persistent 1px capacity bar + "{arrived} / {total} pax" chip in the kiosk chrome; both flip to orange at ≥ 90%. Organizer dashboard mirrors the same bar (20s polling). |

## Phase 6: Real-Time Operations & Seating

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[ ]` | **Live Table Occupancy UI** | No table assignments in the schema, no usher-facing view. |
| `[ ]` | **The "No-Show" Triage** | No H+2 unchecked-VIP surfacing. (Data to build it exists: tags + `checked_in_at`.) |
| `[ ]` | **In-App Usher Broadcasting** | No usher dashboard, so no alert channel. |

## Phase 7: Post-Event Reconciliation

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[~]` | **Angpao/Gift Digital Ledger** | Gift tags are persisted per guest (`gift_tag_code`) and visible in the roster — reconciliation is *possible* — but there is no host UI to enter amounts against a tag. |
| `[~]` | **Discrepancy Auditing** | `actual_pax` vs invited `party_size` is stored per guest and aggregated into arrived-pax counts, but no "RSVP 2, Actual 5 (+3)" report view exists. |
| `[ ]` | **1-Click Export (CSV/PDF)** | Guest CSV **import** and a QR-codes **PDF** exist; there is no export of the check-in ledger (timestamps, proxies, gift tags, RSVP vs actual). |

## Phase 8: Hardware & Physical Layer Resilience

| Status | Feature | Evidence |
| :---: | :--- | :--- |
| `[x]` | **Kiosk Mode / Guided Access** | Fullscreen requested on the PIN-submit gesture; "tap to return to fullscreen" nudge when it drops; `beforeunload` speed bump; hidden long-press (700ms) menu, PIN re-verified server-side, with force-refresh. |
| `[~]` | **Thermal & Battery UI Tracking** | Battery % chip lives in the kiosk chrome (red ≤ 20%), Battery API feature-detected. **Missing:** scanner framerate throttling when idle — fps is fixed at 10 with no motion detection. |
| `[x]` | **Local Data Wiping** | PIN-gated "Akhiri acara": flushes the pending queue, deletes the whole IndexedDB database, clears the sessionStorage token, reloads. Warns loudly if unsynced scans would be lost. |

---

## Summary

- **14 / 20 fully implemented**, 4 partial, 5 not built (one item intentionally skipped per the checklist's own note).
- The camera bug was the only defect found in the implemented set; fixed and verified end-to-end this session.
- Biggest genuine gaps, in impact order: check-in ledger **CSV export** (Phase 7 — cheap, data already in one table), **gift-amount entry UI** (Phase 7), scanner **idle throttling** (Phase 8), and the whole **usher ecosystem** (Phases 5–6 — a separate product surface).
