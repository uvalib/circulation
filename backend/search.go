package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (svc *serviceContext) searchHandler(c *gin.Context) {
	log.Printf("INFO: call to search solr received")
	c.String(http.StatusNotImplemented, "search is not yet implemented")
}
