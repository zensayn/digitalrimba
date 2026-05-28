const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type DashboardWedding = {
  id: string;
  couple_name: string;
  event_date: string;
  status: string;
};

export type DashboardGuestHistoryPoint = {
  date: string;
  confirmed: number;
  declined: number;
  pending: number;
};

export type DashboardGuestSummary = {
  invited: number;
  confirmed: number;
  declined: number;
  pending: number;
  history: DashboardGuestHistoryPoint[];
};

export type DashboardNextPayment = {
  label: string;
  amount: number;
  due_date: string;
  due_in: number;
};

export type DashboardBudgetSummary = {
  total: number;
  spent: number;
  paid: number;
  remaining: number;
  utilization: number;
  overspend: boolean;
  next_payment: DashboardNextPayment | null;
};

export type DashboardTask = {
  id: string;
  label: string;
  category: string;
  assigned_to: string;
  urgent: boolean;
  due_date: string;
};

export type DashboardChecklistSummary = {
  total: number;
  completed: number;
  progress: number;
  tasks: DashboardTask[];
};

export type DashboardAlerts = {
  urgent_tasks: number;
  overdue_tasks: number;
  overdue_budget_items: number;
  pending_rsvps: number;
};

export type DashboardMilestone = {
  label: string;
  due_date: string;
  kind: string;
};

export type DashboardOverview = {
  wedding: DashboardWedding | null;
  guests: DashboardGuestSummary;
  budget: DashboardBudgetSummary;
  checklist: DashboardChecklistSummary;
  alerts: DashboardAlerts;
  next_milestone: DashboardMilestone | null;
};

let _cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now) {
    return _cachedToken.value;
  }

  const res = await fetch("/api/auth/token");
  if (!res.ok) throw new Error("Not signed in");

  const { token } = (await res.json()) as { token: string };
  _cachedToken = { value: token, expiresAt: now + 13 * 60 * 1000 };
  return token;
}

async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(options?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await authedFetch(`${BASE}/api/dashboard`);
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return normalizeDashboardOverview((await res.json()) as Partial<DashboardOverview>);
}

export function normalizeDashboardOverview(raw: Partial<DashboardOverview>): DashboardOverview {
  return {
    wedding: raw.wedding ?? null,
    guests: {
      invited: raw.guests?.invited ?? 0,
      confirmed: raw.guests?.confirmed ?? 0,
      declined: raw.guests?.declined ?? 0,
      pending: raw.guests?.pending ?? 0,
      history: raw.guests?.history ?? [],
    },
    budget: {
      total: raw.budget?.total ?? 0,
      spent: raw.budget?.spent ?? 0,
      paid: raw.budget?.paid ?? 0,
      remaining: raw.budget?.remaining ?? 0,
      utilization: raw.budget?.utilization ?? 0,
      overspend: raw.budget?.overspend ?? false,
      next_payment: raw.budget?.next_payment ?? null,
    },
    checklist: {
      total: raw.checklist?.total ?? 0,
      completed: raw.checklist?.completed ?? 0,
      progress: raw.checklist?.progress ?? 0,
      tasks: raw.checklist?.tasks ?? [],
    },
    alerts: {
      urgent_tasks: raw.alerts?.urgent_tasks ?? 0,
      overdue_tasks: raw.alerts?.overdue_tasks ?? 0,
      overdue_budget_items: raw.alerts?.overdue_budget_items ?? 0,
      pending_rsvps: raw.alerts?.pending_rsvps ?? 0,
    },
    next_milestone: raw.next_milestone ?? null,
  };
}
