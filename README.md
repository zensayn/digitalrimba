# rimba

Monorepo for the Rimba wedding platform. A single GitHub repo containing four parts:

```
rimba/
  digital/      # Digital product: Go backend (chi + Postgres) + Next.js 16 frontend (pnpm)
  fisik/        # Physical product catalog: Go backend + Next.js frontend (Bun) — imported from rimba-fisik
  invitation/   # Guest-facing invitation view (placeholder — scaffold pending)
  admin/        # Admin / operator backoffice (placeholder — scaffold pending)
  docs/         # Monorepo-level docs
  docker-compose.yml
```

`fisik/` was brought in with `git subtree`, so its full commit history is preserved here — there is no submodule and no second repo.

## Running

### digital
```bash
# database + backend
docker compose up postgres backend        # builds from ./digital/backend, Postgres on host :5433

# frontend
cd digital/frontend && pnpm install && pnpm dev
```

### fisik
```bash
cd fisik/frontend && bun install && bun dev
cd fisik/backend  && go run ./cmd/api
```

> Note: `digital/frontend` uses **pnpm** and `fisik/frontend` uses **Bun**. They are independent — run each from its own folder.
