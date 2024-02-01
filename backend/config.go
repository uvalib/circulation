package main

import (
	"flag"
	"log"
)

type configData struct {
	port        int
	solrURL     string
	solrCore    string
	csvPageSize int
	csvMax      uint
	devAuthUser string
	jwtKey      string
}

func getConfiguration() *configData {
	var config configData
	flag.IntVar(&config.port, "port", 8080, "Port to offer service on (default 8080)")
	flag.StringVar(&config.solrURL, "solr", "http://circdata-solr-production.private.production:8080", "Solr URL")
	flag.StringVar(&config.solrCore, "solrcore", "user_data_core", "Solr Core")
	flag.IntVar(&config.csvPageSize, "csvpage", 1000, "page size for CSV requests (default 1000)")
	flag.UintVar(&config.csvMax, "csvmax", 100000, "max size for CSV export (default 100000)")
	flag.StringVar(&config.devAuthUser, "devuser", "", "Authorized computing id for dev")
	flag.StringVar(&config.jwtKey, "jwtkey", "", "JWT signature key")
	flag.Parse()

	if config.jwtKey == "" {
		log.Fatal("Parameter jwtkey is required")
	}

	log.Printf("[CONFIG] port          = [%d]", config.port)
	log.Printf("[CONFIG] solrURL       = [%s]", config.solrURL)
	log.Printf("[CONFIG] solrCore      = [%s]", config.solrCore)
	log.Printf("[CONFIG] csvpage       = [%d]", config.csvPageSize)
	log.Printf("[CONFIG] csvmax        = [%d]", config.csvMax)
	if config.devAuthUser != "" {
		log.Printf("[CONFIG] devuser       = [%s]", config.devAuthUser)
	}
	return &config
}
