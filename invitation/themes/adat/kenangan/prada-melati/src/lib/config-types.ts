// src/lib/config-types.ts
// ─── FIXED: Jangan diubah kecuali ada perubahan skema kontrak ───────────────

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

export interface RundownItem {
  time: string;
  title: string;
}

export interface TurutMengundangItem {
  name: string;
  note: string;
}

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  gold: string;
  goldLight: string;
  goldDim: string;
  text: string;
  textMuted: string;
  textDim: string;
}

export interface ThemeTypography {
  displayFont: string;
  bodyFont: string;
}

export interface InvitationTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
}

export interface MusicConfig {
  src: string;
  coverArt: string;
  title: string;
  artist: string;
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
  rundown: {
    akad: RundownItem[];
    resepsi: RundownItem[];
  };
  turutMengundang: TurutMengundangItem[];
  theme: InvitationTheme;
  music?: MusicConfig;
  sections: {
    order: string[];
    enabled: Record<string, boolean>;
  };
}
