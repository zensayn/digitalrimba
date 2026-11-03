// Kelas peran UI dulu bernama .btn-bloom / .input-bloom / .bloom-panel — kosakata
// yang tidak nyambung begitu tema disalin jadi tema keraton atau dongeng. Peran
// UI kini bernama netral; yang bernuansa tema (.soft-wash, .mood-*,
// .botanical-card) sengaja DIBIARKAN karena memang identitas visual tema.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Path biasa, bukan new URL — di Windows path absolut C:\... akan diurai
// new URL sebagai protokol "c:" dan gagal.
const SRC = fileURLToPath(new URL("../../src/", import.meta.url));

const sourceFiles = () =>
  readdirSync(SRC, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(tsx?|css)$/.test(entry.name))
    .map((entry) => {
      const name = join(entry.parentPath ?? entry.path, entry.name);
      return { name, text: readFileSync(name, "utf8") };
    });

const RETIRED = ["btn-bloom", "input-bloom", "bloom-panel", "specimen-card", "leaf-divider"];

test("nama kelas lama tidak muncul lagi di mana pun", () => {
  for (const file of sourceFiles()) {
    for (const name of RETIRED) {
      assert.ok(!file.text.includes(name), `${file.name} masih memuat kelas lama "${name}"`);
    }
  }
});

test("setiap kelas peran baru terdefinisi di globals.css", () => {
  const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");
  for (const name of ["btn-primary", "input-field", "panel", "card", "divider"]) {
    assert.ok(css.includes(`.${name} {`), `globals.css tidak mendefinisikan .${name}`);
  }
});

test("tidak ada warna hex hardcode di komponen", () => {
  // Semua warna wajib lewat token. Satu-satunya pengecualian dulu adalah
  // piringan hitam MusicPlayer — kini jadi token --vinyl-disc di globals.css.
  for (const file of sourceFiles()) {
    if (file.name.endsWith(".css")) continue;
    const found = file.text.match(/#[0-9A-Fa-f]{6}\b/g);
    assert.equal(
      found,
      null,
      `${file.name} memuat hex hardcode ${JSON.stringify(found)} — pakai var(--token)`,
    );
  }
});
