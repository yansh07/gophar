package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email string `gorm:"unique;not null" json:"email"`
	Password string `gorm:"not null" json:"-"` //json me pass nahi hoga
}

type Monitor struct {
	gorm.Model
	UserId uint `json:"user_id"`
	URL string `gorm:"not null" json:"url"`
	Frequency int `gorm:"default:60" json:"frequency"` //seconds mein
	IsActive bool `gorm:"default:true" json:"is_active"`
}

type HealthLog struct {
	ID uint `gorm:"primaryKey" json:"id"`
	MonitorId uint `json:"monitor_id"`
	Status string `json:"status"`
	Latency string `json:"latency"`
	CreatedAt time.Time `json:"checked_at"`
}