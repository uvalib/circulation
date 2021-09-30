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
	Section    string   `json:"section"`
	Label      string   `json:"label"`
	FilterType string   `json:"filterType"` // select, date, subject
	Facet      string   `json:"facet"`
	Values     []string `json:"values,omitempty"`
	Sort       bool     `json:"sort"`
}

func (svc *serviceContext) getFacets(c *gin.Context) {
	user := c.GetString("user")
	log.Printf("INFO: user %s get facets request", user)
	out := make([]facetInfo, 0)
	facetNames := []facetInfo{
		{Label: "Checkout Date", Facet: "checkout_date", FilterType: "date", Section: "Date", Sort: true},

		// org
		{Label: "School", Facet: "school_a", FilterType: "select", Section: "Organization", Sort: true},
		{Label: "Department", Facet: "department_a", FilterType: "select", Section: "Organization", Sort: true},

		// user
		{Label: "User Role", Facet: "user_role_a", FilterType: "select", Section: "User", Sort: true},
		{Label: "Borrower Profile", Facet: "borrower_profile_a", FilterType: "select", Section: "User", Sort: true},
		{Label: "Faculty Type", Facet: "job_title_a", FilterType: "select", Section: "User", Sort: true},
		{Label: "Degree Seeking", Facet: "is_degree_seeking_a", FilterType: "select", Section: "User", Sort: true},
		{Label: "Degree Level", Facet: "plan_degree_a", FilterType: "select", Section: "User", Sort: true},
		// student appointment not populated

		// location
		{Label: "Station Library", Facet: "checkout_library_a", FilterType: "select", Section: "Location", Sort: true},
		{Label: "Item Library", Facet: "item_library_a", FilterType: "select", Section: "Location", Sort: true},
		{Label: "Item Location", Facet: "home_loc_a", FilterType: "select", Section: "Location", Sort: true},
		{Label: "Reserve Desk", Facet: "reserve_a", FilterType: "select", Section: "Location", Sort: true},
		{Label: "User Library", Facet: "user_library_a", FilterType: "select", Section: "Location", Sort: true},

		// item
		{Label: "Primary Subject", Facet: "call_number_narrow_a", FilterType: "select", Section: "Item", Sort: true},
		{Label: "Subject Fields", Facet: "subject_t", FilterType: "subject", Section: "Item", Sort: true},
		{Label: "Item Class Scheme", Facet: "item_class_scheme_a", FilterType: "select", Section: "Item", Sort: true},
		{Label: "Item Type", Facet: "item_type_a", FilterType: "select", Section: "Item", Sort: true},
		{Label: "Format", Facet: "format_a", FilterType: "select", Section: "Item", Sort: true},
		{Label: "Publication Year", Facet: "pub_year_a", FilterType: "select", Section: "Item", Sort: true},
		{Label: "Language", Facet: "language_a", FilterType: "select", Section: "Item", Sort: true}}

	for _, fi := range facetNames {
		if fi.FilterType == "select" {
			log.Printf("INFO: user %s get facet values for %s", user, fi.Facet)
			qParams := make([]string, 0)
			qParams = append(qParams, fmt.Sprintf("facet.field=%s", fi.Facet))
			qParams = append(qParams, "facet=on")
			qParams = append(qParams, "fl=*")
			qParams = append(qParams, "q=*")
			qParams = append(qParams, "rows=0")
			qParams = append(qParams, "facet.sort=alpha")
			qParams = append(qParams, "facet.limit=10000")

			solrURL := fmt.Sprintf("%s/solr/%s/select?%s", svc.SolrURL, svc.SolrCore, strings.Join(qParams, "&"))
			resp, err := svc.getAPIResponse(solrURL, svc.HTTPClient)
			if err != nil {
				log.Printf("ERROR: user %s solr query failed: %s", user, err.Error())
				c.String(http.StatusInternalServerError, err.Error())
				return
			}

			var respJSON solrResponseFacets
			err = json.Unmarshal(resp, &respJSON)
			if err != nil {
				log.Printf("ERROR: user %s unable to parse solr response: %s", user, err.Error())
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
