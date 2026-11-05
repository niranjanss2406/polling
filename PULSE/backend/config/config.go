package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	GinMode         string
	MongoDBURI      string
	MongoDBDatabase string
	RedisURL        string
	JWTSecret       string
	FrontendURL     string
	TokenExpiry     time.Duration
}

var AppConfig *Config

func LoadConfig() *Config {
	// Load .env file if it exists, otherwise use environment variables
	_ = godotenv.Load(".env")

	port := getEnv("PORT", "8080")
	ginMode := getEnv("GIN_MODE", "debug")
	mongoURI := getEnv("MONGODB_URI", "mongodb://localhost:27017")
	mongoDB := getEnv("MONGODB_DATABASE", "pulse_db")
	redisURL := getEnv("REDIS_URL", "localhost:6379")
	jwtSecret := getEnv("JWT_SECRET", "pulse_super_secret_jwt_signing_key_production_guvi_2026")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")

	expiryStr := getEnv("TOKEN_EXPIRY", "24h")
	tokenExpiry, err := time.ParseDuration(expiryStr)
	if err != nil {
		tokenExpiry = 24 * time.Hour
	}

	AppConfig = &Config{
		Port:            port,
		GinMode:         ginMode,
		MongoDBURI:      mongoURI,
		MongoDBDatabase: mongoDB,
		RedisURL:        redisURL,
		JWTSecret:       jwtSecret,
		FrontendURL:     frontendURL,
		TokenExpiry:     tokenExpiry,
	}

	return AppConfig
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

