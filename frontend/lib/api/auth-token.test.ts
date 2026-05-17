import assert from "node:assert/strict";
import test from "node:test";

type FetchCall = {
  url: string;
  init: RequestInit | undefined;
};

test("budget API gets Better Auth JWT with GET", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": { token: "jwt-token" },
    "/api/budget/summary": {
      total_budgeted: 0,
      total_actual: 0,
      overspend: false,
      categories: [],
    },
  });

  try {
    const { fetchBudgetSummary } = await import(`./budget.ts?budget-${Date.now()}`);
    await fetchBudgetSummary();
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls[0]?.url, "/api/auth/token");
  assert.notEqual(calls[0]?.init?.method, "POST");
});

test("guests API gets Better Auth JWT with GET", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": { token: "jwt-token" },
    "/api/guests": [],
  });

  try {
    const { fetchGuests } = await import(`./guests.ts?guests-${Date.now()}`);
    await fetchGuests();
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls[0]?.url, "/api/auth/token");
  assert.notEqual(calls[0]?.init?.method, "POST");
});

function mockFetch(calls: FetchCall[], responses: Record<string, unknown>) {
  return async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    calls.push({ url, init });
    if (!(url in responses)) {
      throw new Error(`Unexpected fetch: ${url}`);
    }

    return new Response(JSON.stringify(responses[url]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}
