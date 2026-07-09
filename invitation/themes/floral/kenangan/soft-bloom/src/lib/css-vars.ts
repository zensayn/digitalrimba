// src/lib/css-vars.ts
import type { InvitationTheme } from "./config-types";

export function buildCssVars(theme: InvitationTheme): string {
  // Catatan: font (--font-display/-body/-script) dimuat & di-selfhost via next/font
  // di layout.tsx (lihat sana). Di sini hanya warna dari config.
  const { colors } = theme;
  return `
    :root {
      --bg: ${colors.bg};
      --surface: ${colors.surface};
      --surface-2: ${colors.surface2};
      --accent: ${colors.accent};
      --accent-soft: ${colors.accentSoft};
      --leaf: ${colors.leaf};
      --text: ${colors.text};
      --text-muted: ${colors.textMuted};
      --text-dim: ${colors.textDim};
    }
  `;
}
