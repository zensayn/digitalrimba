import SinemaExperience from "@/components/SinemaExperience";
import type { InvitationConfig } from "@/lib/config-types";
import configJson from "../invitation.config.json";
import { Suspense } from "react";

const config = configJson as InvitationConfig;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SinemaExperience config={config} />
    </Suspense>
  );
}
