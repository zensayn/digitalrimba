import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "REPLACE_ME";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  // Raw pg.Pool — better-auth wraps it in Kysely's PostgresDialect automatically.
  database: pool,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},

  plugins: [
    // JWT plugin exposes:
    //   GET  /api/auth/jwks   — public JWKS (point Go backend here)
    //   GET  /api/auth/token  — issues a signed JWT for the current session
    jwt({
      jwt: {
        expirationTime: "15m",
      },
    }),
  ],
});

export type Auth = typeof auth;
