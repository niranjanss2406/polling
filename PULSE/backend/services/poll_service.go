package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"pulse-backend/models"
	"pulse-backend/repositories"
	"pulse-backend/utils"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollService interface {
	CreatePoll(ctx context.Context, creatorID string, req *models.CreatePollRequest) (*models.Poll, error)
	GetPoll(ctx context.Context, pollID string) (*models.Poll, error)
	GetMyPolls(ctx context.Context, creatorID string) ([]models.Poll, error)
	GetAllPolls(ctx context.Context) ([]models.Poll, error)
	UpdatePoll(ctx context.Context, pollID, creatorID string, req *models.UpdatePollRequest) (*models.Poll, error)
	ClosePoll(ctx context.Context, pollID, creatorID string) error
	ReopenPoll(ctx context.Context, pollID, creatorID string) error
	DeletePoll(ctx context.Context, pollID, creatorID string) error
}

type pollService struct {
	pollRepo repositories.PollRepository
}

func NewPollService(pollRepo repositories.PollRepository) PollService {
	return &pollService{pollRepo: pollRepo}
}

func (s *pollService) CreatePoll(ctx context.Context, creatorID string, req *models.CreatePollRequest) (*models.Poll, error) {
	creatorObjID, err := primitive.ObjectIDFromHex(creatorID)
	if err != nil {
		return nil, errors.New("invalid creator ID")
	}

	question := strings.TrimSpace(req.Question)
	if len(question) < 5 || len(question) > 300 {
		return nil, errors.New("question must be between 5 and 300 characters")
	}

	if err := utils.ValidatePollOptions(req.Options); err != nil {
		return nil, err
	}

	if err := utils.ValidateExpiration(req.ExpiresAt); err != nil {
		return nil, err
	}

	// Prepare options with unique generated IDs
	pollOptions := make([]models.PollOption, len(req.Options))
	for i, optText := range req.Options {
		pollOptions[i] = models.PollOption{
			ID:    fmt.Sprintf("opt_%s", uuid.New().String()[:8]),
			Text:  strings.TrimSpace(optText),
			Votes: 0,
		}
	}

	poll := &models.Poll{
		CreatorID:     creatorObjID,
		Question:      question,
		Description:   strings.TrimSpace(req.Description),
		Options:       pollOptions,
		AllowMultiple: req.AllowMultiple,
		ExpiresAt:     req.ExpiresAt,
	}

	if err := s.pollRepo.Create(ctx, poll); err != nil {
		return nil, err
	}

	return poll, nil
}

func (s *pollService) GetPoll(ctx context.Context, pollID string) (*models.Poll, error) {
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

	// Dynamic expiration check
	if poll.Status == "active" && poll.ExpiresAt != nil && poll.ExpiresAt.Before(time.Now().UTC()) {
		poll.Status = "closed"
		_ = s.pollRepo.UpdateStatus(ctx, poll.ID, "closed")
	}

	return poll, nil
}

func (s *pollService) GetMyPolls(ctx context.Context, creatorID string) ([]models.Poll, error) {
	creatorObjID, err := primitive.ObjectIDFromHex(creatorID)
	if err != nil {
		return nil, errors.New("invalid creator ID")
	}

	return s.pollRepo.FindByCreatorID(ctx, creatorObjID)
}

func (s *pollService) GetAllPolls(ctx context.Context) ([]models.Poll, error) {
	return s.pollRepo.FindAll(ctx)
}

func (s *pollService) UpdatePoll(ctx context.Context, pollID, creatorID string, req *models.UpdatePollRequest) (*models.Poll, error) {
	poll, err := s.GetPoll(ctx, pollID)
	if err != nil {
		return nil, err
	}

	if poll.CreatorID.Hex() != creatorID {
		return nil, errors.New("unauthorized: you do not own this poll")
	}

	if req.Question != nil {
		q := strings.TrimSpace(*req.Question)
		if len(q) < 5 || len(q) > 300 {
			return nil, errors.New("question must be between 5 and 300 characters")
		}
		poll.Question = q
	}

	if req.Description != nil {
		poll.Description = strings.TrimSpace(*req.Description)
	}

	if req.ExpiresAt != nil {
		if err := utils.ValidateExpiration(req.ExpiresAt); err != nil {
			return nil, err
		}
		poll.ExpiresAt = req.ExpiresAt
	}

	if err := s.pollRepo.Update(ctx, poll); err != nil {
		return nil, err
	}

	return poll, nil
}

func (s *pollService) ClosePoll(ctx context.Context, pollID, creatorID string) error {
	poll, err := s.GetPoll(ctx, pollID)
	if err != nil {
		return err
	}

	if poll.CreatorID.Hex() != creatorID {
		return errors.New("unauthorized: you do not own this poll")
	}

	return s.pollRepo.UpdateStatus(ctx, poll.ID, "closed")
}

func (s *pollService) ReopenPoll(ctx context.Context, pollID, creatorID string) error {
	poll, err := s.GetPoll(ctx, pollID)
	if err != nil {
		return err
	}

	if poll.CreatorID.Hex() != creatorID {
		return errors.New("unauthorized: you do not own this poll")
	}

	return s.pollRepo.UpdateStatus(ctx, poll.ID, "active")
}

func (s *pollService) DeletePoll(ctx context.Context, pollID, creatorID string) error {
	poll, err := s.GetPoll(ctx, pollID)
	if err != nil {
		return err
	}

	if poll.CreatorID.Hex() != creatorID {
		return errors.New("unauthorized: you do not own this poll")
	}

	return s.pollRepo.Delete(ctx, poll.ID)
}

