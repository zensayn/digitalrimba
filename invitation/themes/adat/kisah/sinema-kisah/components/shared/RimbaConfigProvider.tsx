"use client";

// src/components/RimbaConfigProvider.tsx
import { createContext, useContext, type ReactNode } from "react";
import type { InvitationConfig } from "@/lib/config-types";
import staticConfig from "../../invitation.config.json";

const DEFAULT_CONFIG = staticConfig as InvitationConfig;

const ConfigContext = createContext<InvitationConfig>(DEFAULT_CONFIG);

export function useInvitationConfig(): InvitationConfig {
  return useContext(ConfigContext);
}

export function RimbaConfigProvider({ children }: { children: ReactNode }) {
  return <ConfigContext.Provider value={DEFAULT_CONFIG}>{children}</ConfigContext.Provider>;
}
