"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRoster, type CheckInGuest } from "@/lib/api/checkin-operator";
import { cacheGuests, getCachedGuests, putCachedGuest } from "@/lib/checkin/offline-db";

/**
 * Keeps the full guest roster in memory (for instant fuzzy search) and
 * mirrored in IndexedDB (to survive refresh and outages). Network first,
 * cache fallback.
 */
export function useOfflineGuestCache(token: string | null) {
  const [roster, setRoster] = useState<CheckInGuest[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    const requestId = ++requestIdRef.current;
    try {
      const guests = await fetchRoster(token);
      if (requestId !== requestIdRef.current) return; // superseded by a newer refresh
      await cacheGuests(guests);
      setRoster(guests);
      setFromCache(false);
    } catch {
      const cached = await getCachedGuests().catch(() => []);
      if (requestId === requestIdRef.current && cached.length > 0) {
        setRoster(cached);
        setFromCache(true);
      }
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  /** Merge one updated/new guest into memory + IndexedDB (after a scan or walk-in). */
  const upsertGuest = useCallback((guest: CheckInGuest) => {
    setRoster((prev) => {
      const idx = prev.findIndex((g) => g.id === guest.id);
      if (idx === -1) return [...prev, guest];
      const next = [...prev];
      next[idx] = guest;
      return next;
    });
    void putCachedGuest(guest);
  }, []);

  return { roster, fromCache, refresh, upsertGuest };
}
