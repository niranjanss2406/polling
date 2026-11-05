package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pulse-backend/config"
	"pulse-backend/controllers"
	"pulse-backend/database"
	pulseRedis "pulse-backend/redis"
	"pulse-backend/repositories"
	"pulse-backend/routes"
	"pulse-backend/services"
	"pulse-backend/websocket"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("🚀 Starting PULSE Real-Time Polling Platform...")

	// 1. Load Configuration
	cfg := config.LoadConfig()
	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 2. Initialize Database Connections
	mongoDB, err := database.ConnectMongoDB(cfg)
	if err != nil {
		log.Printf("⚠️ Warning initializing MongoDB: %v", err)
	}
	defer database.DisconnectMongoDB()

	redisClient, err := database.ConnectRedis(cfg)
	if err != nil {
		log.Printf("⚠️ Warning initializing Redis: %v", err)
	}
	defer func() {
		if redisClient != nil {
			_ = redisClient.Close()
		}
	}()

	// 3. Initialize Redis Real-Time Components
	pulseRedis.InitVoteCounter(redisClient)
	publisher := pulseRedis.InitEventPublisher(redisClient)
	subscriber := pulseRedis.InitEventSubscriber(redisClient)

	// 4. Initialize WebSocket Hub
	hub := websocket.NewHub()
	go hub.Run()

	// 5. Initialize Repositories
	userRepo := repositories.NewUserRepository(mongoDB)
	pollRepo := repositories.NewPollRepository(mongoDB)
	voteRepo := repositories.NewVoteRepository(mongoDB)

	// 6. Initialize Business Services
	authService := services.NewAuthService(userRepo)
	pollService := services.NewPollService(pollRepo)
	resultService := services.NewResultService(pollRepo, voteRepo)
	voteService := services.NewVoteService(pollRepo, voteRepo, resultService)

	// Provide result fetcher to WebSocket handler for instant connection state
	websocket.SetResultFetcher(resultService)

	// Bridge Redis subscriber events to WebSocket Hub
	_ = publisher
	_ = subscriber

	// 7. Initialize HTTP Controllers
	authController := controllers.NewAuthController(authService)
	pollController := controllers.NewPollController(pollService)
	voteController := controllers.NewVoteController(voteService)
	resultController := controllers.NewResultController(resultService)

	// 8. Setup Gin Router & Routes
	router := gin.Default()

	deps := &routes.RouteDependencies{
		AuthController:   authController,
		PollController:   pollController,
		VoteController:   voteController,
		ResultController: resultController,
		Hub:              hub,
	}
	routes.SetupRoutes(router, deps)

	// 9. Graceful HTTP Server Setup
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("⚡ PULSE Backend listening on port %s (GIN_MODE=%s)", cfg.Port, cfg.GinMode)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server Listen error: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server with a timeout of 5 seconds
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("👋 PULSE server gracefully exited.")
}

