#!/usr/bin/env bash
#
# run application
#

# run the server
cd bin; ./circulation -solr $CIRCDATA_SOLR_URL -solrcore $CIRCDATA_SOLR_CORE

# return the status
exit $?

#
# end of file
#
