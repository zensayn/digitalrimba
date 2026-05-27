import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pangky & Radit — The Wedding | Rimba Digital",
  description: "Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan Pangky & Radit. 14 Juni 2026.",
  openGraph: {
    title: "Pangky & Radit — The Wedding",
    description: "Sebuah perayaan cinta. 14 Juni 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="h-full antialiased overflow-hidden">{children}</body>
    </html>
  );
}
