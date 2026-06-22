import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingChrome';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Toaster } from '@/components/ui/sonner';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Pathname-aware chrome. Renders only on marketing routes; auth/dashboard
          routes naturally skip Header + Footer without extra wiring. */}
      <MarketingHeader />
      {children}
      <MarketingFooter />

      {/* ── Floating WhatsApp Button (Bottom Right) ── */}
      <FloatingWhatsApp />

      {/* Toasts (share-link copied, etc.) */}
      <Toaster position="bottom-center" />
    </NextIntlClientProvider>
  );
}
