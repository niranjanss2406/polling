package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"pulse-backend/database"
)

type EventPublisher struct {
	redisClient *database.RedisClient
}

var Publisher *EventPublisher

func InitEventPublisher(r *database.RedisClient) *EventPublisher {
	Publisher = &EventPublisher{
		redisClient: r,
	}
	return Publisher
}

func getPollChannel(pollID string) string {
	return fmt.Sprintf("poll:%s:updates", pollID)
}

// PublishPollUpdate sends an event to the poll's Redis channel
func (p *EventPublisher) PublishPollUpdate(ctx context.Context, pollID string, payload interface{}) error {
	channel := getPollChannel(pollID)
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal event payload: %w", err)
	}

	if p.redisClient != nil && p.redisClient.Client != nil {
		err := p.redisClient.Client.Publish(ctx, channel, data).Err()
		if err == nil {
			return nil
		}
		log.Printf("⚠️ Redis Publish error on channel %s: %v. Passing to internal hub.", channel, err)
	}

	// Internal fallback: notify subscriber directly if registered
	if Subscriber != nil {
		Subscriber.BroadcastLocal(pollID, data)
	}

	return nil
}

