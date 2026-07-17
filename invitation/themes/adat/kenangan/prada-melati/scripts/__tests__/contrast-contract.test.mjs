// Palet gelap gampang melanggar WCAG tanpa ketahuan. Tes ini yang menahannya.
// DESIGN_SYSTEM.md §9: teks normal minimal 4.5:1, teks besar minimal 3:1.
//
// Sumber kebenaran palet adalah invitation.config.json, sebab buildCssVars
// menimpa token :root di globals.css dengan nilai dari sana saat runtime.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../../invitation.config.json", import.meta.url)));
const c = config.theme.colors;

const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const SURFACES = [c.bg, c.surface, c.surface2];
const TEXT_TOKENS = { text: c.text, textMuted: c.textMuted, textDim: c.textDim, gold: c.gold };

test("setiap token teks memenuhi 4.5:1 di atas semua permukaan", () => {
  for (const [name, fg] of Object.entries(TEXT_TOKENS)) {
    for (const bg of SURFACES) {
      const r = ratio(fg, bg);
      assert.ok(r >= 4.5, `${name} (${fg}) di atas ${bg} hanya ${r.toFixed(2)}:1, butuh 4.5`);
    }
  }
});

test("goldDim dekoratif, cukup 3:1 untuk teks besar", () => {
  for (const bg of SURFACES) {
    const r = ratio(c.goldDim, bg);
    assert.ok(r >= 3, `goldDim (${c.goldDim}) di atas ${bg} hanya ${r.toFixed(2)}:1`);
  }
});
