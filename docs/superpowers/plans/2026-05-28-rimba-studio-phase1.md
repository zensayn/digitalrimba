# Rimba Studio Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/studio` route di dalam sacred-luxe yang menggunakan Puck untuk reorder sections dan edit konten undangan, hasilnya disimpan ke `invitation.config.json`.

**Architecture:** Studio hidup sebagai route `/studio` di dalam app sacred-luxe yang sudah ada (port 3000). Data undangan dipindah dari hardcoded TypeScript ke `invitation.config.json`. `invitation.ts` di-refactor menjadi re-export dari JSON sehingga semua section component tidak perlu diubah. Puck menampilkan satu card per section untuk reorder, field editing di panel kanan Puck. Preview invitation tampil di iframe kanan.

**Tech Stack:** Next.js 16.2.5 (App Router), TypeScript, `@measured/puck`, Tailwind CSS

---

## File Map

```
sacred-luxe/
├── invitation.config.json               CREATE  ← source of truth data
├── src/
│   ├── data/
│   │   └── invitation.ts                MODIFY  ← re-export dari JSON
│   ├── lib/
│   │   └── config-types.ts              CREATE  ← TypeScript types
│   ├── studio/
│   │   ├── puck.config.tsx              CREATE  ← definisi Puck components
│   │   └── lib/
│   │       └── config-mapping.ts        CREATE  ← config ↔ Puck data mapping
│   ├── app/
│   │   ├── studio/
│   │   │   ├── layout.tsx               CREATE  ← minimal layout (no snap/music)
│   │   │   └── page.tsx                 CREATE  ← Studio UI
│   │   └── api/
│   │       └── config/
│   │           └── route.ts             CREATE  ← GET + POST config JSON
│   └── components/
│       └── studio/
│           └── SectionCard.tsx          CREATE  ← Puck canvas card per section
└── package.json                         MODIFY  ← add @measured/puck
```

---

## Task 1: Buat `invitation.config.json`

**Files:**
- Create: `invitation.config.json` (di root sacred-luxe, sejajar dengan `package.json`)

- [ ] **Step 1: Buat file JSON dengan data dari `invitation.ts`**

