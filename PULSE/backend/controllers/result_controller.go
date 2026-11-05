package controllers

import (
	"net/http"

	"pulse-backend/services"
	"pulse-backend/utils"

	"github.com/gin-gonic/gin"
)

type ResultController struct {
	resultService services.ResultService
}

func NewResultController(resultService services.ResultService) *ResultController {
	return &ResultController{resultService: resultService}
}

func (rc *ResultController) GetResults(c *gin.Context) {
	pollID := c.Param("id")
	resync := c.Query("resync") == "true"

	var results interface{}
	var err error

	if resync {
		results, err = rc.resultService.ResyncFromMongo(c.Request.Context(), pollID)
	} else {
		results, err = rc.resultService.GetResults(pollID)
	}

	if err != nil {
		utils.JSONError(c, http.StatusNotFound, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"results": results,
	})
}

