package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

// reserved for future role-based access control
type roleContextKey struct{}
type subjectContextKey struct{}

type Authenticator struct {
	jwksURL string
	// cache holds the JWKS in-process so we don't do an HTTP round-trip to
	// the frontend on every authenticated request. Nil if setup failed —
	// parse then falls back to a live fetch, i.e. the old behavior.
	cache *jwk.Cache
}

func NewAuthenticator(jwksURL string) *Authenticator {
	a := &Authenticator{jwksURL: jwksURL}
	c, err := jwk.NewCache(context.Background(), httprc.NewClient())
	if err == nil && c.Register(context.Background(), jwksURL,
		jwk.WithMinInterval(15*time.Minute),
		// Don't block boot on the frontend being up; fetch in the background.
		jwk.WithWaitReady(false),
	) == nil {
		a.cache = c
	}
	return a
}

// parse verifies the token against the cached JWKS; on any cache miss or
// verification failure it retries against a freshly fetched key set, so key
// rotation never locks users out for the cache interval.
func (a *Authenticator) parse(ctx context.Context, raw []byte) (jwt.Token, error) {
	if a.cache != nil {
		if set, err := a.cache.Lookup(ctx, a.jwksURL); err == nil {
			if token, err := jwt.Parse(raw, jwt.WithKeySet(set), jwt.WithValidate(true)); err == nil {
				return token, nil
			}
		}
	}
	fetchCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if a.cache != nil {
		set, err := a.cache.Refresh(fetchCtx, a.jwksURL)
		if err != nil {
			return nil, err
		}
		return jwt.Parse(raw, jwt.WithKeySet(set), jwt.WithValidate(true))
	}
	set, err := jwk.Fetch(fetchCtx, a.jwksURL)
	if err != nil {
		return nil, err
	}
	return jwt.Parse(raw, jwt.WithKeySet(set), jwt.WithValidate(true))
}

func AuthMiddleware(jwksURL string) func(http.Handler) http.Handler {
	return NewAuthenticator(jwksURL).Middleware
}

func (a *Authenticator) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, ok := bearerToken(r.Header.Get("Authorization"))
		if !ok {
			http.Error(w, "missing bearer token", http.StatusUnauthorized)
			return
		}

		token, err := a.parse(r.Context(), []byte(raw))
		if err != nil {
			http.Error(w, "invalid bearer token", http.StatusUnauthorized)
			return
		}

		sub, _ := token.Subject()
		ctx := context.WithValue(r.Context(), subjectContextKey{}, sub)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

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

func SubjectFromContext(ctx context.Context) (string, bool) {
	sub, ok := ctx.Value(subjectContextKey{}).(string)
	return sub, ok && sub != ""
}

func bearerToken(header string) (string, bool) {
	authType, token, ok := strings.Cut(header, " ")
	if !ok || !strings.EqualFold(authType, "Bearer") || strings.TrimSpace(token) == "" {
		return "", false
	}

	return token, true
}

