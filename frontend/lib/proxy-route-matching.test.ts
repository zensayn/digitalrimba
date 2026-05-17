import assert from "node:assert/strict";
import test from "node:test";

test("protected route matching uses path segment boundaries", async () => {
  const { isProtectedRoute } = await import(`./proxy-route-matching.ts?protected-${Date.now()}`);

  assert.equal(isProtectedRoute("/onboarding"), true);
  assert.equal(isProtectedRoute("/onboarding/details"), true);
  assert.equal(isProtectedRoute("/id/onboarding"), true);
  assert.equal(isProtectedRoute("/id/onboarding/details"), true);

  assert.equal(isProtectedRoute("/onboarding-success"), false);
  assert.equal(isProtectedRoute("/id/onboarding-success"), false);
});

test("non-localized app route matching uses path segment boundaries", async () => {
  const { isNonLocalizedAppRoute } = await import(`./proxy-route-matching.ts?app-${Date.now()}`);

  assert.equal(isNonLocalizedAppRoute("/dashboard"), true);
  assert.equal(isNonLocalizedAppRoute("/dashboard/guests"), true);
  assert.equal(isNonLocalizedAppRoute("/onboarding"), true);
  assert.equal(isNonLocalizedAppRoute("/onboarding/details"), true);

  assert.equal(isNonLocalizedAppRoute("/dashboard-preview"), false);
  assert.equal(isNonLocalizedAppRoute("/onboarding-success"), false);
});
