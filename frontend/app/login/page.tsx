import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import LoginPage from '@/components/auth/LoginPage';

export default async function LoginRoutePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/dashboard');
  return <LoginPage mode="sign-in" />;
}
