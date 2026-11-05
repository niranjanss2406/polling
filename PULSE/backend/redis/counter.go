package redis

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"

	"pulse-backend/database"
)

type VoteCounter struct {
	redisClient *database.RedisClient
	localMu     sync.RWMutex
	localStore  map[string]int64 // In-memory fallback if Redis is unavailable
}

var Counter *VoteCounter

func InitVoteCounter(r *database.RedisClient) *VoteCounter {
	Counter = &VoteCounter{
		redisClient: r,
		localStore:  make(map[string]int64),
	}
	return Counter
}

func getOptionKey(pollID, optionID string) string {
	return fmt.Sprintf("poll:%s:option:%s:votes", pollID, optionID)
}

func getTotalKey(pollID string) string {
	return fmt.Sprintf("poll:%s:total_votes", pollID)
}

// IncrementVote safely increments the Redis counter for an option and the poll total
func (vc *VoteCounter) IncrementVote(ctx context.Context, pollID string, optionIDs []string) error {
	if vc.redisClient != nil && vc.redisClient.Client != nil {
		pipe := vc.redisClient.Client.Pipeline()
		for _, optID := range optionIDs {
			pipe.Incr(ctx, getOptionKey(pollID, optID))
		}
		pipe.IncrBy(ctx, getTotalKey(pollID), int64(len(optionIDs)))

		// Set a 7-day TTL on counters to clean up cold keys
		for _, optID := range optionIDs {
			pipe.Expire(ctx, getOptionKey(pollID, optID), 7*24*time.Hour)
		}
		pipe.Expire(ctx, getTotalKey(pollID), 7*24*time.Hour)

		_, err := pipe.Exec(ctx)
		if err == nil {
			return nil
		}
		log.Printf("⚠️ Redis IncrementVote error: %v. Using in-memory fallback.", err)
	}

	// In-memory fallback
	vc.localMu.Lock()
	defer vc.localMu.Unlock()
	for _, optID := range optionIDs {
		vc.localStore[getOptionKey(pollID, optID)]++
		vc.localStore[getTotalKey(pollID)]++
	}
	return nil
}

// GetOptionVotes retrieves vote count for an option
func (vc *VoteCounter) GetOptionVotes(ctx context.Context, pollID, optionID string) (int64, error) {
	if vc.redisClient != nil && vc.redisClient.Client != nil {
		val, err := vc.redisClient.Client.Get(ctx, getOptionKey(pollID, optionID)).Result()
		if err == nil {
			return strconv.ParseInt(val, 10, 64)
		}
	}

	vc.localMu.RLock()
	defer vc.localMu.RUnlock()
	return vc.localStore[getOptionKey(pollID, optionID)], nil
}

// RebuildFromMongo repopulates Redis counters using verified MongoDB counts as the ground truth
func (vc *VoteCounter) RebuildFromMongo(ctx context.Context, pollID string, optionCounts map[string]int64, totalVotes int64) error {
	if vc.redisClient != nil && vc.redisClient.Client != nil {
		pipe := vc.redisClient.Client.Pipeline()
		for optID, count := range optionCounts {
			pipe.Set(ctx, getOptionKey(pollID, optID), count, 7*24*time.Hour)
		}
		pipe.Set(ctx, getTotalKey(pollID), totalVotes, 7*24*time.Hour)
		_, err := pipe.Exec(ctx)
		if err != nil {
			log.Printf("⚠️ Failed to rebuild Redis counters: %v", err)
			return err
		}
		return nil
	}

	vc.localMu.Lock()
	defer vc.localMu.Unlock()
	for optID, count := range optionCounts {
		vc.localStore[getOptionKey(pollID, optID)] = count
	}
	vc.localStore[getTotalKey(pollID)] = totalVotes
	return nil
}

