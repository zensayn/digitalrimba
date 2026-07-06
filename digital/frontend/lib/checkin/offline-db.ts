// IndexedDB persistence for the operator kiosk: guest roster cache,
// pending-scan replay queue, and small meta values (gift tag counter).
// Uses `idb` only to remove IndexedDB callback boilerplate.

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CheckInGuest, ScanPayload } from "@/lib/api/checkin-operator";

const DB_NAME = "rimba-checkin";
const DB_VERSION = 1;

export type PendingScan = ScanPayload & { queuedAt: number };

interface CheckinDBSchema extends DBSchema {
  guests: { key: string; value: CheckInGuest }; // keyed by qrToken
  pending_scans: { key: number; value: PendingScan };
  meta: { key: string; value: string | number };
}

let dbPromise: Promise<IDBPDatabase<CheckinDBSchema>> | null = null;

function getDB() {
  dbPromise ??= openDB<CheckinDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore("guests", { keyPath: "qrToken" });
      db.createObjectStore("pending_scans", { autoIncrement: true });
      db.createObjectStore("meta");
    },
  });
  return dbPromise;
}

// ── Guest roster cache ────────────────────────────────────────────────────────

export async function cacheGuests(guests: CheckInGuest[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("guests", "readwrite");
  await tx.store.clear();
  for (const g of guests) {
    if (g.qrToken) void tx.store.put(g);
  }
  await tx.done;
}

export async function getCachedGuests(): Promise<CheckInGuest[]> {
  return (await getDB()).getAll("guests");
}

export async function putCachedGuest(guest: CheckInGuest): Promise<void> {
  if (!guest.qrToken) return;
  await (await getDB()).put("guests", guest);
}

// ── Pending scan queue ────────────────────────────────────────────────────────

export async function enqueueScan(scan: PendingScan): Promise<void> {
  await (await getDB()).add("pending_scans", scan);
}

export async function getPendingScans(): Promise<
  { id: number; scan: PendingScan }[]
> {
  const db = await getDB();
  const tx = db.transaction("pending_scans");
  const out: { id: number; scan: PendingScan }[] = [];
  for await (const cursor of tx.store) {
    out.push({ id: cursor.key, scan: cursor.value });
  }
  return out;
}

export async function removePendingScan(id: number): Promise<void> {
  await (await getDB()).delete("pending_scans", id);
}

export async function countPendingScans(): Promise<number> {
  return (await getDB()).count("pending_scans");
}

// ── Meta values ───────────────────────────────────────────────────────────────

export async function getMeta(
  key: string
): Promise<string | number | undefined> {
  return (await getDB()).get("meta", key);
}

export async function setMeta(
  key: string,
  value: string | number
): Promise<void> {
  await (await getDB()).put("meta", value, key);
}

// ── End Event wipe ────────────────────────────────────────────────────────────

export async function wipeOfflineData(): Promise<void> {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = null;
  }
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}
