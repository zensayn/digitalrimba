/**
 * One-shot migration: preserve Clerk-synced users table, create Better-Auth core schema.
 * Run with: node scripts/migrate-better-auth.mjs
 */
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://rimba:rimba_secret@localhost:5432/rimba_db",
});

const migration = `
-- ── Step 1: Preserve existing Clerk-synced users ────────────────────────────
-- Renamed so the Go backend can still read historical data while we transition.
ALTER TABLE IF EXISTS users RENAME TO clerk_users_backup;

-- ── Step 2: Better-Auth core tables ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "user" (
  "id"            TEXT        NOT NULL PRIMARY KEY,
  "name"          TEXT        NOT NULL,
  "email"         TEXT        NOT NULL UNIQUE,
  "emailVerified" BOOLEAN     NOT NULL DEFAULT false,
  "image"         TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"          TEXT        NOT NULL PRIMARY KEY,
  "expiresAt"   TIMESTAMPTZ NOT NULL,
  "token"       TEXT        NOT NULL UNIQUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "userId"      TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                    TEXT        NOT NULL PRIMARY KEY,
  "accountId"             TEXT        NOT NULL,
  "providerId"            TEXT        NOT NULL,
  "userId"                TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken"           TEXT,
  "refreshToken"          TEXT,
  "idToken"               TEXT,
  "accessTokenExpiresAt"  TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope"                 TEXT,
  "password"              TEXT,
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"         TEXT        NOT NULL PRIMARY KEY,
  "identifier" TEXT        NOT NULL,
  "value"      TEXT        NOT NULL,
  "expiresAt"  TIMESTAMPTZ NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Step 3: Indexes for hot query paths ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS "session_userId_idx"      ON "session"("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx"      ON "account"("userId");
CREATE INDEX IF NOT EXISTS "account_providerId_idx"  ON "account"("providerId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");
`;

async function run() {
  const client = await pool.connect();
  try {
    console.log("Applying Better-Auth migration…");
    await client.query("BEGIN");
    await client.query(migration);
    await client.query("COMMIT");
    console.log("Migration committed successfully.");

    // Verify tables
    const result = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    console.log(
      "Tables now in DB:",
      result.rows.map((r) => r.tablename).join(", ")
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed — rolled back.", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
