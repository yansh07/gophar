package handlers

import (
	"gophar/pkg/database"
	"gophar/pkg/models"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
)

func AddMonitor(c *gin.Context) {
	var input struct {
		URL       string `json:"url" binding:"required"`
		Frequency int    `json:"frequency"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Enter correct URL!!"})
		return
	}

	// validate URL format
	parsedURL, err := url.ParseRequestURI(input.URL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") || parsedURL.Host == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL. Must be a valid http/https URL (e.g. https://example.com)"})
		return
	}

	// quick reachability check
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Head(parsedURL.String())
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is not reachable. Check the URL and try again."})
		return
	}
	resp.Body.Close()

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User identification failed."})
		return
	}

	if input.Frequency == 0 {
		input.Frequency = 60
	}

	newMonitor := models.Monitor{
		UserId:    userID.(uint),
		URL:       input.URL,
		Frequency: input.Frequency,
		IsActive:  true,
	}

	if err := database.DB.Create(&newMonitor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add URL"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Monitor added.",
		"data":    newMonitor,
	})
}

func GetMonitor(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User identification failed."})
		return
	}

	var monitors []models.Monitor
	if err := database.DB.Where("user_id = ?", userID.(uint)).Find(&monitors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch monitors"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"monitors": monitors,
	})
}

func GetUserMonitors(c *gin.Context) {
	userID, _ := c.Get("userID")
	var monitors []models.Monitor

	database.DB.Where("user_id = ?", userID).Find(&monitors)

	type MonitorResponse struct {
		models.Monitor
		LastStatus  string `json:"last_status"`
		LastChecked string `json:"last_checked"`
	}

	var response []MonitorResponse
	for _, m := range monitors {
		var lastLog models.HealthLog
		//latest log for this monitor
		database.DB.Where("monitor_id = ?", m.ID).Order("created_at desc").First(&lastLog)

		response = append(response, MonitorResponse{
			Monitor:     m,
			LastStatus:  lastLog.Status,
			LastChecked: lastLog.CreatedAt.Format(time.RFC3339),
		})
	}
	c.JSON(200, response)
}

func GetMonitorStats(c *gin.Context) {
	monitorID := c.Param("id")
	var logs []models.HealthLog

	//pichla 20 checks for graph
	database.DB.Where("monitor_id = ?", monitorID).Order("created_at desc").Limit(20).Find(&logs)

	c.JSON(200, logs)
}

func GetAllLogs(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User identification failed."})
		return
	}

	var monitors []models.Monitor
	database.DB.Where("user_id = ?", userID.(uint)).Find(&monitors)

	monitorURLs := make(map[uint]string)
	var monitorIDs []uint
	for _, m := range monitors {
		monitorURLs[m.ID] = m.URL
		monitorIDs = append(monitorIDs, m.ID)
	}

	type LogResponse struct {
		models.HealthLog
		URL string `json:"url"`
	}

	var response []LogResponse
	if len(monitorIDs) > 0 {
		var logs []models.HealthLog
		database.DB.Where("monitor_id IN ?", monitorIDs).Order("created_at desc").Limit(50).Find(&logs)
		for _, l := range logs {
			response = append(response, LogResponse{
				HealthLog: l,
				URL:       monitorURLs[l.MonitorId],
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"logs": response})
}

func DeleteMonitor(c *gin.Context) {
	//url se id uthao
	monitorID := c.Param("id")
	userID, _ := c.Get("userID")

	var monitor []models.Monitor

	result := database.DB.Where("id = ? AND user_id = ?", monitorID, userID).First(&monitor)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"Error": "Monitor not found"})
		return
	}
	database.DB.Where("monitor_id = ?", monitorID).Delete(&models.HealthLog{})
	database.DB.Unscoped().Delete(&monitor)
	c.JSON(http.StatusOK, gin.H{"message": "Monitor deleted!!!"})
}