package tests

import (
	"testing"
	"time"

	"pulse-backend/config"
	"pulse-backend/utils"
)

func init() {
	config.AppConfig = &config.Config{
		JWTSecret:   "test_secret_key_pulse_guvi_assessment_2026",
		TokenExpiry: 1 * time.Hour,
	}
}

func TestPasswordHashing(t *testing.T) {
	rawPassword := "SecurePassword123!"

	hash, err := utils.HashPassword(rawPassword)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if hash == rawPassword {
		t.Fatalf("Hash should not match raw password plaintext")
	}

	// Verify valid match
	if !utils.CheckPasswordHash(rawPassword, hash) {
		t.Errorf("Expected password hash check to succeed for correct password")
	}

	// Verify invalid mismatch
	if utils.CheckPasswordHash("WrongPassword456!", hash) {
		t.Errorf("Expected password hash check to fail for incorrect password")
	}
}

func TestJWTTokenGenerationAndValidation(t *testing.T) {
	userID := "60d5ec49f1b2c8b1f8e4e1a1"
	email := "developer@pulse.dev"

	token, err := utils.GenerateToken(userID, email, "user")
	if err != nil {
		t.Fatalf("Failed to generate JWT: %v", err)
	}

	if token == "" {
		t.Fatalf("Generated token is empty")
	}

	claims, err := utils.ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate valid JWT: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected userID %s, got %s", userID, claims.UserID)
	}

	if claims.Email != email {
		t.Errorf("Expected email %s, got %s", email, claims.Email)
	}

	// Test invalid token
	_, err = utils.ValidateToken("invalid.tampered.token")
	if err == nil {
		t.Errorf("Expected error validating malformed token, got nil")
	}
}

func TestEmailValidator(t *testing.T) {
	validEmails := []string{
		"alex@example.com",
		"user.name+tag@domain.co.uk",
		"student@guvi.in",
	}

	for _, e := range validEmails {
		if err := utils.ValidateEmail(e); err != nil {
			t.Errorf("Expected valid email for %s, got %v", e, err)
		}
	}

	invalidEmails := []string{
		"",
		"not-an-email",
		"plainaddress",
		"@missingusername.com",
	}

	for _, e := range invalidEmails {
		if err := utils.ValidateEmail(e); err == nil {
			t.Errorf("Expected validation error for invalid email %s, got nil", e)
		}
	}
}

func TestPasswordStrengthValidator(t *testing.T) {
	validPasswords := []string{
		"SecurePass123",
		"AlphaNumeric999",
	}

	for _, p := range validPasswords {
		if err := utils.ValidatePassword(p); err != nil {
			t.Errorf("Expected valid password for %s, got %v", p, err)
		}
	}

	invalidPasswords := []string{
		"short",          // < 8 chars
		"alllettersonly", // missing number
		"1234567890",     // missing letters
	}

	for _, p := range invalidPasswords {
		if err := utils.ValidatePassword(p); err == nil {
			t.Errorf("Expected validation error for %s, got nil", p)
		}
	}
}

