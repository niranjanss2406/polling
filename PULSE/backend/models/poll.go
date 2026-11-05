package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollOption struct {
	ID    string `bson:"id" json:"id"`
	Text  string `bson:"text" json:"text"`
	Votes int64  `bson:"votes" json:"votes"`
}

type Poll struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CreatorID     primitive.ObjectID `bson:"creator_id" json:"creator_id"`
	Question      string             `bson:"question" json:"question"`
	Description   string             `bson:"description,omitempty" json:"description"`
	Options       []PollOption       `bson:"options" json:"options"`
	AllowMultiple bool               `bson:"allow_multiple" json:"allow_multiple"`
	Status        string             `bson:"status" json:"status"` // "active" or "closed"
	TotalVotes    int64              `bson:"total_votes" json:"total_votes"`
	ExpiresAt     *time.Time         `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}

type CreatePollRequest struct {
	Question      string     `json:"question" binding:"required,min=5,max=300"`
	Description   string     `json:"description" binding:"max=1000"`
	Options       []string   `json:"options" binding:"required,min=2,max=10,dive,required,min=1,max=120"`
	AllowMultiple bool       `json:"allow_multiple"`
	ExpiresAt     *time.Time `json:"expires_at"`
}

type UpdatePollRequest struct {
	Question    *string    `json:"question"`
	Description *string    `json:"description"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

type PollResultsResponse struct {
	PollID     string       `json:"poll_id"`
	Question   string       `json:"question"`
	TotalVotes int64        `json:"total_votes"`
	Status     string       `json:"status"`
	Options    []PollOption `json:"options"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

