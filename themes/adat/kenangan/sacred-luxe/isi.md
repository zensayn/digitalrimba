# 📋 Isi Konten — Sacred Luxe (Heartwood Series)

Dokumen ini merinci semua bagian (section) yang ada dalam desain undangan digital **Sacred Luxe**, beserta data contoh yang saat ini digunakan, dan panduan pengisian untuk klien baru.

---

## 🗂️ Urutan Halaman (9 Section)

| # | Section | ID | Keterangan |
|---|---|---|---|
| 1 | Cover | `cover` | Halaman pembuka |
| 2 | Undangan | `greeting` | Salam pembuka + nama tamu |
| 3 | Mempelai | `couple` | Profil kedua mempelai |
| 4 | Akad Nikah | `akad` | Detail acara akad |
| 5 | Resepsi | `resepsi` | Detail acara resepsi |
| 6 | Galeri | `gallery` | Foto kenangan (3D globe) |
| 7 | RSVP | `rsvp` | Form konfirmasi kehadiran |
| 8 | Amplop Digital | `gift` | Rekening bank |
| 9 | Penutup | `closing` | Closing + branding |

---

## 1. 🎴 Cover

Halaman pembuka dengan nama mempelai besar, tanggal pernikahan, countdown timer, dan tombol "Buka Undangan".

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Nama Mempelai 1 (pendek) | `Pangky` |
| Nama Mempelai 2 (pendek) | `Radit` |
| Tanggal pernikahan | `14 Juni 2026` |
| Jam mulai (untuk countdown) | `2026-06-14T08:00:00` |

### Fitur otomatis:
- Countdown timer real-time (hari, jam, menit, detik)
- Animasi masuk bertahap
- Tombol scroll ke section Undangan

---

## 2. 💌 Undangan (Greeting)

Halaman salam pembuka dengan Bismillah dan teks undangan. Mendukung **nama tamu personal** via URL parameter.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Teks pembuka | `Tanpa mengurangi rasa hormat, kami mengundang Anda...` |
| Nama tamu (opsional, via URL) | `?to=Bapak%20Budi` |

### Cara kirim undangan personal:
```
https://domain.com/?to=Bapak+Budi+Santoso
```
→ Akan tampil: **"Kepada Yth. Bapak Budi Santoso"**

### Isi tetap (tidak perlu diubah):
- Kalimat Bismillah (Arab)
- Teks undangan standar
- Tanda tangan nama mempelai

---

## 3. 👫 Mempelai (Couple)

Menampilkan profil lengkap kedua mempelai beserta nama orang tua.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Nama lengkap mempelai pria | `Pangky Pratama Putra` |
| Nama orang tua mempelai pria | `Putra Bapak H. Ahmad & Ibu Siti Rahmawati` |
| Foto mempelai pria | `/images/groom.jpg` |
| Nama lengkap mempelai wanita | `Radit Kusuma Wardana` |
| Nama orang tua mempelai wanita | `Putra Bapak Drs. Budi Santoso & Ibu Dewi Kusumawati` |
| Foto mempelai wanita | `/images/bride.jpg` |
| Quote pasangan | `"Dua jiwa, satu akar. Bersama kita tumbuh."` |

> 📌 **Catatan foto:** Taruh file foto di folder `public/images/` dengan nama `groom.jpg` dan `bride.jpg`. Ukuran ideal: **400×400px** (persegi).

---

## 4. 🕌 Akad Nikah (Event 1)

Detail lengkap acara akad nikah dengan peta embed Google Maps.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Hari | `Sabtu` |
| Tanggal | `14 Juni 2026` |
| Waktu | `08.00 – 10.00 WIB` |
| Nama venue | `Masjid Agung Al-Falah` |
| Alamat lengkap | `Jl. Merdeka No. 1, Jakarta Selatan` |
| Link Google Maps | `https://maps.google.com/?q=-6.2088,106.8456` |
| Koordinat (untuk embed peta) | `-6.2088, 106.8456` |

### Cara dapat koordinat:
1. Buka Google Maps → cari lokasi
2. Klik kanan → "What's here?"
3. Salin angka lat,long yang muncul

---

## 5. 🥂 Resepsi (Event 2)

