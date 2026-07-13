# Prada Melati — Vinyl Music Player

Tanggal: 2026-07-13

## Ringkasan

Ganti komponen `MusicPlayer.tsx` yang sekarang (bar gold dengan waveform) dengan
piringan hitam (vinyl) mini adaptasi dari Componentry. Player tetap *floating* &
`fixed` di pojok kanan-bawah, berukuran kecil (~72–80px), berputar saat lagu
dimainkan, dengan *tonearm* yang mengayun. Sumber lagu & cover art dibaca dari
`invitation.config.json`.

Keputusan yang sudah disepakati:
- **Placement:** floating pojok kanan-bawah, vinyl diperkecil (~72px mobile / ~80px desktop).
- **Perilaku dipertahankan:** autoplay saat `invitation-open`, loop, warna gold tema, muncul dengan delay (~2s).
- **Sumber data:** blok `music` di `invitation.config.json` (data-driven, seperti field lain).

## Sumber data — blok `music` di config

Tambah blok opsional ke `invitation.config.json`:

```jsonc
"music": {
  "src": "/music/prada-melati.mp3",     // path/URL literal file audio
  "coverArt": "/images/vinyl-label.png", // path/URL literal gambar label
  "title": "Judul Lagu",
  "artist": "Nama Artis"
}
```

Catatan:
- `src` dan `coverArt` adalah string literal — **tidak** dilewatkan `asset()`
  (helper itu khusus gambar tema WebP/PNG; file audio & label vinyl di-set langsung
  oleh pembuat undangan).
- Blok `music` **opsional**. Kalau tidak ada di config, `<MusicPlayer>` tidak
  dirender sama sekali.

### Perubahan tipe (`src/lib/config-types.ts`)

```ts
export interface MusicConfig {
  src: string;
  coverArt: string;
  title: string;
  artist: string;
}
```

Tambah field opsional ke `InvitationConfig`:

```ts
music?: MusicConfig;
```

### Perubahan `src/app/page.tsx`

`page.tsx` meneruskan `config.music` ke komponen:

```tsx
{config.music && <MusicPlayer music={config.music} />}
```

## Komponen `MusicPlayer.tsx` (rewrite)

Adaptasi source Componentry — bukan salin mentah.

**Dibuang dari source Componentry:**
- Jalur YouTube (`getYoutubeId`, `<iframe>`, `postMessage`) — sumber di sini mp3
  lokal + loop. YAGNI.
- Import `@/lib/utils` (`cn`) — helper itu tidak ada di repo. Kelas ditulis
  langsung atau digabung dengan template string sederhana.
- Prop `autoPlay` sebagai satu-satunya pemicu — diganti mekanisme event tema
  (lihat "Perilaku").

**Dipertahankan dari source Componentry (wujud visual):**
- Disc `animate-spin` dengan `animationDuration: "4s"` dan
  `animationPlayState: isPlaying ? "running" : "paused"`.
- Overlay grooves (radial-gradient rings) dan glare (linear-gradient).
- Cover art sebagai `background-image` disc.
- Tonearm mengayun via `framer-motion` (`rotate` beda antara idle & play,
  `transition` easeInOut ~0.5s).
- Center label + lubang tengah.

**Perubahan ukuran & warna:**
- Ukuran: ~72px (mobile) / ~80px (desktop), menggantikan `h-64 w-64 md:h-80 md:w-80`.
  Tonearm, base, needle, dan center diperkecil proporsional (border disc dikurangi
  supaya tidak dominan di ukuran kecil).
- Warna gold tema (via CSS var, konsisten dengan komponen lain):
  - Center label: `var(--surface2)` / border `var(--gold)`.
  - Tonearm base & stick: nuansa gold-dim (`var(--gold-dim)`), needle `var(--gold)`.
  - Cover art tetap jadi latar disc.

**Prop komponen:**

```ts
interface MusicPlayerProps {
  music: MusicConfig;
}
```

## Perilaku yang dipertahankan (dari player lama)

- **Autoplay on open:** `useEffect` memasang listener `document` untuk event
  `"invitation-open"` (di-dispatch oleh CoverSection). Saat kejadian →
  `audio.play().then(() => setPlaying(true)).catch(() => {})`.
- **Loop:** `audio.loop = true`.
- **Delayed appearance:** state `visible`, fade-in lewat `AnimatePresence`
  (`opacity/y`) setelah `setTimeout` ~2000ms.
- **Toggle:** klik pada disc = play/pause (menggantikan tombol terpisah).
  Di-guard oleh state `ready` (`oncanplaythrough`).
- **Cleanup:** `clearTimeout`, lepas listener, `audio.pause()` saat unmount.

**Implementasi audio:** pakai elemen `<audio ref={audioRef}>` yang di-mount
(hidden) dengan `src={music.src}` — bukan `new Audio()` — supaya `src` reaktif
dari config. `audio.loop` di-set lewat atribut/efek.

## Yang dihapus

- CSS `.music-player-bar` di `src/app/globals.css` (dipakai hanya oleh bar lama).
- Konstanta `MUSIC_SRC` / `SONG_TITLE` / `SONG_ARTIST` di komponen (pindah ke config).
- Import `Play` / `Pause` dari `lucide-react` (tombol terpisah hilang; toggle via klik disc).

## Testing & verifikasi

- `bun run typecheck` — tipe `MusicConfig` & prop komponen valid.
- `bun run lint`.
- `bun run test:motion` — pastikan tidak ada regresi pada test motion yang ada.
- Verifikasi visual pakai skill `theme-screenshot`: disc kecil di pojok
  kanan-bawah, tonearm posisi idle vs play, tidak menutupi konten di mobile.

## Dependensi

`framer-motion` sudah terpasang (v12.38 di `package.json`). Tidak perlu
`bun add` paket baru.
