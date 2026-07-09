// Package cache provides an optional Redis client for caching read-heavy
// data. The cache is best-effort: callers must degrade gracefully to the
// underlying store when Redis is unavailable.
package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// New opens a Redis client for the given URL (callers read REDIS_URL once in
// main and pass it through, like every other config value).
//
// An empty url returns (nil, nil) — the cache is optional and the backend
// serves directly from Postgres. A non-nil error means a URL was provided but
// the connection could not be established.
func New(ctx context.Context, url string) (*redis.Client, error) {
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