```json
{
  "couple": {
    "groom": {
      "name": "Pangky",
      "fullName": "Pangky Pratama Putra",
      "parents": "Putra Bapak H. Ahmad & Ibu Siti Rahmawati",
      "photo": "/images/groom.jpg",
      "instagram": "@pangky.pratama"
    },
    "bride": {
      "name": "Radit",
      "fullName": "Radit Kusuma Wardana",
      "parents": "Putra Bapak Drs. Budi Santoso & Ibu Dewi Kusumawati",
      "photo": "/images/bride.jpg",
      "instagram": "@radit.kusuma"
    },
    "hashtag": "#PangkyRaditForever",
    "quote": "Dua jiwa, satu akar. Bersama kita tumbuh."
  },
  "events": {
    "akad": {
      "title": "Akad Nikah",
      "day": "Sabtu",
      "date": "14 Juni 2026",
      "time": "08.00 – 10.00 WIB",
      "venue": "Masjid Agung Al-Falah",
      "address": "Jl. Merdeka No. 1, Jakarta Selatan",
      "mapsUrl": "https://maps.google.com/?q=-6.2088,106.8456",
      "embedUrl": "https://maps.google.com/maps?q=-6.2088,106.8456&z=16&output=embed",
      "startISO": "20260614T010000Z",
      "endISO": "20260614T030000Z"
    },
    "resepsi": {
      "title": "Resepsi",
      "day": "Sabtu",
      "date": "14 Juni 2026",
      "time": "11.00 – 15.00 WIB",
      "venue": "The Rimba Garden Hall",
      "address": "Jl. Sudirman Kav. 22, Jakarta Pusat",
      "mapsUrl": "https://maps.google.com/?q=-6.2092,106.8229",
      "embedUrl": "https://maps.google.com/maps?q=-6.2092,106.8229&z=16&output=embed",
      "startISO": "20260614T040000Z",
      "endISO": "20260614T080000Z"
    }
  },
  "weddingDate": "2026-06-14T08:00:00",
  "gallery": [
    { "src": "https://picsum.photos/seed/rimba1/600/600?grayscale", "alt": "Momen bersama" },
    { "src": "https://picsum.photos/seed/rimba2/600/600?grayscale", "alt": "Senyum bahagia" },
    { "src": "https://picsum.photos/seed/rimba3/600/600?grayscale", "alt": "Kasih sayang" },
    { "src": "https://picsum.photos/seed/rimba4/600/600?grayscale", "alt": "Perjalanan cinta" },
    { "src": "https://picsum.photos/seed/rimba5/600/600?grayscale", "alt": "Kenangan indah" }
  ],
  "bankAccounts": [
    { "bank": "BCA", "name": "Pangky Pratama Putra", "number": "1234 5678 9012" },
    { "bank": "Mandiri", "name": "Radit Kusuma Wardana", "number": "9876 5432 1098" }
  ],
  "loveStory": [
    {
      "chapter": "Awal Bertemu",
      "year": "2020",
      "description": "Pertemuan tak terduga di sebuah sore yang tenang. Sebuah tatapan, sebuah senyum — dan dunia terasa berbeda.",
      "image": "https://picsum.photos/seed/story1/400/400?grayscale"
    },
    {
      "chapter": "Jatuh Cinta",
      "year": "2021",
      "description": "Perasaan itu tumbuh perlahan, seperti akar yang menghujam dalam. Tanpa disadari, hidupku sudah tak sama.",
      "image": "https://picsum.photos/seed/story2/400/400?grayscale"
    },
    {
      "chapter": "Bersama",
      "year": "2022",
      "description": "Setiap momen kecil menjadi kenangan besar. Tawa, air mata, dan segala hal di antaranya — kita lalui bersama.",
      "image": "https://picsum.photos/seed/story3/400/400?grayscale"
    },
    {
      "chapter": "Lamaran",
      "year": "2025",
      "description": "Di bawah langit senja yang jingga, dengan gentar aku bertanya — dan ia menjawab iya.",
      "image": "https://picsum.photos/seed/story4/400/400?grayscale"
    }
  ],
  "dressCode": {
    "theme": "Elegant Neutral",
    "description": "Kami mengundang Anda untuk tampil elegan bersama kami. Kenakan busana dengan warna-warna lembut dan netral yang mencerminkan keanggunan hari istimewa ini.",
    "colors": [
      { "hex": "#F0EDE6", "name": "Ivory" },
      { "hex": "#C9A84C", "name": "Champagne" },
      { "hex": "#C4A090", "name": "Dusty Rose" },
      { "hex": "#8A9E85", "name": "Sage" },
      { "hex": "#A89278", "name": "Taupe" },
      { "hex": "#1E2E42", "name": "Midnight" }
    ],
    "avoid": ["Putih murni", "Merah cerah"]
  },
  "sections": {
    "order": ["cover", "greeting", "couple", "lovestory", "akad", "resepsi", "dresscode", "gallery", "rsvp", "gift", "closing"],
    "enabled": {
      "cover": true,
      "greeting": true,
      "couple": true,
      "lovestory": true,
      "akad": true,
      "resepsi": true,
      "dresscode": true,
      "gallery": true,
      "rsvp": true,
      "gift": true,
      "closing": true
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add invitation.config.json
git commit -m "feat: add invitation.config.json as data source"
```

---

## Task 2: TypeScript Types untuk Config

**Files:**
- Create: `src/lib/config-types.ts`

- [ ] **Step 1: Buat file types**

