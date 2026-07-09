// Canonical invitation config shape shared with the theme workers.
// KEEP IN SYNC with invitation/themes/adat/kenangan/warm-narrative/src/lib/config-types.ts
// (this file adds `music` and `templateId`, which the studio owns).
//
// PATCH contract: the backend merges content per TOP-LEVEL key only — always
// send complete top-level values (the studio sends the whole config on save).

export type PersonConfig = {
  name: string;
  fullName: string;
  parents: string;
  photo: string;
  instagram: string;
};

export type EventConfig = {
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
};

export type GalleryItem = {
  src: string;
  alt: string;
};

export type BankAccount = {
  bank: string;
  name: string;
  number: string;
};

export type LoveStoryChapter = {
  chapter: string;
  year: string;
  description: string;
  image: string;
};

export type DressCodeColor = {
  hex: string;
  name: string;
};

export type InvitationConfig = {
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
  music: {
    src: string;
  };
  templateId?: string;
};

// Warm-narrative is the complete template; its section order is the canonical
// editor order. Sections without their own fields (greeting/rsvp/closing)
// render from couple/gallery data and only expose an on/off toggle.
export const SECTION_ORDER = [
  "cover",
  "greeting",
  "couple",
  "lovestory",
  "akad",
  "resepsi",
  "dresscode",
  "gallery",
  "rsvp",
  "gift",
  "closing",
] as const;

export type ThemeSectionId = (typeof SECTION_ORDER)[number];

function emptyPerson(): PersonConfig {
  return { name: "", fullName: "", parents: "", photo: "", instagram: "" };
}

function emptyEvent(title: string): EventConfig {
  return {
    title,
    day: "",
    date: "",
    time: "",
    venue: "",
    address: "",
    mapsUrl: "",
    embedUrl: "",
    startISO: "",
    endISO: "",
  };
}

export function emptyInvitationConfig(): InvitationConfig {
  return {
    couple: {
      groom: emptyPerson(),
      bride: emptyPerson(),
      hashtag: "",
      quote: "",
    },
    events: {
      akad: emptyEvent("Akad Nikah"),
      resepsi: emptyEvent("Resepsi"),
    },
    weddingDate: "",
    gallery: [],
    bankAccounts: [],
    loveStory: [],
    dressCode: { theme: "", description: "", colors: [], avoid: [] },
    sections: {
      order: [...SECTION_ORDER],
      // lovestory defaults off, matching the warm-narrative demo config.
      enabled: Object.fromEntries(SECTION_ORDER.map((id) => [id, id !== "lovestory"])),
    },
    music: { src: "" },
  };
}

type LegacyContent = {
  brideName?: string;
  groomName?: string;
  date?: string;
  venue?: string;
  story?: string;
  imageUrl?: string;
  musicUrl?: string;
  templateId?: string;
};

// Maps the pre-rich-config flat content shape into an InvitationConfig.
// Only the studio loader uses this; the row becomes rich on its next save.
export function fromLegacyContent(raw: unknown): InvitationConfig {
  const content = (raw ?? {}) as Partial<InvitationConfig> & LegacyContent;
  const config = emptyInvitationConfig();

  if (content.couple) {
    // Already rich: overlay the stored top-level keys onto the empty base so
    // any keys added after this row was saved still have defaults.
    return { ...config, ...content, templateId: content.templateId };
  }

  config.templateId = content.templateId;
  config.couple.bride.name = content.brideName ?? "";
  config.couple.groom.name = content.groomName ?? "";
  config.weddingDate = content.date ?? "";
  config.events.resepsi.date = content.date ?? "";
  config.events.resepsi.venue = content.venue ?? "";
  if (content.story) {
    config.loveStory = [{ chapter: "Our Story", year: "", description: content.story, image: "" }];
    config.sections.enabled.lovestory = true;
  }
  if (content.imageUrl) {
    config.gallery = [{ src: content.imageUrl, alt: "Cover photo" }];
  }
  config.music.src = content.musicUrl ?? "";
  return config;
}
