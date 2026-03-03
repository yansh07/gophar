package handlers

import (
	"gophar/pkg/database"
	"gophar/pkg/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AddMonitor(c *gin.Context) {
	var monitor models.User
	if err := c.ShouldBindJSON(&monitor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Enter correct URL"})
		return
	}
	userEmail, _ := c.Get("UserEmail")

	var user models.User
	database.DB.Where("email = ?", userEmail).First(&user)

	monitor.ID = user.ID
	database.DB.Create(&monitor)

	c.JSON(http.StatusCreated, gin.H{"message": "Monitoring started!", "data": monitor})
}

func GetMonitor(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "monitors": []interface{}{},
    })
}