```typescript
// src/lib/config-types.ts
export interface PersonConfig {
  name: string;
  fullName: string;
  parents: string;
  photo: string;
  instagram: string;
}

export interface EventConfig {
  title: string;
  day: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  embedUrl: string;
  startISO: string;
  endISO: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
}

export interface BankAccount {
  bank: string;
  name: string;
  number: string;
}

export interface LoveStoryChapter {
  chapter: string;
  year: string;
  description: string;
  image: string;
}

export interface DressCodeColor {
  hex: string;
  name: string;
}

export interface InvitationConfig {
  couple: {
    groom: PersonConfig;
    bride: PersonConfig;
    hashtag: string;
    quote: string;
  };
  events: {
    akad: EventConfig;
    resepsi: EventConfig;
  };
  weddingDate: string;
  gallery: GalleryItem[];
  bankAccounts: BankAccount[];
  loveStory: LoveStoryChapter[];
  dressCode: {
    theme: string;
    description: string;
    colors: DressCodeColor[];
    avoid: string[];
  };
  sections: {
    order: string[];
    enabled: Record<string, boolean>;
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/config-types.ts
git commit -m "feat: add InvitationConfig TypeScript types"
```

---

## Task 3: Refactor `invitation.ts` untuk baca dari JSON

**Files:**
- Modify: `src/data/invitation.ts`

- [ ] **Step 1: Ganti isi `invitation.ts` agar import dari JSON**

```typescript
// src/data/invitation.ts
import rawConfig from "../../invitation.config.json";
import type { InvitationConfig } from "@/lib/config-types";

const config = rawConfig as InvitationConfig;

export const couple = config.couple;

export const events = {
  akad: config.events.akad,
  resepsi: config.events.resepsi,
};

export const weddingDate = new Date(config.weddingDate);

export const gallery = config.gallery;

export const bankAccounts = config.bankAccounts;

export const loveStory = config.loveStory;

export const dressCode = config.dressCode;
```

- [ ] **Step 2: Aktifkan JSON imports di `tsconfig.json`** — buka `tsconfig.json`, pastikan `resolveJsonModule` bernilai `true`. Jika belum ada, tambahkan ke `compilerOptions`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Jalankan dev server, pastikan undangan masih tampil normal**

```bash
npm run dev
```

Buka `http://localhost:3000`. Semua section harus tampil dengan data yang sama seperti sebelumnya.

- [ ] **Step 4: Commit**

```bash
git add src/data/invitation.ts tsconfig.json
git commit -m "refactor: invitation.ts reads from invitation.config.json"
```

---

## Task 4: API Route untuk Baca/Tulis Config

**Files:**
- Create: `src/app/api/config/route.ts`

> ⚠️ Next.js 16 mungkin punya perubahan di API routes. Cek `node_modules/next/dist/docs/` jika ada error. Syntax di bawah mengikuti App Router standard.

- [ ] **Step 1: Buat API route**

