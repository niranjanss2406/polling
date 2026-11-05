package services

import (
	"context"
	"errors"
	"time"

	"pulse-backend/models"
	pulseRedis "pulse-backend/redis"
	"pulse-backend/repositories"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ResultService interface {
	GetResults(pollID string) (*models.PollResultsResponse, error)
	ResyncFromMongo(ctx context.Context, pollID string) (*models.PollResultsResponse, error)
}

type resultService struct {
	pollRepo repositories.PollRepository
	voteRepo repositories.VoteRepository
}

func NewResultService(pollRepo repositories.PollRepository, voteRepo repositories.VoteRepository) ResultService {
	return &resultService{
		pollRepo: pollRepo,
		voteRepo: voteRepo,
	}
}

func (s *resultService) GetResults(pollID string) (*models.PollResultsResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, errors.New("invalid poll ID format")
	}

	poll, err := s.pollRepo.FindByID(ctx, objID)
	if err != nil {
		return nil, err
	}
	if poll == nil {
		return nil, errors.New("poll not found")
	}

	options := make([]models.PollOption, len(poll.Options))
	copy(options, poll.Options)

	var totalVotes int64 = 0

	// Try reading real-time counters from Redis
	redisCountersFound := false
	if pulseRedis.Counter != nil {
		for i, opt := range options {
			count, err := pulseRedis.Counter.GetOptionVotes(ctx, pollID, opt.ID)
			if err == nil && count > 0 {
				options[i].Votes = count
				redisCountersFound = true
			}
			totalVotes += options[i].Votes
		}
	}

	// If Redis has no data yet or total is 0, pull from MongoDB and rebuild Redis
	if !redisCountersFound && poll.TotalVotes > 0 {
		return s.ResyncFromMongo(ctx, pollID)
	}

	// If MongoDB already has votes recorded, ensure total is accurate
	if poll.TotalVotes > totalVotes {
		totalVotes = poll.TotalVotes
	}

	return &models.PollResultsResponse{
		PollID:     poll.ID.Hex(),
		Question:   poll.Question,
		TotalVotes: totalVotes,
		Status:     poll.Status,
		Options:    options,
		UpdatedAt:  time.Now().UTC(),
	}, nil
}

// ResyncFromMongo rebuilds Redis counter state from MongoDB verified vote records
func (s *resultService) ResyncFromMongo(ctx context.Context, pollID string) (*models.PollResultsResponse, error) {
	objID, err := primitive.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, errors.New("invalid poll ID format")
	}

	poll, err := s.pollRepo.FindByID(ctx, objID)
	if err != nil || poll == nil {
		return nil, errors.New("poll not found")
	}

	counts, err := s.voteRepo.GetOptionCounts(ctx, poll.ID)
	if err != nil {
		counts = make(map[string]int64)
	}

	options := make([]models.PollOption, len(poll.Options))
	var totalVotes int64 = 0

	for i, opt := range poll.Options {
		vCount := counts[opt.ID]
		if vCount == 0 && opt.Votes > 0 {
			vCount = opt.Votes
		}
		options[i] = models.PollOption{
			ID:    opt.ID,
			Text:  opt.Text,
			Votes: vCount,
		}
		totalVotes += vCount
	}

	// Rebuild Redis counters from MongoDB ground truth
	if pulseRedis.Counter != nil {
		_ = pulseRedis.Counter.RebuildFromMongo(ctx, pollID, counts, totalVotes)
	}

	return &models.PollResultsResponse{
		PollID:     poll.ID.Hex(),
		Question:   poll.Question,
		TotalVotes: totalVotes,
		Status:     poll.Status,
		Options:    options,
		UpdatedAt:  time.Now().UTC(),
	}, nil
}

