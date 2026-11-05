package middleware

import (
	"net/http"
	"strings"

	"pulse-backend/utils"

	"github.com/gin-gonic/gin"
)

// AuthRequired ensures request has a valid JWT token
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header is required",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization format must be Bearer <token>",
			})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token: " + err.Error(),
			})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

// AdminRequired ensures the authenticated user is the designated administrator
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("userRole")
		email, _ := c.Get("userEmail")

		if role != "admin" && email != "niranjanss2406@gmail.com" {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Access restricted: Only the administrator (niranjanss2406@gmail.com) is authorized to create or manage polls",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// OptionalAuth parses JWT if provided, allowing both authenticated users and anonymous voters
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				claims, err := utils.ValidateToken(parts[1])
				if err == nil && claims != nil {
					c.Set("userID", claims.UserID)
					c.Set("userEmail", claims.Email)
					c.Set("userRole", claims.Role)
				}
			}
		}
		c.Next()
	}
}
