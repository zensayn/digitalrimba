# Check-in QR Redesign — Design Spec
**Date:** 2026-05-17  
**Status:** Approved

---

## Context

The check-in system has two pages that both need work:
- `dashboard/checkin-qr` — organizer setup page: currently a minimal placeholder with hardcoded `TEST01`, no real QR generation, and no database wiring.
- `checkin/[eventCode]` — operator scan page: functional but uses a plain vertical scroll layout that isn't optimized for fast door check-in.

The backend is also missing the `checkin_events` table that the Go handler already queries — meaning the auth flow is broken against a real DB. QR generation is marked "coming soon".

**Goal:** Full-stack redesign. Both pages get a proper UI using the existing Rimba design system. The backend gets the missing DB table, QR code generation, PDF download, and email dispatch.

---

## Design System

All components follow the existing Rimba/Cohere Ivory Editorial language already used across the dashboard.

### Tokens
| Token | Value | Use |
|---|---|---|
| `canvas` | `#ffffff` | Card surfaces, page backgrounds |
| `warm-canvas` | `#faf8f5` | Page body background |
| `primary` | `#346739` | Primary CTAs, success states, active accents |
| `pale-green` | `#edfce9` | Success badges, avatar bg, status banners |
| `ink` | `#212121` | Headings, primary text |
| `muted` | `#93939f` | Labels, metadata, placeholders |
| `hairline` | `#d9d9dd` | Dividers, card borders |
| `coral` | `#ff7759` | Souvenir/warning states |
| `error` | `#b30000` | Already-checked-in alerts |

### Typography
All Poppins. H1 40px/700 (32px mobile), H2 24px/700, H3 18px/700, body 16px/400, captions 12px/400. Zero letter-spacing everywhere.

### Components to reuse
- **`TextureButton`** (`components/ui/texture-button.tsx`) — `variant="primary"` for all primary actions, `variant="secondary"` / `variant="outline"` for secondary actions
- **`Card` / `CardContent` / `CardHeader`** (`components/ui/card.tsx`) — `rounded-xl ring-1 ring-foreground/10 bg-card`
- **`Sheet`** (`components/ui/sheet.tsx`) — slide-up bottom sheet for the operator guest card
- **`Input`** (`components/ui/input.tsx`) — search field on operator page
- **`Avatar`** (`components/ui/avatar.tsx`) — guest initials avatar
- **`Skeleton`** (`components/ui/skeleton.tsx`) — loading states

### Animations (Emil Kowalski)
- Button press: `active:scale-[0.97]` at 100ms — already in `TextureButton`
- Sheet slide-up: `cubic-bezier(0.32, 0.72, 0, 1)` at 250ms (use `Sheet` component, already has this)
- Camera success flash: green `bg-primary/10` overlay fade-in at 150ms, fade-out at 400ms
- Counter increment: framer-motion number transition already used in dashboard

---

## Page 1 — Organizer Setup (`dashboard/checkin-qr`)

### Layout: Dashboard Grid

