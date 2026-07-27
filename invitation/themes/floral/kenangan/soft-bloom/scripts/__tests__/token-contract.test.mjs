// Dulu warna punya DUA sumber: :root di globals.css dan theme.colors di config,
// dengan nilai yang sama persis. Siapa yang menang bergantung urutan cascade —
// perangkap klasik saat tema disalin ("sudah ganti config kok warnanya tetap").
// Tes ini menetapkan config sebagai satu-satunya sumber, dan menahan token yatim.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");

const config = JSON.parse(read("../../invitation.config.json"));
const css = read("../../src/app/globals.css");
const cssVars = read("../../src/lib/css-vars.ts");

// Token yang dimiliki config — globals.css tidak boleh mendefinisikan ulang.
const CONFIG_OWNED = [
  "--bg", "--surface", "--surface-2",
  "--accent", "--accent-soft", "--leaf",
  "--text", "--text-muted", "--text-dim",
  "--wash-1", "--wash-2", "--wash-3", "--wash-4", "--wash-5",
];

const rootBlock = () => {
  const start = css.indexOf(":root");
  assert.ok(start !== -1, "globals.css tidak punya blok :root");
  return css.slice(start, css.indexOf("}", start));
};

test("globals.css tidak mendefinisikan ulang token milik config", () => {
  const root = rootBlock();
  for (const token of CONFIG_OWNED) {
    assert.ok(
      !root.includes(`${token}:`),
      `${token} masih didefinisikan di :root globals.css — sumbernya harus invitation.config.json`,
    );
  }
});

test("buildCssVars memancarkan setiap token milik config", () => {
  for (const token of CONFIG_OWNED) {
    assert.ok(cssVars.includes(token), `css-vars.ts tidak memancarkan ${token}`);
  }
});

test("setiap kunci theme.colors terpakai di css-vars.ts", () => {
  for (const key of Object.keys(config.theme.colors)) {
    assert.ok(
      cssVars.includes(`colors.${key}`),
      `theme.colors.${key} ada di config tapi tidak pernah dipancarkan — token mati`,
    );
  }
});

// border & shadow-card DULU ada di config dan harus disetel ulang manual tiap
// kali palet berubah. Sekarang keduanya turunan (accent 22%, text 5%) yang
// dihitung globals.css. Tes ini menahan supaya tak diam-diam dikembalikan.
test("turunan tidak dikembalikan ke config", () => {
  for (const key of ["border"]) {
    assert.ok(
      !(key in config.theme.colors),
      `theme.colors.${key} muncul lagi di config — nilainya turunan, tempatnya di globals.css`,
    );
  }
  assert.ok(!config.theme.shadows, "theme.shadows muncul lagi di config — bayangan diturunkan dari --text");
});

// Kumpulkan seluruh var(--x) yang dipakai di src/, pastikan tak ada yang yatim.
// Catatan: pakai path biasa (bukan new URL) — di Windows path absolut seperti
// C:\... akan diurai new URL sebagai protokol "c:" dan gagal.
const SRC = fileURLToPath(new URL("../../src/", import.meta.url));

const sourceFiles = () =>
  readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|css)$/.test(entry.name))
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));

// Nama wajib ditutup `)` atau `,` — tanpa itu, prosa di komentar seperti
// "→ var(--font-*)" ikut tertangkap sebagai token bernama "--font-".
const VAR_USE = /var\((--[a-z0-9-]*[a-z0-9])\s*[),]/g;

const collectUsedVars = () => {
  const used = new Set();
  for (const file of sourceFiles()) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(VAR_USE)) used.add(match[1]);
  }
  return used;
};

test("tidak ada var(--x) yang tak pernah didefinisikan", () => {
  const defined = new Set(CONFIG_OWNED);
  for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):/gm)) defined.add(match[1]);
  // Font disuntik next/font lewat className di layout.tsx, bukan lewat CSS.
  for (const token of ["--font-display", "--font-body", "--font-script"]) defined.add(token);

  for (const token of collectUsedVars()) {
    assert.ok(defined.has(token), `${token} dipakai tapi tidak pernah didefinisikan`);
  }
});
