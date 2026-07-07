const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type BudgetCategorySummary = {
  name: string;
  budgeted: number;
  estimated: number;
  planned: number;
  actual: number;
  paid: number;
  overspend: boolean;
};

export type BudgetSummary = {
  total_budgeted: number;
  total_actual: number;
  total_paid: number;
  overspend: boolean;
  categories: BudgetCategorySummary[];
};

export type CategoryBudget = {
  category: string;
  planned_amount: number;
};

export type BudgetItem = {
  id: string;
  category: string;
  item_name: string;
  vendor?: string | null;
  estimated_amount: number;
  actual_amount: number;
  paid_amount: number;
  paid: boolean;
  payment_status: PaymentStatus;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateBudgetItemInput = {
  category: string;
  item_name: string;
  vendor?: string;
  estimated_amount: number;
  actual_amount: number;
  paid_amount: number;
  due_date?: string | null;
};

export type UpdateBudgetItemInput = {
  category?: string;
  item_name?: string;
  vendor?: string | null;
  estimated_amount?: number;
  actual_amount?: number;
  paid_amount?: number;
  due_date?: string | null;
};

let _cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now) {
    return _cachedToken.value;
  }
  const res = await fetch('/api/auth/token');
  if (!res.ok) throw new Error('Not signed in');
  const { token } = (await res.json()) as { token: string };
  _cachedToken = { value: token, expiresAt: now + 13 * 60 * 1000 };
  return token;
}

async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> | undefined),
    Authorization: `Bearer ${token}`,
  };
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, { ...options, headers });
}

export async function fetchBudgetSummary(): Promise<BudgetSummary> {
  const res = await authedFetch(`${BASE}/api/budget/summary`);
  if (!res.ok) throw new Error(`Budget summary fetch failed: ${res.status}`);
  return res.json();
}

export async function createBudgetItem(params: CreateBudgetItemInput): Promise<BudgetItem> {
  const res = await authedFetch(`${BASE}/api/budget/items`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Create budget item failed: ${res.status}`);
  return res.json();
}

export async function fetchBudgetItems(): Promise<BudgetItem[]> {
  const res = await authedFetch(`${BASE}/api/budget/items`);
  if (!res.ok) throw new Error(`Budget items fetch failed: ${res.status}`);
  return res.json();
}

export async function updateBudgetItem(id: string, params: UpdateBudgetItemInput): Promise<BudgetItem> {
  const res = await authedFetch(`${BASE}/api/budget/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Update budget item failed: ${res.status}`);
  return res.json();
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const res = await authedFetch(`${BASE}/api/budget/items/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Delete budget item failed: ${res.status}`);
}

export async function fetchCategoryBudgets(): Promise<CategoryBudget[]> {
  const res = await authedFetch(`${BASE}/api/budget/category-budgets`);
  if (!res.ok) throw new Error(`Category budgets fetch failed: ${res.status}`);
  return res.json();
}

export async function upsertCategoryBudget(category: string, planned_amount: number): Promise<CategoryBudget> {
  const res = await authedFetch(`${BASE}/api/budget/category-budgets`, {
    method: 'PUT',
    body: JSON.stringify({ category, planned_amount }),
  });
  if (!res.ok) throw new Error(`Set category budget failed: ${res.status}`);
  return res.json();
}
