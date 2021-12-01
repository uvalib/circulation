package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type solrResponseHeader struct {
	Status int `json:"status,omitempty"`
}

type solrDocument map[string]interface{}

type solrResponseDocuments struct {
	NumFound int            `json:"numFound,omitempty"`
	Start    int            `json:"start,omitempty"`
	Docs     []solrDocument `json:"docs,omitempty"`
}

type solrFacetCount struct {
	FacetFields map[string][]interface{} `json:"facet_fields"`
}
type solrResponseFacets struct {
	Header      solrResponseHeader `json:"responseHeader,omitempty"`
	FacetCounts solrFacetCount     `json:"facet_counts"`
}

type solrResponse struct {
	Header         solrResponseHeader    `json:"responseHeader,omitempty"`
	Response       solrResponseDocuments `json:"response,omitempty"`
	NextCursorMark string                `json:"nextCursorMark,omitempty"`
}

type solrMapping struct {
	SolrField string `json:"field"`
	Label     string `json:"label"`
	Section   string `json:"section"`
}

// ServiceContext contains common data used by all handlers
type serviceContext struct {
	Version          string
	SolrURL          string
	SolrCore         string
	CSVPageSize      int
	CSVMaxRows       uint
	HTTPClient       *http.Client
	ExportHTTPClient *http.Client
	SolrMappings     []solrMapping
}

// InitializeService sets up the service context for all API handlers
func initializeService(version string, cfg *configData) *serviceContext {
	ctx := serviceContext{Version: version, SolrURL: cfg.solrURL, SolrCore: cfg.solrCore,
		CSVPageSize: cfg.csvPageSize, CSVMaxRows: cfg.csvMax}

	log.Printf("INFO: create HTTP clients...")
	defaultTransport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   5 * time.Second,
			KeepAlive: 600 * time.Second,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		MaxIdleConnsPerHost:   100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}
	ctx.HTTPClient = &http.Client{
		Transport: defaultTransport,
		Timeout:   25 * time.Second,
	}
	ctx.ExportHTTPClient = &http.Client{
		Transport: defaultTransport,
		Timeout:   60 * time.Second,
	}
	log.Printf("INFO: HTTP Clients created")

	log.Printf("INFO: loading solr mapping")
	mapFile, err := os.Open("data/mappings.json")
	if err != nil {
		log.Fatal(err)
	}

	jsonParser := json.NewDecoder(mapFile)
	if err = jsonParser.Decode(&ctx.SolrMappings); err != nil {
		log.Fatal(err)
	}
	log.Printf("INFO: solr mappings loaded")

	return &ctx
}

func (svc *serviceContext) healthCheck(c *gin.Context) {
	type hcResp struct {
		Healthy bool   `json:"healthy"`
		Message string `json:"message,omitempty"`
	}
	hcMap := make(map[string]hcResp)
	hcMap["circulation"] = hcResp{Healthy: true}

	c.JSON(http.StatusOK, hcMap)
}

func (svc *serviceContext) getVersion(c *gin.Context) {
	build := "unknown"

	// cos our CWD is the bin directory
	files, _ := filepath.Glob("../buildtag.*")
	if len(files) == 1 {
		build = strings.Replace(files[0], "../buildtag.", "", 1)
	}

	vMap := make(map[string]string)
	vMap["version"] = Version
	vMap["build"] = build
	c.JSON(http.StatusOK, vMap)
}

func (svc *serviceContext) getAPIResponse(url string, httpClient *http.Client) ([]byte, error) {
	log.Printf("INFO: GET API Response from %s, timeout  %.0f sec", url, svc.HTTPClient.Timeout.Seconds())
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36")

	startTime := time.Now()
	resp, rawErr := httpClient.Do(req)
	elapsedNanoSec := time.Since(startTime)
	elapsedMS := int64(elapsedNanoSec / time.Millisecond)
	log.Printf("INFO: raw %s response elapsed time: %d (ms)", url, elapsedMS)
	bodyBytes, err := handleAPIResponse(url, resp, rawErr)
	elapsedNanoSec = time.Since(startTime)
	elapsedMS = int64(elapsedNanoSec / time.Millisecond)

	if err != nil {
		log.Printf("ERROR: %s : %s. Total Elapsed Time: %d (ms)", url, err.Error(), elapsedMS)
		return nil, err
	}

	log.Printf("INFO: successful response from %s. Total Elapsed Time: %d (ms)", url, elapsedMS)
	return bodyBytes, nil
}

func handleAPIResponse(url string, resp *http.Response, rawErr error) ([]byte, error) {
	if rawErr != nil {
		status := http.StatusBadRequest
		errMsg := rawErr.Error()
		if strings.Contains(rawErr.Error(), "Timeout") {
			status = http.StatusRequestTimeout
			errMsg = fmt.Sprintf("%s timed out", url)
		} else if strings.Contains(rawErr.Error(), "connection refused") {
			status = http.StatusServiceUnavailable
			errMsg = fmt.Sprintf("%s refused connection", url)
		}
		err := fmt.Errorf("%d: %s", status, errMsg)
		return nil, err
	} else if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		defer resp.Body.Close()
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		status := resp.StatusCode
		errMsg := string(bodyBytes)
		err := fmt.Errorf("%d: %s", status, errMsg)
		return nil, err
	}

	defer resp.Body.Close()
	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	return bodyBytes, nil
}
