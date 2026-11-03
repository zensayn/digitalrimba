"use client";

// Pemicu entrance: mengamati tiap `.reveal-scope` (section & jahitan antar-section)
// dan menandai `data-inview="true"` saat pertama masuk viewport → melepas tahanan
// animasi [data-enter] di dalamnya (lihat globals.css). Sekali reveal, lalu berhenti
// diamati (tak animasi ulang saat digulir balik). Aman untuk scroll window (HP) &
// kontainer .content-scroll (desktop) karena memakai root viewport.

import { useEffect } from "react";

export default function RevealController() {
  useEffect(() => {
    const scopes = Array.from(document.querySelectorAll<HTMLElement>(".reveal-scope"));
    if (scopes.length === 0) return;

    // Hormati preferensi hemat gerak → tampilkan semua langsung, tanpa animasi.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      scopes.forEach((s) => s.setAttribute("data-inview", "true"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-inview", "true");
            io.unobserve(entry.target);
          }
        }
      },
      // threshold 0: picu begitu tepi elemen menyentuh viewport (penting untuk
      // jahitan yang tingginya 0). rootMargin bawah -12%: reveal sedikit setelah
      // benar-benar masuk, bukan pas menyerempet tepi paling bawah.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );

    scopes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return null;
}
