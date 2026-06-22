package handlers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

// CachingCatalogStore decorates a CatalogStore with a best-effort Redis cache.
//
// Catalog data is static (it only changes when the seeder runs at boot), so
// reads are cached as JSON under deterministic keys. Any Redis failure — miss,
// timeout, or outage — falls through to the inner store, so the cache can never
// turn a working request into an error.
type CachingCatalogStore struct {
	inner CatalogStore
	rdb   *redis.Client
	ttl   time.Duration
}

func NewCachingCatalogStore(inner CatalogStore, rdb *redis.Client, ttl time.Duration) *CachingCatalogStore {
	return &CachingCatalogStore{inner: inner, rdb: rdb, ttl: ttl}
}

func (s *CachingCatalogStore) ListCollections(ctx context.Context) ([]CatalogCollection, error) {
	return cacheGetOrLoad(ctx, s.rdb, "catalog:collections", s.ttl, func() ([]CatalogCollection, error) {
		return s.inner.ListCollections(ctx)
	})
}

func (s *CachingCatalogStore) ListProducts(ctx context.Context, collection string) ([]CatalogProduct, error) {
	key := "catalog:products:all"
	if collection != "" {
		key = "catalog:products:" + collection
	}
	return cacheGetOrLoad(ctx, s.rdb, key, s.ttl, func() ([]CatalogProduct, error) {
		return s.inner.ListProducts(ctx, collection)
	})
}

func (s *CachingCatalogStore) GetProductBySlug(ctx context.Context, slug string) (CatalogProductDetail, error) {
	return cacheGetOrLoad(ctx, s.rdb, "catalog:product:"+slug, s.ttl, func() (CatalogProductDetail, error) {
		return s.inner.GetProductBySlug(ctx, slug)
	})
}

// cacheGetOrLoad returns the cached JSON value at key, or loads it via load and
// populates the cache. On any Redis error it falls back to load. Errors from
// load (including ErrCatalogProductNotFound) are returned unchanged and never
// cached, so 404s stay live.
func cacheGetOrLoad[T any](ctx context.Context, rdb *redis.Client, key string, ttl time.Duration, load func() (T, error)) (T, error) {
	var zero T

	if data, err := rdb.Get(ctx, key).Bytes(); err == nil {
		var v T
		if json.Unmarshal(data, &v) == nil {
			return v, nil
		}
		// Corrupt entry — fall through and reload.
	}

	v, err := load()
	if err != nil {
		return zero, err
	}

	if data, err := json.Marshal(v); err == nil {
		// Best-effort write; ignore failures so a flaky cache never blocks reads.
		_ = rdb.Set(ctx, key, data, ttl).Err()
	}

	return v, nil
}
