package handlers

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// CachingPricingStore decorates a PricingStore with the same best-effort Redis
// cache used for the catalog. Pricing only changes when the seeder publishes a
// new version at boot, so reads are safe to cache under deterministic keys. Any
// Redis failure falls through to the inner store and is never fatal.
type CachingPricingStore struct {
	inner PricingStore
	rdb   *redis.Client
	ttl   time.Duration
}

func NewCachingPricingStore(inner PricingStore, rdb *redis.Client, ttl time.Duration) *CachingPricingStore {
	return &CachingPricingStore{inner: inner, rdb: rdb, ttl: ttl}
}

func (s *CachingPricingStore) GetPricing(ctx context.Context) (PricingCatalog, error) {
	return cacheGetOrLoad(ctx, s.rdb, "pricing:all", s.ttl, func() (PricingCatalog, error) {
		return s.inner.GetPricing(ctx)
	})
}

func (s *CachingPricingStore) GetProductPricing(ctx context.Context, slug string) (ProductPricing, error) {
	return cacheGetOrLoad(ctx, s.rdb, "pricing:product:"+slug, s.ttl, func() (ProductPricing, error) {
		return s.inner.GetProductPricing(ctx, slug)
	})
}
