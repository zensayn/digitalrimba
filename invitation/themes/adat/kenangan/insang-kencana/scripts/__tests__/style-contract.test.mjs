// Sebelum kontrak ini, style ditulis dengan TIGA cara yang bercampur — kelas
// CSS, utilitas Tailwind, dan style={{}} inline — sehingga satu peran visual
// punya banyak nama. "Sub-judul serif italic" ditulis 4× dengan clamp berbeda
// (22/6vw/30, 22/5.8vw/28, 20/5.4vw/27, 20/5.2vw/26), "lead italic" 3×, kartu
// kertas 2 jalur (kelas .card vs ditulis tangan di Event/Gift/Rundown). Tak ada
// satu pun yang salah sendiri-sendiri; yang salah adalah tak ada satu tempat
// untuk mengubahnya. Aturannya sekarang:
//
//   sifat VISUAL (font, warna, tepi, radius, bayangan)  → kelas peran di globals.css
//   GEOMETRI satu-satuan (posisi, ukuran, flex, z-index) → boleh inline
//   NILAI DATA (warna swatch dari config)                → custom property, mis. --swatch
//
// Ornamen murni (gambar yang cuma diposisikan & digoyang) dikecualikan: di sana
// tak ada peran visual yang bisa dibagi, hanya geometri per-instans.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
const css = read("../../src/app/globals.css");

// Path biasa, bukan new URL — di Windows path absolut C:\... akan diurai
// new URL sebagai protokol "c:" dan gagal.
const SECTIONS = fileURLToPath(new URL("../../src/components/sections/", import.meta.url));

const sectionFiles = () =>
  readdirSync(SECTIONS)
    .filter((name) => name.endsWith("Section.tsx"))
    .map((name) => ({ name, text: readFileSync(join(SECTIONS, name), "utf8") }));

// Properti yang menyatakan RUPA, bukan tempat. Inilah yang wajib punya nama.
const VISUAL_PROPS = [
  "fontSize", "fontWeight", "fontStyle", "fontFamily",
  "lineHeight", "letterSpacing", "textTransform", "textShadow", "textDecoration",
  "color", "background", "backgroundColor", "backgroundImage",
  "border", "borderTop", "borderBottom", "borderLeft", "borderRight",
  "borderColor", "borderRadius", "boxShadow", "backdropFilter",
];

// Baris komentar tidak dihitung — penjelasan boleh menyebut nama properti.
const codeLines = (text) =>
  text.split("\n").map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => {
      const t = line.trimStart();
      return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
    });

test("tak ada properti visual di dalam style inline section", () => {
  for (const file of sectionFiles()) {
    for (const { line, n } of codeLines(file.text)) {
      for (const prop of VISUAL_PROPS) {
        assert.ok(
          !new RegExp(`\\b${prop}\\s*:`).test(line),
          `${file.name}:${n} menyetel "${prop}" inline — beri nama perannya di globals.css.\n    ${line.trim()}`,
        );
      }
    }
  }
});

// Gejala khas "kelas dipakai separuh": className menyebut peran, lalu satu-dua
// sifatnya ditambal inline. Itu justru menyembunyikan duplikasi — perannya
// terlihat seragam di JSX padahal tidak.
test("kelas peran tidak ditambal style inline", () => {
  for (const file of sectionFiles()) {
    for (const { line, n } of codeLines(file.text)) {
      const role = line.match(/className="[^"]*\b(type-[a-z-]+|card|card-solid|panel|chip|swatch|btn-[a-z-]+)\b[^"]*"/);
      if (!role) continue;
      const inline = line.match(/style=\{\{([^}]*)\}/);
      if (!inline) continue;
      for (const prop of VISUAL_PROPS) {
        assert.ok(
          !new RegExp(`\\b${prop}\\s*:`).test(inline[1]),
          `${file.name}:${n} memakai kelas "${role[1]}" lalu menambal "${prop}" inline\n    ${line.trim()}`,
        );
      }
    }
  }
});

test("setiap kelas peran yang dipakai section benar-benar ada di globals.css", () => {
  // Terminator `[` penting: kelas penanda seperti .reveal-scope hanya muncul
  // sebagai .reveal-scope[data-inview="true"], tak pernah berdiri sendiri.
  // Spasi di depan juga: .ambient-anim hanya dideklarasikan (menjorok) di dalam
  // @media (prefers-reduced-motion) — tetap terdefinisi.
  const declared = new Set([...css.matchAll(/^\s*\.([a-z][a-z0-9-]*)[\s,{:[]/gm)].map((m) => m[1]));
  // Utilitas Tailwind sah dipakai untuk TATA LETAK; yang diperiksa di sini hanya
  // kelas milik tema (peran visual & komposisi), yang pola namanya khas.
  // Prefiks harus KHAS tema. "text-" tak boleh dipakai mentah: ia menyapu
  // utilitas Tailwind seperti text-center, jadi kelas tema yang diawali "text-"
  // disebut namanya satu per satu.
  const THEME_CLASS = /^(type-|card|panel|chip|swatch|avatar|polaroid|icon-badge|btn-|rule-fade|map-|text-halo|text-scrim|edge-|scroll-hint|section-|mood-|soft-wash|botanical-card|divider|input-field|amp-|photo-|cover-date|event-|rundown-|bank-card|venue-card|closing-|opening-|snap-|flow-|reveal-|ambient-|font-)/;

  for (const file of sectionFiles()) {
    for (const [, value] of file.text.matchAll(/className="([^"{]+)"/g)) {
      for (const name of value.split(/\s+/).filter(Boolean)) {
        if (!THEME_CLASS.test(name)) continue;
        assert.ok(
          declared.has(name),
          `${file.name} memakai kelas tema ".${name}" yang tidak terdefinisi di globals.css`,
        );
      }
    }
  }
});

test("tak ada kelas peran yatim di globals.css", () => {
  // Kelas peran yang tak pernah dipakai adalah utang: ia ikut disalin ke tema
  // turunan dan menyesatkan orang berikutnya. Diperiksa di seluruh src/.
  const SRC = fileURLToPath(new URL("../../src/", import.meta.url));
  const all = readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.tsx?$/.test(e.name))
    .map((e) => readFileSync(join(e.parentPath ?? e.path, e.name), "utf8"))
    .join("\n");

  const roles = [...css.matchAll(/^\.(type-[a-z0-9-]+|card-solid|chip|swatch|avatar|polaroid|icon-badge[a-z-]*|btn-[a-z-]+|rule-fade|map-[a-z-]+|amp-[a-z-]+|photo-[a-z-]+|text-halo[a-z-]*|text-scrim|edge-dissolve)[\s,{]/gm)]
    .map((m) => m[1]);

  const unused = [...new Set(roles)].filter((name) => !all.includes(name));
  assert.deepEqual(unused, [], `kelas peran tak terpakai: ${unused.join(", ")}`);
});
