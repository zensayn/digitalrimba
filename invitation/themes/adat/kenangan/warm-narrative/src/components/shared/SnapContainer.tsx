"use client";

import { useRef, type ReactNode } from "react";
import { ParallaxContext } from "./parallax-context";

/**
 * Client wrapper around the main scroll container. Owns the scroll ref and
 * exposes it through ParallaxContext so each ParallaxScene can bind its
 * scroll progress to this element. Server-component sections are passed
 * through as `children` untouched.
 */
export default function SnapContainer({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ParallaxContext.Provider value={scrollRef}>
      <div ref={scrollRef} className="snap-container">
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}
