package database

import (
	"context"
	"log"
	"strings"
	"time"

	"pulse-backend/config"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

var Redis *RedisClient

// ConnectRedis initializes the Redis client
func ConnectRedis(cfg *config.Config) (*RedisClient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var opt *redis.Options
	var err error

	if strings.HasPrefix(cfg.RedisURL, "redis://") || strings.HasPrefix(cfg.RedisURL, "rediss://") {
		opt, err = redis.ParseURL(cfg.RedisURL)
		if err != nil {
			log.Printf("⚠️ Error parsing Redis URL: %v. Falling back to default options.", err)
			opt = &redis.Options{Addr: "localhost:6379"}
		}
	} else {
		opt = &redis.Options{
			Addr: cfg.RedisURL,
		}
	}

	rdb := redis.NewClient(opt)

	// Check connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ Warning: Redis connection ping failed (%v). Pub/sub & real-time counter fallback active.", err)
	} else {
		log.Println("✅ Successfully connected to Redis.")
	}

	client := &RedisClient{
		Client: rdb,
	}

	Redis = client
	return client, nil
}

// Close closes the Redis connection
func (r *RedisClient) Close() error {
	if r.Client != nil {
		return r.Client.Close()
	}
	return nil
}

