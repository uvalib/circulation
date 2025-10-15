import { defineStore } from 'pinia'
import { createFetch } from '@vueuse/core'
import { useJwt } from '@vueuse/integrations/useJwt'

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
      timeMode: "any",
      subjectQuery: "",
      page: 0,
      pageSize: 50,
      hits: [],
      totalHits: -1,
      maxExport: 10000,
      sort: "checkout_date%20asc",
      useAuthFetch: null,
   }),
	getters: {
      allDay: state => {
         return state.timeMode == "any"
      },
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
         this.timeMode = "any"
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

      async getFacets() {
         if ( this.facets.length > 0) return

         this.working =  true
         const {error, data} = await this.useAuthFetch("/api/facets").get().json()
         if ( error.value ) {
            this.setFatalError(error.value)
         } else {
            this.setFacets( data.value )
         }
         this.working = false
      },

      setJWT(jwt) {
         if (jwt != this.jwt) {
            this.jwt = jwt
            localStorage.setItem("cq_jwt", jwt)

            const { payload } = useJwt(jwt)
            this.computeID = payload.value.computeID

            // create an authorised useFetch
            const store = this
            this.useAuthFetch = createFetch({
               options: {
                 beforeFetch({ options }) {
                   options.headers.Authorization = `Bearer ${jwt}`
                   return { options }
                 },
                 updateDataOnError: true,
                 onFetchError(ctx) {
                     console.log("ON FETCH ERROR")
                     console.log( ctx.response.status )
                     console.log( ctx )
                     if ( ctx.response.status == 401 ) {
                        localStorage.removeItem("cq_jwt")
                        store.jwt = ""
                        store.computeID = ""
                        store.router.push("/expired")
                        ctx.error = null
                     }
                     return ctx
                  },
               },
               // fetchOptions: {
               //   mode: 'cors',
               // },
            })
         }
      },

      async search(mode) {
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

         const {error, data} = await this.useAuthFetch(url).post(req)
         if ( error.value ) {
            this.setFatalError(error.value)
         } else {
            if ( mode == "export") {
               const fileURL = window.URL.createObjectURL(new Blob([data.value]));
               const fileLink = document.createElement('a');
               fileLink.href = fileURL;
               fileLink.setAttribute('download', "export.csv")
               document.body.appendChild(fileLink);
               fileLink.click();
               window.URL.revokeObjectURL(fileURL);
            } else {
               if (mode == "new") {
                  this.clearSearchHits()
               }
               if ( data.value ) {
                  this.addSearchHits( JSON.parse(data.value) )
                  this.router.push("/results")
               }
            }
         }
         this.working =  false
      }
   },
})
