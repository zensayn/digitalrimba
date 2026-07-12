import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const page = read("../../src/app/page.tsx");
const desktop = read("../../src/components/shared/DesktopCover.tsx");
const globals = read("../../src/app/globals.css");

test("page.tsx membungkus DesktopCover dalam .app-shell (spec §4)", () => {
  assert.match(page, /import DesktopCover from "@\/components\/shared\/DesktopCover"/);
  assert.match(page, /className="app-shell"/, ".app-shell wrapper harus ada");
  assert.match(page, /<DesktopCover\b/, "DesktopCover harus dirender");
});

test("DesktopCover reuse KelirScene cover + GuestName dalam Suspense (spec §2)", () => {
  assert.match(desktop, /kelirFor\("cover"\)/, "harus pakai preset cover");
  assert.match(desktop, /<KelirScene\b/, "harus reuse KelirScene");
  assert.match(desktop, /<Suspense[\s\S]*<GuestName\s*\/>[\s\S]*<\/Suspense>/, "GuestName wajib dalam Suspense");
  assert.match(desktop, /aria-hidden="true"/, "aside dekoratif harus aria-hidden");
});

test("DesktopCover meneruskan wheel ke .snap-container (spec §2)", () => {
  assert.match(desktop, /\.snap-container/);
  assert.match(desktop, /scrollBy/);
});

test("globals: desktop-cover default none + split @media 1024px (spec §3)", () => {
  assert.match(globals, /\.desktop-cover\s*\{\s*display:\s*none/, "default harus display:none");
  assert.match(globals, /@media \(min-width:\s*1024px\)/, "harus ada breakpoint 1024px");
  assert.match(globals, /\.app-shell\s*\{[^}]*display:\s*flex/, ".app-shell harus flex di desktop");
  assert.match(globals, /\.snap-container\s*\{[^}]*flex:\s*0 0 clamp\(/, "kolom kanan harus flex-basis clamp");
});
