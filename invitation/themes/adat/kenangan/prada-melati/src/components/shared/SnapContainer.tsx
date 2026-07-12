"use client";

import { useRef, type ReactNode } from "react";
import { ScrollContext } from "./scroll-context";

/**
 * Pembungkus klien untuk kontainer scroll utama. Ia memegang scrollRef dan
 * menyebarkannya lewat ScrollContext. Section (server component) diteruskan
 * apa adanya sebagai `children`.
 */
export default function SnapContainer({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContext.Provider value={scrollRef}>
      <div ref={scrollRef} className="snap-container">
        {children}
      </div>
    </ScrollContext.Provider>
  );
}
