import { redirect } from "next/navigation";

// /en/dashboard and /id/dashboard are locale-aware entry points.
// The canonical dashboard lives at /dashboard (under the (dashboard) route group).
// next-intl is bypassed for /dashboard in proxy.ts so this redirect is safe.
export default function LocaleDashboardPage() {
  redirect("/dashboard");
}
