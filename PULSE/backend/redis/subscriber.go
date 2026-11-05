package redis

import (
	"context"
	"fmt"
	"sync"

	"pulse-backend/database"

	rdb "github.com/redis/go-redis/v9"
)

type MessageHandler func(pollID string, payload []byte)

type EventSubscriber struct {
	redisClient   *database.RedisClient
	handlers      map[string][]MessageHandler
	activePubSubs map[string]*rdb.PubSub
	mu            sync.RWMutex
}

var Subscriber *EventSubscriber

func InitEventSubscriber(r *database.RedisClient) *EventSubscriber {
	Subscriber = &EventSubscriber{
		redisClient:   r,
		handlers:      make(map[string][]MessageHandler),
		activePubSubs: make(map[string]*rdb.PubSub),
	}
	return Subscriber
}

// Subscribe registers a handler for updates on a poll
func (s *EventSubscriber) Subscribe(pollID string, handler MessageHandler) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.handlers[pollID] = append(s.handlers[pollID], handler)

	// If Redis client is active and we don't have a listener routine running for this channel yet, start one
	if s.redisClient != nil && s.redisClient.Client != nil {
		if _, exists := s.activePubSubs[pollID]; !exists {
			channel := fmt.Sprintf("poll:%s:updates", pollID)
			pubsub := s.redisClient.Client.Subscribe(context.Background(), channel)
			s.activePubSubs[pollID] = pubsub

			go s.listenChannel(pollID, pubsub)
		}
	}
}

func (s *EventSubscriber) listenChannel(pollID string, pubsub *rdb.PubSub) {
	ch := pubsub.Channel()
	for msg := range ch {
		s.dispatch(pollID, []byte(msg.Payload))
	}
}

func (s *EventSubscriber) dispatch(pollID string, payload []byte) {
	s.mu.RLock()
	handlers := make([]MessageHandler, len(s.handlers[pollID]))
	copy(handlers, s.handlers[pollID])
	s.mu.RUnlock()

	for _, h := range handlers {
		h(pollID, payload)
	}
}

// BroadcastLocal triggers subscribers directly (fallback if Redis is unavailable)
func (s *EventSubscriber) BroadcastLocal(pollID string, payload []byte) {
	s.dispatch(pollID, payload)
}

// Unsubscribe removes a handler or cleans up the pubsub
func (s *EventSubscriber) Unsubscribe(pollID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if pubsub, exists := s.activePubSubs[pollID]; exists {
		_ = pubsub.Close()
		delete(s.activePubSubs, pollID)
	}
	delete(s.handlers, pollID)
}

