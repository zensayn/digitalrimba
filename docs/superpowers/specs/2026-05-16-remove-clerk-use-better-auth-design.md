# Remove Clerk — Use Better-Auth End-to-End

_Date: 2026-05-16_

## Goal

Remove all Clerk infrastructure from the codebase. The Go backend should validate JWTs using better-auth's JWKS endpoint. The Clerk user-sync webhook pipeline is deleted — better-auth owns user management directly.

---

## What Stays Identical

- `backend/internal/middleware/auth.go` — the `AuthMiddleware` is already generic JWKS-based. It only needs the URL changed (via env var). No code changes to the JWT validation logic.
- `frontend/lib/auth-client.ts` — already uses `better-auth/react`. No Clerk SDK present.
- `frontend/lib/api/budget.ts` — already uses `POST /api/auth/token` (better-auth endpoint).
- All route handlers and business logic.

---

## File-by-File Changes

### 1. `backend/.env`

- Replace `CLERK_JWKS_URL=https://...` with `JWKS_URL=http://localhost:3000/api/auth/jwks`
- Delete `CLERK_WEBHOOK_SIGNING_SECRET=whsec_...`

### 2. `backend/cmd/api/main.go`

- Read `os.Getenv("JWKS_URL")` instead of `CLERK_JWKS_URL`
- Fail-fast check: `if jwksURL == "" { log.Fatal("JWKS_URL is required") }`
- Remove `wh := handlers.NewWebhookHandler(pool)` (webhook handler instantiation)
- Remove `r.Post("/webhooks/clerk", wh.HandleClerk)` route registration
- Remove the `role == "couple"` weddingID pre-fetch block entirely:
  ```go
  // DELETE this block:
  if role, _ := authmw.RoleFromContext(ctx); role == "couple" && hasSub {
      var weddingID string
      if err := pool.QueryRow(ctx,
          "SELECT id FROM weddings WHERE owner_user_id = $1 LIMIT 1", sub,
      ).Scan(&weddingID); err == nil {
          ctx = internalhandlers.WithGuestAuth(ctx, internalhandlers.GuestAuth{
              Role:      "couple",
              WeddingID: weddingID,
          })
      }
  }
  ```
- Keep `import "rimba-api/handlers"` — `handlers.Health` is still registered at `r.Get("/health", handlers.Health)`
- Remove all comments mentioning Clerk

### 3. `backend/handlers/webhook.go`

**Delete the file.** The Clerk user-sync pipeline (`user.created`, `user.updated`, `user.deleted` → DB) is dead weight. Better-auth manages users directly.

`handlers/health.go` remains — the `handlers` package survives.

### 4. `backend/internal/webhook/verify.go`

**Delete the file.** The Svix HMAC verification package is only used by the now-deleted webhook handler.

### 5. `backend/main.go` (old entry point, not `cmd/api/main.go`)

- Remove `wh := handlers.NewWebhookHandler(pool)`
- Remove `r.Post("/webhooks/clerk", wh.HandleClerk)`
- Keep `"rimba-api/handlers"` import — `handlers.Health` is registered here at `r.Get("/health", handlers.Health)`, so the import stays

### 6. `backend/internal/middleware/auth.go`

- **Delete** the private `roleFromToken` function (Clerk-specific `publicMetadata.role` extraction — meaningless with better-auth JWTs)
- **Remove** the two lines in `Middleware` that called it:
  ```go
  // DELETE these:
  role := roleFromToken(token)
  ctx = context.WithValue(ctx, roleContextKey{}, role)
  ```
- **Keep** `roleContextKey`, `RoleFromContext`, and `RequireRole` — add comment:
  ```go
  // reserved for future role-based access control
  ```

### 7. `backend/internal/db/users.go`

- Update comment from `"Clerk user ID"` → `"user ID"` (no logic changes)

### 8. `frontend/components/invitation/InvitationStudio.tsx`

- Remove the comment `// Replaces Clerk's useAuth().getToken() pattern.`

---

## Auth Flow After Migration

```
User signs in via better-auth (frontend Next.js)
  → session stored in DB via better-auth

Frontend calls POST /api/auth/token
  → better-auth issues signed JWT (15 min, better-auth private key)
  → JWT sub = better-auth user ID (UUID)

Frontend sends Authorization: Bearer <jwt> to Go backend

Go backend AuthMiddleware:
  → fetches JWKS from http://localhost:3000/api/auth/jwks
  → validates JWT signature
  → extracts sub, stores as UserID in context

Protected handlers (budget, guests, invitations):
  → read UserID from context
  → query: SELECT id FROM weddings WHERE owner_user_id = $1 LIMIT 1
  → proceed with weddingID
```

---

## What Is Not Changing

- The `users` table schema — better-auth manages its own schema (it creates a `user` table, not `users`). The `users` table (used for guest/wedding foreign keys) remains.
- Wedding lookup fallback queries — unchanged and fully functional.
- Checkin routes — already use self-contained HMAC auth, no JWT involved.
- All tests — no test touches Clerk-specific code paths.

---

## Out of Scope

- Migrating existing user records from Clerk IDs to better-auth UUIDs (no production data at risk)
- Adding role claims to better-auth JWTs (explicitly deferred — fallback DB lookup is sufficient)
- Removing `RoleFromContext` / `RequireRole` from `auth.go` (retained as reserved hooks)
