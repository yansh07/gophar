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
	origins := []string{
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	}

	if fe := strings.TrimSpace(os.Getenv("FRONTEND_URL")); fe != "" {
		origins = append(origins, fe)
	}

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
	_ = godotenv.Load()

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	database.ConnectDB()

	r := gin.Default()
	_ = r.SetTrustedProxies(nil)

	allowedOrigins := allowedOriginsFromEnv()
	log.Printf("CORS allowed origins: %v", keys(allowedOrigins))

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			if origin == "" {
				return true
			}
			_, ok := allowedOrigins[origin]
			return ok
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/signup", handlers.Signup)
	r.POST("/login", handlers.Login)

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/monitors", handlers.AddMonitor)
		protected.GET("/monitors", handlers.GetMonitor)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port", port)
	log.Fatal(r.Run(":" + port))
}

func keys(m map[string]struct{}) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	return out
}
