package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"rimba-api/handlers"
	"rimba-api/internal/db"
	internalhandlers "rimba-api/internal/handlers"
	authmw "rimba-api/internal/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, reading from environment")
	}

	ctx := context.Background()

	pool, err := db.New(ctx)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	jwksURL := os.Getenv("JWKS_URL")
	if jwksURL == "" {
		log.Fatal("JWKS_URL is required")
	}

	invStore := internalhandlers.NewPostgresInvitationStore(pool)
	invHandler := internalhandlers.NewInvitationHandler(invStore)

	guestStore := internalhandlers.NewPostgresGuestStore(pool)
	guestHandler := internalhandlers.NewGuestHandler(guestStore)

	dashboardStore := internalhandlers.NewPostgresDashboardStore(pool)
	dashboardHandler := internalhandlers.NewDashboardHandler(dashboardStore)

	checkinKey := []byte(os.Getenv("CHECKIN_SESSION_KEY"))
	if len(checkinKey) == 0 {
		log.Fatal("CHECKIN_SESSION_KEY is required")
	}
	checkinStore := internalhandlers.NewPostgresCheckinStore(pool)
	checkinHandler := internalhandlers.NewCheckinHandler(checkinStore, checkinKey)

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RequestID)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if allowedOrigin != "" {
				w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				w.Header().Set("Access-Control-Max-Age", "3600")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	r.Get("/health", handlers.Health)

	// Public invitation read — no auth required.
	r.Get("/api/invitations/{slug}", invHandler.GetBySlug)

	// Checkin routes — self-contained HMAC auth, no JWT required.
	checkinHandler.RegisterRoutes(r)

	// Protected routes — JWT required; sub propagated as user ID.
	r.Group(func(r chi.Router) {
		r.Use(authmw.AuthMiddleware(jwksURL))
		r.Use(func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				ctx := r.Context()
				sub, hasSub := authmw.SubjectFromContext(ctx)
				if hasSub {
					ctx = internalhandlers.WithUserID(ctx, sub)
				}
				next.ServeHTTP(w, r.WithContext(ctx))
			})
		})

		dashboardHandler.RegisterRoutes(r)
		r.Post("/api/invitations", invHandler.Create)
		r.Patch("/api/invitations/{id}", invHandler.Update)
		r.Delete("/api/invitations/{id}", invHandler.Delete)
		guestHandler.RegisterRoutes(r)
		internalhandlers.RegisterBudgetRoutes(r, pool)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("rimba-api listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}
