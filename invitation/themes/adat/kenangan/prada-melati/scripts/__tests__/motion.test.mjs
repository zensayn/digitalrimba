import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

const goldDust = read("../../src/components/shared/GoldDust.tsx");
const page = read("../../src/app/page.tsx");
const globals = read("../../src/app/globals.css");

// ─── Task 1: GoldDust ──────────────────────────────────────────────────────
test("GoldDust: 14 serpih, generator deterministik sr() (spec gerak §2.1)", () => {
  assert.match(goldDust, /const COUNT = 14\b/, "COUNT harus 14");
  assert.match(goldDust, /function sr\(/, "harus punya seed deterministik sr()");
});

test("GoldDust: pakai aset SerpihEmas via asset(), fallback 404 aman", () => {
  assert.match(goldDust, /asset\("SerpihEmas"\)/, "harus merujuk aset SerpihEmas");
  assert.match(goldDust, /onError=\{hideOnError\}/, "harus sembunyikan bila 404");
});

test("GoldDust: dekoratif, keyframe per-serpih diinjeksi", () => {
  assert.match(goldDust, /aria-hidden/, "harus aria-hidden");
  assert.match(goldDust, /dangerouslySetInnerHTML/, "keyframe per-serpih via <style>");
});

test("page.tsx memasang GoldDust global (spec gerak §2.1)", () => {
  assert.match(page, /import GoldDust from "@\/components\/shared\/GoldDust"/);
  assert.match(page, /<GoldDust\s*\/>/);
});

test("globals: .gold-dust fixed + reduced-motion sembunyikan (spec gerak §2.1)", () => {
  assert.match(globals, /\.gold-dust\s*\{[^}]*position:\s*fixed/, ".gold-dust harus position:fixed");
  assert.match(
    globals,
    /prefers-reduced-motion:\s*reduce[\s\S]*\.gold-dust\s*\{\s*display:\s*none/,
    "reduced-motion harus display:none untuk .gold-dust",
  );
});

// ─── Task 2: Blencong flicker ──────────────────────────────────────────────
const kelir = read("../../src/components/shared/KelirScene.tsx");

test("blencong: napas sinus lama diganti (spec gerak §2.2)", () => {
  assert.doesNotMatch(
    kelir,
    /\[0\.85,\s*1,\s*0\.85\]/,
    "opacity napas simetris lama harus hilang",
  );
});

test("blencong: kedip tak beraturan 6 langkah + times + durasi 5s", () => {
  assert.match(kelir, /opacity:\s*\[0\.9,\s*1,\s*0\.86,\s*0\.97,\s*0\.88,\s*1\]/, "opacity flicker 6 langkah");
  assert.match(kelir, /times:\s*\[/, "harus pakai times tak rata");
  assert.match(kelir, /duration:\s*5\b/, "durasi flicker 5s");
});

test("blencong: reduced-motion tetap beku (animate undefined)", () => {
  assert.match(kelir, /animate=\{reduced \? undefined :/, "reduced → animate undefined");
});

// ─── Task 3: Kilau idle shimmer ────────────────────────────────────────────
const gilt = read("../../src/components/shared/GiltSweep.tsx");

test("kilau: idle shimmer menempel saat tidak reduced (spec gerak §2.3)", () => {
  assert.match(gilt, /reduced \? undefined : "gilt-idle"/, "kelas gilt-idle hanya saat tidak reduced");
});

test("globals: @keyframes giltIdle + matikan saat reduced-motion", () => {
  // `globals` (dibaca di puncak berkas) sudah mencerminkan globals.css final saat
  // seluruh test dijalankan di Task 3 — semua penyuntingan CSS sudah selesai.
  assert.match(globals, /@keyframes giltIdle/, "harus ada keyframes giltIdle");
  assert.match(globals, /\.gilt-idle\s*\{[^}]*animation:\s*giltIdle/, ".gilt-idle memakai animasi giltIdle");
  assert.match(
    globals,
    /prefers-reduced-motion:\s*reduce[\s\S]*\.gilt-idle\s*\{\s*animation:\s*none/,
    "reduced-motion harus mematikan .gilt-idle",
  );
});
