import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import WeddingProfileOnboarding from "@/components/onboarding/WeddingProfileOnboarding";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/id/auth");
  }

  return <WeddingProfileOnboarding />;
}
