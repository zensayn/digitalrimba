import assert from "node:assert/strict";
import test from "node:test";

type FetchCall = {
  url: string;
  init: RequestInit | undefined;
};

test("dashboard API gets Better Auth JWT with GET", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch(calls, {
    "/api/auth/token": { token: "jwt-token" },
    "/api/dashboard": {
      wedding: null,
      guests: { invited: 0, confirmed: 0, declined: 0, pending: 0, history: null },
      budget: { total: 0, spent: 0, paid: 0, remaining: 0, utilization: 0, next_payment: null },
      checklist: { total: 0, completed: 0, progress: 0, tasks: null },
      alerts: { urgent_tasks: 0, overdue_tasks: 0, overdue_budget_items: 0, pending_rsvps: 0 },
      next_milestone: null,
    },
  });

  try {
    const { fetchDashboardOverview } = await import(`./dashboard.ts?dashboard-${Date.now()}`);
    const overview = await fetchDashboardOverview();

    assert.equal(calls[0]?.url, "/api/auth/token");
    assert.notEqual(calls[0]?.init?.method, "POST");
    assert.equal(calls[1]?.url, "/api/dashboard");
    assert.equal(new Headers(calls[1]?.init?.headers).get("Authorization"), "Bearer jwt-token");
    assert.deepEqual(overview.guests.history, []);
    assert.deepEqual(overview.checklist.tasks, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
