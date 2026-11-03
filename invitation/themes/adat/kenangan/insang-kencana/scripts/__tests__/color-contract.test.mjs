// token-contract menjaga PALET (config vs :root). Tes ini menjaga lapisan di
// bawahnya: TURUNAN palet — permukaan tembus pandang, kabut kertas, tint aksen,
// bayangan, halo — yang dulu ditulis sebagai rgba() mentah di 30 tempat di
// globals.css dan 30 tempat lagi di komponen.
//
// Kenapa itu berbahaya padahal tak ada yang salah secara teknis: `rgba(126,
// 105, 150, 0.08)` TIDAK ikut berubah saat `accent` diganti di config. Jadi
// tema turunan yang mengganti palet akan tetap membawa ungu tema lama di
// tombol terpilih, garis input, coretan chip, dan bayangan kartu — persis
// perangkap "sudah ganti config kok warnanya tak berubah" yang dulu diberantas
// token-contract, cuma satu lapis lebih dalam dan jauh lebih sulit terlihat.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
const css = read("../../src/app/globals.css");

const SRC = fileURLToPath(new URL("../../src/", import.meta.url));
const sourceFiles = () =>
  readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.tsx?$/.test(e.name))
    .map((e) => {
      const name = join(e.parentPath ?? e.path, e.name);
      return { name, text: readFileSync(name, "utf8") };
    });

const COLOR_LITERAL = /rgba?\([0-9][0-9., ]*\)|#[0-9A-Fa-f]{6}\b/g;

// Blok :root paling atas adalah rumah sah warna BENDA (piringan hitam, lipatan
// amplop, lilin segel) — warna yang memang tak boleh ikut berubah bersama
// palet. Di luar itu, tak ada literal warna di mana pun.
const objectBlock = () => {
  const start = css.indexOf(":root");
  assert.notEqual(start, -1, "globals.css tidak punya blok :root");
  return css.slice(start, css.indexOf("}", start));
};

test("tak ada literal warna di globals.css di luar blok warna benda", () => {
  const objects = objectBlock();
  const rest = css.replace(objects, "");
  const found = rest.match(COLOR_LITERAL);
  assert.equal(
    found,
    null,
    `globals.css memuat literal warna ${JSON.stringify(found)} — turunkan dari palet dengan color-mix`,
  );
});

test("tak ada literal warna di komponen", () => {
  for (const file of sourceFiles()) {
    const found = file.text.match(COLOR_LITERAL);
    assert.equal(
      found,
      null,
      `${file.name} memuat literal warna ${JSON.stringify(found)} — pakai var(--token)`,
    );
  }
});

// Turunan wajib DIHITUNG dari primitif, bukan ditulis ulang sebagai nilai jadi.
// Kalau seseorang menulis `--accent-tint: #EFEAF3`, tes di atas lolos (bukan
// rgba, bukan hex 6-digit di komponen) tapi ikatannya ke palet tetap putus.
test("setiap token turunan benar-benar diturunkan dari palet", () => {
  const DERIVED = [
    "--surface-card", "--surface-panel", "--surface-photo", "--surface-subtle", "--surface-faint",
    "--paper-strong", "--paper", "--paper-soft", "--paper-faint", "--paper-clear",
    "--accent-tint", "--accent-hairline", "--accent-line", "--accent-strike",
    "--accent-strong", "--accent-glow", "--border",
    "--shadow-card", "--shadow-lift", "--shadow-float", "--shadow-rail",
    "--shadow-cta", "--shadow-swatch",
    "--drop-sm", "--drop-md", "--drop-lg",
    "--halo-paper", "--halo-paper-strong",
  ];
  for (const token of DERIVED) {
    const match = css.match(new RegExp(`^\\s*${token}:\\s*([^;]+);`, "m"));
    assert.ok(match, `globals.css tidak mendefinisikan ${token}`);
    const value = match[1];
    // Sah bila memakai color-mix (dari primitif) ATAU merujuk token turunan lain.
    assert.ok(
      /color-mix\(/.test(value) || /var\(--/.test(value),
      `${token} ditulis sebagai nilai jadi (${value.trim()}) — ikatannya ke palet putus`,
    );
  }
});

test("token efek terdefinisi dan dipakai, bukan angka lepas", () => {
  for (const token of ["--blur-card", "--blur-panel", "--ease-soft", "--dur-quick", "--dur-base", "--dur-enter"]) {
    assert.ok(
      new RegExp(`^\\s*${token}:`, "m").test(css),
      `globals.css tidak mendefinisikan token efek ${token}`,
    );
    assert.ok(
      css.includes(`var(${token})`),
      `${token} terdefinisi tapi tak pernah dipakai — token mati`,
    );
  }
});