```typescript
// src/app/api/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "invitation.config.json");

export async function GET() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test GET endpoint**

Pastikan dev server jalan, lalu buka browser ke:
```
http://localhost:3000/api/config
```
Expected: JSON isi undangan tampil di browser.

- [ ] **Step 3: Test POST endpoint**

```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```
Expected: `{"ok":true}` dan `invitation.config.json` berubah (cek isinya).

Setelah test, kembalikan `invitation.config.json` ke isi semula (git checkout).

```bash
git checkout invitation.config.json
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/config/route.ts
git commit -m "feat: add /api/config GET+POST route"
```

---

## Task 5: Install Puck + Studio Layout

**Files:**
- Modify: `package.json`
- Create: `src/app/studio/layout.tsx`

- [ ] **Step 1: Install `@measured/puck`**

```bash
npm install @measured/puck
```

Expected output: `added X packages`.

- [ ] **Step 2: Buat Studio layout — tanpa musik player dan snap-scroll**

```typescript
// src/app/studio/layout.tsx
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: "#0f0f0f", color: "#f0f0f0" }}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/app/studio/layout.tsx
git commit -m "feat: install puck and add studio layout"
```

---

## Task 6: SectionCard Component + Puck Config

**Files:**
- Create: `src/components/studio/SectionCard.tsx`
- Create: `src/studio/puck.config.tsx`
- Create: `src/studio/lib/config-mapping.ts`

- [ ] **Step 1: Buat SectionCard** — card yang ditampilkan di Puck canvas per section

```typescript
// src/components/studio/SectionCard.tsx
export function SectionCard({ label, description }: { label: string; description?: string }) {
  return (
    <div style={{
      padding: "16px 20px",
      border: "1px solid rgba(201,168,76,0.3)",
      borderRadius: "8px",
      background: "rgba(201,168,76,0.05)",
      margin: "4px 0",
      cursor: "grab",
    }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.05em" }}>
        {label}
      </div>
      {description && (
        <div style={{ fontSize: "12px", color: "#9A9A8E", marginTop: "4px" }}>
          {description}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Buat config-mapping.ts** — konversi antara flat config dan Puck data format

```typescript
// src/studio/lib/config-mapping.ts
import type { InvitationConfig } from "@/lib/config-types";
import type { Data } from "@measured/puck";

export function configToPuckData(config: InvitationConfig): Data {
  const sectionOrder = config.sections.order;

  const contentMap: Record<string, { type: string; props: Record<string, unknown> }> = {
    cover: {
      type: "Cover",
      props: {
        groomName: config.couple.groom.name,
        groomFullName: config.couple.groom.fullName,
        groomParents: config.couple.groom.parents,
        groomPhoto: config.couple.groom.photo,
        groomInstagram: config.couple.groom.instagram,
        brideName: config.couple.bride.name,
        brideFullName: config.couple.bride.fullName,
        brideParents: config.couple.bride.parents,
        bridePhoto: config.couple.bride.photo,
        brideInstagram: config.couple.bride.instagram,
        hashtag: config.couple.hashtag,
        quote: config.couple.quote,
        weddingDate: config.weddingDate,
      },
    },
    greeting: { type: "Greeting", props: {} },
    couple: { type: "Couple", props: {} },
    lovestory: {
      type: "LoveStory",
      props: {
        chapters: JSON.stringify(config.loveStory),
      },
    },
    akad: {
      type: "EventAkad",
      props: {
        title: config.events.akad.title,
        day: config.events.akad.day,
        date: config.events.akad.date,
        time: config.events.akad.time,
        venue: config.events.akad.venue,
        address: config.events.akad.address,
        mapsUrl: config.events.akad.mapsUrl,
        embedUrl: config.events.akad.embedUrl,
        startISO: config.events.akad.startISO,
        endISO: config.events.akad.endISO,
      },
    },
    resepsi: {
      type: "EventResepsi",
      props: {
        title: config.events.resepsi.title,
        day: config.events.resepsi.day,
        date: config.events.resepsi.date,
        time: config.events.resepsi.time,
        venue: config.events.resepsi.venue,
        address: config.events.resepsi.address,
        mapsUrl: config.events.resepsi.mapsUrl,
        embedUrl: config.events.resepsi.embedUrl,
        startISO: config.events.resepsi.startISO,
        endISO: config.events.resepsi.endISO,
      },
    },
    dresscode: {
      type: "DressCode",
      props: {
        theme: config.dressCode.theme,
        description: config.dressCode.description,
      },
    },
    gallery: {
      type: "Gallery",
      props: {
        images: JSON.stringify(config.gallery),
      },
    },
    rsvp: { type: "RSVP", props: {} },
    gift: {
      type: "Gift",
      props: {
        accounts: JSON.stringify(config.bankAccounts),
      },
    },
    closing: {
      type: "Closing",
      props: {
        hashtag: config.couple.hashtag,
        quote: config.couple.quote,
      },
    },
  };

  const content = sectionOrder
    .filter((id) => config.sections.enabled[id])
    .map((id) => ({
      type: contentMap[id]?.type ?? id,
      props: contentMap[id]?.props ?? {},
    }));

  return { root: { props: {} }, content } as Data;
}

export function puckDataToConfig(
  data: Data,
  existingConfig: InvitationConfig
): InvitationConfig {
  const config = structuredClone(existingConfig);

  const order: string[] = [];
  const enabled: Record<string, boolean> = Object.fromEntries(
    Object.keys(existingConfig.sections.enabled).map((k) => [k, false])
  );

  const typeToId: Record<string, string> = {
    Cover: "cover", Greeting: "greeting", Couple: "couple",
    LoveStory: "lovestory", EventAkad: "akad", EventResepsi: "resepsi",
    DressCode: "dresscode", Gallery: "gallery", RSVP: "rsvp",
    Gift: "gift", Closing: "closing",
  };

  for (const item of data.content) {
    const id = typeToId[item.type];
    if (!id) continue;
    order.push(id);
    enabled[id] = true;

    const p = item.props as Record<string, string>;

    if (item.type === "Cover") {
      config.couple.groom.name = p.groomName ?? config.couple.groom.name;
      config.couple.groom.fullName = p.groomFullName ?? config.couple.groom.fullName;
      config.couple.groom.parents = p.groomParents ?? config.couple.groom.parents;
      config.couple.groom.photo = p.groomPhoto ?? config.couple.groom.photo;
      config.couple.groom.instagram = p.groomInstagram ?? config.couple.groom.instagram;
      config.couple.bride.name = p.brideName ?? config.couple.bride.name;
      config.couple.bride.fullName = p.brideFullName ?? config.couple.bride.fullName;
      config.couple.bride.parents = p.brideParents ?? config.couple.bride.parents;
      config.couple.bride.photo = p.bridePhoto ?? config.couple.bride.photo;
      config.couple.bride.instagram = p.brideInstagram ?? config.couple.bride.instagram;
      config.couple.hashtag = p.hashtag ?? config.couple.hashtag;
      config.couple.quote = p.quote ?? config.couple.quote;
      config.weddingDate = p.weddingDate ?? config.weddingDate;
    }

    if (item.type === "EventAkad") {
      config.events.akad = {
        ...config.events.akad,
        title: p.title ?? config.events.akad.title,
        day: p.day ?? config.events.akad.day,
        date: p.date ?? config.events.akad.date,
        time: p.time ?? config.events.akad.time,
        venue: p.venue ?? config.events.akad.venue,
        address: p.address ?? config.events.akad.address,
        mapsUrl: p.mapsUrl ?? config.events.akad.mapsUrl,
        embedUrl: p.embedUrl ?? config.events.akad.embedUrl,
        startISO: p.startISO ?? config.events.akad.startISO,
        endISO: p.endISO ?? config.events.akad.endISO,
      };
    }

    if (item.type === "EventResepsi") {
      config.events.resepsi = {
        ...config.events.resepsi,
        title: p.title ?? config.events.resepsi.title,
        day: p.day ?? config.events.resepsi.day,
        date: p.date ?? config.events.resepsi.date,
        time: p.time ?? config.events.resepsi.time,
        venue: p.venue ?? config.events.resepsi.venue,
        address: p.address ?? config.events.resepsi.address,
        mapsUrl: p.mapsUrl ?? config.events.resepsi.mapsUrl,
        embedUrl: p.embedUrl ?? config.events.resepsi.embedUrl,
        startISO: p.startISO ?? config.events.resepsi.startISO,
        endISO: p.endISO ?? config.events.resepsi.endISO,
      };
    }

    if (item.type === "Gift" && p.accounts) {
      try { config.bankAccounts = JSON.parse(p.accounts); } catch { /* keep existing */ }
    }

    if (item.type === "Gallery" && p.images) {
      try { config.gallery = JSON.parse(p.images); } catch { /* keep existing */ }
    }

    if (item.type === "LoveStory" && p.chapters) {
      try { config.loveStory = JSON.parse(p.chapters); } catch { /* keep existing */ }
    }

    if (item.type === "DressCode") {
      config.dressCode.theme = p.theme ?? config.dressCode.theme;
      config.dressCode.description = p.description ?? config.dressCode.description;
    }
  }

  config.sections.order = order;
  config.sections.enabled = { ...existingConfig.sections.enabled, ...enabled };

  return config;
}
```

- [ ] **Step 3: Buat puck.config.tsx** — definisi semua section sebagai Puck components

```typescript
// src/studio/puck.config.tsx
import type { Config } from "@measured/puck";
import { SectionCard } from "@/components/studio/SectionCard";

export const puckConfig: Config = {
  components: {
    Cover: {
      label: "Cover",
      fields: {
        groomName:      { type: "text", label: "Nama Mempelai Pria" },
        groomFullName:  { type: "text", label: "Nama Lengkap Pria" },
        groomParents:   { type: "text", label: "Orang Tua Pria" },
        groomPhoto:     { type: "text", label: "URL Foto Pria" },
        groomInstagram: { type: "text", label: "Instagram Pria" },
        brideName:      { type: "text", label: "Nama Mempelai Wanita" },
        brideFullName:  { type: "text", label: "Nama Lengkap Wanita" },
        brideParents:   { type: "text", label: "Orang Tua Wanita" },
        bridePhoto:     { type: "text", label: "URL Foto Wanita" },
        brideInstagram: { type: "text", label: "Instagram Wanita" },
        hashtag:        { type: "text", label: "Hashtag" },
        quote:          { type: "textarea", label: "Quote" },
        weddingDate:    { type: "text", label: "Tanggal Pernikahan (ISO)" },
      },
      render: ({ groomName, brideName }) => (
        <SectionCard label="Cover" description={`${groomName} & ${brideName}`} />
      ),
      defaultProps: {
        groomName: "", groomFullName: "", groomParents: "",
        groomPhoto: "", groomInstagram: "",
        brideName: "", brideFullName: "", brideParents: "",
        bridePhoto: "", brideInstagram: "",
        hashtag: "", quote: "", weddingDate: "",
      },
    },

    Greeting: {
      label: "Greeting",
      fields: {},
      render: () => <SectionCard label="Greeting" description="Salam pembuka + nama tamu" />,
      defaultProps: {},
    },

    Couple: {
      label: "Couple",
      fields: {},
      render: () => <SectionCard label="Couple" description="Profil mempelai (dari data Cover)" />,
      defaultProps: {},
    },

    LoveStory: {
      label: "Love Story",
      fields: {
        chapters: { type: "textarea", label: "Chapters (JSON array)" },
      },
      render: () => <SectionCard label="Love Story" description="Carousel perjalanan cinta" />,
      defaultProps: { chapters: "[]" },
    },

    EventAkad: {
      label: "Event — Akad",
      fields: {
        title:    { type: "text", label: "Judul" },
        day:      { type: "text", label: "Hari" },
        date:     { type: "text", label: "Tanggal" },
        time:     { type: "text", label: "Waktu" },
        venue:    { type: "text", label: "Venue" },
        address:  { type: "text", label: "Alamat" },
        mapsUrl:  { type: "text", label: "Google Maps URL" },
        embedUrl: { type: "text", label: "Google Maps Embed URL" },
        startISO: { type: "text", label: "Start ISO (calendar)" },
        endISO:   { type: "text", label: "End ISO (calendar)" },
      },
      render: ({ venue }) => (
        <SectionCard label="Event — Akad" description={venue as string} />
      ),
      defaultProps: {
        title: "", day: "", date: "", time: "",
        venue: "", address: "", mapsUrl: "", embedUrl: "",
        startISO: "", endISO: "",
      },
    },

    EventResepsi: {
      label: "Event — Resepsi",
      fields: {
        title:    { type: "text", label: "Judul" },
        day:      { type: "text", label: "Hari" },
        date:     { type: "text", label: "Tanggal" },
        time:     { type: "text", label: "Waktu" },
        venue:    { type: "text", label: "Venue" },
        address:  { type: "text", label: "Alamat" },
        mapsUrl:  { type: "text", label: "Google Maps URL" },
        embedUrl: { type: "text", label: "Google Maps Embed URL" },
        startISO: { type: "text", label: "Start ISO (calendar)" },
        endISO:   { type: "text", label: "End ISO (calendar)" },
      },
      render: ({ venue }) => (
        <SectionCard label="Event — Resepsi" description={venue as string} />
      ),
      defaultProps: {
        title: "", day: "", date: "", time: "",
        venue: "", address: "", mapsUrl: "", embedUrl: "",
        startISO: "", endISO: "",
      },
    },

    DressCode: {
      label: "Dress Code",
      fields: {
        theme:       { type: "text", label: "Tema" },
        description: { type: "textarea", label: "Deskripsi" },
      },
      render: ({ theme }) => (
        <SectionCard label="Dress Code" description={theme as string} />
      ),
      defaultProps: { theme: "", description: "" },
    },

    Gallery: {
      label: "Gallery",
      fields: {
        images: { type: "textarea", label: "Gambar (JSON array of {src, alt})" },
      },
      render: () => <SectionCard label="Gallery" description="WebGL 3D globe" />,
      defaultProps: { images: "[]" },
    },

    RSVP: {
      label: "RSVP",
      fields: {},
      render: () => <SectionCard label="RSVP" description="Form konfirmasi kehadiran" />,
      defaultProps: {},
    },

    Gift: {
      label: "Gift",
      fields: {
        accounts: { type: "textarea", label: "Rekening (JSON array of {bank, name, number})" },
      },
      render: () => <SectionCard label="Gift" description="Amplop digital" />,
      defaultProps: { accounts: "[]" },
    },

    Closing: {
      label: "Closing",
      fields: {
        hashtag: { type: "text", label: "Hashtag" },
        quote:   { type: "textarea", label: "Quote penutup" },
      },
      render: ({ hashtag }) => (
        <SectionCard label="Closing" description={hashtag as string} />
      ),
      defaultProps: { hashtag: "", quote: "" },
    },
  },
};
```

- [ ] **Step 4: Commit**

```bash
git add src/components/studio/SectionCard.tsx src/studio/puck.config.tsx src/studio/lib/config-mapping.ts
git commit -m "feat: add Puck config and config mapping utilities"
```

---

## Task 7: Studio Page

**Files:**
- Create: `src/app/studio/page.tsx`

- [ ] **Step 1: Buat Studio page**

```typescript
// src/app/studio/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/studio/puck.config";
import { configToPuckData, puckDataToConfig } from "@/studio/lib/config-mapping";
import type { InvitationConfig } from "@/lib/config-types";

const PREVIEW_MOBILE_WIDTH = 390;
const PREVIEW_DESKTOP_WIDTH = 1280;

export default function StudioPage() {
  const [puckData, setPuckData] = useState<Data | null>(null);
  const [rawConfig, setRawConfig] = useState<InvitationConfig | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number>(PREVIEW_MOBILE_WIDTH);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((config: InvitationConfig) => {
        setRawConfig(config);
        setPuckData(configToPuckData(config));
      });
  }, []);

  const handlePublish = async (data: Data) => {
    if (!rawConfig) return;
    setSaveStatus("saving");
    const newConfig = puckDataToConfig(data, rawConfig);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) throw new Error("Save failed");
      setRawConfig(newConfig);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  if (!puckData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#C9A84C" }}>
        Loading Rimba Studio...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{
        height: "48px", background: "#0A0A08", borderBottom: "1px solid rgba(201,168,76,0.2)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: "12px",
        fontSize: "13px", color: "#9A9A8E",
      }}>
        <span style={{ color: "#C9A84C", fontWeight: 600, marginRight: "auto" }}>◆ Rimba Studio</span>
        <button
          onClick={() => setPreviewWidth(PREVIEW_MOBILE_WIDTH)}
          style={{
            padding: "4px 12px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.3)",
            background: previewWidth === PREVIEW_MOBILE_WIDTH ? "rgba(201,168,76,0.15)" : "transparent",
            color: "#C9A84C", cursor: "pointer", fontSize: "12px",
          }}
        >
          Mobile (390px)
        </button>
        <button
          onClick={() => setPreviewWidth(PREVIEW_DESKTOP_WIDTH)}
          style={{
            padding: "4px 12px", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.3)",
            background: previewWidth === PREVIEW_DESKTOP_WIDTH ? "rgba(201,168,76,0.15)" : "transparent",
            color: "#C9A84C", cursor: "pointer", fontSize: "12px",
          }}
        >
          Desktop (1280px)
        </button>
        {saveStatus === "saving" && <span style={{ color: "#9A9A8E" }}>Menyimpan...</span>}
        {saveStatus === "saved"  && <span style={{ color: "#4CAF50" }}>✓ Tersimpan</span>}
        {saveStatus === "error"  && <span style={{ color: "#ef4444" }}>✗ Gagal simpan</span>}
      </div>

      {/* Editor + Preview */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Puck editor (kiri) */}
        <div style={{ flex: "0 0 480px", overflow: "auto", borderRight: "1px solid rgba(201,168,76,0.2)" }}>
          <Puck
            config={puckConfig}
            data={puckData}
            onPublish={handlePublish}
            overrides={{
              headerActions: () => null,
            }}
          />
        </div>

        {/* Preview iframe (kanan) */}
        <div style={{
          flex: 1, background: "#1a1a1a", display: "flex",
          alignItems: "flex-start", justifyContent: "center",
          overflow: "auto", padding: "24px",
        }}>
          <div style={{
            width: `${previewWidth}px`,
            height: "844px",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 0 40px rgba(0,0,0,0.5)",
            flexShrink: 0,
          }}>
            <iframe
              src="http://localhost:3000"
              width={previewWidth}
              height="844"
              style={{ border: "none", display: "block" }}
              title="Invitation Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Jalankan dev server dan buka Studio**

```bash
npm run dev
```

Buka `http://localhost:3000/studio`.

Expected:
- Toolbar "◆ Rimba Studio" muncul di atas
- Panel Puck di kiri menampilkan section cards yang bisa di-drag
- Preview iframe di kanan menampilkan undangan

- [ ] **Step 3: Test full flow**

1. Di panel Puck kiri, klik section "Cover"
2. Di panel fields (kanan Puck), ubah "Nama Mempelai Pria" menjadi nama lain
3. Klik tombol "Publish" di Puck
4. Expected: `invitation.config.json` terupdate, preview iframe reload otomatis via HMR

- [ ] **Step 4: Commit**

```bash
git add src/app/studio/page.tsx
git commit -m "feat: add Rimba Studio page with Puck editor and preview iframe"
```

---

## Task 8: Smoke Test & Polish

- [ ] **Step 1: Verifikasi undangan masih normal di `localhost:3000`**

Buka `http://localhost:3000`. Semua section (Cover, Couple, Event, dll) harus tampil dengan data dari `invitation.config.json`.

- [ ] **Step 2: Test reorder section di Studio**

Di Puck canvas, drag section "Gift" ke posisi sebelum "RSVP". Klik Publish. Buka `invitation.config.json` dan verifikasi `sections.order` sudah berubah.

> ⚠️ Catatan: `page.tsx` undangan saat ini menggunakan urutan hardcoded. Setelah Phase 1 selesai, `page.tsx` perlu diupdate untuk render sections berdasarkan `config.sections.order`. Ini bisa jadi task terpisah jika scope Phase 1 sudah cukup.

- [ ] **Step 3: Test edit konten event**

Di Studio, klik section "Event — Akad", ubah field "Venue" menjadi nama tempat lain, Publish. Verifikasi perubahan muncul di preview.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Rimba Studio Phase 1 complete"
```

---

## Catatan Implementasi

**HMR dan JSON imports:**
Next.js akan watch file JSON yang di-import secara statis. Karena `invitation.ts` melakukan `import rawConfig from "../../invitation.config.json"`, setiap kali API route menulis ke file tersebut, Next.js dev server akan mendeteksi perubahan dan trigger HMR — sehingga preview iframe reload otomatis.

**Puck `overrides.headerActions`:**
Puck menampilkan header dengan tombol Publish dan actions lain. `overrides: { headerActions: () => null }` menyembunyikan default header actions agar tidak duplikat dengan toolbar custom di atas.

**Section order di `page.tsx`:**
Saat ini `page.tsx` merender sections dalam urutan hardcoded. Untuk Phase 1, ini acceptable — reorder bisa dilihat di `invitation.config.json`. Implementasi dynamic render berdasarkan `config.sections.order` bisa dilakukan di iterasi berikutnya.
