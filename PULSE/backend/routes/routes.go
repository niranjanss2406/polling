package routes

import (
	"net"
	"net/http"
	"strings"
	"time"

	"pulse-backend/controllers"
	"pulse-backend/middleware"
	"pulse-backend/websocket"

	"github.com/gin-gonic/gin"
)

type RouteDependencies struct {
	AuthController   *controllers.AuthController
	PollController   *controllers.PollController
	VoteController   *controllers.VoteController
	ResultController *controllers.ResultController
	Hub              *websocket.Hub
}

func SetupRoutes(r *gin.Engine, deps *RouteDependencies) {
	// Global Middlewares
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.RateLimit(120, time.Minute))

	// Health Check Endpoint
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"platform":  "PULSE – Real-Time Interactive Polling",
			"version":   "1.0.0",
		})
	})

	// System / Network Info Endpoint (for easy LAN & QR share discovery)
	r.GET("/api/system/network-info", func(c *gin.Context) {
		lanIP := "127.0.0.1"
		addrs, err := net.InterfaceAddrs()
		if err == nil {
			var fallbackIP string
			for _, address := range addrs {
				if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
					if ip4 := ipnet.IP.To4(); ip4 != nil {
						ipStr := ip4.String()
						// Skip APIPA/link-local 169.254.x.x
						if strings.HasPrefix(ipStr, "169.254.") {
							continue
						}
						// Prefer standard private LAN subnets
						if strings.HasPrefix(ipStr, "192.168.") || strings.HasPrefix(ipStr, "10.") || strings.HasPrefix(ipStr, "172.") {
							lanIP = ipStr
							break
						}
						if fallbackIP == "" {
							fallbackIP = ipStr
						}
					}
				}
			}
			if lanIP == "127.0.0.1" && fallbackIP != "" {
				lanIP = fallbackIP
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"lan_ip":     lanIP,
			"port":       5173,
			"lan_url":    "http://" + lanIP + ":5173",
			"public_url": "https://number-fotos-interior-appraisal.trycloudflare.com",
			"api_port":   8080,
		})
	})

	// WebSocket Endpoint
	r.GET("/ws/polls/:id", websocket.HandleWebSocket(deps.Hub))

	api := r.Group("/api")
	{
		// Authentication Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", deps.AuthController.Register)
			auth.POST("/login", deps.AuthController.Login)
			auth.GET("/me", middleware.AuthRequired(), deps.AuthController.GetMe)
		}

		// Poll Routes
		polls := api.Group("/polls")
		{
			// Public & Voter Endpoints
			polls.GET("", middleware.OptionalAuth(), deps.PollController.GetMyPolls)
			polls.GET("/:id", deps.PollController.GetPoll)
			polls.GET("/:id/results", deps.ResultController.GetResults)
			polls.GET("/:id/voted", middleware.OptionalAuth(), deps.VoteController.CheckVoted)
			polls.POST("/:id/vote", middleware.OptionalAuth(), deps.VoteController.SubmitVote)

			// Creator Endpoints (Restricted to Admin: niranjanss2406@gmail.com)
			protected := polls.Group("")
			protected.Use(middleware.AuthRequired())
			{
				protected.POST("", middleware.AdminRequired(), deps.PollController.CreatePoll)
				protected.PUT("/:id", middleware.AdminRequired(), deps.PollController.UpdatePoll)
				protected.DELETE("/:id", middleware.AdminRequired(), deps.PollController.DeletePoll)
				protected.PATCH("/:id/close", middleware.AdminRequired(), deps.PollController.ClosePoll)
				protected.PATCH("/:id/reopen", middleware.AdminRequired(), deps.PollController.ReopenPoll)
			}
		}
	}
}

