package services

import (
	"context"
	"errors"
	"strings"

	"pulse-backend/models"
	"pulse-backend/repositories"
	"pulse-backend/utils"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthService interface {
	Register(ctx context.Context, req *models.RegisterRequest) (*models.UserResponse, string, error)
	Login(ctx context.Context, req *models.LoginRequest) (*models.UserResponse, string, error)
	GetProfile(ctx context.Context, userID string) (*models.UserResponse, error)
}

type authService struct {
	userRepo repositories.UserRepository
}

func NewAuthService(userRepo repositories.UserRepository) AuthService {
	return &authService{userRepo: userRepo}
}

func (s *authService) Register(ctx context.Context, req *models.RegisterRequest) (*models.UserResponse, string, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if err := utils.ValidateEmail(email); err != nil {
		return nil, "", err
	}
	if err := utils.ValidatePassword(req.Password); err != nil {
		return nil, "", err
	}

	// Check existing user
	existing, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}
	if existing != nil {
		return nil, "", errors.New("a user with this email address already exists")
	}

	// Hash password with bcrypt
	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, "", errors.New("failed to securely hash password")
	}

	role := "user"
	if email == "niranjanss2406@gmail.com" {
		role = "admin"
	}

	user := &models.User{
		Name:         strings.TrimSpace(req.Name),
		Email:        email,
		PasswordHash: hashed,
		Role:         role,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", err
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, "", errors.New("failed to generate authentication token")
	}

	resp := user.ToResponse()
	return &resp, token, nil
}

func (s *authService) Login(ctx context.Context, req *models.LoginRequest) (*models.UserResponse, string, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("invalid email or password")
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, "", errors.New("invalid email or password")
	}

	if user.Role == "" {
		if user.Email == "niranjanss2406@gmail.com" {
			user.Role = "admin"
		} else {
			user.Role = "user"
		}
	}

	token, err := utils.GenerateToken(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		return nil, "", errors.New("failed to generate authentication token")
	}

	resp := user.ToResponse()
	return &resp, token, nil
}

func (s *authService) GetProfile(ctx context.Context, userID string) (*models.UserResponse, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	user, err := s.userRepo.FindByID(ctx, objID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	resp := user.ToResponse()
	return &resp, nil
}

