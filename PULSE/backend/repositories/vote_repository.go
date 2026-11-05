package repositories

import (
	"context"
	"fmt"
	"sync"
	"time"

	"pulse-backend/database"
	"pulse-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type VoteRepository interface {
	Create(ctx context.Context, vote *models.Vote) error
	HasVoted(ctx context.Context, pollID primitive.ObjectID, voterID string) (bool, error)
	GetOptionCounts(ctx context.Context, pollID primitive.ObjectID) (map[string]int64, error)
}

type mongoVoteRepository struct {
	db         *database.MongoDB
	localVotes map[string]bool // key: pollID:voterID
	mu         sync.RWMutex
}

func NewVoteRepository(db *database.MongoDB) VoteRepository {
	return &mongoVoteRepository{
		db:         db,
		localVotes: make(map[string]bool),
	}
}

func (r *mongoVoteRepository) Create(ctx context.Context, vote *models.Vote) error {
	vote.ID = primitive.NewObjectID()
	vote.CreatedAt = time.Now().UTC()

	key := fmt.Sprintf("%s:%s", vote.PollID.Hex(), vote.VoterID)
	r.mu.Lock()
	r.localVotes[key] = true
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Votes != nil {
		_, err := r.db.Votes.InsertOne(ctx, vote)
		return err
	}

	return nil
}

func (r *mongoVoteRepository) HasVoted(ctx context.Context, pollID primitive.ObjectID, voterID string) (bool, error) {
	if r.db != nil && r.db.IsConnected && r.db.Votes != nil {
		filter := bson.M{
			"poll_id":  pollID,
			"voter_id": voterID,
		}
		count, err := r.db.Votes.CountDocuments(ctx, filter)
		if err != nil {
			return false, err
		}
		return count > 0, nil
	}

	key := fmt.Sprintf("%s:%s", pollID.Hex(), voterID)
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.localVotes[key], nil
}

func (r *mongoVoteRepository) GetOptionCounts(ctx context.Context, pollID primitive.ObjectID) (map[string]int64, error) {
	if r.db != nil && r.db.IsConnected && r.db.Votes != nil {
		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.M{"poll_id": pollID}}},
			{{Key: "$unwind", Value: "$option_ids"}},
			{{Key: "$group", Value: bson.M{
				"_id":   "$option_ids",
				"count": bson.M{"$sum": 1},
			}}},
		}

		cursor, err := r.db.Votes.Aggregate(ctx, pipeline)
		if err != nil {
			return nil, err
		}
		defer cursor.Close(ctx)

		type OptionCountResult struct {
			OptionID string `bson:"_id"`
			Count    int64  `bson:"count"`
		}

		counts := make(map[string]int64)
		for cursor.Next(ctx) {
			var res OptionCountResult
			if err := cursor.Decode(&res); err == nil {
				counts[res.OptionID] = res.Count
			}
		}

		return counts, nil
	}

	return make(map[string]int64), nil
}
