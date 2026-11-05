package repositories

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"pulse-backend/database"
	"pulse-backend/models"
	"pulse-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.User, error)
}

type mongoUserRepository struct {
	db         *database.MongoDB
	localUsers map[string]*models.User
	mu         sync.RWMutex
}

func NewUserRepository(db *database.MongoDB) UserRepository {
	repo := &mongoUserRepository{
		db:         db,
		localUsers: make(map[string]*models.User),
	}

	// Pre-seed Administrator account requested by user
	adminID, _ := primitive.ObjectIDFromHex("672501a3b1c2d3e4f5a6b7a0")
	adminPass, _ := utils.HashPassword("niranjan$$2007")
	adminUser := &models.User{
		ID:           adminID,
		Name:         "Niranjan (Admin)",
		Email:        "niranjanss2406@gmail.com",
		PasswordHash: adminPass,
		Role:         "admin",
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}
	repo.localUsers["niranjanss2406@gmail.com"] = adminUser
	repo.localUsers[adminID.Hex()] = adminUser

	// Pre-seed demo user into local store for instant demo testing
	demoID, _ := primitive.ObjectIDFromHex("672501a3b1c2d3e4f5a6b7c8")
	hashedPass, _ := utils.HashPassword("Pulse2026!")
	demoUser := &models.User{
		ID:           demoID,
		Name:         "Alex Morgan (Voter)",
		Email:        "demo@pulse.dev",
		PasswordHash: hashedPass,
		Role:         "user",
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}
	repo.localUsers["demo@pulse.dev"] = demoUser
	repo.localUsers[demoID.Hex()] = demoUser

	return repo
}

func (r *mongoUserRepository) Create(ctx context.Context, user *models.User) error {
	user.ID = primitive.NewObjectID()
	now := time.Now().UTC()
	user.CreatedAt = now
	user.UpdatedAt = now

	// Save to local cache
	r.mu.Lock()
	r.localUsers[strings.ToLower(user.Email)] = user
	r.localUsers[user.ID.Hex()] = user
	r.mu.Unlock()

	if r.db != nil && r.db.IsConnected && r.db.Users != nil {
		_, err := r.db.Users.InsertOne(ctx, user)
		return err
	}

	return nil
}

func (r *mongoUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	lowerEmail := strings.ToLower(strings.TrimSpace(email))

	if r.db != nil && r.db.IsConnected && r.db.Users != nil {
		var user models.User
		err := r.db.Users.FindOne(ctx, bson.M{"email": lowerEmail}).Decode(&user)
		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, nil
			}
			return nil, err
		}
		return &user, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	if u, exists := r.localUsers[lowerEmail]; exists {
		return u, nil
	}
	return nil, nil
}

func (r *mongoUserRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	if r.db != nil && r.db.IsConnected && r.db.Users != nil {
		var user models.User
		err := r.db.Users.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, nil
			}
			return nil, err
		}
		return &user, nil
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	if u, exists := r.localUsers[id.Hex()]; exists {
		return u, nil
	}
	return nil, nil
}
