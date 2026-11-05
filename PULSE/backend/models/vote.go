package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Vote struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    primitive.ObjectID `bson:"poll_id" json:"poll_id"`
	VoterID   string             `bson:"voter_id" json:"voter_id"` // server-issued anonymous token or user id
	OptionIDs []string           `bson:"option_ids" json:"option_ids"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type SubmitVoteRequest struct {
	OptionIDs []string `json:"option_ids" binding:"required,min=1"`
	VoterID   string   `json:"voter_id"`
}

type VoteBroadcastEvent struct {
	Type       string              `json:"type"` // "vote_update"
	PollID     string              `json:"poll_id"`
	Results    PollResultsResponse `json:"results"`
	Viewers    int                 `json:"viewers,omitempty"`
	Timestamp  time.Time           `json:"timestamp"`
}

