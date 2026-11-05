package tests

import (
	"testing"
	"time"

	"pulse-backend/models"
	"pulse-backend/utils"
)

func TestPollOptionValidation(t *testing.T) {
	// Valid options
	validOptions := []string{"Go", "Rust", "TypeScript"}
	if err := utils.ValidatePollOptions(validOptions); err != nil {
		t.Errorf("Expected valid options, got: %v", err)
	}

	// Too few options (< 2)
	singleOption := []string{"Only One"}
	if err := utils.ValidatePollOptions(singleOption); err == nil {
		t.Errorf("Expected error for single option, got nil")
	}

	// Empty option
	emptyOption := []string{"Valid Option", "   "}
	if err := utils.ValidatePollOptions(emptyOption); err == nil {
		t.Errorf("Expected error for empty option string, got nil")
	}

	// Duplicate options (case-insensitive)
	duplicateOptions := []string{"Option A", "option a"}
	if err := utils.ValidatePollOptions(duplicateOptions); err == nil {
		t.Errorf("Expected error for duplicate options, got nil")
	}

	// Too many options (> 10)
	tooMany := make([]string, 11)
	for i := range tooMany {
		tooMany[i] = string(rune('A' + i))
	}
	if err := utils.ValidatePollOptions(tooMany); err == nil {
		t.Errorf("Expected error for >10 options, got nil")
	}
}

func TestPollExpirationLogic(t *testing.T) {
	pastTime := time.Now().Add(-10 * time.Minute)
	if err := utils.ValidateExpiration(&pastTime); err == nil {
		t.Errorf("Expected error for past expiration date, got nil")
	}

	futureTime := time.Now().Add(24 * time.Hour)
	if err := utils.ValidateExpiration(&futureTime); err != nil {
		t.Errorf("Expected future expiration date to be valid, got: %v", err)
	}

	// Nil expiration (no limit) is allowed
	if err := utils.ValidateExpiration(nil); err != nil {
		t.Errorf("Expected nil expiration to be valid, got: %v", err)
	}
}

func TestPollModelStatus(t *testing.T) {
	poll := models.Poll{
		Question:      "Favorite DB?",
		Status:        "active",
		AllowMultiple: false,
		Options: []models.PollOption{
			{ID: "opt_1", Text: "MongoDB", Votes: 10},
			{ID: "opt_2", Text: "PostgreSQL", Votes: 5},
		},
		TotalVotes: 15,
	}

	if poll.Status != "active" {
		t.Errorf("Expected active status, got %s", poll.Status)
	}

	if poll.TotalVotes != 15 {
		t.Errorf("Expected 15 total votes, got %d", poll.TotalVotes)
	}
}

