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
