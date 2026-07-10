# rimba

Monorepo for the Rimba wedding platform. A single GitHub repo containing four parts:

```
rimba/
  digital/      # Digital product: Go backend (chi + Postgres) + Next.js 16 frontend (pnpm)
  fisik/        # Physical product catalog: Go backend + Next.js frontend (Bun) — imported from rimba-fisik
  invitation/   # Guest-facing invitation view (placeholder — scaffold pending)
  admin/        # Admin / operator backoffice (placeholder — scaffold pending)
  docs/         # Monorepo-level docs
```

`fisik/` was brought in with `git subtree`, so its full commit history is preserved here — there is no submodule and no second repo.

## Running

Each app has its own compose stack (own Postgres, Redis, backend) — start/stop/reset them
independently:

```bash
# digital: postgres :5433 (rimba_db) + redis :6380 + backend :8090
# The data volume is external (survives compose down -v) — create it once on
# a fresh checkout:
docker volume create rimba_rimba_digital_data
(cd digital && docker compose up -d --build)

# fisik: postgres :5434 (rimba_fisik_db) + internal redis + backend :8081
(cd fisik && docker compose up -d --build)
```

Fisik's entrypoint runs its goose migrations + catalog/pricing seeds on every start, so a fresh
fisik database self-populates. Digital's migrations are applied manually from the host:

```bash
goose -dir digital/db/migrations postgres \
  "postgresql://rimba:rimba_secret@localhost:5433/rimba_db" up
```

### frontends

```bash
(cd digital/frontend && pnpm install && pnpm dev)   # talks to digital backend on :8090
(cd fisik/frontend   && bun install  && bun dev)    # talks to fisik backend on :8081 (.env.local)
```

> Note: `digital/frontend` uses **pnpm** and `fisik/frontend` uses **Bun**. They are independent — run each from its own folder.
