// src/lib/css-vars.ts
import type { InvitationTheme } from "./config-types";

export function buildCssVars(theme: InvitationTheme): string {
  const { colors, typography } = theme;
  return `
    :root {
      --bg: ${colors.bg};
      --surface: ${colors.surface};
      --surface-2: ${colors.surface2};
      --gold: ${colors.gold};
      --gold-light: ${colors.goldLight};
      --gold-dim: ${colors.goldDim};
      --text: ${colors.text};
      --text-muted: ${colors.textMuted};
      --text-dim: ${colors.textDim};
      --font-display: '${typography.displayFont}', serif;
      --font-body: '${typography.bodyFont}', sans-serif;
    }
  `;
}
