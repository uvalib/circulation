package main

import (
	"flag"
	"log"
)

type configData struct {
	port     int
	solrURL  string
	solrCore string
}

func getConfiguration() *configData {
	var config configData
	flag.IntVar(&config.port, "port", 8080, "Port to offer service on (default 8080)")
	flag.StringVar(&config.solrURL, "solr", "http://circdata-solr-production.private.production:8080", "Solr URL")
	flag.StringVar(&config.solrCore, "solrcore", "user_data_core", "Solr Core")
	flag.Parse()

	log.Printf("[CONFIG] port          = [%d]", config.port)
	log.Printf("[CONFIG] solrURL       = [%s]", config.solrURL)
	log.Printf("[CONFIG] solrCore      = [%s]", config.solrCore)
	return &config
}
