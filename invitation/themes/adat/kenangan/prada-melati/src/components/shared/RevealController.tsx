"use client";

// Pemicu entrance konten: mengamati tiap `.scene-reveal` (wrapper konten di
// dalam SceneContent) dan menandainya `data-inview="true"` saat pertama masuk
// viewport → melepas tahanan animasi rise pada anak-anaknya (lihat globals.css).
// Sekali reveal lalu berhenti diamati (tak animasi ulang saat digulir balik).
// Memakai root viewport, jadi aman untuk scroll HP maupun kolom kanan desktop.

import { useEffect } from "react";

export default function RevealController() {
  useEffect(() => {
    const scopes = Array.from(document.querySelectorAll<HTMLElement>(".scene-reveal"));
    if (scopes.length === 0) return;

    // Hormati hemat gerak / lingkungan tanpa IO → tampilkan semua langsung.
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
      // rootMargin bawah -12%: reveal sedikit setelah konten benar-benar masuk,
      // bukan pas menyerempet tepi paling bawah.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    scopes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return null;
}
