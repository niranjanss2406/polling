package websocket

import (
	"encoding/json"
	"sync"
)

type BroadcastMessage struct {
	PollID  string
	Payload []byte
}

type Hub struct {
	// Rooms maps pollID -> map[client]bool
	rooms      map[string]map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *BroadcastMessage
	mu         sync.RWMutex
}

var GlobalHub *Hub

func NewHub() *Hub {
	hub := &Hub{
		rooms:      make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *BroadcastMessage, 256),
	}
	GlobalHub = hub
	return hub
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if _, exists := h.rooms[client.PollID]; !exists {
				h.rooms[client.PollID] = make(map[*Client]bool)
			}
			h.rooms[client.PollID][client] = true
			count := len(h.rooms[client.PollID])
			h.mu.Unlock()

			// Broadcast updated live viewer count
			h.broadcastViewerCount(client.PollID, count)

		case client := <-h.Unregister:
			h.mu.Lock()
			if clients, exists := h.rooms[client.PollID]; exists {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					count := len(clients)
					if count == 0 {
						delete(h.rooms, client.PollID)
					}
					h.mu.Unlock()
					h.broadcastViewerCount(client.PollID, count)
					continue
				}
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.Lock()
			clients := h.rooms[message.PollID]
			for client := range clients {
				select {
				case client.Send <- message.Payload:
				default:
					close(client.Send)
					delete(clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) broadcastViewerCount(pollID string, count int) {
	msg, err := json.Marshal(map[string]interface{}{
		"type":    "viewer_count",
		"poll_id": pollID,
		"viewers": count,
	})
	if err == nil {
		h.BroadcastToPoll(pollID, msg)
	}
}

// BroadcastToPoll sends a raw byte slice to all connected clients for a poll
func (h *Hub) BroadcastToPoll(pollID string, payload []byte) {
	h.Broadcast <- &BroadcastMessage{
		PollID:  pollID,
		Payload: payload,
	}
}

// GetViewerCount returns current connected clients for a poll
func (h *Hub) GetViewerCount(pollID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.rooms[pollID])
}

