"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckinApiError,
  scanGuest,
  type CheckInGuest,
  type ScanPayload,
} from "@/lib/api/checkin-operator";
import {
  countPendingScans,
  enqueueScan,
  getPendingScans,
  removePendingScan,
} from "@/lib/checkin/offline-db";

export type SubmitScanResult =
  | { queued: true }
  | { queued: false; guest: CheckInGuest; alreadyArrived: boolean };

/**
 * Live-first scan writes with an offline replay queue. Network failures
 * queue the scan; HTTP errors (guest not found, 401…) are rethrown.
 * Replay is sequential against POST /api/checkin/scan, which is idempotent
 * (INSERT … ON CONFLICT DO NOTHING).
 */
export function useScanQueue(token: string | null) {
  const [pendingCount, setPendingCount] = useState(0);
  const flushingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    setPendingCount(await countPendingScans().catch(() => 0));
  }, []);

  const flush = useCallback(async () => {
    if (!token || flushingRef.current || !navigator.onLine) return;
    flushingRef.current = true;
    try {
      const pending = await getPendingScans();
      for (const { id, scan } of pending) {
        try {
          await scanGuest(token, scan);
          await removePendingScan(id);
        } catch (err) {
          if (err instanceof CheckinApiError) {
            // Server rejected this scan (e.g. guest deleted) — drop it so it
            // doesn't block the rest of the queue forever.
            await removePendingScan(id);
            continue;
          }
          break; // still offline — retry on next tick
        }
      }
    } finally {
      flushingRef.current = false;
      await refreshCount();
    }
  }, [token, refreshCount]);

  useEffect(() => {
    if (!token) return;
    queueMicrotask(() => {
      void refreshCount();
      void flush();
    });
    const interval = setInterval(() => void flush(), 15_000);
    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", onOnline);
    };
  }, [token, flush, refreshCount]);

  const submitScan = useCallback(
    async (payload: ScanPayload): Promise<SubmitScanResult> => {
      if (!token) throw new Error("not authenticated");
      const queue = async (): Promise<SubmitScanResult> => {
        await enqueueScan({ ...payload, queuedAt: Date.now() });
        await refreshCount();
        return { queued: true };
      };

      if (!navigator.onLine) return queue();
      try {
        const result = await scanGuest(token, payload);
        return { queued: false, ...result };
      } catch (err) {
        if (err instanceof CheckinApiError) throw err;
        return queue(); // network failure
      }
    },
    [token, refreshCount]
  );

  return { submitScan, pendingCount, flush };
}
