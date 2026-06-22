import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";

const ROOT = join(import.meta.dir, "..");
const SHARED = join(ROOT, "_shared");

type ThemeConfig = {
  name: string;
  path: string;        // relatif dari ROOT
  hasSrc: boolean;     // true → components ada di src/components/
  hasInfiniteMenu: boolean;
};

const THEMES: ThemeConfig[] = [
  {
    name: "sacred-luxe",
    path: "themes/adat/kenangan/sacred-luxe",
    hasSrc: true,
    hasInfiniteMenu: true,
  },
  {
    name: "warm-narrative",
    path: "themes/adat/kenangan/warm-narrative",
    hasSrc: true,
    hasInfiniteMenu: true,
  },
  {
    name: "sinema-kisah",
    path: "themes/adat/kisah/sinema-kisah",
    hasSrc: false,
    hasInfiniteMenu: false,
  },
];

function ensureDir(filePath: string) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyFile(from: string, to: string, transform?: (src: string) => string) {
  const content = readFileSync(from, "utf-8");
  ensureDir(to);
  writeFileSync(to, transform ? transform(content) : content, "utf-8");
  console.log(`  ✓ ${to.replace(ROOT + "/", "").replace(ROOT + "\\", "")}`);
}

function componentsDir(theme: ThemeConfig): string {
  return join(ROOT, theme.path, theme.hasSrc ? "src/components" : "components");
}

function libDir(theme: ThemeConfig): string {
  return join(ROOT, theme.path, theme.hasSrc ? "src/lib" : "lib");
}

// Dari posisi components/shared/RimbaConfigProvider.tsx ke invitation.config.json di root theme:
// hasSrc=true  → src/components/shared/ → ../../../  (3 levels up)
// hasSrc=false → components/shared/     → ../../     (2 levels up)
function configJsonPath(theme: ThemeConfig): string {
  return theme.hasSrc
    ? "../../../invitation.config.json"
    : "../../invitation.config.json";
}

function syncTheme(theme: ThemeConfig) {
  console.log(`\n→ ${theme.name}`);

  const compShared = join(componentsDir(theme), "shared");
  const lib = libDir(theme);

  // lib — di-sync ke lokasi yang sama (tidak ke shared/ subfolder)
  copyFile(join(SHARED, "lib/config-types.ts"), join(lib, "config-types.ts"));
  copyFile(join(SHARED, "lib/css-vars.ts"), join(lib, "css-vars.ts"));

  // MusicPlayer
  copyFile(
    join(SHARED, "components/MusicPlayer.tsx"),
    join(compShared, "MusicPlayer.tsx")
  );

  // RimbaConfigProvider — transform path JSON import sesuai struktur theme
  const jsonPath = configJsonPath(theme);
  copyFile(
    join(SHARED, "components/RimbaConfigProvider.tsx"),
    join(compShared, "RimbaConfigProvider.tsx"),
    (src) =>
      src.replace(
        /import staticConfig from ".*?invitation\.config\.json"/,
        `import staticConfig from "${jsonPath}"`
      )
  );

  // InfiniteMenu — hanya untuk theme yang pakai globe gallery
  if (theme.hasInfiniteMenu) {
    copyFile(
      join(SHARED, "components/InfiniteMenu.tsx"),
      join(compShared, "InfiniteMenu.tsx")
    );
    copyFile(
      join(SHARED, "components/InfiniteMenu.css"),
      join(compShared, "InfiniteMenu.css")
    );
  }
}

console.log("🔄 Rimba sync-shared\n");
for (const theme of THEMES) {
  syncTheme(theme);
}
console.log("\n✅ Sync selesai.");
