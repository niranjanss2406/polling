package utils

import (
	"errors"
	"net/mail"
	"strings"
	"time"
)

func ValidateEmail(email string) error {
	trimmed := strings.TrimSpace(email)
	if trimmed == "" {
		return errors.New("email is required")
	}
	_, err := mail.ParseAddress(trimmed)
	if err != nil {
		return errors.New("invalid email address format")
	}
	return nil
}

func ValidatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	var hasLetter, hasNumber bool
	for _, c := range password {
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') {
			hasLetter = true
		} else if c >= '0' && c <= '9' {
			hasNumber = true
		}
	}
	if !hasLetter || !hasNumber {
		return errors.New("password must contain both letters and numbers")
	}
	return nil
}

func ValidatePollOptions(options []string) error {
	if len(options) < 2 {
		return errors.New("poll must contain at least 2 options")
	}
	if len(options) > 10 {
		return errors.New("poll cannot contain more than 10 options")
	}

	seen := make(map[string]bool)
	for _, opt := range options {
		trimmed := strings.TrimSpace(opt)
		if trimmed == "" {
			return errors.New("option text cannot be empty")
		}
		lower := strings.ToLower(trimmed)
		if seen[lower] {
			return errors.New("duplicate option text is not allowed: " + trimmed)
		}
		seen[lower] = true
	}
	return nil
}

func ValidateExpiration(expiresAt *time.Time) error {
	if expiresAt != nil && expiresAt.Before(time.Now().Add(30*time.Second)) {
		return errors.New("expiration date must be in the future")
	}
	return nil
}

