import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { auth } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/id/auth');
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <DashboardShell>{children}</DashboardShell>
    </NextIntlClientProvider>
  );
}
