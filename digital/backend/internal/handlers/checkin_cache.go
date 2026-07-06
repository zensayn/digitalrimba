package handlers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

// TTLs for the check-in QR dashboard hot path (organizer page polls every 20s).
const (
	checkinEventTTL = time.Minute
	checkinStatsTTL = 5 * time.Second // ponytail: TTL-only, no write invalidation — staleness invisible under a 20s poll
	weddingOwnerTTL = 10 * time.Minute
)

// CachingCheckinStore decorates a CheckinStore with a best-effort Redis cache
// on the read-heavy lookups. Any Redis failure — miss, timeout, or outage —
// falls through to the inner store, so the cache can never turn a working
// request into an error. Write methods pass through via the embedded interface.
type CachingCheckinStore struct {
	CheckinStore
	rdb *redis.Client
}

func NewCachingCheckinStore(inner CheckinStore, rdb *redis.Client) *CachingCheckinStore {
	return &CachingCheckinStore{CheckinStore: inner, rdb: rdb}
}

func (s *CachingCheckinStore) GetCheckinEventByCode(ctx context.Context, code string) (CheckinEvent, error) {
	return cacheGetOrLoad(ctx, s.rdb, "dg:checkin:event:"+code, checkinEventTTL, func() (CheckinEvent, error) {
		return s.CheckinStore.GetCheckinEventByCode(ctx, code)
	})
}

func (s *CachingCheckinStore) GetCheckinEventByWeddingID(ctx context.Context, weddingID string) (CheckinEvent, error) {
	return cacheGetOrLoad(ctx, s.rdb, "dg:checkin:eventbywedding:"+weddingID, checkinEventTTL, func() (CheckinEvent, error) {
		return s.CheckinStore.GetCheckinEventByWeddingID(ctx, weddingID)
	})
}

func (s *CachingCheckinStore) GetCheckinStats(ctx context.Context, weddingID string) (CheckinStats, error) {
	return cacheGetOrLoad(ctx, s.rdb, "dg:checkin:stats:"+weddingID, checkinStatsTTL, func() (CheckinStats, error) {
		return s.CheckinStore.GetCheckinStats(ctx, weddingID)
	})
}

// UpdateEventPINHash rotates the PIN, so cached events (which carry the old
// hash) must be dropped or operators would be rejected with the new PIN for
// up to a minute.
func (s *CachingCheckinStore) UpdateEventPINHash(ctx context.Context, weddingID, pinHash string) error {
	if err := s.CheckinStore.UpdateEventPINHash(ctx, weddingID, pinHash); err != nil {
		return err
	}
	keys := []string{"dg:checkin:eventbywedding:" + weddingID}
	if event, err := s.CheckinStore.GetCheckinEventByWeddingID(ctx, weddingID); err == nil {
		keys = append(keys, "dg:checkin:event:"+event.EventCode)
	}
	_ = s.rdb.Del(ctx, keys...).Err()
	return nil
}

// CachingWeddingResolver caches the user→wedding lookup that runs on every
// organizer check-in request. Ownership is effectively immutable, so a long
// TTL is safe.
type CachingWeddingResolver struct {
	inner CheckinWeddingResolver
	rdb   *redis.Client
}

func NewCachingWeddingResolver(inner CheckinWeddingResolver, rdb *redis.Client) *CachingWeddingResolver {
	return &CachingWeddingResolver{inner: inner, rdb: rdb}
}

func (r *CachingWeddingResolver) WeddingIDForUser(ctx context.Context, userID string) (string, error) {
	return cacheGetOrLoad(ctx, r.rdb, "dg:wedding:owner:"+userID, weddingOwnerTTL, func() (string, error) {
		return r.inner.WeddingIDForUser(ctx, userID)
	})
}

// cacheGetOrLoad returns the cached JSON value at key, or loads it via load
// and populates the cache. On any Redis error it falls back to load. Errors
// from load (including pgx.ErrNoRows) are returned unchanged and never cached,
// so "not found" stays live.
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
