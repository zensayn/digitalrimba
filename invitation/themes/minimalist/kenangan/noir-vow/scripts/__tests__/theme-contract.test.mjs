// Identitas tema (slug, host, path CDN) dulu tersebar di 4 berkas. Sekali salah
// salin, tak ada error — cuma aset 404 diam-diam atau guard slug menunjuk domain
// tema lain. Tes ini yang menahannya: src/lib/theme-meta.ts jadi sumbernya,
// sisanya wajib ikut.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");

// wrangler.jsonc memuat komentar `//` → buang baris komentar sebelum di-parse.
// Cukup baris penuh: berkas ini tak punya komentar di ujung baris berisi nilai.
const parseJsonc = (text) =>
  JSON.parse(
    text
      .split("\n")
      .filter((line) => !line.trim().startsWith("//"))
      .join("\n"),
  );

const meta = read("../../src/lib/theme-meta.ts");
const readConst = (name) => {
  const match = meta.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`));
  assert.ok(match, `theme-meta.ts tidak mengekspor ${name}`);
  return match[1];
};

const THEME_SLUG = readConst("THEME_SLUG");
const THEME_HOST = readConst("THEME_HOST");
const THEME_CDN_PATH = readConst("THEME_CDN_PATH");

const wrangler = parseJsonc(read("../../wrangler.jsonc"));
const pkg = JSON.parse(read("../../package.json"));
const config = JSON.parse(read("../../invitation.config.json"));

test("nama worker mengikuti slug tema", () => {
  assert.equal(wrangler.name, `rimba-${THEME_SLUG}`);
});

test("custom domain di wrangler sama dengan THEME_HOST", () => {
  const patterns = (wrangler.routes ?? []).map((route) => route.pattern);
  assert.ok(
    patterns.includes(THEME_HOST),
    `routes ${JSON.stringify(patterns)} tidak memuat ${THEME_HOST}`,
  );
});

test("THEME_HOST adalah subdomain dari slug", () => {
  assert.equal(THEME_HOST, `${THEME_SLUG}.rimba.io`);
});

test("path CDN aset berakhir dengan slug tema", () => {
  assert.ok(
    THEME_CDN_PATH.endsWith(`/${THEME_SLUG}`),
    `${THEME_CDN_PATH} tidak berakhir dengan /${THEME_SLUG}`,
  );
});

test("nama package diturunkan dari path CDN", () => {
  assert.equal(pkg.name, THEME_CDN_PATH.replace(/\//g, "-"));
});

test("assets.ts dan page.tsx tidak lagi menulis nama tema secara manual", () => {
  for (const file of ["../../src/lib/assets.ts", "../../src/app/page.tsx"]) {
    assert.ok(
      !read(file).includes(THEME_SLUG),
      `${file} masih menulis "${THEME_SLUG}" — pakai konstanta dari theme-meta.ts`,
    );
  }
});

test("TEMPLATE.md menyebut setiap berkas yang wajib diganti saat menyalin tema", () => {
  const template = read("../../TEMPLATE.md");
  const SWAP_SURFACE = [
    "src/lib/theme-meta.ts",
    "wrangler.jsonc",
    "package.json",
    "invitation.config.json",
    "src/app/layout.tsx",
    "public/images",
    "README.md",
    "DESIGN_SPEC.md",
  ];
  for (const path of SWAP_SURFACE) {
    assert.ok(template.includes(path), `TEMPLATE.md tidak menyebut ${path}`);
  }
});

test("font di config sama dengan yang benar-benar di-import layout", () => {
  const layout = read("../../src/app/layout.tsx");
  for (const [role, name] of Object.entries(config.theme.typography)) {
    const identifier = name.replace(/ /g, "_");
    assert.ok(
      layout.includes(identifier),
      `layout.tsx tidak meng-import ${name} padahal config menyebutnya sebagai ${role}`,
    );
  }
});
