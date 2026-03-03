package middleware

import (
	"gophar/pkg/utils"
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc{
	return func(c *gin.Context) {
		//header se authorization lena hai
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Dude, where is token?"})
			c.Abort()
			return
		}

		//format check: Bearer <token>
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format!!"})
			c.Abort()
			return
		}

		//verfiy token - utils me jo banaya tha
		claims, err := utils.VerifyToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired or wrong!!"})
			c.Abort()
			return
		}
		c.Set("userEmail", claims["email"])
		c.Next()
	}
}