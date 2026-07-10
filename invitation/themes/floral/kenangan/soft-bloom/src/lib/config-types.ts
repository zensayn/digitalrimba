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
  dressCode: DressCodeConfig;
  theme: InvitationTheme;
  sections: {
    order: string[];
    enabled: Record<string, boolean>;
  };
  // Optional per-invitation background music (studio catalog pick or upload).
  // Themes read src + the startSec/endSec trim window (playback starts at
  // startSec and loops back there after endSec); title/artist/trackId are
  // studio display data.
  music?: {
    src: string;
    title?: string;
    artist?: string;
    trackId?: string;
    startSec?: number;
    endSec?: number;
  };
}
