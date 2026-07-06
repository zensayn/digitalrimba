"use client";

import { createContext, useContext, type RefObject } from "react";

/**
 * Holds a ref to the scrolling element (`.snap-container`) so that
 * ParallaxScene instances can measure scroll progress against the real
 * scroll container instead of the window.
 */
export const ParallaxContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useParallaxContainer() {
  return useContext(ParallaxContext);
}
