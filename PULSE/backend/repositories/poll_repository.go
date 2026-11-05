package repositories

import (
	"context"
	"errors"
	"sync"
	"time"

	"pulse-backend/database"
	"pulse-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PollRepository interface {
	Create(ctx context.Context, poll *models.Poll) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error)
	FindByCreatorID(ctx context.Context, creatorID primitive.ObjectID) ([]models.Poll, error)
	FindAll(ctx context.Context) ([]models.Poll, error)
	Update(ctx context.Context, poll *models.Poll) error
	UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	IncrementOptionVotes(ctx context.Context, pollID primitive.ObjectID, optionIDs []string) error
}

type mongoPollRepository struct {
	db         *database.MongoDB
	localPolls map[string]*models.Poll
	mu         sync.RWMutex
}

func NewPollRepository(db *database.MongoDB) PollRepository {
	repo := &mongoPollRepository{
		db:         db,
		localPolls: make(map[string]*models.Poll),
	}

	// Pre-seed a rich interactive showcase poll for instant testing
	sampleID, _ := primitive.ObjectIDFromHex("672501a3b1c2d3e4f5a6b799")
	creatorID, _ := primitive.ObjectIDFromHex("672501a3b1c2d3e4f5a6b7c8")
	samplePoll := &models.Poll{
		ID:          sampleID,
		CreatorID:   creatorID,
		Question:    "What is your primary backend language for high-concurrency microservices?",
		Description: "Live showcase poll evaluating backend ecosystems for low-latency real-time apps.",
		Options: []models.PollOption{
			{ID: "opt_go1234", Text: "Go (Golang & Gin)", Votes: 42},
			{ID: "opt_node12", Text: "Node.js & TypeScript", Votes: 28},
			{ID: "opt_rust11", Text: "Rust & Actix", Votes: 19},
			{ID: "opt_pyth11", Text: "Python & FastAPI", Votes: 11},
		},
		AllowMultiple: false,
		Status:        "active",
		TotalVotes:    100,
		CreatedAt:     time.Now().Add(-2 * time.Hour).UTC(),
		UpdatedAt:     time.Now().UTC(),
	}
	repo.localPolls[sampleID.Hex()] = samplePoll

	return repo
}

func (r *mongoPollRepository) Create(ctx context.Context, poll *models.Poll) error {
	poll.ID = primitive.NewObjectID()
	now := time.Now().UTC()
	poll.CreatedAt = now
	poll.UpdatedAt = now
	poll.Status = "active"
	poll.TotalVotes = 0

	r.mu.Lock()
	r.localPolls[poll.ID.Hex()] = poll
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		_, err := r.db.Polls.InsertOne(ctx, poll)
		return err
	}

	return nil
}

func (r *mongoPollRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error) {
	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		var poll models.Poll
		err := r.db.Polls.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, nil
			}
			return nil, err
		}
		return &poll, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	if p, exists := r.localPolls[id.Hex()]; exists {
		// Return copy
		pCopy := *p
		return &pCopy, nil
	}
	return nil, nil
}

func (r *mongoPollRepository) FindByCreatorID(ctx context.Context, creatorID primitive.ObjectID) ([]models.Poll, error) {
	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
		cursor, err := r.db.Polls.Find(ctx, bson.M{"creator_id": creatorID}, opts)
		if err != nil {
			return nil, err
		}
		defer cursor.Close(ctx)

		var polls []models.Poll
		if err := cursor.All(ctx, &polls); err != nil {
			return nil, err
		}
		if polls == nil {
			polls = []models.Poll{}
		}
		return polls, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var polls []models.Poll
	for _, p := range r.localPolls {
		if p.CreatorID == creatorID {
			polls = append(polls, *p)
		}
	}
	if polls == nil {
		polls = []models.Poll{}
	}
	return polls, nil
}

func (r *mongoPollRepository) FindAll(ctx context.Context) ([]models.Poll, error) {
	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
		cursor, err := r.db.Polls.Find(ctx, bson.M{}, opts)
		if err != nil {
			return nil, err
		}
		defer cursor.Close(ctx)

		var polls []models.Poll
		if err := cursor.All(ctx, &polls); err != nil {
			return nil, err
		}
		if polls == nil {
			polls = []models.Poll{}
		}
		return polls, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var polls []models.Poll
	for _, p := range r.localPolls {
		polls = append(polls, *p)
	}
	if polls == nil {
		polls = []models.Poll{}
	}
	return polls, nil
}

func (r *mongoPollRepository) Update(ctx context.Context, poll *models.Poll) error {
	poll.UpdatedAt = time.Now().UTC()

	r.mu.Lock()
	r.localPolls[poll.ID.Hex()] = poll
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		update := bson.M{
			"$set": bson.M{
				"question":    poll.Question,
				"description": poll.Description,
				"expires_at":  poll.ExpiresAt,
				"updated_at":  poll.UpdatedAt,
			},
		}
		_, err := r.db.Polls.UpdateOne(ctx, bson.M{"_id": poll.ID}, update)
		return err
	}

	return nil
}

func (r *mongoPollRepository) UpdateStatus(ctx context.Context, id primitive.ObjectID, status string) error {
	r.mu.Lock()
	if p, exists := r.localPolls[id.Hex()]; exists {
		p.Status = status
		p.UpdatedAt = time.Now().UTC()
	}
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		update := bson.M{
			"$set": bson.M{
				"status":     status,
				"updated_at": time.Now().UTC(),
			},
		}
		_, err := r.db.Polls.UpdateOne(ctx, bson.M{"_id": id}, update)
		return err
	}

	return nil
}

func (r *mongoPollRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	r.mu.Lock()
	delete(r.localPolls, id.Hex())
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		_, err := r.db.Polls.DeleteOne(ctx, bson.M{"_id": id})
		return err
	}

	return nil
}

func (r *mongoPollRepository) IncrementOptionVotes(ctx context.Context, pollID primitive.ObjectID, optionIDs []string) error {
	now := time.Now().UTC()

	r.mu.Lock()
	if p, exists := r.localPolls[pollID.Hex()]; exists {
		optMap := make(map[string]bool)
		for _, id := range optionIDs {
			optMap[id] = true
		}
		for i, opt := range p.Options {
			if optMap[opt.ID] {
				p.Options[i].Votes++
				p.TotalVotes++
			}
		}
		p.UpdatedAt = now
	}
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Polls != nil {
		for _, optID := range optionIDs {
			filter := bson.M{
				"_id":        pollID,
				"options.id": optID,
			}
			update := bson.M{
				"$inc": bson.M{
					"options.$.votes": 1,
					"total_votes":     1,
				},
				"$set": bson.M{
					"updated_at": now,
				},
			}
			_, err := r.db.Polls.UpdateOne(ctx, filter, update)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
