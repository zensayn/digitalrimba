# Remove Clerk — Use Better-Auth End-to-End Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all Clerk infrastructure from the codebase so the Go backend validates JWTs using better-auth's JWKS endpoint and the Clerk user-sync webhook pipeline is gone entirely.

**Architecture:** `backend/cmd/api/main.go` is the live entry point (compiled to `backend/api`). `backend/main.go` is dead code — deleted as part of this work. The Go `AuthMiddleware` is already generic JWKS-based; only the env var URL changes. The Clerk webhook handler and Svix verification package are deleted with no replacement since better-auth manages users directly.

**Tech Stack:** Go 1.25 (chi router, lestrrat-go/jwx v3 for JWT), better-auth (Next.js), PostgreSQL.

---

## File Map

| File | Action |
|---|---|
| `backend/main.go` | **Delete** — dead code, not the live entry point |
| `backend/.env` | Modify — replace `CLERK_JWKS_URL`, remove `CLERK_WEBHOOK_SIGNING_SECRET` |
| `backend/cmd/api/main.go` | Modify — read `JWKS_URL`, remove webhook route, remove role pre-fetch block |
| `backend/handlers/webhook.go` | **Delete** — Clerk user-sync pipeline, no replacement needed |
| `backend/internal/webhook/verify.go` | **Delete** — Svix HMAC verifier, only used by deleted webhook handler |
| `backend/internal/webhook/` | **Remove directory** — empty after verify.go deleted |
| `backend/internal/middleware/auth.go` | Modify — delete `roleFromToken`, remove two role lines from `Middleware`, add reserved comments |
| `backend/internal/db/users.go` | Modify — update "Clerk user ID" comment to "user ID" |
| `frontend/components/invitation/InvitationStudio.tsx` | Modify — remove Clerk comment |

---

## Task 1: Delete dead entry point `backend/main.go`

**Files:**
- Delete: `backend/main.go`

- [ ] **Step 1: Confirm it is unreferenced**

```bash
cd /Users/pangkywaradjodi/rimba/backend
# The live binary is compiled from cmd/api/main.go (produces backend/api)
# Verify backend/main.go is a separate package main that can't co-exist at root
go build ./cmd/api/... 2>&1
```
Expected: clean build. This confirms `cmd/api/main.go` is the live entry point.

- [ ] **Step 2: Delete the file**

```bash
rm /Users/pangkywaradjodi/rimba/backend/main.go
```

- [ ] **Step 3: Confirm build still passes**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./cmd/api/... 2>&1
```
Expected: no output (clean build). The live server still builds.

- [ ] **Step 4: Confirm tests still pass**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go test ./... 2>&1 | tail -10
```
Expected: all PASS.

---

## Task 2: Update `backend/.env`

**Files:**
- Modify: `backend/.env`

- [ ] **Step 1: Replace CLERK_JWKS_URL with JWKS_URL**

Open `backend/.env`. Find:
```
CLERK_JWKS_URL=https://golden-pipefish-87.clerk.accounts.dev/.well-known/jwks.json
```
Replace with:
```
JWKS_URL=http://localhost:3000/api/auth/jwks
```

- [ ] **Step 2: Remove CLERK_WEBHOOK_SIGNING_SECRET**

Find and delete the line:
```
CLERK_WEBHOOK_SIGNING_SECRET=whsec_nOhFr9wcUI5gzySBrNqFb4TevHNSL1Ey
```

- [ ] **Step 3: Verify the env file looks correct**

```bash
grep -i "clerk" /Users/pangkywaradjodi/rimba/backend/.env
```
Expected: no output (zero Clerk references remaining).

---

## Task 3: Update `backend/cmd/api/main.go`

**Files:**
- Modify: `backend/cmd/api/main.go`

Read the file first. Then make the following changes:

- [ ] **Step 1: Replace CLERK_JWKS_URL with JWKS_URL**

Find:
```go
jwksURL := os.Getenv("CLERK_JWKS_URL")
if jwksURL == "" {
    log.Fatal("CLERK_JWKS_URL is required")
}
```
Replace with:
```go
jwksURL := os.Getenv("JWKS_URL")
if jwksURL == "" {
    log.Fatal("JWKS_URL is required")
}
```

- [ ] **Step 2: Remove the WebhookHandler instantiation and route**

Find and delete these two lines (they appear near the top of the route setup, before the protected group):
```go
wh := handlers.NewWebhookHandler(pool)
```
and:
```go
r.Post("/webhooks/clerk", wh.HandleClerk)
```

