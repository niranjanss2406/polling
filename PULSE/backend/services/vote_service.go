package services

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"pulse-backend/models"
	pulseRedis "pulse-backend/redis"
	"pulse-backend/repositories"
	"pulse-backend/websocket"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type VoteService interface {
	SubmitVote(ctx context.Context, pollID string, req *models.SubmitVoteRequest) (*models.PollResultsResponse, error)
	HasVoted(ctx context.Context, pollID string, voterID string) (bool, error)
}

type voteService struct {
	pollRepo      repositories.PollRepository
	voteRepo      repositories.VoteRepository
	resultService ResultService
}

func NewVoteService(
	pollRepo repositories.PollRepository,
	voteRepo repositories.VoteRepository,
	resultService ResultService,
) VoteService {
	return &voteService{
		pollRepo:      pollRepo,
		voteRepo:      voteRepo,
		resultService: resultService,
	}
}

func (s *voteService) SubmitVote(ctx context.Context, pollID string, req *models.SubmitVoteRequest) (*models.PollResultsResponse, error) {
	objID, err := primitive.ObjectIDFromHex(pollID)
	if err != nil {
		return nil, errors.New("invalid poll ID format")
	}

	// 1. Fetch & verify poll
	poll, err := s.pollRepo.FindByID(ctx, objID)
	if err != nil {
		return nil, err
	}
	if poll == nil {
		return nil, errors.New("poll not found")
	}

	// 2. Check if poll is active & not expired
	if poll.Status != "active" {
		return nil, errors.New("voting is closed for this poll")
	}
	if poll.ExpiresAt != nil && poll.ExpiresAt.Before(time.Now().UTC()) {
		_ = s.pollRepo.UpdateStatus(ctx, poll.ID, "closed")
		return nil, errors.New("this poll has expired and is no longer accepting votes")
	}

	// 3. Validate options selection
	if len(req.OptionIDs) == 0 {
		return nil, errors.New("you must select at least one option")
	}
	if !poll.AllowMultiple && len(req.OptionIDs) > 1 {
		return nil, errors.New("multiple options are not allowed on this single-choice poll")
	}

	validOptionMap := make(map[string]bool)
	for _, opt := range poll.Options {
		validOptionMap[opt.ID] = true
	}
	for _, optID := range req.OptionIDs {
		if !validOptionMap[optID] {
			return nil, errors.New("invalid option ID: " + optID)
		}
	}

	// 4. Ensure voter ID (server-issued or client token)
	voterID := strings.TrimSpace(req.VoterID)
	if voterID == "" {
		voterID = "anon_" + uuid.New().String()
	}

	// 5. Check duplicate vote in MongoDB (source of truth)
	hasVoted, err := s.voteRepo.HasVoted(ctx, poll.ID, voterID)
	if err != nil {
		return nil, err
	}
	if hasVoted {
		return nil, errors.New("duplicate vote: you have already voted in this poll")
	}

	// 6. Persist Vote document in MongoDB
	vote := &models.Vote{
		PollID:    poll.ID,
		VoterID:   voterID,
		OptionIDs: req.OptionIDs,
	}
	if err := s.voteRepo.Create(ctx, vote); err != nil {
		// MongoDB unique index protects against race conditions
		return nil, errors.New("duplicate vote detected: your vote was already recorded")
	}

	// 7. Update MongoDB option vote counters
	if err := s.pollRepo.IncrementOptionVotes(ctx, poll.ID, req.OptionIDs); err != nil {
		return nil, err
	}

	// 8. Safely increment Redis counters
	if pulseRedis.Counter != nil {
		_ = pulseRedis.Counter.IncrementVote(ctx, pollID, req.OptionIDs)
	}

	// 9. Fetch aggregated latest results
	latestResults, err := s.resultService.GetResults(pollID)
	if err != nil {
		return nil, err
	}

	// 10. Publish event to Redis Pub/Sub channel (poll:{id}:updates)
	broadcastPayload := map[string]interface{}{
		"type":      "vote_update",
		"poll_id":   pollID,
		"results":   latestResults,
		"timestamp": time.Now().UTC(),
	}

	if pulseRedis.Publisher != nil {
		_ = pulseRedis.Publisher.PublishPollUpdate(ctx, pollID, broadcastPayload)
	}

	// Also directly notify local WebSocket clients for fastest zero-delay local delivery
	if websocket.GlobalHub != nil {
		importJson, err := json.Marshal(broadcastPayload)
		if err == nil {
			websocket.GlobalHub.BroadcastToPoll(pollID, importJson)
		}
	}

	return latestResults, nil
}

func (s *voteService) HasVoted(ctx context.Context, pollID string, voterID string) (bool, error) {
	objID, err := primitive.ObjectIDFromHex(pollID)
	if err != nil {
		return false, errors.New("invalid poll ID format")
	}
	return s.voteRepo.HasVoted(ctx, objID, voterID)
}

