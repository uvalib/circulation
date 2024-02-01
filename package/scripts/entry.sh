#!/usr/bin/env bash
#
# run application
#

# run the server
cd bin; ./circulation -solr $CIRCDATA_SOLR_URL -solrcore $CIRCDATA_SOLR_CORE -csvpage $CIRCDATA_CSV_PAGE -csvmax $CIRCDATA_CSV_MAX -jwtkey $CIRCDATA_JWT_KEY

# return the status
exit $?

#
# end of file
#
