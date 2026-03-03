package main

import (
	"gophar/pkg/database"
	"gophar/pkg/handlers"
	"gophar/pkg/middleware"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func allowedOriginsFromEnv() map[string]struct{} {
	origins := []string{}

	// Always allow localhost 
	if gin.Mode() != gin.ReleaseMode {
		origins = append(origins,
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		)
	}

	if fe := os.Getenv("FRONTEND_URL"); fe != "" {
		origins = append(origins, fe)
	}

	// multi-origin
	if raw := os.Getenv("CORS_ALLOWED_ORIGINS"); raw != "" {
		for _, origin := range strings.Split(raw, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				origins = append(origins, origin)
			}
		}
	}

	set := make(map[string]struct{}, len(origins))
	for _, o := range origins {
		set[o] = struct{}{}
	}

	return set
}

func main() {
	// Load .env locally (ignored in Railway automatically)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found (this is fine in production)")
	}

	// Connect Database
	database.ConnectDB()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.SetTrustedProxies(nil)

	allowedOrigins := allowedOriginsFromEnv()

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Non-browser clients may not send Origin
			if origin == "" {
				return true
			}
			_, ok := allowedOrigins[origin]
			return ok
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Public routes
	r.POST("/signup", handlers.Signup)
	r.POST("/login", handlers.Login)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/monitors", handlers.AddMonitor)
		protected.GET("/monitors", handlers.GetMonitor)
	}

	// Railway dynamic port support
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port", port)
	r.Run(":" + port)
}