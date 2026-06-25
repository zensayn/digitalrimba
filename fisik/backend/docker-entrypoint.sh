#!/bin/sh
# Migrate → seed → serve. goose, seed-catalog and seed-pricing are idempotent,
# so this is safe to run on every container start.
set -e

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "[entrypoint] applying migrations..."
/app/goose -dir /app/migrations postgres "$DATABASE_URL" up

echo "[entrypoint] seeding catalog..."
/app/seed-catalog

echo "[entrypoint] seeding pricing..."
/app/seed-pricing

echo "[entrypoint] starting api..."
exec /app/api
