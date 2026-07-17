"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

import { asset, hideOnError } from "@/lib/assets";

const STRANDS = [
  { src: asset("RonceanMelatiL"), side: "left" as const, delay: "0s" },
  { src: asset("RonceanMelatiR"), side: "right" as const, delay: "-2.4s" },
];

export default function RonceanMelati({ zIndex = 3 }: { zIndex?: number }) {
  // Hentikan sway saat pemiliknya di luar viewport — loop infinite tak perlu
  // membakar frame setelah user scroll melewatinya.
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "20% 0px 20% 0px" });

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      {STRANDS.map((s) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.side}
          src={s.src}
          alt=""
          onError={hideOnError}
          className={`ronce ${inView ? "" : "ronce-paused"}`}
          style={{
            position: "absolute",
            top: 0,
            [s.side]: 0,
            height: "58vh",
            transformOrigin: "top center",
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
