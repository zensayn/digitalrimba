import type { Metadata } from "next";
import { Marcellus, Lora, Inter } from "next/font/google";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

// Marcellus: kontras rendah, berkarakter pahatan — untuk emas yang terukir.
// Playfair Display dan Cormorant Garamond dilarang; keduanya suara tema lain.
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
      className={`h-full ${marcellus.variable} ${lora.variable} ${inter.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* CSS vars statis dari invitation config */}
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="h-full antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
