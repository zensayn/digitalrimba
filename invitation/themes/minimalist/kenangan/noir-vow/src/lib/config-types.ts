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
  /** URL penuh atau path CDN foto undangan (dilewatkan invitationPhoto). */
  image: string;
}

export interface RundownItem {
  time: string;
  title: string;
}

export interface TurutMengundangItem {
  name: string;
  note: string;
}

export interface DressCodeColor {
  hex: string;
  name: string;
}

export interface DressCodeConfig {
  theme: string;
  description: string;
  colors: DressCodeColor[];
  avoid: string[];
}

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  accent: string;
  accentSoft: string;
  leaf: string;
  text: string;
  textMuted: string;
  textDim: string;
  /** Lima warna wash dekoratif (.mood-* dan .soft-wash). Dinomori supaya tema
      turunan bebas memakai warna apa pun tanpa nama yang menyesatkan. */
  wash1: string;
  wash2: string;
  wash3: string;
  wash4: string;
  wash5: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  scriptFont?: string;
}

/** Palet PRIMITIF + tipografi saja. Turunannya (border, bayangan, permukaan
 *  tembus pandang, halo, efek) tinggal di globals.css dan dihitung dari palet
 *  ini lewat color-mix — lihat blok "WARNA TURUNAN & EFEK" di sana. `border`
 *  dan `shadows` dulu ada di sini dan harus disetel ulang manual tiap kali
 *  palet berubah; sekarang ikut sendiri. */
export interface InvitationTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
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
  // Musik latar: config demo mengisi file katalog + cover; overlay studio
  // (pilih/unggah lagu) mengganti key ini dengan src + jendela trim
  // startSec/endSec (playback mulai di startSec, loop kembali ke sana
  // setelah endSec); title/artist/trackId adalah data tampilan studio.
  music: {
    /** Nama file di katalog R2 `rimba-invitations/music/catalog/` (atau URL penuh).
        Kosong = fallback file lokal `/music/theme.mp3`. */
    file?: string;
    title?: string;
    artist?: string;
    /** Foto label piringan — foto mempelai atau foto apa pun (URL/path CDN). */
    cover?: string;
    /** Overlay studio: URL langsung hasil pilih/unggah — menang atas `file`. */
    src?: string;
    trackId?: string;
    startSec?: number;
    endSec?: number;
  };
  // Video latar (SceneBackground, semua section). Sama pola dengan `music`:
  // konten pelanggan (video prewedding mereka sendiri), bukan aset tema —
  // kosong = fallback aset tema `AmbientLoop.mp4` (lihat SceneBackground.tsx).
  coverVideo?: {
    /** Nama file di katalog R2 `rimba-invitations/video/catalog/` (atau URL penuh). */
    file?: string;
    /** Overlay studio: URL langsung hasil unggah pelanggan — menang atas `file`. */
    src?: string;
  };
  gallery: GalleryItem[];
  bankAccounts: BankAccount[];
  // Opsional: draft studio yang dibuat sebelum tiga section ini ada tidak
  // memuatnya sama sekali, jadi tiap pemakaian wajib menoleransi undefined
  // (InvitationExperience melewati section yang datanya kosong).
  loveStory?: LoveStoryChapter[];
  rundown?: {
    akad: RundownItem[];
    resepsi: RundownItem[];
  };
  turutMengundang?: TurutMengundangItem[];
  dressCode: DressCodeConfig;
  theme: InvitationTheme;
  sections: {
    order: string[];
    enabled: Record<string, boolean>;
  };
}
