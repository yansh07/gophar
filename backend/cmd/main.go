package main

import (
	"gophar/pkg/database"
	"gophar/pkg/handlers"
	"gophar/pkg/middleware"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	database.ConnectDB()

	r := gin.Default()
	r.SetTrustedProxies(nil)

	// ✅ CORS Config
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
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

	r.Run(":8080")
}