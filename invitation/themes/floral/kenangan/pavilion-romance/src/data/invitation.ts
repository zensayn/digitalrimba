// src/data/invitation.ts
import rawConfig from "../../invitation.config.json";
import { validateInvitationConfig } from "@/lib/invitation-config";

export const config = validateInvitationConfig(rawConfig);

export const couple = config.couple;
export const events = { akad: config.events.akad, resepsi: config.events.resepsi };
export const weddingDate = new Date(config.weddingDate);
export const gallery = config.gallery;
export const bankAccounts = config.bankAccounts;
export const dressCode = config.dressCode;
export const sectionsConfig = config.sections;
export const theme = config.theme;
