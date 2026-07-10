import { headers } from "next/headers";
import InvitationExperience from "@/components/shared/InvitationExperience";
import { resolveConfig } from "@/lib/resolve-config";

export default async function Page() {
  const h = await headers();
  // The demo custom domain routes straight to this worker, so a client there
  // controls every header — honoring x-rimba-slug would let anyone render an
  // arbitrary tenant's invitation here. Router-forwarded requests keep the
  // invitation's own host (host-based routing can't deliver those here
  // directly), so any other host means the header came from the router.
  const host = (h.get("host") ?? "").split(":")[0];
  const slug = host === "soft-bloom.rimba.io" ? null : h.get("x-rimba-slug");
  const config = await resolveConfig(slug);
  return <InvitationExperience config={config} />;
}
