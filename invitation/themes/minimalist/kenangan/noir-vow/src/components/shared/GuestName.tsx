"use client";

import { useSearchParams } from "next/navigation";

export default function GuestName({ fallback = "Tamu Undangan" }: { fallback?: string }) {
  const searchParams = useSearchParams();
  return searchParams.get("to")?.trim() || fallback;
}
