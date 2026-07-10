import { headers } from "next/headers";
import InvitationExperience from "@/components/shared/InvitationExperience";
import { resolveConfig } from "@/lib/resolve-config";

export default async function Page() {
  const config = await resolveConfig((await headers()).get("x-rimba-slug"));
  return <InvitationExperience config={config} />;
}
