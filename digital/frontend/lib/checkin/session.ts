// Operator session persisted in sessionStorage so a kiosk refresh doesn't
// force PIN re-entry. Cleared on tab close or explicit End Event.
// Exposed as a tiny external store for useSyncExternalStore (SSR-safe).

export type OperatorSession = {
  token: string;
  label: string;
};

const KEY_PREFIX = "checkin-session:";

let cached: { key: string; value: OperatorSession | null } | null = null;
const listeners = new Set<() => void>();

export function subscribeSession(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function readSession(eventCode: string): OperatorSession | null {
  const key = KEY_PREFIX + eventCode;
  if (cached?.key === key) return cached.value;
  let value: OperatorSession | null = null;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) value = JSON.parse(raw) as OperatorSession;
  } catch {
    value = null;
  }
  cached = { key, value };
  return value;
}

export function writeSession(
  eventCode: string,
  session: OperatorSession | null
): void {
  const key = KEY_PREFIX + eventCode;
  try {
    if (session) sessionStorage.setItem(key, JSON.stringify(session));
    else sessionStorage.removeItem(key);
  } catch {
    // storage unavailable — session lives in memory only
  }
  cached = { key, value: session };
  listeners.forEach((l) => l());
}
