import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import LoginPage from '@/components/auth/LoginPage';

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return <LoginPage mode="sign-up" />;
}
