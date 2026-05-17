import assert from "node:assert/strict";
import test from "node:test";

const existingProfile = {
  id: "wed-1",
  slug: "alya-bima",
  couple_name: "Alya & Bima",
  event_date: "2026-08-24",
  venue_name: "Rimba Glass House",
  venue_address: "Jakarta",
  tier: "leaf",
  status: "draft",
};

test("dashboard without wedding profile redirects to onboarding", async () => {
  const { getWeddingProfileRedirectPath } = await import(`./wedding-profile-routing.ts?routing-empty-${Date.now()}`);

  assert.equal(getWeddingProfileRedirectPath(null, "/dashboard"), "/onboarding");
  assert.equal(getWeddingProfileRedirectPath(null, "/dashboard/guests"), "/onboarding");
});

test("onboarding with wedding profile redirects back to dashboard", async () => {
  const { getWeddingProfileRedirectPath } = await import(`./wedding-profile-routing.ts?routing-complete-${Date.now()}`);

  assert.equal(getWeddingProfileRedirectPath(existingProfile, "/onboarding"), "/dashboard");
});

test("loading state and valid dashboard profile do not redirect", async () => {
  const { getWeddingProfileRedirectPath } = await import(`./wedding-profile-routing.ts?routing-loaded-${Date.now()}`);

  assert.equal(getWeddingProfileRedirectPath(undefined, "/dashboard"), null);
  assert.equal(getWeddingProfileRedirectPath(existingProfile, "/dashboard"), null);
});
