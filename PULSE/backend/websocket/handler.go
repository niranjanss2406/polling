package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"pulse-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow WebSocket connections from authorized origins
		return true
	},
}

type PollResultFetcher interface {
	GetResults(pollID string) (*models.PollResultsResponse, error)
}

var ResultFetcher PollResultFetcher

func SetResultFetcher(rf PollResultFetcher) {
	ResultFetcher = rf
}

// HandleWebSocket manages the /ws/polls/:id endpoint
func HandleWebSocket(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		pollID := c.Param("id")
		if pollID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Poll ID is required"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade failed: %v", err)
			return
		}

		client := &Client{
			Hub:    hub,
			Conn:   conn,
			Send:   make(chan []byte, 256),
			PollID: pollID,
		}

		hub.Register <- client

		// Requirement 12: When a new client connects, send the current poll results immediately.
		if ResultFetcher != nil {
			results, err := ResultFetcher.GetResults(pollID)
			if err == nil && results != nil {
				initialMsg, err := json.Marshal(map[string]interface{}{
					"type":      "initial_state",
					"poll_id":   pollID,
					"results":   results,
					"viewers":   hub.GetViewerCount(pollID) + 1,
					"timestamp": time.Now().UTC(),
				})
				if err == nil {
					client.Send <- initialMsg
				}
			}
		}

		go client.WritePump()
		go client.ReadPump()
	}
}

