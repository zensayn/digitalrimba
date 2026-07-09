import InvitationExperience from "@/components/shared/InvitationExperience";
import type { InvitationConfig } from "@/lib/config-types";
import configJson from "../../invitation.config.json";

const config = configJson as InvitationConfig;

export default function Page() {
  return <InvitationExperience config={config} />;
}
