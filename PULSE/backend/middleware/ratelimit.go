package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipRateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
}

type visitor struct {
	lastSeen time.Time
	count    int
}

var limiter = &ipRateLimiter{
	visitors: make(map[string]*visitor),
}

func init() {
	// Clean up stale visitors every 5 minutes
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			limiter.mu.Lock()
			for ip, v := range limiter.visitors {
				if time.Since(v.lastSeen) > 3*time.Minute {
					delete(limiter.visitors, ip)
				}
			}
			limiter.mu.Unlock()
		}
	}()
}

// RateLimit limits requests per IP (default: max 120 req/min)
func RateLimit(maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter.mu.Lock()
		defer limiter.mu.Unlock()

		v, exists := limiter.visitors[ip]
		if !exists || time.Since(v.lastSeen) > window {
			limiter.visitors[ip] = &visitor{
				lastSeen: time.Now(),
				count:    1,
			}
			c.Next()
			return
		}

		v.count++
		v.lastSeen = time.Now()

		if v.count > maxRequests {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Rate limit exceeded. Please wait a moment before sending more requests.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

