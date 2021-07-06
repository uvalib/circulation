package main

import (
	"flag"
	"log"
)

type configData struct {
	port     int
	solrURL  string
	solrCore string
	solrPort int
}

func getConfiguration() *configData {
	var config configData
	flag.IntVar(&config.port, "port", 8080, "Port to offer service on (default 8085)")
	flag.StringVar(&config.solrURL, "solr", "http://circdata-solr-production.private.production:8080", "Solr URL")
	flag.StringVar(&config.solrCore, "solrcore", "user_data_core", "Solr Core")
	flag.IntVar(&config.solrPort, "solrport", 8080, "Port for solr (default 8085)")
	flag.Parse()

	log.Printf("[CONFIG] port          = [%d]", config.port)
	log.Printf("[CONFIG] solrURL       = [%s]", config.solrURL)
	log.Printf("[CONFIG] solrCore      = [%s]", config.solrCore)
	log.Printf("[CONFIG] solrPort      = [%d]", config.solrPort)
	return &config
}
