package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"rimba-api/handlers"
	"rimba-api/internal/cache"
	"rimba-api/internal/db"
	internalhandlers "rimba-api/internal/handlers"
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

	var catalogStore internalhandlers.CatalogStore = internalhandlers.NewPostgresCatalogStore(pool)

	// Optional Redis cache for the read-only catalog. Static data, so wrap the
	// store in a caching decorator when REDIS_URL is configured. The cache is
	// best-effort: if Redis is missing or unreachable, we serve from Postgres.
	rdb, err := cache.New(ctx)
	if err != nil {
		log.Printf("redis unavailable, serving without cache: %v", err)
	}
	if rdb != nil {
		// The API boots right after the entrypoint's seed step, so startup is a
		// reliable post-seed hook to drop any stale catalog entries. This Redis
		// is dedicated to the fisik catalog, so a full flush is safe.
		if err := rdb.FlushDB(ctx).Err(); err != nil {
			log.Printf("redis flush on boot: %v", err)
		}
		catalogStore = internalhandlers.NewCachingCatalogStore(catalogStore, rdb, time.Hour)
		defer rdb.Close()
		log.Println("catalog cache enabled (redis)")
	}

	catalogHandler := internalhandlers.NewCatalogHandler(catalogStore)

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RequestID)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if allowedOrigin != "" {
				w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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

	// Public product catalog — no auth required.
	catalogHandler.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("rimba-api listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}
