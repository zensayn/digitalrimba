import { headers } from "next/headers";
import { Suspense } from "react";
import SinemaExperience from "@/components/SinemaExperience";
import { resolveConfig } from "@/lib/resolve-config";

export default async function Page() {
  const config = await resolveConfig((await headers()).get("x-rimba-slug"));

  return (
    <Suspense fallback={null}>
      <SinemaExperience config={config} />
    </Suspense>
  );
}
