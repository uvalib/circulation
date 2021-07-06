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
	Label  string   `json:"label"`
	Facet  string   `json:"facet"`
	Values []string `json:"values"`
}

func (svc *serviceContext) getFacets(c *gin.Context) {
	log.Printf("INFO: get facets")
	out := make([]facetInfo, 0)
	facetNames := []facetInfo{{Label: "User Role", Facet: "user_role_a"}, {Label: "Checkout Library", Facet: "checkout_library_a"},
		{Label: "Item Library", Facet: "item_library_a"}, {Label: "Item Location", Facet: "home_loc_a"},
		{Label: "Primary Subject", Facet: "call_number_narrow_a"}, {Label: "Subject", Facet: "subject_str"},
		{Label: "Item Class Scheme", Facet: "item_class_scheme_a"}, {Label: "Item Type", Facet: "item_type_a"},
		{Label: "Format", Facet: "format_a"}, {Label: "Language", Facet: "language_a"}}

	for _, fi := range facetNames {
		log.Printf("INFO: get facet values for %s", fi.Facet)
		qParams := make([]string, 0)
		qParams = append(qParams, fmt.Sprintf("facet.field=%s", fi.Facet))
		qParams = append(qParams, "facet=on")
		qParams = append(qParams, "fl=*")
		qParams = append(qParams, "q=*")
		qParams = append(qParams, "rows=0")
		qParams = append(qParams, "facet.sort=alpha")

		solrURL := fmt.Sprintf("http://%s:%d/solr/%s/select?%s", svc.SolrURL, svc.SolrPort, svc.SolrCore, strings.Join(qParams, "&"))
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
		out = append(out, fi)
	}

	c.JSON(http.StatusOK, out)
}
