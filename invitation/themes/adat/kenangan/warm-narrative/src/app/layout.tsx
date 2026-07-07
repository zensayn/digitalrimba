import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

// ── Fonts — self-hosted lewat next/font (tanpa render-blocking @import) ──────
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

import { ASSET_BASE as THEME_BASE, THEMES_CDN_ORIGIN } from "@/lib/assets";

// ── GANTI: Sesuaikan dengan nama pasangan & tanggal ──────────────────────────
export const metadata: Metadata = {
  title: `${couple.groom.name} & ${couple.bride.name} — The Wedding | Rimba Digital`,
  description: `Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan ${couple.groom.name} & ${couple.bride.name}.`,
  openGraph: {
    title: `${couple.groom.name} & ${couple.bride.name} — The Wedding`,
    description: `Sebuah perayaan cinta yang tak terlupakan.`,
    type: "website",
  },
};
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cssVars = buildCssVars(theme);
  return (
    <html
      lang="id"
      className={`h-full ${playfair.variable} ${sourceSerif.variable} ${inter.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.png" type="image/png" />
        {THEMES_CDN_ORIGIN && (
          <link rel="preconnect" href={THEMES_CDN_ORIGIN} />
        )}
        {/* First paint: amplop menutup seluruh layar — flap & stempel harus datang duluan */}
        <link rel="preload" as="image" type="image/webp" fetchPriority="high" href={`${THEME_BASE}/WarmAmplopFlapLeft.webp`} />
        <link rel="preload" as="image" type="image/webp" fetchPriority="high" href={`${THEME_BASE}/StempelWarm.webp`} />
        {/* Cover scene di balik amplop — layer LCP (kolom sakura & bg) di-preload
            karena baru ter-discover setelah hydration (ParallaxScene client-side) */}
        <link rel="preload" as="image" type="image/webp" fetchPriority="high" href={`${THEME_BASE}/CoverBg.webp`} />
        <link rel="preload" as="image" type="image/webp" fetchPriority="high" href={`${THEME_BASE}/SakuraColumnL.webp`} />
        <link rel="preload" as="image" type="image/webp" href={`${THEME_BASE}/SakuraColumnR.webp`} />
        <link rel="preload" as="image" type="image/webp" href={`${THEME_BASE}/CoverArch.webp`} />
        {/* CSS vars statis dari invitation config */}
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
