package main

import (
	"gophar/pkg/database"
	"gophar/pkg/handlers"
	"gophar/pkg/middleware"
	"gophar/pkg/services"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	database.ConnectDB()

	r := gin.Default()
	_ = r.SetTrustedProxies(nil)

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {

			if strings.HasPrefix(origin, "http://localhost") || strings.HasPrefix(origin, "http://127.0.0.1") {
				return true
			}
			if origin == "https://gophar.vercel.app" {
				return true
			}
			envFrontend := strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
			if envFrontend != "" && origin == envFrontend {
				return true
			}

			log.Printf("Blocked CORS attempt from: %s", origin)
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
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
		protected.GET("/monitors", handlers.GetUserMonitors)
		protected.GET("/monitor/:id/stats", handlers.GetMonitorStats)
		protected.GET("/logs", handlers.GetAllLogs)
		protected.DELETE("/monitors/:id", handlers.DeleteMonitor)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	services.StartInternalMonitoring()

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
