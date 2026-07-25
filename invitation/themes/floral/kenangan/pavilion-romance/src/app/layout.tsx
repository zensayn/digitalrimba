import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Imperial_Script } from "next/font/google";
import "./globals.css";
import { config } from "@/data/invitation";
import { buildCssVars } from "@/lib/css-vars";
import { invitationSocialImage } from "@/lib/invitation-media";

// ── Tipografi "mahal" (di-selfhost oleh Next → tanpa FOUT / Comic Sans fallback) ─
// Serif elegan (nama, angka, venue) + kaligrafi (nama tamu, "&") + sans halus (teks).
const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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

const siteUrl = new URL("https://pavilion-romance.rimba.io");
const socialImage = invitationSocialImage(config.media.socialImage);
const title = `${config.couple.groom.name} & ${config.couple.bride.name} — The Wedding`;
const description = `Kami mengundang Anda untuk berbagi kebahagiaan di hari pernikahan ${config.couple.groom.name} & ${config.couple.bride.name}.`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `${title} | Rimba Digital`,
  description,
  alternates: { canonical: "/" },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Rimba Digital",
    title,
    description,
    images: [{ url: socialImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cssVars = buildCssVars(config.theme);
  const openingFallback = `
(() => {
  if (window.__rimbaOpeningFallback) return;
  window.__rimbaOpeningFallback = true;

  document.addEventListener("click", (event) => {
    // Setelah EnvelopeOverlay terhidrasi, React memegang kendali penuh.
    // Listener ini terdaftar lebih dulu dari listener delegasi React (sama-sama
    // di document) sehingga stopPropagation dari React tak bisa menahannya —
    // tanpa guard ini ia ikut menyetel translateY(-6%) di tengah animasi flap
    // (amplop "terangkat", menyisakan celah di dasar layar).
    if (window.__rimbaOpeningGateHydrated) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest("[data-open-invitation-button]");
    if (!button) return;

    // Penanda untuk React: undangan sudah dibuka sebelum hidrasi → EnvelopeOverlay
    // langsung melewati amplop saat mount (tanpa animasi ulang).
    window.__rimbaInvitationOpened = true;

    document.dispatchEvent(new CustomEvent("invitation-open"));
    window.scrollTo({ top: 0, behavior: "instant" });

    const content = document.getElementById("invitation-content");
    if (content) {
      content.removeAttribute("aria-hidden");
      content.removeAttribute("inert");
    }

    const gate = document.querySelector("[data-opening-gate]");
    if (gate instanceof HTMLElement) {
      gate.setAttribute("aria-hidden", "true");
      gate.style.opacity = "0";
      gate.style.pointerEvents = "none";
      gate.style.transform = "translateY(-6%)";
    }
  });
})();
`;
  return (
    <html lang="id" className={`h-full ${fontVars}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* CSS vars statis dari invitation config */}
        <style id="rimba-theme-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
        <script id="rimba-opening-fallback" dangerouslySetInnerHTML={{ __html: openingFallback }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
