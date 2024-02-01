import { defineStore } from 'pinia'
import axios from 'axios'

function parseJwt(token) {
   var base64Url = token.split('.')[1]
   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
   var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
   }).join(''))

   return JSON.parse(jsonPayload);
}

export const useSearchStore = defineStore('search', {
	state: () => ({
      jwt: "",
      computeID: "",
      working: false,
      fatalError: "",
      showMessage: false,
      message: "",
      facets: [],
      filter: [],
      dateCriteria: [],
      timeStart: "",
      timeEnd: "",
      allDay: true,
      subjectQuery: "",
      page: 0,
      pageSize: 50,
      hits: [],
      totalHits: -1,
      maxExport: 10000,
      sort: "checkout_date%20asc"
   }),
	getters: {
      sectionFacets:  state => {
         return (section) => {
            let sect = state.facets.find( sf => sf.section == section)
            if (!sect) return []
            return sect.facets
         }
      },
      facetValues:  state => {
         return (section, facet) => {
            let sect = state.facets.find( sf => sf.section == section)
            if (!sect) return []
            let vals = sect.facets.find( f => f.facet == facet)
            if (!vals) return []
            if ( !vals.values ) return []
            return vals.values
         }
      },
      facetSelections:  state => {
         return (tgtFacet) => {
            let filter = state.filter.find( f => f.facet == tgtFacet)
            if ( filter ) {
               return filter.values
            }
            return []
         }
      },
      facetLabel:  state => {
         return (section, facet) => {
            let sect = state.facets.find( sf => sf.section == section)
            if ( !sect ) return ""
            let f = sect.facets.find( f => f.facet == facet)
            if ( !f ) return ""
            return f.label
         }
      },
      findFacetValue: state => {
         return (section, facet, queryStr) => {
            let sect = state.facets.find( sf => sf.section == section)
            let facetData = sect.facets.find( f => f.facet == facet)
            let lcq = queryStr.toLowerCase()
            let v = facetData.values.find( v => v.toLowerCase().indexOf(lcq) == 0)
            return v
         }
      },
      isFacetValueSelected: state => {
         return (tgtFacet, val) => {
            let tgtFilter = state.filter.find( f => f.facet == tgtFacet)
            if ( tgtFilter ) {
               return tgtFilter.values.findIndex( v => v == val) > -1
            }
            return false
         }
      },
      dateParam: state => {
         let out = []
         state.dateCriteria.forEach( dc => {
            if (dc.comparison == "BETWEEN") {
               out.push({op: dc.op, q: `${dc.value} TO ${dc.endVal}`})
            } else if (dc.comparison == "EQUAL") {
               out.push({op: dc.op, q: dc.value})
            } else {
               out.push({op: dc.op, q: `${dc.comparison} ${dc.value}`})
            }
         })
         return out
      },

      timeParam: state => {
         let out = ""
         if ( state.allDay == false) {
            out = `${state.timeStart} TO ${state.timeEnd}`
         }
         return out
      },

      sortOptions: state => {
         let out = []
         state.facets.forEach( sect => {
            sect.facets.forEach( f=> {
               if (f.sort == true) {
                  out.push({value: `${f.facet}%20asc`, label: `${f.label} ASC`})
                  out.push({value: `${f.facet}%20desc`, label: `${f.label} DESC`})
               }
            })
         })
         out.sort( (a, b) => {
            if (a.label < b.label) {
               return -1;
             }
             if (a.label > b.label) {
               return 1;
             }
             return 0;
         })
         return out
      }
   },
	actions: {
      addDate() {
         this.dateCriteria.push( ({ op: "AND", value: "", comparison: "EQUAL", endVal: "" }))
      },
      addSearchHits(hitData) {
         this.totalHits = hitData.total
         this.maxExport = hitData.maxExport
         hitData.hits.forEach( h => this.hits.push(h) )
      },
      clearAll() {
         this.filter = []
         this.timeStart = ""
         this.timeEnd = ""
         this.allDay = true
         this.subjectQuery = ""
         this.dateCriteria.splice(0, this.dateCriteria.length)
         this.sort = "checkout_date%20asc"
      },
      clearMessage() {
         this.showMessage = false
         this.message = ""
      },
      setMessage( m ) {
         this.message = m
         this.showMessage = true
      },
      clearSearchHits() {
         this.totalHits = -1
         this.hits.splice(0, this.hits.length)
      },
      removeDate(idx) {
         this.dateCriteria.splice(idx, 1)
      },
      setFatalError(err) {
         this.fatalError = err
      },
      setFacets(data) {
         this.facets.splice(0, this.facets.length)
         let currSection = {section: "", facets: []}
         data.forEach( f => {
            if (f.section != currSection.section) {
               if (currSection.section != "") {
                  this.facets.push(currSection)
               }
               currSection = {section: f.section, facets: []}
            }
            currSection.facets.push(f)
         })
         this.facets.push(currSection)
      },

      clearAllFacetSelections(tgtFacet) {
         let filterIdx = this.filter.findIndex( f => f.facet == tgtFacet)
         if (filterIdx > -1) {
            this.filter.splice(filterIdx, 1)
         }
      },

      setFacetFilterValues(tgtFacet, selections) {
         if ( selections.length == 0) {
            this.clearAllFacetSelections(tgtFacet)
         } else {
            let tgtFilter = this.filter.find( f => f.facet == tgtFacet)
            if ( tgtFilter ) {
               tgtFilter.values = selections
            } else {
               this.filter.push( {facet: tgtFacet, values: selections} )
            }
         }
      },

      getFacets() {
         if ( this.facets.length > 0) return

         this.working =  true
         axios.get( `/api/facets` ).then( response => {
            this.setFacets(response.data)
            this.working =  false
         }).catch ( error => {
            this.setFatalError(error)
            this.working =  false
         })
      },

      setJWT(jwt) {
         if (jwt != this.jwt) {
            this.jwt = jwt
            localStorage.setItem("cq_jwt", jwt)

            let parsed = parseJwt(jwt)
            this.computeID = parsed.computeID

            // add interceptor to put bearer token in header
            axios.interceptors.request.use(config => {
               config.headers['Authorization'] = 'Bearer ' + jwt
               return config
            }, error => {
               return Promise.reject(error)
            })

            // Catch 401 errors and redirect to an expired auth page
            axios.interceptors.response.use(
               res => res,
               err => {
                  console.log("failed response for "+err.config.url)
                  console.log(err)
                  if (err.config.url.match(/\/authenticate/)) {
                     this.router.push("/forbidden")
                  } else {
                     if (err.response && err.response.status == 401) {
                        localStorage.removeItem("cq_jwt")
                        this.jwt = ""
                        this.computeID = ""
                        this.router.push("/expired")
                        return new Promise(() => { })
                     }
                  }
                  return Promise.reject(err)
               }
            )
         }
      },

      search(mode) {
         this.working =  true
         let req = {
            date: this.dateParam,
            time: this.timeParam,
            filter: this.filter,
            subject: this.subjectQuery,
            sort: this.sort,
            pagination: {start: 0, rows: this.pageSize}
         }
         let  url = "/api/search"
         if (mode == "export") {
            url += "?export=csv"
            req.pagination =  {start: 0, rows: this.totalHits}
         } else if (mode == "more" ){
            this.page++
            req.pagination =  {start: this.page*this.pageSize, rows: this.pageSize}
         }
         axios.post( url, req ).then( response => {
            if ( mode == "export") {
               const fileURL = window.URL.createObjectURL(new Blob([response.data]));
               const fileLink = document.createElement('a');
               fileLink.href = fileURL;
               fileLink.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
               document.body.appendChild(fileLink);
               fileLink.click();
               window.URL.revokeObjectURL(fileURL);
            } else {
               if (mode == "new") {
                  this.clearSearchHits()
               }
               this.addSearchHits(response.data)
               this.router.push("/results")
            }
            this.working =  false
         }).catch( error => {
            this.setMessage(error)
            this.working =  false
         })
      }
   },
})
