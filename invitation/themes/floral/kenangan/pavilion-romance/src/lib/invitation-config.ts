import type { InvitationConfig, SectionId } from "@/lib/config-types";

export const SECTION_IDS = [
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
  "rundown",
  "turut",
  "closing",
] as const satisfies readonly SectionId[];

const isSectionId = (value: unknown): value is SectionId =>
  typeof value === "string" && SECTION_IDS.includes(value as SectionId);

function assertConfig(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid invitation config: ${message}`);
  }
}

const isHttpUrl = (value: unknown) => {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export function validateInvitationConfig(value: unknown): InvitationConfig {
  const config = value as Partial<InvitationConfig>;

  assertConfig(config.couple?.groom?.name?.trim(), "couple.groom.name is required");
  assertConfig(config.couple?.bride?.name?.trim(), "couple.bride.name is required");
  assertConfig(config.media?.slug?.trim(), "media.slug is required");
  assertConfig(config.media?.socialImage?.trim(), "media.socialImage is required");
  assertConfig(
    typeof config.weddingDate === "string" && !Number.isNaN(Date.parse(config.weddingDate)),
    "weddingDate must be a valid date",
  );
  assertConfig(isHttpUrl(config.events?.akad?.mapsUrl), "events.akad.mapsUrl must be an http(s) URL");
  assertConfig(isHttpUrl(config.events?.akad?.embedUrl), "events.akad.embedUrl must be an http(s) URL");
  assertConfig(isHttpUrl(config.events?.resepsi?.mapsUrl), "events.resepsi.mapsUrl must be an http(s) URL");
  assertConfig(isHttpUrl(config.events?.resepsi?.embedUrl), "events.resepsi.embedUrl must be an http(s) URL");
  assertConfig(
    Array.isArray(config.sections?.order) && config.sections.order.every(isSectionId),
    "sections.order contains an unknown section id",
  );
  assertConfig(
    config.sections?.enabled && SECTION_IDS.every((id) => typeof config.sections?.enabled?.[id] === "boolean"),
    "sections.enabled must define every section id",
  );

  if (config.sections.enabled.gallery) {
    assertConfig(
      Array.isArray(config.gallery) && config.gallery.length > 0,
      "gallery must contain at least one image when enabled",
    );
  }

  if (config.sections.enabled.lovestory) {
    assertConfig(
      Array.isArray(config.loveStory) && config.loveStory.length > 0,
      "loveStory must contain at least one chapter when enabled",
    );
  }

  if (config.sections.enabled.rundown) {
    assertConfig(
      Array.isArray(config.rundown?.akad) && Array.isArray(config.rundown?.resepsi) &&
        config.rundown.akad.length + config.rundown.resepsi.length > 0,
      "rundown must contain at least one item when enabled",
    );
  }

  if (config.sections.enabled.turut) {
    assertConfig(
      Array.isArray(config.turutMengundang) && config.turutMengundang.length > 0,
      "turutMengundang must contain at least one entry when enabled",
    );
  }

  return value as InvitationConfig;
}
