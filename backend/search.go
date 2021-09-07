package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

type paginationData struct {
	Start int `json:"start"`
	Rows  int `json:"rows"`
}

type dateParam struct {
	Op    string `json:"op"`
	Query string `json:"q"`
}

type searchRequest struct {
	Pagination paginationData `json:"pagination"`
	DateQuery  []dateParam    `json:"date"`
}

type hitValue struct {
	Label string   `json:"label"`
	Value []string `json:"value"`
}

type searchHit struct {
	Fields []hitValue `json:"fields"`
}

func (svc *serviceContext) searchHandler(c *gin.Context) {
	log.Printf("INFO: call to search solr received")
	var req searchRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		log.Printf("ERROR: unable to parse search payload: %s", err.Error())
		c.String(http.StatusBadRequest, "invalid search request: %s", err.Error())
		return
	}
	qParams := make([]string, 0)
	qParams = append(qParams, fmt.Sprintf("start=%d", req.Pagination.Start))
	qParams = append(qParams, fmt.Sprintf("rows=%d", req.Pagination.Rows))
	qParams = append(qParams, "fl=*")

	if len(req.DateQuery) > 0 {
		dq := getDateQueryString(req.DateQuery)
		qParams = append(qParams, fmt.Sprintf("fq=checkout_daterange:%s", url.QueryEscape(dq)))
	}

	solrURL := fmt.Sprintf("%s/solr/%s/select?%s", svc.SolrURL, svc.SolrCore, strings.Join(qParams, "&"))
	resp, err := svc.getAPIResponse(solrURL)
	if err != nil {
		log.Printf("ERROR: solr search query failed: %s", err.Error())
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	var respJSON solrResponse
	err = json.Unmarshal(resp, &respJSON)
	if err != nil {
		log.Printf("ERROR: unable to parse solr response: %s", err.Error())
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	log.Printf("INFO: %d hits in solr response", respJSON.Response.NumFound)
	var out struct {
		Total int          `json:"total"`
		Hits  *[]searchHit `json:"hits"`
	}
	out.Total = respJSON.Response.NumFound
	out.Hits = svc.extractHitData(respJSON.Response.Docs)

	c.JSON(http.StatusOK, out)
}

func (svc *serviceContext) extractHitData(solrHits []solrDocument) *[]searchHit {
	out := make([]searchHit, 0)
	for _, doc := range solrHits {
		log.Printf("HIT DATA----------------------")
		hit := searchHit{Fields: make([]hitValue, 0)}
		for _, sm := range svc.SolrMappings {
			hv := hitValue{Label: sm.Label}
			solrVal := doc[sm.SolrField]
			log.Printf("field:%s label:%s= type:%T, val:%v", sm.SolrField, sm.Label, solrVal, solrVal)
			strVal, ok := solrVal.(string)
			if ok {
				hv.Value = append(hv.Value, strVal)
				hit.Fields = append(hit.Fields, hv)
			} else {
				arrayVal, ok := solrVal.([]interface{})
				if ok {
					for _, sv := range arrayVal {
						strVal, ok := sv.(string)
						if ok {
							hv.Value = append(hv.Value, strVal)
						}
					}
					hit.Fields = append(hit.Fields, hv)
				} else {
					log.Printf("INFO: %s:%v is not a string or array of strings", sm.SolrField, solrVal)
				}
			}
		}
		out = append(out, hit)
	}
	return &out
}

func getDateQueryString(dateQ []dateParam) string {
	out := ""
	log.Printf("INFO: generate query string for date request: %+v", dateQ)
	for idx, term := range dateQ {
		if idx > 0 {
			out += fmt.Sprintf(" %s ", term.Op)
		}
		if strings.Contains(term.Query, "BEFORE") {
			d := strings.Split(term.Query, " ")[1]
			out += fmt.Sprintf("[* TO %s]", d)
		} else if strings.Contains(term.Query, "AFTER") {
			d := strings.Split(term.Query, " ")[1]
			out += fmt.Sprintf("[%s TO *]", d)
		} else {
			if strings.Contains(term.Query, "TO") {
				out += fmt.Sprintf("[%s]", term.Query)
			} else {
				out += term.Query
			}
		}
	}
	out = fmt.Sprintf("(%s)", out)
	log.Printf("INFO: date query: %s", out)
	return out
}