Sama seperti Akad Nikah, untuk acara resepsi.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Hari | `Sabtu` |
| Tanggal | `14 Juni 2026` |
| Waktu | `11.00 – 15.00 WIB` |
| Nama venue | `The Rimba Garden Hall` |
| Alamat lengkap | `Jl. Sudirman Kav. 22, Jakarta Pusat` |
| Link Google Maps | `https://maps.google.com/?q=-6.2092,106.8229` |
| Koordinat (untuk embed peta) | `-6.2092, 106.8229` |

---

## 6. 📸 Galeri (Gallery)

Globe 3D interaktif yang menampilkan foto-foto dalam format bola yang bisa diputar.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Foto 1 | `public/images/gallery-1.jpg` |
| Foto 2 | `public/images/gallery-2.jpg` |
| Foto 3 | `public/images/gallery-3.jpg` |
| Foto 4 | `public/images/gallery-4.jpg` |
| Foto 5 | `public/images/gallery-5.jpg` |

> 📌 **Catatan:**
> - Jumlah foto: **minimal 4, maksimal 8** (terlalu banyak bisa lambat)
> - Ukuran ideal per foto: **600×600px** (persegi)
> - Format: `.jpg` atau `.png`
> - Saat ini menggunakan placeholder dari picsum.photos (grayscale demo)

---

## 7. 📝 RSVP

Form konfirmasi kehadiran interaktif. Tamu mengisi nama, pilih hadir/tidak hadir, jumlah tamu, dan ucapan.

### Tidak ada data yang perlu diisi klien.

Form ini otomatis. Yang bisa dikustomisasi:
- Integrasi ke backend/database (saat ini simulasi 1.2 detik)
- Batas jumlah tamu per undangan (saat ini max 5)

### Field yang diisi tamu:
1. **Nama Tamu** — teks bebas
2. **Konfirmasi** — pilih `Hadir` atau `Tidak Hadir`
3. **Jumlah Tamu** — angka 1–5 (muncul jika pilih Hadir)
4. **Ucapan** — teks bebas (opsional)

---

## 8. 💳 Amplop Digital (Gift)

Menampilkan rekening bank untuk hadiah digital, dengan tombol salin nomor rekening.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Bank 1 | `BCA` |
| Nama penerima 1 | `Pangky Pratama Putra` |
| No. rekening 1 | `1234 5678 9012` |
| Bank 2 | `Mandiri` |
| Nama penerima 2 | `Radit Kusuma Wardana` |
| No. rekening 2 | `9876 5432 1098` |

> 📌 Bisa ditambah hingga **3 rekening** tanpa perlu ubah kode.

---

## 9. 🌹 Penutup (Closing)

Halaman penutup dengan nama mempelai besar, ayat Al-Quran (QS. Ar-Rum: 21), hashtag, dan branding Rimba Digital.

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Nama pendek mempelai pria | `Pangky` *(dari data couple)* |
| Nama pendek mempelai wanita | `Radit` *(dari data couple)* |
| Hashtag | `#PangkyRaditForever` |

---

## 🎵 Music Player

Pemutar musik yang berjalan di latar belakang (pojok kanan bawah).

### Data yang dibutuhkan:
| Field | Contoh Saat Ini |
|---|---|
| Judul lagu | `Jatuh Cinta Seperti di Film-Film` |
| Nama artis | `Sal Priadi` |
| File audio | `public/music/[nama-file].mp3` |

> 📌 Taruh file `.mp3` di folder `public/music/`. Ukuran ideal: di bawah **5MB** agar loading cepat.

---

## 📁 Cara Update Konten

Semua isi undangan diatur di **satu file**:

```
src/data/invitation.ts
```

Cukup edit file tersebut, semua halaman akan otomatis terupdate.

### Struktur file:
```typescript
export const couple = { ... }      // Data mempelai
export const events = { ... }      // Data akad & resepsi  
export const weddingDate = ...     // Tanggal untuk countdown
export const gallery = [ ... ]     // Daftar foto
export const bankAccounts = [ ... ] // Rekening bank
```

---

## 🌐 Link Undangan Personal

Format URL untuk mengirim undangan dengan nama tamu:

```
https://[domain]/?to=Nama+Tamu+Lengkap
```

Contoh:
```
https://undangan.rimbadigital.com/?to=Bapak+dan+Ibu+Budi+Santoso
```
