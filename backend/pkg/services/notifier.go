package services

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"
)

func CheckTelegramConfig() {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")
	if token == "" || chatID == "" {
		log.Println("⚠️  TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — Telegram alerts disabled")
	} else {
		log.Println("✅ Telegram alerts configured")
	}
}

func SendTelegramAlert(website string, status string) {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")
	if token == "" || chatID == "" {
		log.Printf("[alert] %s — %s (Telegram not configured)", website, status)
		return
	}

	message := fmt.Sprintf("🔔 *GOPHAR ALERT*\n\n*Site:* %s\n*Status:* %s\n*Time:* %s",
		website, status, time.Now().Format("15:04:05 MST"))

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)

	_, err := http.PostForm(apiURL, url.Values{
		"chat_id":    {chatID},
		"text":       {message},
		"parse_mode": {"Markdown"},
	})
	if err != nil {
		log.Printf("[alert] Failed to send Telegram alert for %s: %v", website, err)
		return
	}
	log.Printf("[alert] Telegram alert sent for: %s", website)
}
