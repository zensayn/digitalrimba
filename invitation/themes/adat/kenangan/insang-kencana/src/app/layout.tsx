import type { Metadata } from "next";
import { Prata, Work_Sans, Alex_Brush } from "next/font/google";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

// ── Tipografi "mahal" (di-selfhost oleh Next → tanpa FOUT / Comic Sans fallback) ─
// Serif klasik bernuansa manuskrip (nama, judul, angka) + kaligrafi (nama tamu, "&")
// + sans hangat untuk teks isi. Prata/Alex Brush sengaja beda dari Marcellus/Lora
// (prada-melati) supaya dua tema "adat" ini tidak terasa kembar meski satu palet
// keluarga (emas-hijau vs coklat-emas).
const fontDisplay = Prata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});
const fontBody = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const fontScript = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
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
    description: `Undangan pernikahan bernuansa adat Melayu — emas dan hijau, motif Corak Insang khas Pontianak.`,
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
