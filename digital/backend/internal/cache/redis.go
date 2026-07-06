// Package cache provides an optional Redis client for caching read-heavy
// data. The cache is best-effort: callers must degrade gracefully to the
// underlying store when Redis is unavailable.
package cache

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// New opens a Redis client using REDIS_URL from the environment.
//
// If REDIS_URL is unset, it returns (nil, nil) — the cache is optional and the
// backend serves directly from Postgres. A non-nil error means REDIS_URL was
// set but the connection could not be established.
func New(ctx context.Context) (*redis.Client, error) {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		return nil, nil
	}

	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("parse REDIS_URL: %w", err)
	}

	client := redis.NewClient(opts)

	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("redis ping: %w", err)
	}

	return client, nil
}
