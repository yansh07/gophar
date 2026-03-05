package services

import (
	"fmt"
	"gophar/pkg/database"
	"gophar/pkg/models"
	"net/http"
	"strconv"
	"time"
)

// StartInternalMonitoring ticks every 30s and checks which monitors are due.
func StartInternalMonitoring() {
	ticker := time.NewTicker(30 * time.Second)

	go func() {
		// run once immediately on startup
		checkDueMonitors()

		for range ticker.C {
			checkDueMonitors()
		}
	}()
}

func checkDueMonitors() {
	var monitors []models.Monitor
	database.DB.Where("is_active = ?", true).Find(&monitors)

	for _, m := range monitors {
		var lastLog models.HealthLog
		result := database.DB.Where("monitor_id = ?", m.ID).Order("created_at desc").First(&lastLog)

		// no log yet → first check, or check if enough time has passed
		if result.Error != nil || time.Since(lastLog.CreatedAt) >= time.Duration(m.Frequency)*time.Second {
			go pingAndLog(m)
		}
	}
}

func pingAndLog(mon models.Monitor) {
	client := &http.Client{Timeout: 10 * time.Second}

	start := time.Now()
	resp, err := client.Get(mon.URL)
	duration := time.Since(start)

	statusCode := 0
	if err == nil {
		statusCode = resp.StatusCode
		resp.Body.Close()
	}

	latencyMs := duration.Milliseconds()

	log := models.HealthLog{
		MonitorId: mon.ID,
		Status:    strconv.Itoa(statusCode),
		Latency:   strconv.FormatInt(latencyMs, 10),
	}
	database.DB.Create(&log)

	if statusCode == 0 {
		fmt.Printf("[ping] %s → error (took %dms)\n", mon.URL, latencyMs)
	} else {
		fmt.Printf("[ping] %s → %d (took %dms)\n", mon.URL, statusCode, latencyMs)
	}
}
