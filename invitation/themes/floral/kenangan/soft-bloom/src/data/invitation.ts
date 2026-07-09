// src/data/invitation.ts
// ─── FIXED: Typed re-export dari invitation.config.json ──────────────────────
import rawConfig from "../../invitation.config.json";
import type { InvitationConfig } from "@/lib/config-types";

export const config = rawConfig as InvitationConfig;

export const couple        = config.couple;
export const events        = { akad: config.events.akad, resepsi: config.events.resepsi };
export const weddingDate   = new Date(config.weddingDate);
export const gallery       = config.gallery;
export const bankAccounts  = config.bankAccounts;
export const dressCode     = config.dressCode;
export const sectionsConfig = config.sections;
export const theme         = config.theme;
