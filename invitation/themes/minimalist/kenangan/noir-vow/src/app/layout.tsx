import type { Metadata } from "next";
import { Bodoni_Moda, Jost, Imperial_Script } from "next/font/google";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

// ── Tipografi "mahal" (di-selfhost oleh Next → tanpa FOUT / Comic Sans fallback) ─
// Serif berkontras tebal-tipis (nama, angka, venue) + kaligrafi (nama tamu, "&")
// + sans halus (teks). Bodoni Moda dipilih untuk noir-vow — kontras stroke tinggi
// terasa cinematic/editorial, beda dari Cormorant Garamond (kontras rendah, dipakai
// Soft Bloom & Pavilion Romance) yang lebih cocok untuk mood floral-lembut.
const fontDisplay = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const fontBody = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const fontScript = Imperial_Script({
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
    description: `Undangan pernikahan bertema bunga liar pastel yang segar.`,
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
