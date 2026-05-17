package middleware

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jws"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

const privateKeyPEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDTFcmO0UJEitea
7TkxanKcJTo7X7owPUKNwAPs45EqopT6y+SgVzOg/6NNzuPGNqQqf1ZLjT8Phqb9
3aom7/4pE9jOfGCiJXkgORBpVV99gN3/YNVyY1vFfwz3zVa/S2yXfoju9x/JsGBy
6hh0CB57Dd5n1B9/gMxu4PKn4w9vWt8mAhaBCVCIz4cLgdXhhxyNivexbNb3w3Eg
RyeXtmvgxzyfNd1fMJ5k8D4NI4ATgSGOtBGhW2Bsk4JPBKDAbZKFIptE6Xv7qPaI
LqN31anpxcWJo9mnhbrq3EWE96oXzeJw9YTQv2g7oA4Ke4kJMZXFQN/Co14WkQ+M
uLCtPkqjAgMBAAECggEACAUZ5V06AVStIGvG8oOy2w/nCH54moCZWL1k6Mk0qMQI
mQbKJvVpNsK/t6MWsF8/GYZBBxnUvYhGK/sSDeysYW8pm57KJR77XSgN4ZKm0CPn
S16ofXIc+IH9QiUBGL+K3q6mET4+bPFQmM0gJLhyQAak3pkGoVeJbOULEynjWj2t
9VNKoITgcvpTFCWKGcE48uFGy5n4Uv5i+QgvpsUhCK451Je5IgVjxQIymAfja9Zf
kB4hjVrxgWa8zQj2Dq/G/Y1JhP/PlTEC4WgAf+bNdxjfW1hkalHGLDLZdrGWpxM6
Az4qo9TOOmQzDv0grn9CCcl86pdxO5MKOJQmPvD0oQKBgQDuSDqPhddcwbOhPT9Q
R2F7RKna2Afdoi8JrsMvVjqDRfGItkENvUMQxidmZao0aE1w0dEgTOzxI/1pHGqY
J/GCNEoWNbeezM+pRF4PCkELLaBK3BppX1N+oIKmGYbyWhUonNZrkuCjGeYoq6Og
U1wRaC0DYbrJcSodsU5Olfy26wKBgQDix9rcVYOwwoF4KRTZKE0+KgNHh0W6G+6t
AOu9JNJ+7zdSJ7eQU7zXmnhHfUWI+PLGe7xR0c9maAWGaBaHS5lLmqK9/MHyDa67
Bj4vrtWpcAgHTSAvO22cHQIP8TE/Yjtj1IOo+NaJ/rnz2PbJSeNxwAfcyBgY9mOt
A0SrYs09KQKBgQCqOQsssK6TYwVSMJDkZrnq97hn0GB+Inh78E8bp/wQ/4x238xF
ZmlcuFI5QnN/EOwRprJA4vN5qP5FcrlrjU1oeLZce297kFDhWSfgkrC4rZWPJQHx
ONpK4Zuz0RSoWVY4NyKuorS7j6rubv9rb2GcRdGyUsS/V4qAv8NzPI7WlQKBgQCD
R1JIzjAHuPEd0BpDg3MDk2qGk6YnkFfgSnIs8g3wcSZDJr66i977qG4MZFZGbmaL
w8FGVACNtZXNMqAn/fllrMSc2p6jMox9s6V4EOuaxEHBiEIjVXGkN56j/+mUWZcr
uS/mNvZqt8yJfoWODHnftVxX0HUyrh8RXpz34aAR0QKBgA1+rjrJi9yPUXi+eftb
BK0FIJltVDQHkqHIz6FMleSe7xhwXDxGMeuSYM8S3QlU6MkGtmanKVz3oP4dZS8v
xxEYt8WoJd2BHPCqZC7wjdQfQWJEhCNMOJAE0DRs+BFQHXa8HGXcw4kZyLd1l841
3qCstBogkYmu7ao2pExnJVVN
-----END PRIVATE KEY-----`

func TestValidTokenPasses(t *testing.T) {
	handler, jwks := testHandler(t)
	defer jwks.Close()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+signedToken(t, time.Now().Add(time.Hour)))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assertStatus(t, rec.Code, http.StatusNoContent)
}

// RequireRole always blocks when no role is set in context (role no longer comes from JWT).
func TestRequireRoleForbiddenWithNoRoleInContext(t *testing.T) {
	_, jwks := testHandler(t)
	defer jwks.Close()

	jwksPayload, err := os.ReadFile("testdata/jwks.json")
	if err != nil {
		t.Fatalf("read JWKS fixture: %v", err)
	}

	jwksServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(jwksPayload)
	}))
	defer jwksServer.Close()

	final := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	auth := NewAuthenticator(jwksServer.URL)
	handler := auth.Middleware(requireRole("admin")(final))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+signedToken(t, time.Now().Add(time.Hour)))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assertStatus(t, rec.Code, http.StatusForbidden)
}

func TestMissingAuthorizationHeaderUnauthorized(t *testing.T) {
	handler, jwks := testHandler(t)
	defer jwks.Close()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assertStatus(t, rec.Code, http.StatusUnauthorized)
}

func TestMalformedJWTUnauthorized(t *testing.T) {
	handler, jwks := testHandler(t)
	defer jwks.Close()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer not-a-jwt")

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assertStatus(t, rec.Code, http.StatusUnauthorized)
}

func TestExpiredJWTUnauthorized(t *testing.T) {
	handler, jwks := testHandler(t)
	defer jwks.Close()

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+signedToken(t, time.Now().Add(-time.Hour)))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	assertStatus(t, rec.Code, http.StatusUnauthorized)
}

// testHandler builds an auth-wrapped handler with no role requirement.
// Role is no longer populated from JWT after the better-auth migration.
func testHandler(t *testing.T) (http.Handler, *httptest.Server) {
	t.Helper()

	jwksPayload, err := os.ReadFile("testdata/jwks.json")
	if err != nil {
		t.Fatalf("read JWKS fixture: %v", err)
	}

	jwksServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(jwksPayload)
	}))

	final := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sub, ok := SubjectFromContext(r.Context())
		if !ok || sub == "" {
			t.Fatalf("subject in context = %q, %v; want non-empty, true", sub, ok)
		}
		w.WriteHeader(http.StatusNoContent)
	})

	auth := NewAuthenticator(jwksServer.URL)
	return auth.Middleware(final), jwksServer
}

func signedToken(t *testing.T, expiresAt time.Time) string {
	t.Helper()

	token := jwt.New()
	mustSet(t, token, jwt.SubjectKey, "user_test")
	mustSet(t, token, jwt.IssuedAtKey, time.Now().Add(-time.Minute))
	mustSet(t, token, jwt.ExpirationKey, expiresAt)

	headers := jws.NewHeaders()
	if err := headers.Set(jws.KeyIDKey, "test-key"); err != nil {
		t.Fatalf("set kid header: %v", err)
	}

	signed, err := jwt.Sign(token, jwt.WithKey(jwa.RS256(), privateKey(t), jws.WithProtectedHeaders(headers)))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}

	return string(signed)
}

func privateKey(t *testing.T) *rsa.PrivateKey {
	t.Helper()

	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		t.Fatal("decode private key PEM: nil block")
	}

	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		t.Fatalf("parse private key: %v", err)
	}

	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		t.Fatalf("private key type = %T; want *rsa.PrivateKey", key)
	}
	return rsaKey
}

func mustSet(t *testing.T, token jwt.Token, key string, value any) {
	t.Helper()
	if err := token.Set(key, value); err != nil {
		t.Fatalf("set %s: %v", key, err)
	}
}

func assertStatus(t *testing.T, got, want int) {
	t.Helper()
	if got != want {
		t.Fatalf("status = %d; want %d", got, want)
	}
}
