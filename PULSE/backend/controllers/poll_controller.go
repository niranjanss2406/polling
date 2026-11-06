package controllers

import (
	"net/http"

	"pulse-backend/models"
	"pulse-backend/services"
	"pulse-backend/utils"

	"github.com/gin-gonic/gin"
)

type PollController struct {
	pollService services.PollService
}

func NewPollController(pollService services.PollService) *PollController {
	return &PollController{pollService: pollService}
}

func (pc *PollController) CreatePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.JSONError(c, http.StatusUnauthorized, "Authentication required to create a poll")
		return
	}

	var req models.CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, "Invalid poll payload: "+err.Error())
		return
	}

	poll, err := pc.pollService.CreatePoll(c.Request.Context(), userID.(string), &req)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

func (pc *PollController) GetPoll(c *gin.Context) {
	pollID := c.Param("id")
	poll, err := pc.pollService.GetPoll(c.Request.Context(), pollID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"poll":    poll,
	})
}

func (pc *PollController) GetAllPolls(c *gin.Context) {
	polls, err := pc.pollService.GetAllPolls(c.Request.Context())
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"polls":   polls,
	})
}

func (pc *PollController) GetMyPolls(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		// If unauthenticated or guest, return all public polls
		pc.GetAllPolls(c)
		return
	}

	role, _ := c.Get("userRole")
	allParam := c.Query("all")

	// For non-admin voters, or when explicitly requested, return all polls for voting
	if role != "admin" || allParam == "true" {
		pc.GetAllPolls(c)
		return
	}

	polls, err := pc.pollService.GetMyPolls(c.Request.Context(), userID.(string))
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"polls":   polls,
	})
}

func (pc *PollController) UpdatePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.JSONError(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	pollID := c.Param("id")

	var req models.UpdatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, "Invalid update payload: "+err.Error())
		return
	}

	poll, err := pc.pollService.UpdatePoll(c.Request.Context(), pollID, userID.(string), &req)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Poll updated successfully",
		"poll":    poll,
	})
}

func (pc *PollController) ClosePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.JSONError(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	pollID := c.Param("id")

	err := pc.pollService.ClosePoll(c.Request.Context(), pollID, userID.(string))
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Poll closed successfully",
	})
}

func (pc *PollController) ReopenPoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.JSONError(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	pollID := c.Param("id")

	err := pc.pollService.ReopenPoll(c.Request.Context(), pollID, userID.(string))
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Poll reopened successfully",
	})
}

func (pc *PollController) DeletePoll(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.JSONError(c, http.StatusUnauthorized, "Authentication required")
		return
	}
	pollID := c.Param("id")

	role, _ := c.Get("userRole")
	email, _ := c.Get("userEmail")
	isAdmin := role == "admin" || email == "niranjanss2406@gmail.com"

	err := pc.pollService.DeletePoll(c.Request.Context(), pollID, userID.(string), isAdmin)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Poll deleted successfully",
	})
}

