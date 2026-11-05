package controllers

import (
	"net/http"

	"pulse-backend/models"
	"pulse-backend/services"
	"pulse-backend/utils"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

func (ac *AuthController) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, "Invalid request format: "+err.Error())
		return
	}

	user, token, err := ac.authService.Register(c.Request.Context(), &req)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User registered successfully",
		"token":   token,
		"user":    user,
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, "Invalid request format: "+err.Error())
		return
	}

	user, token, err := ac.authService.Login(c.Request.Context(), &req)
	if err != nil {
		utils.JSONError(c, http.StatusUnauthorized, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"token":   token,
		"user":    user,
	})
}

func (ac *AuthController) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.JSONError(c, http.StatusUnauthorized, "User session not authenticated")
		return
	}

	user, err := ac.authService.GetProfile(c.Request.Context(), userID.(string))
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user,
	})
}

