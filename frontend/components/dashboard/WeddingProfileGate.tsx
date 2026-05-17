"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchWeddingProfile } from "@/lib/api/weddings";
import { getWeddingProfileRedirectPath } from "@/lib/wedding-profile-routing";

export default function WeddingProfileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profileQuery = useQuery({
    queryKey: ["wedding", "profile"],
    queryFn: fetchWeddingProfile,
  });

  const redirectPath = profileQuery.isSuccess
    ? getWeddingProfileRedirectPath(profileQuery.data, pathname)
    : null;

  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [redirectPath, router]);

  if (profileQuery.isLoading) {
    return <GateStatus title="Loading workspace" description="Checking wedding profile." />;
  }

  if (profileQuery.isError) {
    return (
      <GateStatus
        title="Wedding profile unavailable"
        description={profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load profile."}
      />
    );
  }

  if (redirectPath) {
    return <GateStatus title="Onboarding required" description="Redirecting to wedding profile onboarding." />;
  }

  return <>{children}</>;
}

function GateStatus({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-black">{title}</h2>
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
