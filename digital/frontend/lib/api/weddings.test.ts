import assert from "node:assert/strict";
import test from "node:test";

type FetchCall = {
  url: string;
  init: RequestInit | undefined;
};

test("wedding profile API gets Better Auth JWT with GET", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": { token: "jwt-token" },
    "/api/weddings/profile": { wedding: null },
  });

  try {
    const { fetchWeddingProfile } = await import(`./weddings.ts?weddings-${Date.now()}`);
    const profile = await fetchWeddingProfile();
    assert.equal(profile, null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls[0]?.url, "/api/auth/token");
  assert.equal(calls[1]?.url, "/api/weddings/profile");
  assert.equal(new Headers(calls[1]?.init?.headers).get("Authorization"), "Bearer jwt-token");
});

test("save wedding profile sends JSON payload with Better Auth JWT", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": { token: "jwt-token" },
    "/api/weddings/profile": {
      wedding: {
        id: "wed-1",
        slug: "alya-bima",
        couple_name: "Alya & Bima",
        event_date: "2026-08-24",
        venue_name: "Rimba Glass House",
        venue_address: "Jakarta",
        tier: "leaf",
        status: "draft",
      },
    },
  });

  try {
    const { saveWeddingProfile } = await import(`./weddings.ts?weddings-save-${Date.now()}`);
    const profile = await saveWeddingProfile({
      couple_name: "Alya & Bima",
      event_date: "2026-08-24",
      venue_name: "Rimba Glass House",
      venue_address: "Jakarta",
    });
    assert.equal(profile.couple_name, "Alya & Bima");
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls[1]?.url, "/api/weddings/profile");
  assert.equal(calls[1]?.init?.method, "PUT");
  assert.equal(new Headers(calls[1]?.init?.headers).get("Authorization"), "Bearer jwt-token");
  assert.equal(new Headers(calls[1]?.init?.headers).get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(calls[1]?.init?.body as string), {
    couple_name: "Alya & Bima",
    event_date: "2026-08-24",
    venue_name: "Rimba Glass House",
    venue_address: "Jakarta",
  });
});

test("wedding profile API rejects invalid token response", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": {},
  });

  try {
    const { fetchWeddingProfile } = await import(`./weddings.ts?weddings-invalid-token-${Date.now()}`);
    await assert.rejects(fetchWeddingProfile(), /Invalid token response/);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "/api/auth/token");
});

test("wedding profile API treats profile 404 as not onboarded", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": { token: "jwt-token" },
    "/api/weddings/profile": { status: 404, body: { error: "not found" } },
  });

  try {
    const { fetchWeddingProfile } = await import(`./weddings.ts?weddings-not-onboarded-${Date.now()}`);
    const profile = await fetchWeddingProfile();
    assert.equal(profile, null);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls[1]?.url, "/api/weddings/profile");
});

function mockFetch(calls: FetchCall[], responses: Record<string, unknown | { status: number; body: unknown }>) {
  return async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    calls.push({ url, init });
    if (!(url in responses)) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    const response = responses[url];
    if (isMockResponse(response)) {
      return new Response(JSON.stringify(response.body), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

function isMockResponse(value: unknown): value is { status: number; body: unknown } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "status" in value &&
      typeof value.status === "number" &&
      "body" in value,
  );
}