```
┌─────────────────────────────────────────────────────┐
│  [Shell nav: breadcrumb / avatar]                   │
├─────────────────────────────────────────────────────┤
│  H1: Check-in Setup        sub: Sinta & Budi        │
│  ┌─ Status banner (green) ─────────────────────────┐│
│  │ ● Check-in active · 42 / 248 arrived            ││
│  └──────────────────────────────────────────────────┘│
│  ┌─ Event Code ──┐  ┌─ Operator PIN ──────────────┐ │
│  │ SINTA01       │  │ ●●●●●● (masked)             │ │
│  │ [Copy URL]    │  │ [Reveal & Copy] [Regenerate] │ │
│  └───────────────┘  └─────────────────────────────┘ │
│  ┌─ QR Code Distribution (full-width) ─────────────┐│
│  │ ▣  248 unique QR codes ready                    ││
│  │    Each guest has a personal token              ││
│  │                    [↓ Download PDF] [✉ Email All]││
│  └──────────────────────────────────────────────────┘│
│  ┌─ Live Statistics (full-width) ──────────────────┐ │
│  │   42 Arrived  │  206 Pending  │  31 Souvenirs   │ │
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Component breakdown
- **Status banner** — `bg-[#edfce9] border border-[#c5e8c9] rounded-xl` with pulsing green dot. Hidden if check-in not yet active.
- **Event Code card** — `Card` with mono `text-xl font-bold` code, URL shown in `bg-[#faf8f5] rounded-lg text-xs` chip, `TextureButton variant="primary"` for Copy URL, `TextureButton variant="outline"` for Regenerate.
- **PIN card** — 6 masked `●` dots, `TextureButton variant="primary"` for Reveal & Copy (toggles reveal), `TextureButton variant="outline"` for Regenerate. Reveals the actual PIN in `font-mono`.
- **QR Distribution card** — full-width `Card`. Left: QR icon + count + subtitle. Right: two stacked `TextureButton`s — `variant="primary"` Download PDF, `variant="secondary"` Email All Guests.
- **Live Stats** — full-width `Card`, 3-column grid divided by `border-r border-[#f2f2f2]`. Values use `text-2xl font-bold` with color coding (green / ink / coral).

### Data wiring
- `GET /api/checkin/events/:weddingId` — load event code, PIN status, guest count
- `POST /api/checkin/events` — create event (generates event code + hashed PIN); idempotent — returns existing record if already created for this wedding
- `GET /api/checkin/qr/pdf?weddingId=` — stream PDF download
- `POST /api/checkin/qr/email?weddingId=` — trigger email dispatch
- `GET /api/checkin/stream` (SSE) — live stats counter

---

## Page 2 — Operator Scan (`checkin/[eventCode]`)

### Layout: Camera First + Slide-up Sheet

```
Mobile (375px max-width)
┌────────────────────────┐
│ SINTA01   Sinta & Budi │  ← sticky top bar
│                 42/248 │
├────────────────────────┤
│                        │
│   ┌──────────────┐     │  ← fullscreen camera
│   │   QR frame   │     │     (html5-qrcode)
│   └──────────────┘     │
│   Align QR code here   │
├────────────────────────┤
│ 🔍 Search guest name…  │  ← always-visible search
├────────────────────────┤
│  [Empty / hint text]   │  ← expands into guest sheet
└────────────────────────┘

On scan → Sheet slides up:
┌────────────────────────┐
│  ▬▬▬  (drag handle)   │
│  [Avatar] Name  [VIP]  │
│  Table 12 · Party ×2   │
│  [Table] [Party] [RSVP]│  ← info chips
│  Souvenir claimed  [○] │  ← toggle
│  [✓ Check In]          │  ← TextureButton primary full-width
└────────────────────────┘
```

### States
1. **Scanning** — camera live, scan-line animation, search input visible, hint text below
2. **Guest found** — `Sheet` slides up with guest card. Camera dims slightly (`opacity-80`). Confirm with `TextureButton variant="primary"`.
3. **Already checked in** — Sheet shows `bg-[#fef2f2]` avatar, arrival time, `TextureButton variant="destructive"` styled warning. QR frame corners turn coral.
4. **Search results** — typing in search shows debounced list of guests as compact rows; tap row to open same Sheet flow.
5. **Check-in success** — sheet dismisses, counter increments with framer-motion, green flash on camera overlay for 400ms, ready for next scan.

### Component breakdown
- **Top bar** — sticky `h-14 border-b border-neutral-100`, event code + wedding name left, live counter badge (`bg-[#edfce9] text-[#346739]`) right
- **Camera** — `html5-qrcode` mounted in a `div` that fills available height. Overlay renders QR frame corners as absolutely-positioned divs.
- **Search** — `Input` component, `rounded-full bg-[#f5f3f0]`, debounced 300ms, triggers `GET /api/checkin/guests?q=&weddingId=`
- **Sheet** — `Sheet` component from `components/ui/sheet.tsx`, `side="bottom"`, `rounded-t-2xl`. Guest avatar uses `Avatar` component with initials fallback.
- **Info chips** — 3-column flex grid with `bg-[#faf8f5] rounded-xl` cells showing Table / Party / RSVP status
- **Souvenir toggle** — controlled `<button>` with `bg-[#346739]` / `bg-neutral-200` states; calls `PATCH /api/checkin/guests/:id/souvenir`
- **CTA** — `TextureButton variant="primary"` full-width `w-full`; calls `POST /api/checkin/scan`

---

## Backend Changes

### New DB migration
```sql
-- db/migrations/00002_checkin_events.sql
CREATE TABLE checkin_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id  UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_code  TEXT NOT NULL UNIQUE,
  pin_hash    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkin_events_wedding ON checkin_events(wedding_id);
```

### New API routes
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/checkin/events` | Create event code + PIN for a wedding |
| `GET` | `/api/checkin/events/:weddingId` | Fetch event config (code, PIN masked) |
| `GET` | `/api/checkin/events/:weddingId/qr/pdf` | Generate + stream PDF of all guest QR codes |
| `POST` | `/api/checkin/events/:weddingId/qr/email` | Trigger per-guest email with QR image |

### QR code generation
- Library: `github.com/skip2/go-qrcode` (Go) — generates PNG per `guest.qr_token`
- PDF bundling: `github.com/signintech/gopdf` — one guest per page: name, table, QR image
- Email: existing email service; embed QR as inline `image/png` attachment

---

## Files to Create / Modify

### Frontend
| File | Action |
|---|---|
| `components/dashboard/CheckinQrPage.tsx` | Full rewrite — dashboard grid layout |
| `components/checkin/OperatorCheckIn.tsx` | Full rewrite — camera-first + Sheet |
| `app/(checkin)/checkin/[eventCode]/page.tsx` | Update layout wrapper if needed |

### Backend
| File | Action |
|---|---|
| `db/migrations/00002_checkin_events.sql` | New — creates `checkin_events` table |
| `backend/internal/handlers/checkin.go` | Add new routes (create event, QR PDF, email) |
| `backend/internal/handlers/checkin_store.go` | Add new store methods |
| `backend/cmd/api/main.go` | Register new routes |

---

## Verification

1. **Organizer flow** — Create a wedding, go to `dashboard/checkin-qr`, confirm event code generated, PIN revealed correctly, PDF downloads with all guest QR codes, email triggered per guest.
2. **Operator flow** — Open `checkin/[eventCode]` on mobile, authenticate with PIN, scan a guest QR code, confirm Sheet slides up with correct guest data, tap Check In, confirm counter increments and SSE updates.
3. **Already checked in** — Scan same QR twice, confirm error state renders correctly.
4. **Search fallback** — Type guest name, tap from results, complete check-in via Sheet.
5. **DB integrity** — Verify `checkin` table has one row per guest after check-in, `souvenir_claimed` toggles correctly.
