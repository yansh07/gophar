package database

import (
	"fmt"
	"log"
	"os"
	"gophar/pkg/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	fmt.Println("Database connection successful!!")

	if err := db.AutoMigrate(&models.User{}, &models.Monitor{}, &models.HealthLog{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	DB = db
}