package controllers

import (
	"net/http"

	"pulse-backend/models"
	"pulse-backend/services"
	"pulse-backend/utils"

	"github.com/gin-gonic/gin"
)

type VoteController struct {
	voteService services.VoteService
}

func NewVoteController(voteService services.VoteService) *VoteController {
	return &VoteController{voteService: voteService}
}

func (vc *VoteController) SubmitVote(c *gin.Context) {
	pollID := c.Param("id")

	var req models.SubmitVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, "Invalid vote submission: "+err.Error())
		return
	}

	// If voter ID wasn't provided in the JSON body, check header or generate
	if req.VoterID == "" {
		req.VoterID = c.GetHeader("X-Voter-ID")
	}

	// If authenticated, prefer the user ID for authenticated voting tracking
	if userID, exists := c.Get("userID"); exists && userID != nil {
		req.VoterID = "user_" + userID.(string)
	}

	results, err := vc.voteService.SubmitVote(c.Request.Context(), pollID, &req)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Vote recorded successfully",
		"results": results,
	})
}

func (vc *VoteController) CheckVoted(c *gin.Context) {
	pollID := c.Param("id")

	var voterID string
	if userID, exists := c.Get("userID"); exists && userID != nil {
		voterID = "user_" + userID.(string)
	} else {
		voterID = c.GetHeader("X-Voter-ID")
		if voterID == "" {
			voterID = c.Query("voter_id")
		}
	}

	if voterID == "" {
		c.JSON(http.StatusOK, gin.H{
			"success":   true,
			"has_voted": false,
		})
		return
	}

	hasVoted, err := vc.voteService.HasVoted(c.Request.Context(), pollID, voterID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success":   true,
			"has_voted": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"has_voted": hasVoted,
		"voter_id":  voterID,
	})
}

