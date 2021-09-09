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

type filterParam struct {
	Facet  string   `json:"facet"`
	Values []string `json:"values"`
}

type searchRequest struct {
	Pagination   paginationData `json:"pagination"`
	DateQuery    []dateParam    `json:"date"`
	TimeQuery    string         `json:"time"`
	Filters      []filterParam  `json:"filter"`
	SubjectQuery string         `json:"subject"`
}

type hitValue struct {
	Label string   `json:"label"`
	Value []string `json:"value"`
}

type sectionData struct {
	Label  string     `json:"label"`
	Fields []hitValue `json:"fields"`
}

type searchHit struct {
	Sections []sectionData `json:"sections"`
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
	qParams = append(qParams, "sort=checkout_date%20asc")

	if len(req.DateQuery) > 0 {
		dq := getDateQueryString(req.DateQuery)
		qParams = append(qParams, fmt.Sprintf("fq=checkout_daterange:%s", url.QueryEscape(dq)))
	}
	if len(req.TimeQuery) > 0 {
		tq := fmt.Sprintf("[%s]", req.TimeQuery)
		qParams = append(qParams, fmt.Sprintf("fq=checkout_time_str:%s", url.QueryEscape(tq)))
	}
	if len(req.Filters) > 0 {
		for _, f := range req.Filters {
			q := make([]string, 0)
			for _, v := range f.Values {
				q = append(q, fmt.Sprintf("\"%s\"", v))
			}
			qs := strings.Join(q, " OR ")
			qs = fmt.Sprintf("(%s)", qs)
			qParams = append(qParams, fmt.Sprintf("fq=%s:%s", f.Facet, url.QueryEscape(qs)))
		}
	}
	if req.SubjectQuery != "" {
		qParams = append(qParams, "qt=search")
		qParams = append(qParams, "defType=lucene")
		qParams = append(qParams, fmt.Sprintf("q=subject_t:(%s)", url.QueryEscape(req.SubjectQuery)))
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

	log.Printf("INFO: %d total hits for solr query", respJSON.Response.NumFound)
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
		hit := searchHit{Sections: make([]sectionData, 0)}
		currSection := sectionData{Label: ""}

		// Walk through each solr mapping and assign the data to a section and list of fields
		for _, sm := range svc.SolrMappings {
			hv := hitValue{Label: sm.Label}

			// get the raw solr field as an interface, and be sure it is present
			solrVal, hasKey := doc[sm.SolrField]
			if hasKey == false {
				// field not present in response; skip
				continue
			}

			// values are strings or array of interface{}. find out which...
			strVal, ok := solrVal.(string)
			if ok {
				// string. just add it to the value (all values are arrays)
				hv.Value = append(hv.Value, strVal)
			} else {
				// must be an array of interface{}, which is really just an array of string.
				// type cast and add each value to the values array
				arrayVal, ok := solrVal.([]interface{})
				if ok {
					for _, sv := range arrayVal {
						strVal, ok := sv.(string)
						if ok {
							hv.Value = append(hv.Value, strVal)
						}
					}
				} else {
					// unsupported value type... skip it
					log.Printf("WARNING: %s:%v is not a string or array of strings", sm.SolrField, solrVal)
					continue
				}
			}

			// at this point hv contains a single field label and values. see if it goes in this section or a new one
			// (sections in the mapping are in order and contiguous)
			if currSection.Label != sm.Section {
				if currSection.Label != "" {
					// prior section is now complete. add it to the hit
					hit.Sections = append(hit.Sections, currSection)
				}

				// reset current section to the newly found one
				currSection = sectionData{Label: sm.Section, Fields: make([]hitValue, 0)}
			}

			// add the fields to the current section
			currSection.Fields = append(currSection.Fields, hv)
		}
		// add the last section to the hit, then add the hit to the output
		hit.Sections = append(hit.Sections, currSection)
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
