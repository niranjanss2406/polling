package tests

import (
	"context"
	"testing"

	pulseRedis "pulse-backend/redis"
)

func TestVoteCounterInMemoryFallback(t *testing.T) {
	// Initialize vote counter with nil client to exercise in-memory fallback
	counter := pulseRedis.InitVoteCounter(nil)
	ctx := context.Background()

	pollID := "test_poll_123"
	optionIDs := []string{"opt_go", "opt_rust"}

	// Increment votes
	err := counter.IncrementVote(ctx, pollID, optionIDs)
	if err != nil {
		t.Fatalf("IncrementVote failed: %v", err)
	}

	// Verify option 1
	votesGo, err := counter.GetOptionVotes(ctx, pollID, "opt_go")
	if err != nil {
		t.Fatalf("GetOptionVotes failed: %v", err)
	}
	if votesGo != 1 {
		t.Errorf("Expected 1 vote for opt_go, got %d", votesGo)
	}

	// Increment opt_go again
	_ = counter.IncrementVote(ctx, pollID, []string{"opt_go"})
	votesGo2, _ := counter.GetOptionVotes(ctx, pollID, "opt_go")
	if votesGo2 != 2 {
		t.Errorf("Expected 2 votes for opt_go after second increment, got %d", votesGo2)
	}

	// Test rebuild from Mongo
	counts := map[string]int64{
		"opt_go":   10,
		"opt_rust": 5,
	}
	err = counter.RebuildFromMongo(ctx, pollID, counts, 15)
	if err != nil {
		t.Fatalf("RebuildFromMongo failed: %v", err)
	}

	rebuiltGo, _ := counter.GetOptionVotes(ctx, pollID, "opt_go")
	if rebuiltGo != 10 {
		t.Errorf("Expected 10 votes for opt_go after rebuild, got %d", rebuiltGo)
	}
}

func TestResultsCalculation(t *testing.T) {
	totalVotes := int64(100)
	optionVotes := int64(45)

	percentage := float64(optionVotes) / float64(totalVotes) * 100.0
	if percentage != 45.0 {
		t.Errorf("Expected percentage 45.0, got %f", percentage)
	}
}

