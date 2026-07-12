import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../../src/components/shared/sceneKelir.ts", import.meta.url), "utf8");

const SECTION_IDS = [
  "cover", "greeting", "couple", "lovestory", "akad", "resepsi",
  "dresscode", "gallery", "rsvp", "gift", "closing",
];

test("KELIR memuat kesebelas id section (spec §10)", () => {
  for (const id of SECTION_IDS) {
    assert.match(src, new RegExp(`\\b${id}\\s*:`), `preset '${id}' hilang dari KELIR`);
  }
});

test("cover memakai AktorGunungan, blencong 38% terang 0.9 (spec §6f)", () => {
  const cover = src.slice(src.indexOf("cover:"), src.indexOf("greeting:"));
  assert.match(cover, /"AktorGunungan"/, "cover harus memakai AktorGunungan");
  assert.match(cover, /blencongY:\s*"38%"/, "blencongY cover harus 38%");
  assert.match(cover, /blencongBright:\s*0\.9/, "blencongBright cover harus 0.9");
});

test("closing menerbitkan cahaya dari hem bawah (blencong 88%, terang 1.0)", () => {
  const closing = src.slice(src.indexOf("closing:"));
  assert.match(closing, /blencongY:\s*"88%"/, "blencongY closing harus 88%");
  assert.match(closing, /blencongBright:\s*1(\.0)?\b/, "blencongBright closing harus 1.0");
});

// ─── Hem bervariasi per section (spec hem-variasi) ──────────────────────────
// `readFileSync` & `src` sudah didefinisikan di puncak berkas ini.
const kelirScene = readFileSync(new URL("../../src/components/shared/KelirScene.tsx", import.meta.url), "utf8");

test("KelirPreset punya field hem opsional (spec hem §3)", () => {
  assert.match(src, /hem\?:\s*string/, "interface harus punya hem?: string");
});

const HEM = {
  greeting: "HemSulur",
  couple: "HemMelati",
  lovestory: "HemKawung",
  dresscode: "HemKawung",
  gallery: "HemMelati",
  rsvp: "HemSulur",
  gift: "HemMelati",
};

for (const [id, hem] of Object.entries(HEM)) {
  test(`${id} memakai hem ${hem} (spec hem §2)`, () => {
    assert.match(
      src,
      new RegExp(`${id}:[^\\n]*hem:\\s*"${hem}"`),
      `preset ${id} harus menyetel hem: "${hem}"`,
    );
  });
}

test("section hero tak menyetel hem → default TumpalBand", () => {
  for (const id of ["cover", "akad", "resepsi", "closing"]) {
    const line = src.split("\n").find((l) => l.trimStart().startsWith(`${id}:`));
    assert.ok(line, `baris preset ${id} harus ada`);
    assert.doesNotMatch(line, /hem:/, `${id} tak boleh menyetel hem`);
  }
});

test("KelirScene merender hem dari preset (spec hem §3)", () => {
  assert.match(
    kelirScene,
    /asset\(preset\.hem \?\? "TumpalBand"\)/,
    "KelirScene harus memakai preset.hem ?? \"TumpalBand\"",
  );
});
