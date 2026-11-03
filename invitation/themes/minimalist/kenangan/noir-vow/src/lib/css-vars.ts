// src/lib/css-vars.ts
import type { InvitationTheme } from "./config-types";

// SATU-SATUNYA sumber palet PRIMITIF: invitation.config.json. globals.css
// sengaja tidak mendefinisikan ulang token-token ini di :root — dulu keduanya
// memuat nilai yang sama dan pemenangnya bergantung urutan cascade. Dijaga
// scripts/__tests__/token-contract.test.mjs.
//
// Yang TIDAK dipancarkan di sini karena murni turunan (dihitung globals.css
// dengan color-mix dari primitif di bawah): --border, --shadow-*, --surface-*,
// --paper-*, --accent-tint/line/strike/strong/glow, --halo-*.
//
// Catatan: font (--font-display/-body/-script) dimuat & di-selfhost oleh
// next/font di layout.tsx, jadi tidak ikut dipancarkan di sini.
export function buildCssVars(theme: InvitationTheme): string {
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
      --wash-1: ${colors.wash1};
      --wash-2: ${colors.wash2};
      --wash-3: ${colors.wash3};
      --wash-4: ${colors.wash4};
      --wash-5: ${colors.wash5};
    }
  `;
}
