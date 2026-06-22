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

Both backends share **one** Postgres (`rimba_db`, container `rimba-digital-database`, host `:5433`)
defined in the root `docker-compose.yml`. Their schemas coexist in `public`: digital owns
`users`/`weddings`/`invitation`/… and fisik owns the `catalog_*` tables.

```bash
# one database + both backends (digital on :8080, fisik on :8081)
docker compose up postgres backend fisik-backend
```

> **Migration ordering on a fresh volume:** the two backends apply goose migrations into the same
> `goose_db_version` sequence (digital `00001`–`00005`, fisik `00006`). On a brand-new database,
> apply digital's migrations *before* starting `fisik-backend`, otherwise fisik records version `6`
> first and digital's `goose up` would skip `1`–`5`:
> ```bash
> docker compose up -d postgres
> goose -dir digital/db/migrations postgres \
>   "postgresql://rimba:rimba_secret@localhost:5433/rimba_db" up
> docker compose up backend fisik-backend     # fisik entrypoint applies 00006 + seeds
> ```

### frontends
```bash
cd digital/frontend && pnpm install && pnpm dev   # talks to digital backend on :8080
cd fisik/frontend   && bun install  && bun dev     # talks to fisik backend on :8081 (.env.local)
```

> Note: `digital/frontend` uses **pnpm** and `fisik/frontend` uses **Bun**. They are independent — run each from its own folder.
