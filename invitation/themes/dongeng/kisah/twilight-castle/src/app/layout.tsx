import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

// ── Tipografi khas twilight-castle — hirarki 3-tingkat yang tegas ───────────────
// Hirarki sengaja kontras supaya tiap peran punya suara sendiri & tetap terbaca:
//   Cinzel               → judul utama & nama mempelai. Serif kapital "terukir"
//                          ala trajan/roman klasik: megah, proporsional, arsitektural.
//   Cormorant Garamond   → sub-judul & tanggal. Serif halus bernuansa sastra
//                          dongeng klasik (dulu Playfair) — juga untuk "&"/nama tamu.
//   Plus Jakarta Sans    → teks isi & detail acara. Sans-serif modern nan bersih
//                          (dulu EB Garamond) agar info lokasi/waktu mudah dibaca
//                          di layar HP tanpa bertabrakan dengan font ornamen.
const fontDisplay = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});
const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const fontScript = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-script",
  display: "swap",
});
const fontVars = `${fontDisplay.variable} ${fontBody.variable} ${fontScript.variable}`;

// ── GANTI: Sesuaikan dengan nama pasangan & tanggal ──────────────────────────
export const metadata: Metadata = {
  title: `${couple.groom.name} & ${couple.bride.name} — The Wedding | Rimba Digital`,
  description: `Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan ${couple.groom.name} & ${couple.bride.name}.`,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: `${couple.groom.name} & ${couple.bride.name} — The Wedding`,
    description: `Undangan pernikahan bertema istana dongeng senja yang megah.`,
    type: "website",
  },
};
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cssVars = buildCssVars(theme);
  return (
    <html lang="id" className={`h-full ${fontVars}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* CSS vars statis dari invitation config */}
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
