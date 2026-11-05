package database

import (
	"context"
	"log"
	"time"

	"pulse-backend/config"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	Client      *mongo.Client
	Database    *mongo.Database
	Users       *mongo.Collection
	Polls       *mongo.Collection
	Votes       *mongo.Collection
	IsConnected bool
}

var DB *MongoDB

// ConnectMongoDB establishes connection to MongoDB and creates indexes
func ConnectMongoDB(cfg *config.Config) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoDBURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return &MongoDB{IsConnected: false}, err
	}

	isConnected := false
	if err := client.Ping(ctx, nil); err != nil {
		log.Printf("⚠️ Notice: Local MongoDB not detected. In-memory standalone engine active.")
	} else {
		log.Println("✅ Successfully connected to MongoDB.")
		isConnected = true
	}

	database := client.Database(cfg.MongoDBDatabase)
	usersColl := database.Collection("users")
	pollsColl := database.Collection("polls")
	votesColl := database.Collection("votes")

	db := &MongoDB{
		Client:      client,
		Database:    database,
		Users:       usersColl,
		Polls:       pollsColl,
		Votes:       votesColl,
		IsConnected: isConnected,
	}

	// Initialize Indexes if connected
	if isConnected {
		createIndexes(db)
	}

	DB = db
	return db, nil
}

func createIndexes(db *MongoDB) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Users: Unique Email Index
	emailIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	_, _ = db.Users.Indexes().CreateOne(ctx, emailIndex)

	// 2. Polls: CreatorID index
	pollCreatorIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "creator_id", Value: 1}},
	}
	_, _ = db.Polls.Indexes().CreateOne(ctx, pollCreatorIndex)

	// 3. Votes: Compound Unique Index on (poll_id + voter_id)
	voteUniqueIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "poll_id", Value: 1},
			{Key: "voter_id", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	}
	_, _ = db.Votes.Indexes().CreateOne(ctx, voteUniqueIndex)

	// 4. Votes: PollID index
	votePollIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "poll_id", Value: 1}},
	}
	_, _ = db.Votes.Indexes().CreateOne(ctx, votePollIndex)
}

// DisconnectMongoDB closes the MongoDB client
func DisconnectMongoDB() {
	if DB != nil && DB.Client != nil && DB.IsConnected {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		_ = DB.Client.Disconnect(ctx)
		log.Println("MongoDB connection closed.")
	}
}
