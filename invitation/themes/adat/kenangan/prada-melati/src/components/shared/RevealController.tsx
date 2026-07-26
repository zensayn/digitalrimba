"use client";

// Pemicu entrance konten: menandai `.scene-reveal` dengan data-inview="true"
// begitu blok konten MULAI masuk layar — bukan menunggu section penuh di layar.
// Mendengar scrollend/scroll pada snap-container (bukan window) karena scroll
// terjadi di dalam div.snap-container, bukan di window.

import { useEffect } from "react";
import { useScrollContainer } from "./scroll-context";

/** Ambang pemicu: konten tampil saat tepi ATASnya sudah melewati 90% tinggi
 *  viewport (alias baru nongol ~10% dari bawah). Dulu syaratnya "seluruh blok
 *  muat di layar" — mustahil untuk section yang lebih tinggi dari layar (rundown,
 *  lovestory, akad), jadi datanya baru muncul setelah discroll 300–840px lagi.
 *  Naikkan angka ini kalau ingin lebih awal lagi (1.0 = tepat saat menyentuh
 *  tepi bawah layar), turunkan kalau ingin lebih telat. */
const ENTER_AT = 0.9;

export default function RevealController() {
  const scrollRef = useScrollContainer();

  useEffect(() => {
    const container = scrollRef?.current;
    const scopes = Array.from(
      document.querySelectorAll<HTMLElement>(".scene-reveal"),
    );
    if (scopes.length === 0) return;

    // Hormati hemat gerak → tampilkan semua langsung.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      scopes.forEach((s) => s.setAttribute("data-inview", "true"));
      return;
    }

    const revealed = new Set<HTMLElement>();

    function checkAndReveal() {
      const containerRect = container
        ? container.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight, height: window.innerHeight };
      const viewH = containerRect.height || window.innerHeight;

      for (const scope of scopes) {
        if (revealed.has(scope)) continue;

        const rect = scope.getBoundingClientRect();
        // Posisi relatif terhadap container (bukan window)
        const relTop = rect.top - containerRect.top;

        // Cukup tepi atas blok melewati ambang — tanpa syarat "muat penuh",
        // yang tak pernah terpenuhi di section lebih tinggi dari layar. Blok
        // yang sudah terlewat ke atas (relTop negatif) otomatis ikut lolos,
        // jadi lompatan scroll/anchor tak meninggalkan section kosong.
        if (relTop <= viewH * ENTER_AT) {
          scope.setAttribute("data-inview", "true");
          revealed.add(scope);
        }
      }
    }

    // Cek sekali saat mount (untuk section yang sudah langsung terlihat)
    checkAndReveal();

    const target = container ?? window;

    // scrollend: fired setelah snap settling selesai (Chrome 109+, FF 109+)
    target.addEventListener("scrollend", checkAndReveal, { passive: true });

    // Fallback scroll + debounce ringkas untuk browser tanpa scrollend
    let timer: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(timer);
      timer = setTimeout(checkAndReveal, 80);
    }
    target.addEventListener("scroll", onScroll, { passive: true });

    // IO sebagai trigger cepat: fire pada piksel PERTAMA yang masuk viewport,
    // tak menunggu scroll berhenti. Ambang sebenarnya ditegakkan checkAndReveal
    // (ENTER_AT) — IO cuma membangunkannya sedini mungkin. Dulu di sini ada
    // syarat rasio ≥0.95 yang ikut menahan section tinggi.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) checkAndReveal();
      },
      { threshold: 0, root: container ?? null },
    );
    scopes.forEach((s) => io.observe(s));

    return () => {
      target.removeEventListener("scrollend", checkAndReveal);
      target.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      io.disconnect();
    };
  }, [scrollRef]);

  return null;
}
