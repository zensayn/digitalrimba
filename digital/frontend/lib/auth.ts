import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { Pool } from "pg";
import { nextCookies } from "better-auth/next-js";
import { createClient } from "redis";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optional Redis session cache (docker: digital-redis, host port 6380).
// When REDIS_URL is set, better-auth keeps sessions in Redis instead of
// hitting Postgres on every validation; unset = old behavior, nothing breaks.
let redis = process.env.REDIS_URL
  ? createClient({ url: process.env.REDIS_URL })
  : null;
if (redis) {
  redis.on("error", (err) => console.error("redis:", err));
  try {
    await redis.connect();
  } catch (err) {
    console.error("redis: failed to connect, falling back to Postgres sessions", err);
    redis = null;
  }
}

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "REPLACE_ME";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  // Raw pg.Pool — better-auth wraps it in Kysely's PostgresDialect automatically.
  database: pool,

  ...(redis && {
    secondaryStorage: {
      get: (key: string) => redis.get(key),
      set: async (key: string, value: string, ttl?: number) => {
        await redis.set(key, value, ttl ? { EX: ttl } : {});
      },
      delete: async (key: string) => {
        await redis.del(key);
      },
    },
    // Redis is a cache, not the source of truth: keep writing sessions to
    // Postgres so losing Redis never logs everyone out.
    session: {
      storeSessionInDatabase: true,
    },
  }),

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
    nextCookies(),
  ],
});

export type Auth = typeof auth;