- [ ] **Step 3: Remove the `role == "couple"` weddingID pre-fetch block**

Find this block inside the inline middleware function within the protected `r.Group(...)`:
```go
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
Delete this entire block. Keep the `UserID` propagation above it:
```go
sub, hasSub := authmw.SubjectFromContext(ctx)
if hasSub {
    ctx = internalhandlers.WithUserID(ctx, sub)
}
```

- [ ] **Step 4: Remove all Clerk comments**

Find and delete or update these comments:
```go
// Checkin routes — self-contained HMAC auth, no Clerk JWT.
```
→ update to:
```go
// Checkin routes — self-contained HMAC auth, no JWT required.
```

```go
// Protected routes — Clerk JWT required; sub propagated as user ID.
```
→ update to:
```go
// Protected routes — JWT required; sub propagated as user ID.
```

- [ ] **Step 5: Build to verify**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./cmd/api/... 2>&1
```
Expected: clean build (no output). If there are unused import errors (e.g. `authmw` if `RoleFromContext` is no longer imported), fix them. Note: `authmw.SubjectFromContext` and `authmw.AuthMiddleware` are still used, so `authmw` import stays.

- [ ] **Step 6: Verify no Clerk references remain in this file**

```bash
grep -i "clerk" /Users/pangkywaradjodi/rimba/backend/cmd/api/main.go
```
Expected: no output.

---

## Task 4: Delete `backend/handlers/webhook.go`

**Files:**
- Delete: `backend/handlers/webhook.go`

The `handlers` package has two files: `health.go` and `webhook.go`. `handlers.Health` is still used in `cmd/api/main.go` so the package survives — only `webhook.go` goes.

- [ ] **Step 1: Delete the file**

```bash
rm /Users/pangkywaradjodi/rimba/backend/handlers/webhook.go
```

- [ ] **Step 2: Build to verify the package still compiles**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./handlers/... 2>&1
```
Expected: clean build. `handlers.Health` is intact.

- [ ] **Step 3: Full build to confirm no broken references**

```bash
go build ./... 2>&1
```
Expected: clean build. If anything references `handlers.WebhookHandler` or `handlers.NewWebhookHandler`, it will error here — fix it (Task 3 should have already removed the only reference in `cmd/api/main.go`).

---

## Task 5: Delete `backend/internal/webhook/` package

**Files:**
- Delete: `backend/internal/webhook/verify.go`
- Delete: `backend/internal/webhook/` directory

- [ ] **Step 1: Confirm the directory contains only `verify.go`**

```bash
ls /Users/pangkywaradjodi/rimba/backend/internal/webhook/
```
Expected output:
```
verify.go
```
If there are other files, stop and report before proceeding.

- [ ] **Step 2: Delete the file and directory**

```bash
rm -rf /Users/pangkywaradjodi/rimba/backend/internal/webhook/
```

- [ ] **Step 3: Confirm the directory is gone**

```bash
ls /Users/pangkywaradjodi/rimba/backend/internal/webhook/ 2>&1
```
Expected: `ls: ... No such file or directory`

- [ ] **Step 4: Build to confirm no broken imports**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./... 2>&1
```
Expected: clean build. If anything still imports `rimba-api/internal/webhook`, it will error here.

- [ ] **Step 5: Run all tests**

```bash
go test ./... 2>&1 | tail -15
```
Expected: all PASS.

---

## Task 6: Update `backend/internal/middleware/auth.go`

**Files:**
- Modify: `backend/internal/middleware/auth.go`

- [ ] **Step 1: Delete the `roleFromToken` function**

Find and delete the entire function (it currently reads Clerk-specific `publicMetadata.role` from the JWT, which will never exist in better-auth tokens):

```go
func roleFromToken(token jwt.Token) string {
    var publicMetadata map[string]any
    if err := token.Get("publicMetadata", &publicMetadata); err != nil {
        if err := token.Get("public_metadata", &publicMetadata); err != nil {
            return ""
        }
    }

    role, _ := publicMetadata["role"].(string)
    return role
}
```

- [ ] **Step 2: Remove the two role lines from `Middleware`**

Find inside the `Middleware` function, after `token, err := jwt.Parse(...)`:
```go
role := roleFromToken(token)
sub, _ := token.Subject()
ctx := context.WithValue(r.Context(), roleContextKey{}, role)
ctx = context.WithValue(ctx, subjectContextKey{}, sub)
```

