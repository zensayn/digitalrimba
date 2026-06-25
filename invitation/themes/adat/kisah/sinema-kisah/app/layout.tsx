import type { Metadata } from "next";
import "./globals.css";
import { theme, couple } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";

export const metadata: Metadata = {
  title: `${couple.groom.name} & ${couple.bride.name} — Kisah | Rimba Digital`,
  description: `Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan ${couple.groom.name} & ${couple.bride.name}.`,
  openGraph: {
    title: `${couple.groom.name} & ${couple.bride.name} — Kisah`,
    description: "Sebuah kisah cinta yang terangkai indah.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cssVars = buildCssVars(theme);
  return (
    <html lang="id" className="h-full" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="h-full antialiased overflow-hidden film-grain">
        {children}
      </body>
    </html>
  );
}
