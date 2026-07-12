"use client";

import { createContext, useContext, type RefObject } from "react";

/**
 * Ref ke elemen yang benar-benar men-scroll (`.snap-container`), supaya tiap
 * KelirScene mengukur progres scroll terhadap kontainer itu, bukan window.
 */
export const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useScrollContainer() {
  return useContext(ScrollContext);
}
