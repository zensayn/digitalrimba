package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

// reserved for future role-based access control
type roleContextKey struct{}
type subjectContextKey struct{}

type Authenticator struct {
	jwksURL string
}

func NewAuthenticator(jwksURL string) *Authenticator {
	return &Authenticator{jwksURL: jwksURL}
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

		keySet, err := jwk.Fetch(r.Context(), a.jwksURL)
		if err != nil {
			http.Error(w, "invalid signing keys", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse([]byte(raw), jwt.WithKeySet(keySet), jwt.WithValidate(true))
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

