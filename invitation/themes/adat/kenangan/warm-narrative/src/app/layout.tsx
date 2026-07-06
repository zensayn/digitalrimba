import type { Metadata } from "next";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

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
    <html lang="id" className="h-full" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="preconnect" href="https://pub-eb7353f7b67c4ec3b1c5d6d82cf29169.r2.dev" />
        <link rel="preconnect" href="https://pub-ba3f4c2f41c847219cf24b0bfe7524a4.r2.dev" />
        {/* CSS vars statis dari invitation config */}
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
