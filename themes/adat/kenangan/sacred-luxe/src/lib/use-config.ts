"use client";

// src/lib/use-config.ts
import { useEffect, useState } from "react";
import type { InvitationConfig } from "./config-types";
import staticConfig from "../../invitation.config.json";

const DEFAULT_CONFIG = staticConfig as InvitationConfig;

export function useConfig(): InvitationConfig {
  const [config, setConfig] = useState<InvitationConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Hanya terima pesan dari parent (Rimba Studio)
      if (e.data?.type === "RIMBA_CONFIG_UPDATE" && e.data?.config) {
        setConfig(e.data.config as InvitationConfig);
      }
    };
    window.addEventListener("message", onMessage);
    // Beritahu parent bahwa iframe sudah siap
    if (window.parent !== window) {
      window.parent.postMessage({ type: "RIMBA_TEMPLATE_READY" }, "*");
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return config;
}
