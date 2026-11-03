// Ruang punya nasib yang sama dengan warna sebelum token-contract: dulu tiap
// section menulis clamp()-nya sendiri, dan tak ada satu pun yang salah secara
// teknis — hasilnya 6 padding-atas, 5 padding-bawah, 3 gutter, dan 5 lebar kolom
// berbeda untuk peran yang sama, tanpa ada yang pernah memutuskannya. Tes ini
// menetapkan globals.css (--space-*, --section-pad-*, --gutter, --content-max)
// sebagai satu-satunya sumber angka jarak, dan src/lib/rhythm.ts sebagai
// satu-satunya tempat perbedaan antar-section boleh ditulis.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");

const css = read("../../src/app/globals.css");
const rhythm = read("../../src/lib/rhythm.ts");

// Path biasa, bukan new URL — di Windows path absolut C:\... akan diurai
// new URL sebagai protokol "c:" dan gagal.
const SECTIONS = fileURLToPath(new URL("../../src/components/sections/", import.meta.url));

const sectionFiles = () =>
  readdirSync(SECTIONS)
    .filter((name) => name.endsWith("Section.tsx"))
    .map((name) => ({ name, text: readFileSync(join(SECTIONS, name), "utf8") }));

const SPACE_TOKENS = [
  "--space-2xs", "--space-xs", "--space-sm", "--space-md", "--space-lg",
  "--space-block", "--space-group",
  "--gutter", "--content-max", "--content-max-wide", "--shell-max", "--shell-gap",
  "--frame-max", "--frame-crown", "--frame-breath", "--pad-block",
  "--frame-safe-top", "--section-pad-bottom",
];

test("setiap token ruang terdefinisi di globals.css", () => {
  for (const token of SPACE_TOKENS) {
    assert.ok(
      new RegExp(`^\\s*${token}:`, "m").test(css),
      `globals.css tidak mendefinisikan ${token}`,
    );
  }
});

test("globals.css mendefinisikan kolom konten bersama .section-shell", () => {
  assert.ok(css.includes(".section-shell {"), "globals.css tidak mendefinisikan .section-shell");
});

// Regresi berbiaya mahal & tanpa gejala keras: --frame-safe-top pernah tinggal
// di :root. Karena var() disubstitusi di elemen tempat properti DIDEKLARASIKAN,
// var(--frame-max) di dalamnya membeku jadi 0px milik :root — semua section
// framed diam-diam kehilangan zona amannya dan judulnya masuk ke dalam bunga.
// Tak ada tes lama yang bisa melihatnya; hanya screenshot.
test("rumus zona aman atas dideklarasikan di .section-shell, bukan di :root", () => {
  const shellBlock = css.slice(css.indexOf(".section-shell {"));
  assert.ok(
    /--frame-safe-top:[^;]*var\(--frame-max\)/.test(shellBlock.slice(0, shellBlock.indexOf("}"))),
    ".section-shell tidak mendeklarasikan --frame-safe-top yang memakai --frame-max",
  );

  // Cocokkan selektor :root yang sungguhan (di awal baris), bukan kata ":root"
  // yang kebetulan disebut di komentar penjelas.
  const rootBlocks = [...css.matchAll(/^[\t ]*:root\s*\{([^}]*)\}/gm)];
  assert.ok(rootBlocks.length >= 2, `hanya menemukan ${rootBlocks.length} blok :root — regexnya lolos hampa`);
  for (const [, body] of rootBlocks) {
    assert.ok(
      !/--frame-safe-top:/.test(body),
      "--frame-safe-top dideklarasikan di :root — var(--frame-max) akan membeku jadi nilai :root",
    );
  }
});

test("setiap section memakai .section-shell", () => {
  for (const file of sectionFiles()) {
    assert.ok(
      file.text.includes('className="section-shell"') || file.text.includes('className="section-shell'),
      `${file.name} tidak memakai .section-shell — kolom kontennya lepas dari kontrak ruang`,
    );
  }
});

test("setiap section mengambil ritmenya dari rhythm.ts", () => {
  for (const file of sectionFiles()) {
    assert.ok(
      file.text.includes("rhythmVars("),
      `${file.name} tidak memanggil rhythmVars() — --frame-max & override ruangnya tak terikat tabel`,
    );
  }
});

// Inilah cacat yang sebenarnya diperbaiki: bukan "ada padding di section",
// melainkan section yang mengarang SENDIRI ruang vertikal berskala-layar.
// Nudge optik beberapa piksel (mis. paddingBottom: 6 pada glif script cover)
// bukan urusan kontrak ini — yang dijaga adalah padding vertikal yang memakai
// clamp()/satuan viewport, karena itulah bentuk "margin section" di tema ini.
test("tak ada section yang mengarang ruang vertikal atau gutter sendiri", () => {
  const BANNED = [
    [/padding(Top|Bottom)\s*:\s*["'`][^"'`]*(clamp\(|vh|svh|dvh|vw)/, "paddingTop/paddingBottom berskala-layar"],
    [/padding-(top|bottom)\s*:[^;]*(clamp\(|vh|svh|dvh|vw)/, "padding-top/padding-bottom berskala-layar"],
    [/className="[^"]*\bp[xytb]-\d/, "utilitas padding Tailwind (px-/py-/pt-/pb-)"],
  ];
  for (const file of sectionFiles()) {
    for (const [pattern, label] of BANNED) {
      const line = file.text
        .split("\n")
        .findIndex((text) => pattern.test(text) && !text.trimStart().startsWith("//"));
      assert.equal(
        line,
        -1,
        `${file.name}:${line + 1} menyetel ${label} — ruang vertikal & gutter milik token --section-pad-* / --gutter`,
      );
    }
  }
});

test("lebar kolom tidak disetel per section", () => {
  const BANNED = [/\bmax-w-(sm|md|lg|xl)\b/, /maxWidth:\s*["']?\d{3}/];
  for (const file of sectionFiles()) {
    for (const pattern of BANNED) {
      // FloralDivider & TopFrame memang menerima maxWidth ornamen — yang dilarang
      // adalah lebar KOLOM KONTEN, jadi hanya baris pembungkus yang diperiksa.
      const offenders = file.text
        .split("\n")
        .filter((text) => pattern.test(text) && /className=|<div|<section/.test(text));
      assert.deepEqual(
        offenders,
        [],
        `${file.name} mematok lebar kolom sendiri: ${JSON.stringify(offenders)} — pakai --content-max / width:"wide" di rhythm.ts`,
      );
    }
  }
});

test("setiap section yang dirender punya baris di tabel RITME", () => {
  const experience = read("../../src/components/shared/InvitationExperience.tsx");
  const known = experience
    .slice(experience.indexOf("KNOWN_SECTIONS"), experience.indexOf("]);"))
    .match(/"([a-z]+)"/g)
    ?.map((quoted) => quoted.replaceAll('"', "")) ?? [];

  assert.ok(known.length > 0, "tidak berhasil membaca KNOWN_SECTIONS");
  for (const id of known) {
    assert.ok(
      new RegExp(`^\\s*${id}:`, "m").test(rhythm),
      `RITME tidak punya baris untuk section "${id}" — ritmeFor() akan melempar saat dirender`,
    );
  }
});

test("--frame-max hanya ditulis di rhythm.ts, bukan di TopFrame per section", () => {
  for (const file of sectionFiles()) {
    assert.ok(
      !/<TopFrame[^>]*maxWidth/.test(file.text),
      `${file.name} menyetel <TopFrame maxWidth> sendiri — lebar bingkai & zona aman atas jadi bisa melenceng`,
    );
  }
});
