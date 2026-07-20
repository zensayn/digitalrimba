import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const src = readFileSync(new URL("../../src/components/shared/sceneKelir.ts", import.meta.url), "utf8");

const SECTION_IDS = [
  "cover", "greeting", "couple", "lovestory", "akad", "resepsi",
  "dresscode", "gallery", "rsvp", "gift", "rundown", "turut", "closing",
];

test("KELIR memuat semua id section (spec §10 + rundown/turut)", () => {
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
  rundown: "HemKawung",
  turut: "HemSulur",
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

// ─── Pembatas antar-section: hem per-section ────────────────────────────────
// Keputusan desain: hem tiap KelirScene jadi satu-satunya pembatas antar-section.
// TumpalSeam yang dulu menstraddle batas dihapus karena bertumpuk dengan hem
// (dua pita ornamen di garis yang sama → ramai, tak ada keindahan).
const page = readFileSync(new URL("../../src/app/page.tsx", import.meta.url), "utf8");

// ─── GebyokCard bingkai foto (spec pengayaan §6/§10) ─────────────────────────
const gebyokUrl = new URL("../../src/components/shared/GebyokCard.tsx", import.meta.url);
const coupleSection = readFileSync(new URL("../../src/components/sections/CoupleSection.tsx", import.meta.url), "utf8");

test("GebyokCard tersedia sebagai komponen shared", () => {
  assert.ok(existsSync(gebyokUrl), "GebyokCard.tsx harus dibuat");
});

test("GebyokCard menyediakan tiga varian bingkai", () => {
  assert.ok(existsSync(gebyokUrl), "GebyokCard.tsx harus dibuat sebelum kontraknya diperiksa");
  const gebyok = readFileSync(gebyokUrl, "utf8");
  assert.match(gebyok, /BingkaiGebyok/, "varian bingkai Gebyok harus ada");
  assert.match(gebyok, /BingkaiPraba/, "varian bingkai Praba harus ada");
  assert.match(gebyok, /BingkaiTumpal/, "varian bingkai Tumpal harus ada");
  assert.match(gebyok, /RonceanSudut/, "RonceanSudut gading harus tersedia");
  assert.match(gebyok, /corners/, "RonceanSudut harus opsional via prop corners");
});

test("GebyokCard: bingkai emas via GiltSweep, foto background-image", () => {
  assert.ok(existsSync(gebyokUrl), "GebyokCard.tsx harus dibuat sebelum kontraknya diperiksa");
  const gebyok = readFileSync(gebyokUrl, "utf8");
  assert.match(gebyok, /<GiltSweep\b/, "bingkai emas should render via GiltSweep");
  assert.match(gebyok, /backgroundImage/, "foto sebagai background-image");
  assert.match(gebyok, /onError=\{hideOnError\}/, "frame harus aman bila aset 404");
  assert.match(gebyok, /hidden/, "elemen dekoratif harus aria-hidden");
});

test("CoupleSection: person photo difframe from preset", () => {
  assert.match(
    coupleSection,
    /import GebyokCard from "@\/components\/shared\/GebyokCard"/,
    "CoupleSection harus mengimpor GebyokCard",
  );
  assert.match(
    coupleSection,
    /\<GebyokCard\b/,
    "CoupleSection harus memakai GebyokCard untuk foto mempelai",
  );
  assert.match(
    coupleSection,
    /kelirFor\("couple"\)/,
    "CoupleSection harus mengambil preset couple",
  );
});

test("page tidak lagi memasang TumpalSeam antar-section (hem jadi pembatas)", () => {
  assert.doesNotMatch(page, /TumpalSeam/, "TumpalSeam sudah dihapus, tak boleh dirujuk di page");
  assert.match(page, /renderSection\(id, config\)/, "section tetap dirender");
});
