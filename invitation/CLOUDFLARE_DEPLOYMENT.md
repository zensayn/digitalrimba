# Cloudflare Workers: Development, Deployment, dan Maintenance

Panduan ini menjelaskan alur perubahan tema Next.js di folder `invitation`, pengujian lokal, deployment ke Cloudflare Workers, monitoring, rollback, dan maintenance rutin.

## Ringkasan cepat

Untuk perubahan normal pada satu tema:

```powershell
Set-Location themes\adat\kenangan\warm-narrative

bun install
bun dev
bun run lint
bun run preview
bun run deploy
```

Sesudah deploy, buka domain production dan periksa Workers Logs.

Jangan deploy langsung setelah hanya menjalankan `bun dev`. `bun run preview` diperlukan karena aplikasi production dijalankan melalui OpenNext dan Cloudflare Workers, bukan Next.js development server.

## Daftar tema

| Tema | Folder | Worker | Domain production | Status |
|---|---|---|---|---|
| Warm Narrative | `themes/adat/kenangan/warm-narrative` | `rimba-warm-narrative` | [warm-narrative.rimba.io](https://warm-narrative.rimba.io) | Live |
| Sacred Luxe | `themes/adat/kenangan/sacred-luxe` | `rimba-sacred-luxe` | [sacred-luxe.rimba.io](https://sacred-luxe.rimba.io) | Live |
| Sinema Kisah | `themes/adat/kisah/sinema-kisah` | `rimba-sinema-kisah` | [sinema-kisah.rimba.io](https://sinema-kisah.rimba.io) | Live |
| Soft Bloom | `themes/floral/kenangan/soft-bloom` | `rimba-soft-bloom` | [soft-bloom.rimba.io](https://soft-bloom.rimba.io) | Live |

Perbarui tabel ini setelah Worker atau domain baru diaktifkan.

## Prasyarat

- Bun terpasang.
- Node.js terpasang.
- Wrangler tersedia dari dependency tema.
- Akun Cloudflare sudah terautentikasi.

Periksa versi dan sesi Cloudflare:

```powershell
bunx wrangler --version
bunx wrangler whoami
```

Wrangler yang digunakan saat panduan ini ditulis adalah `4.105.0`.

Jika sesi login sudah kedaluwarsa:

```powershell
bunx wrangler login
```

## Alur kerja perubahan sehari-hari

### 1. Masuk ke folder tema

Contoh Warm Narrative:

```powershell
Set-Location themes\adat\kenangan\warm-narrative
```

Contoh tema lain:

```powershell
Set-Location themes\adat\kenangan\sacred-luxe
Set-Location themes\adat\kisah\sinema-kisah
Set-Location themes\floral\kenangan\soft-bloom
```

Semua perintah berikut dijalankan dari folder tema yang sedang dikerjakan.

### 2. Sinkronkan dependency

Jalankan setelah menarik perubahan dari Git atau setelah `package.json`/`bun.lock` berubah:

```powershell
bun install
```

Tidak perlu menjalankannya untuk setiap perubahan CSS atau komponen jika dependency tidak berubah.

### 3. Kerjakan dan uji dengan Next.js

```powershell
bun dev
```

Gunakan ini untuk iterasi UI sehari-hari. Next.js development tetap memakai Turbopack.

Sebelum melanjutkan:

- buka halaman yang berubah;
- periksa desktop dan mobile;
- pastikan gambar, font, audio, animasi, dan link eksternal bekerja;
- periksa browser console;
- hentikan server dengan `Ctrl+C`.

### 4. Jalankan pemeriksaan kode

Semua tema:

```powershell
bun run lint
```

Sinema Kisah juga mempunyai pemeriksaan TypeScript terpisah:

```powershell
bun run typecheck
```

Build production memakai Webpack secara sengaja:

```json
"build": "next build --webpack"
```

Jangan menghapus flag `--webpack`. Next.js 16 memakai Turbopack sebagai default production build, sedangkan kombinasi Turbopack, OpenNext, dan Windows sebelumnya menyebabkan `ChunkLoadError` di Worker.

### 5. Uji sebagai Cloudflare Worker lokal

```powershell
bun run preview
```

Perintah ini:

1. menjalankan `next build --webpack`;
2. membuat bundle OpenNext di `.open-next`;
3. menjalankan Worker lokal melalui Wrangler.

Wrangler akan menampilkan URL seperti:

```text
http://127.0.0.1:8787
```

Setelah pemeriksaan selesai, hentikan preview dengan `Ctrl+C` sebelum menjalankan deploy.

Checklist preview:

- halaman utama mengembalikan HTTP 200;
- tidak ada `ChunkLoadError`;
- asset `_next`, gambar, audio, dan font berhasil dimuat;
- tidak ada error 500 di terminal;
- fitur interaktif tetap bekerja setelah production build.

OpenNext menampilkan peringatan bahwa Windows belum didukung penuh. Peringatan tersebut boleh diterima selama build selesai dan smoke test Worker lulus. Jika muncul kegagalan yang tidak konsisten, ulangi melalui WSL sebelum mengubah kode.

## Deployment production

### Checklist sebelum deploy

- perubahan sudah direview melalui `git diff`;
- perubahan sebaiknya sudah berada pada commit yang dapat diidentifikasi;
- lint dan typecheck yang tersedia sudah lulus;
- `bun run preview` mengembalikan HTTP 200;
- `.env.local` memiliki nilai build yang benar;
- `wrangler.jsonc` menunjuk Worker dan domain yang benar;
- tidak ada secret di source code atau `wrangler.jsonc`;
- perubahan sudah siap ditampilkan ke pengguna production.

Lihat perubahan sebelum deploy:

```powershell
git status --short
git diff
```

### Dry-run

Dry-run memvalidasi bundle tanpa mengubah Worker production:

```powershell
bunx wrangler deploy --dry-run
```

Periksa:

- proses exit tanpa error;
- asset berhasil dibaca;
- binding yang muncul sesuai dengan `wrangler.jsonc`;
- ukuran bundle tidak meningkat secara tidak wajar.

### Deploy

```powershell
bun run deploy
```

Perintah ini membangun ulang aplikasi dan mengirim Worker beserta static assets ke Cloudflare.

Untuk perubahan aplikasi, selalu gunakan `bun run deploy`. Jangan menggantinya dengan `bunx wrangler deploy`, karena Wrangler dapat memakai bundle `.open-next` lama tanpa menjalankan ulang `next build`. `bunx wrangler deploy` hanya aman untuk perubahan konfigurasi Worker setelah bundle aplikasi sudah dipastikan terbaru.

Jangan menutup terminal sampai muncul:

- `OpenNext build complete`;
- `Uploaded <worker-name>`;
- `Deployed <worker-name> triggers`;
- `Current Version ID`.

Simpan Version ID di catatan perubahan atau deskripsi commit/PR. ID tersebut berguna untuk investigasi dan rollback.

### Verifikasi setelah deploy

Contoh Warm Narrative:

```powershell
$response = Invoke-WebRequest `
  -Uri "https://warm-narrative.rimba.io/" `
  -UseBasicParsing `
  -TimeoutSec 30

$response.StatusCode
$response.Headers["Content-Type"]
```

Hasil yang diharapkan:

```text
200
text/html; charset=utf-8
```

Lanjutkan dengan pemeriksaan manual:

- hard refresh halaman;
- buka halaman di private/incognito window;
- periksa layout mobile;
- periksa asset dari `assets-themes.rimba.io`;
- periksa foto dari `assets-invitations.rimba.io`;
- periksa browser console dan network request;
- pantau log selama beberapa menit.

## Environment variables

Konfigurasi saat ini memakai:

```text
NEXT_PUBLIC_THEMES_CDN=https://assets-themes.rimba.io
NEXT_PUBLIC_PHOTOS_CDN=https://assets-invitations.rimba.io
```

Soft Bloom hanya memakai `NEXT_PUBLIC_THEMES_CDN`; tanpa nilai tersebut, tema ini fallback ke `public/images` saat development (lihat `src/lib/assets.ts`).

### Aturan penting untuk `NEXT_PUBLIC_*`

Nilai `NEXT_PUBLIC_*` dimasukkan ke JavaScript bundle pada saat `next build`. Karena itu:

- deployment lokal membaca nilai build dari `.env.local`;
- perubahan pada Cloudflare runtime variables saja tidak mengubah nilai yang sudah tertanam di bundle;
- sesudah mengubah nilai, jalankan build dan deploy ulang;
- pada CI/CD, nilai harus tersedia sebagai build environment variable sebelum OpenNext menjalankan `next build`.

Untuk konfigurasi non-secret, samakan nilai `.env.local` dan `vars` di `wrangler.jsonc` agar local build dan runtime tidak berbeda.

### Secret

Jangan menaruh token, password, private key, atau API key di:

- `NEXT_PUBLIC_*`;
- `wrangler.jsonc`;
- source code;
- command history.

Gunakan prompt interaktif Wrangler:

```powershell
bunx wrangler secret put NAMA_SECRET
```

Periksa nama secret tanpa melihat nilainya:

```powershell
bunx wrangler secret list
```

## Worker configuration

File utama:

```text
wrangler.jsonc
open-next.config.ts
package.json
```

`wrangler.jsonc` adalah source of truth untuk:

- nama Worker;
- compatibility date dan flags;
- static asset binding;
- environment variables non-secret;
- observability;
- custom domain;
- status `workers.dev` dan preview URL.

Konfigurasi production Warm Narrative secara sengaja menggunakan:

```jsonc
"workers_dev": false,
"preview_urls": false
```

Dengan demikian aplikasi hanya dapat diakses melalui custom domain production. Jangan mengubah nilai tersebut tanpa alasan operasional yang jelas.

## Logs dan monitoring

### Live logs dari terminal

Dari folder tema:

```powershell
bunx wrangler tail
```

Hanya error:

```powershell
bunx wrangler tail --status error
```

Format JSON:

```powershell
bunx wrangler tail --format json
```

Hentikan dengan `Ctrl+C`.

### Dashboard

Buka Cloudflare Dashboard:

1. Workers & Pages;
2. pilih Worker;
3. buka Logs atau Observability;
4. filter status 5xx, exception, atau request ke URL tertentu.

Semua Worker menyimpan Workers Logs dengan sampling 100%. Untuk traffic tinggi, sampling dapat diturunkan setelah volume dan biaya dievaluasi.

### Yang perlu dipantau setelah deploy

- lonjakan HTTP 5xx;
- uncaught exception;
- asset 404;
- waktu respons yang meningkat;
- ukuran upload yang melonjak;
- request ke CDN yang gagal;
- perbedaan visual antara preview dan production.

## Rollback

Rollback digunakan jika production mengalami error setelah deployment.

### Lihat deployment dan version

```powershell
bunx wrangler deployments status
bunx wrangler deployments list
bunx wrangler versions list
```

### Rollback ke version sebelumnya

```powershell
bunx wrangler rollback
```

Rollback ke Version ID tertentu:

```powershell
bunx wrangler rollback <VERSION_ID>
```

Rollback langsung mengganti version yang melayani seluruh route dan custom domain Worker. Setelah rollback:

1. verifikasi domain production;
2. periksa Workers Logs;
3. catat Version ID yang bermasalah;
4. perbaiki source code lokal;
5. deploy ulang hanya setelah preview lulus.

Rollback Worker tidak membatalkan perubahan source code lokal atau Git. Jika masalah berasal dari konfigurasi domain/binding, perbaiki `wrangler.jsonc` dan deploy ulang karena rollback version belum tentu membalikkan seluruh perubahan konfigurasi.

## Maintenance rutin

### Setiap deployment

- jalankan lint/typecheck;
- jalankan Worker preview;
- lakukan dry-run untuk perubahan konfigurasi atau dependency;
- simpan Version ID;
- smoke test production;
- pantau logs sesudah deploy.

### Mingguan

- buka Workers Observability;
- periksa 5xx dan exception;
- cek custom domain tetap aktif;
- cek CDN gambar dan foto;
- periksa penggunaan Worker dan anomali traffic.

Untuk situs dengan traffic rendah, pemeriksaan ini dapat dilakukan setelah setiap perubahan production dan setidaknya sekali per minggu.

### Bulanan

- jalankan `bun outdated` pada tiap tema;
- review changelog Next.js, OpenNext, dan Wrangler;
- update patch/minor dependency secara bertahap, satu kelompok per perubahan;
- jalankan lint, typecheck, preview, dan smoke test semua tema;
- cek ukuran Worker dan jumlah static assets;
- review apakah sampling log 100% masih sesuai;
- pastikan OAuth Cloudflare hanya dimiliki akun yang berwenang.

Jangan memperbarui Next.js, `@opennextjs/cloudflare`, dan Wrangler sekaligus tanpa canary test. Mulai dari Warm Narrative, lalu lanjutkan tema lain setelah stabil.

### Setiap tiga bulan

- review dan perbarui `compatibility_date`;
- periksa Cloudflare Workers changelog untuk perubahan runtime;
- uji compatibility date baru secara lokal;
- deploy ke satu Worker canary;
- pantau log sebelum menyamakan konfigurasi tema lain;
- review DNS, custom domain, certificate, dan Worker yang tidak lagi digunakan;
- lakukan latihan rollback agar prosedurnya tetap diketahui.

Compatibility date tidak perlu diubah pada setiap perubahan UI. Perbarui secara sengaja sebagai maintenance tersendiri agar perubahan runtime mudah diisolasi.

### Saat upgrade besar

Upgrade mayor Next.js, React, OpenNext, atau Wrangler harus diperlakukan sebagai pekerjaan terpisah:

1. baca migration guide dan changelog;
2. buat branch khusus;
3. upgrade satu tema;
4. jalankan full build dan Worker preview;
5. cek route, asset, hydration, dan runtime logs;
6. deploy canary;
7. tunggu hasil monitoring;
8. terapkan ke tema lain.

Pertahankan `"build": "next build --webpack"` sampai OpenNext dan lingkungan Windows sudah diverifikasi aman dengan Turbopack.

## Menyiapkan tema baru

Tema baru minimal membutuhkan:

```text
package.json
wrangler.jsonc
open-next.config.ts
.gitignore
```

Checklist:

- nama Worker unik;
- dependency `@opennextjs/cloudflare` dan `wrangler` tersedia;
- build memakai `next build --webpack`;
- `.open-next/` masuk `.gitignore`;
- `nodejs_compat` aktif;
- compatibility date ditentukan;
- Workers Logs aktif;
- domain tidak bentrok dengan DNS yang sudah ada;
- `workers_dev` dan `preview_urls` ditentukan eksplisit;
- preview lokal lulus sebelum deployment pertama.

Lakukan deployment pertama ke `workers.dev` bila perlu untuk canary. Setelah sehat, pasang custom domain dan matikan `workers.dev` jika endpoint publik tambahan tidak diperlukan.

## Troubleshooting

### `ChunkLoadError` atau HTTP 500 pada preview

Pastikan:

```json
"build": "next build --webpack"
```

Hapus hasil build lama, lalu build ulang. Di PowerShell:

```powershell
Remove-Item -LiteralPath .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath .open-next -Recurse -Force -ErrorAction SilentlyContinue
bun run preview
```

Jalankan penghapusan hanya dari folder tema yang benar.

### OpenNext memperingatkan dukungan Windows

Ini adalah peringatan yang diketahui. Jika build atau preview gagal secara tidak konsisten:

- pastikan production build memakai Webpack;
- tutup proses Wrangler/Node lama;
- bersihkan `.next` dan `.open-next`;
- coba ulang dari WSL;
- jangan mengubah aplikasi sebelum error berhasil direproduksi.

### `EPERM` pada log atau registry Wrangler

Wrangler di lingkungan sandbox tertentu mungkin tidak dapat menulis ke:

```text
%APPDATA%\xdg.config\.wrangler
```

Di terminal Windows normal, pastikan direktori tersebut dapat ditulis dan tidak dikunci antivirus/proses lain. Error sandbox tidak selalu berarti Worker atau autentikasi Cloudflare bermasalah.

### Domain mengembalikan 404

Periksa:

- `routes` dan `custom_domain` di `wrangler.jsonc`;
- domain terlihat pada Worker Settings → Domains & Routes;
- hostname tidak memiliki CNAME yang bentrok;
- deployment terakhir berhasil;
- DNS/TLS sudah selesai diprovisi.

### Asset atau environment variable tidak berubah

- pastikan file yang benar telah diubah;
- pastikan nilai `NEXT_PUBLIC_*` tersedia sebelum build;
- hapus build lama jika diperlukan;
- jalankan `bun run deploy`, bukan hanya `wrangler deploy` terhadap bundle lama;
- lakukan hard refresh browser.

### Production error setelah deploy

1. buka live logs;
2. reproduksi satu request;
3. identifikasi Version ID aktif;
4. rollback jika berdampak ke pengguna;
5. investigasi root cause setelah layanan pulih.

## Undangan per-slug: router worker (`{slug}.rimba.io`)

Undangan yang sudah di-publish dari dashboard disajikan di subdomain miliknya sendiri
(mis. `alya-bima.rimba.io`) lewat worker router di `invitation/router/`.

### Arsitektur

```text
{slug}.rimba.io
   │  (zone route *.rimba.io/*)
   ▼
rimba-invitation-router
   │  GET {API_URL}/api/invitations/{slug}   ← hanya untuk membaca content.templateId
   │  (respons API ber-Cache-Control 60s → di-cache edge)
   ▼
service binding tema (rimba-warm-narrative / rimba-sacred-luxe / rimba-sinema-kisah)
   │  request diteruskan + header `x-rimba-slug: {slug}`
   ▼
tema fetch {API_URL}/api/invitations/{slug} sendiri (edge cache yang sama),
overlay content di atas invitation.config.json, render server-side
```

Kontrak penting: **payload config tidak pernah lewat HTTP header** — hanya slug.
Header punya batas ukuran (~8-16KB); love story panjang + galeri besar akan
menyebabkan 431 jika config dikirim via header.

Tanpa header `x-rimba-slug` (akses langsung ke domain demo), tema me-render
`invitation.config.json` bawaannya persis seperti sebelumnya.

### Rute `/preview` (live preview studio)

Setiap tema punya rute `/preview` (client component, terpisah dari halaman
produksi yang tetap server-first): dashboard menampilkannya dalam iframe dan
mengirim draft via `postMessage` (`RIMBA_DRAFT_UPDATE` / `RIMBA_DRAFT_READY`).
Origin pengirim divalidasi exact-match terhadap `NEXT_PUBLIC_STUDIO_ORIGINS`
(build-time, di `.env` tiap tema) — tambahkan origin dashboard production
sebelum build production.

### Setup sekali di dashboard Cloudflare (manual)

1. DNS: tambahkan record wildcard proxied untuk `*.rimba.io`
   (mis. `A * 192.0.2.1`, proxied — placeholder; worker route yang melayani).
2. Pastikan ketiga worker tema sudah ter-deploy (service binding router menunjuk ke namanya).

### Deploy router

```powershell
cd invitation/router
bun install
bunx wrangler deploy
```

### Environment variables terkait

| Variabel | Lokasi | Fungsi |
|---|---|---|
| `API_URL` | `vars` di wrangler.jsonc router **dan** tiap tema | Base URL Go API (`https://api.rimba.io`) |
| `NEXT_PUBLIC_STUDIO_ORIGINS` | `.env` tiap tema (build-time) | Allowlist origin postMessage `/preview` |

Catatan: Go API men-set `Cache-Control: public, max-age=60` untuk undangan
published — perubahan setelah re-publish butuh ±1 menit untuk tampil di domain live.

### Dev lokal

```powershell
# jalankan salah satu tema
cd invitation/themes/adat/kenangan/warm-narrative
API_URL=http://localhost:8090 bun run dev -- --port 3901

# jalankan router, forward ke tema dev (bukan service binding)
cd invitation/router
bunx wrangler dev --port 8787 --var THEME_DEV_ORIGIN:http://localhost:3901 --var API_URL:http://localhost:8090

# uji (wrangler dev menimpa Host, pakai X-Forwarded-Host)
curl --compressed -H "X-Forwarded-Host: {slug}.rimba.io" http://localhost:8787/
```

## Referensi

- [Next.js on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Real-time Logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)
- [Versions and Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/)
- [Compatibility Dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
