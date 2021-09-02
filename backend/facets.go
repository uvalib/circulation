package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type facetInfo struct {
	Section string   `json:"section"`
	Label   string   `json:"label"`
	Type    string   `json:"type"` // select, date, text
	Facet   string   `json:"facet"`
	Values  []string `json:"values,omitempty"`
}

func (svc *serviceContext) getFacets(c *gin.Context) {
	log.Printf("INFO: get facets")
	out := make([]facetInfo, 0)
	facetNames := []facetInfo{
		{Label: "Date", Facet: "checkout_date", Type: "date", Section: "Date"},
		{Label: "School", Facet: "school_a", Type: "select", Section: "Organization"},
		{Label: "Department", Facet: "department_a", Type: "select", Section: "Organization"},
		{Label: "User Role", Facet: "user_role_a", Type: "select", Section: "User"},
		{Label: "Borrower Profile", Facet: "borrower_profile_a", Type: "select", Section: "User"},
		{Label: "Faculty Type", Facet: "job_title_a", Type: "select", Section: "User"},
		{Label: "Degree Seeking", Facet: "is_degree_seeking_a", Type: "select", Section: "User"},
		{Label: "Degree Level", Facet: "plan_degree_a", Type: "select", Section: "User"},
		{Label: "Station Library", Facet: "checkout_library_a", Type: "select", Section: "Location"},
		{Label: "Item Library", Facet: "item_library_a", Type: "select", Section: "Location"},
		{Label: "Item Location", Facet: "home_loc_a", Type: "select", Section: "Location"},
		{Label: "Reserve Desk", Facet: "reserve_a", Type: "select", Section: "Location"},
		{Label: "User Library", Facet: "user_library_a", Type: "select", Section: "Location"},
		{Label: "Primary Subject", Facet: "call_number_narrow_a", Type: "select", Section: "Item"},
		// {Label: "Subject", Facet: "subject_a", Type: "lookup", Section: "Item"},
		{Label: "Item Class Scheme", Facet: "item_class_scheme_a", Type: "select", Section: "Item"},
		{Label: "Item Type", Facet: "item_type_a", Type: "select", Section: "Item"},
		{Label: "Format", Facet: "format_a", Type: "select", Section: "Item"},
		{Label: "Publication Year", Facet: "pub_year_a", Type: "select", Section: "Item"},
		{Label: "Language", Facet: "language_a", Type: "select", Section: "Item"}}

	for _, fi := range facetNames {
		if fi.Type == "select" {
			log.Printf("INFO: get facet values for %s", fi.Facet)
			qParams := make([]string, 0)
			qParams = append(qParams, fmt.Sprintf("facet.field=%s", fi.Facet))
			qParams = append(qParams, "facet=on")
			qParams = append(qParams, "fl=*")
			qParams = append(qParams, "q=*")
			qParams = append(qParams, "rows=0")
			qParams = append(qParams, "facet.sort=alpha")
			qParams = append(qParams, "facet.limit=10000")

			solrURL := fmt.Sprintf("%s/solr/%s/select?%s", svc.SolrURL, svc.SolrCore, strings.Join(qParams, "&"))
			resp, err := svc.getAPIResponse(solrURL)
			if err != nil {
				log.Printf("ERROR: solr query failed: %s", err.Error())
				c.String(http.StatusInternalServerError, err.Error())
				return
			}

			var respJSON solrResponseFacets
			err = json.Unmarshal(resp, &respJSON)
			if err != nil {
				log.Printf("ERROR: unable to parse solr response: %s", err.Error())
				c.String(http.StatusInternalServerError, err.Error())
				return

			}
			values := respJSON.FacetCounts.FacetFields[fi.Facet]
			fi.Values = make([]string, 0)
			for _, val := range values {
				valType := fmt.Sprintf("%T", val)
				if valType == "string" {
					fi.Values = append(fi.Values, val.(string))
				}
			}
		}
		out = append(out, fi)
	}

	c.JSON(http.StatusOK, out)
}
