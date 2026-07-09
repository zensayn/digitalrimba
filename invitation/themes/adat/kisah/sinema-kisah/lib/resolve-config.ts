import type { InvitationConfig } from "./config-types";
import configJson from "../invitation.config.json";

export const demoConfig = configJson as InvitationConfig;

// Top-level keys the studio owns. `theme` (colors/typography) always comes
// from the bundled demo config — it belongs to the template, not the user.
export const EDITABLE_KEYS = [
  "couple",
  "events",
  "weddingDate",
  "gallery",
  "bankAccounts",
  "loveStory",
  "dressCode",
  "sections",
  "music",
] as const;

export function overlayConfig(stored: Partial<InvitationConfig>): InvitationConfig {
  const config: InvitationConfig = { ...demoConfig };
  for (const key of EDITABLE_KEYS) {
    const value = stored[key];
    if (value !== undefined) {
      (config as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return config;
}

// Resolves the config for a request. The wildcard router forwards published
// invitations with an `x-rimba-slug` header (never the payload itself — the
// config is fetched here, riding the API's 60s edge cache). No slug, a
// missing API_URL, or any fetch failure falls back to the bundled demo, so
// the demo domain renders exactly as before.
export async function resolveConfig(slug: string | null): Promise<InvitationConfig> {
  if (!slug) return demoConfig;
  const apiUrl = process.env.API_URL;
  if (!apiUrl) return demoConfig;

  try {
    const res = await fetch(`${apiUrl}/api/invitations/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return demoConfig;
    const invitation = (await res.json()) as { content?: Partial<InvitationConfig> };
    return overlayConfig(invitation.content ?? {});
  } catch {
    return demoConfig;
  }
}