Replace with (remove only the role lines, keep sub and context lines):
```go
sub, _ := token.Subject()
ctx := context.WithValue(r.Context(), subjectContextKey{}, sub)
```

- [ ] **Step 3: Add `// reserved for future role-based access control` comment**

Find the `roleContextKey` type, `RoleFromContext`, and `RequireRole`/`requireRole`. Add the comment directly above `roleContextKey`:

```go
// reserved for future role-based access control
type roleContextKey struct{}
```

The final relevant section should look like:

```go
// reserved for future role-based access control
type roleContextKey struct{}

// ...

func RequireRole(role string) func(http.Handler) http.Handler {
    return requireRole(role)
}

func requireRole(role string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            actual, ok := RoleFromContext(r.Context())
            if !ok || actual != role {
                http.Error(w, "forbidden", http.StatusForbidden)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}

func RoleFromContext(ctx context.Context) (string, bool) {
    role, ok := ctx.Value(roleContextKey{}).(string)
    return role, ok && role != ""
}
```

- [ ] **Step 4: Build to verify**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./internal/middleware/... 2>&1
```
Expected: clean build. If there's an "undefined: roleFromToken" error, it means there's still a call site — find and remove it.

- [ ] **Step 5: Run middleware tests**

```bash
go test ./internal/middleware/... -v 2>&1 | tail -20
```
Expected: all PASS.

- [ ] **Step 6: Full build + all tests**

```bash
go build ./... 2>&1 && go test ./... 2>&1 | tail -15
```
Expected: clean build, all tests PASS.

---

## Task 7: Update comments in `backend/internal/db/users.go`

**Files:**
- Modify: `backend/internal/db/users.go`

- [ ] **Step 1: Update the comments**

Read the file. Find:
```go
// UpsertUser inserts or updates a user by Clerk user ID.
```
Replace with:
```go
// UpsertUser inserts or updates a user by ID.
```

Find:
```go
// DeleteUser removes a user by Clerk user ID.
```
Replace with:
```go
// DeleteUser removes a user by ID.
```

- [ ] **Step 2: Verify no Clerk references remain**

```bash
grep -i "clerk" /Users/pangkywaradjodi/rimba/backend/internal/db/users.go
```
Expected: no output.

---

## Task 8: Remove Clerk comment from frontend

**Files:**
- Modify: `frontend/components/invitation/InvitationStudio.tsx`

- [ ] **Step 1: Find and remove the comment**

Read the file. Find line 24:
```ts
// Replaces Clerk's useAuth().getToken() pattern.
```
Delete this line entirely.

- [ ] **Step 2: Verify no Clerk references remain in the frontend**

```bash
grep -ri "clerk" /Users/pangkywaradjodi/rimba/frontend --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".next"
```
Expected: no output (or only references in `skills-lock.json` / `BUILD_ITERATIONS.md` documentation files, which are fine).

---

## Task 9: Final verification — full build, tests, and smoke test

- [ ] **Step 1: Full backend build**

```bash
cd /Users/pangkywaradjodi/rimba/backend
go build ./... 2>&1
```
Expected: no output (clean).

- [ ] **Step 2: Full test suite**

```bash
go test ./... -v 2>&1 | tail -30
```
Expected: all PASS. Includes `TestBudgetItems` (8/8), `TestGuestImports`, `TestInvitationCRUD`, middleware tests.

- [ ] **Step 3: Confirm zero Clerk references in Go source**

```bash
grep -ri "clerk" /Users/pangkywaradjodi/rimba/backend --include="*.go" 2>/dev/null
```
Expected: no output.

- [ ] **Step 4: Start the backend and confirm `/api/budget/summary` returns 401 (not 404)**

```bash
cd /Users/pangkywaradjodi/rimba/backend
set -a && source .env && set +a
go run ./cmd/api/main.go &
BACKEND_PID=$!
sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/budget/summary)
echo "Status: $STATUS"
kill $BACKEND_PID 2>/dev/null
```
Expected: `Status: 401` — route exists, JWT validation active (JWKS URL now points at better-auth).

- [ ] **Step 5: TypeScript check on frontend**

```bash
cd /Users/pangkywaradjodi/rimba/frontend
npx tsc --noEmit 2>&1 | grep -i "clerk"
```
Expected: no output (no Clerk-related TS errors).
