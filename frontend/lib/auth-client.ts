import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// NEXT_PUBLIC_APP_URL pins the auth client to the root origin so it always
// fetches /api/auth/... and never gets locale-prefixed to /id/api/auth/...
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [jwtClient()],
});

export type Session = typeof authClient.$Infer.Session;
