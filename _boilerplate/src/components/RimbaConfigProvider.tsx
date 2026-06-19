"use client";

// src/components/RimbaConfigProvider.tsx
// ─── FIXED: Context provider + Rimba Studio sync (iframe & standalone) ───────
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { InvitationConfig } from "@/lib/config-types";
import { buildCssVars } from "@/lib/css-vars";
import staticConfig from "../../invitation.config.json";

const DEFAULT_CONFIG = staticConfig as InvitationConfig;

const ConfigContext = createContext<InvitationConfig>(DEFAULT_CONFIG);

export function useInvitationConfig(): InvitationConfig {
  return useContext(ConfigContext);
}

export function RimbaConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<InvitationConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.parent !== window) {
      // ── Mode iframe (Rimba Studio editor preview) ──────────────────────────
      setLoading(false);
      const onMessage = (e: MessageEvent) => {
        if (e.data?.type === "RIMBA_CONFIG_UPDATE" && e.data?.config) {
          const newConfig = e.data.config as InvitationConfig;
          setConfig(newConfig);
          // Update CSS vars live tanpa reload
          const styleEl = document.getElementById("rimba-theme-vars");
          if (styleEl) styleEl.textContent = buildCssVars(newConfig.theme);
        }
      };
      window.addEventListener("message", onMessage);
      // Beritahu Studio bahwa template siap menerima data
      window.parent.postMessage({ type: "RIMBA_TEMPLATE_READY" }, "*");
      return () => window.removeEventListener("message", onMessage);
    } else {
      // ── Mode standalone (dibuka langsung di browser / dev server) ──────────
      // Ambil projectId dari query string: ?project=nama-project
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get("project") || "default-project-id";

      fetch(`http://localhost:3100/api/projects/${projectId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengambil data dari Studio");
          return res.json();
        })
        .then((data) => {
          if (data?.config) {
            setConfig(data.config);
            const styleEl = document.getElementById("rimba-theme-vars");
            if (styleEl) styleEl.textContent = buildCssVars(data.config.theme);
          }
        })
        .catch((err) => {
          // Fallback ke staticConfig — undangan tetap tampil
          console.warn("[Rimba] Gagal memuat dari Studio, memakai data lokal:", err);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: DEFAULT_CONFIG.theme.colors.bg,
          color: DEFAULT_CONFIG.theme.colors.gold,
          fontFamily: "sans-serif",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontFamily: `'${DEFAULT_CONFIG.theme.typography.displayFont}', serif`,
            letterSpacing: "0.1em",
            opacity: 0.85,
          }}
        >
          ◆
        </div>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          Memuat Undangan...
        </div>
      </div>
    );
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
