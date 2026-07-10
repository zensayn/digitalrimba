-- +goose Up
-- Better Auth core tables beyond "user": session/account/verification plus the
-- jwks table for the JWT plugin. Previously these were created out-of-band via
-- the Better Auth CLI (`@better-auth/cli generate`), so a fresh DB volume was
-- missing them and social sign-in 500'd writing OAuth state to "verification".
-- Generated from better-auth ^1.6.11 to match its expected schema exactly.
CREATE TABLE IF NOT EXISTS public."session" (
    "id" text NOT NULL PRIMARY KEY,
    "expiresAt" timestamptz NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamptz NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES public."user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."account" (
    "id" text NOT NULL PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES public."user" ("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamptz,
    "refreshTokenExpiresAt" timestamptz,
    "scope" text,
    "password" text,
    "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public."verification" (
    "id" text NOT NULL PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamptz NOT NULL,
    "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public."jwks" (
    "id" text NOT NULL PRIMARY KEY,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamptz NOT NULL,
    "expiresAt" timestamptz
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON public."session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON public."account" ("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON public."verification" ("identifier");

-- +goose Down
DROP TABLE IF EXISTS public."jwks";
DROP TABLE IF EXISTS public."verification";
DROP TABLE IF EXISTS public."account";
DROP TABLE IF EXISTS public."session";
