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
  /** Path CDN foto undangan (pola sama dengan PersonConfig.photo) atau URL penuh. */
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
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
  scriptFont?: string;
}

export interface InvitationTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
}

export interface InvitationMediaConfig {
  slug: string;
  socialImage: string;
}

export type SectionId =
  | "cover"
  | "greeting"
  | "couple"
  | "lovestory"
  | "akad"
  | "resepsi"
  | "dresscode"
  | "gallery"
  | "rsvp"
  | "gift"
  | "rundown"
  | "turut"
  | "closing";

export interface InvitationConfig {
  media: InvitationMediaConfig;
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
  music: {
    /** Nama file di katalog R2 `rimba-invitations/music/catalog/` (atau URL penuh).
        Kosong = fallback file lokal `/music/theme.mp3`. */
    file: string;
    title: string;
    artist: string;
    /** Foto label piringan (path CDN foto undangan) — foto mempelai atau foto apa pun. */
    cover: string;
  };
  gallery: GalleryItem[];
  bankAccounts: BankAccount[];
  loveStory: LoveStoryChapter[];
  rundown: {
    akad: RundownItem[];
    resepsi: RundownItem[];
  };
  turutMengundang: TurutMengundangItem[];
  dressCode: DressCodeConfig;
  theme: InvitationTheme;
  sections: {
    order: SectionId[];
    enabled: Record<SectionId, boolean>;
  };
}
