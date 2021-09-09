import { createStore } from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import axios from 'axios'

export default createStore({
   state: {
      working: false,
      loadingMore: false,
      fatalError: "",
      message: "",
      facets: [],
      showPicker: false,
      targetSection: "",
      targetFacetID: "",
      targetFacet: null,
      dateCriteria: [],
      timeStart: "",
      timeEnd: "",
      allDay: true,
      subjectQuery: "",
      page: 0,
      pageSize: 50,
      hits: [],
      totalHits: -1,
      sort: "checkout_date%20asc"
   },
   getters: {
      getField,
      sectionFacets:  state => (section) => {
         let sect = state.facets.find( sf => sf.section == section)
         if (!sect) return []
         return sect.facets
      },
      facetValues:  state => (section, facet) => {
         let sect = state.facets.find( sf => sf.section == section)
         if (!sect) return []
         let vals = sect.facets.find( f => f.facet == facet)
         if (!vals) return []
         if ( !vals.values ) return []
         return vals.values
      },
      facetSelections:  state => (section, facet) => {
         let sect = state.facets.find( sf => sf.section == section)
         if (!sect) return []
         let vals = sect.facets.find( f => f.facet == facet)
         if (!vals) return []
         if ( !vals.selected ) return []
         return vals.selected
      },
      facetLabel:  state => (section, facet) => {
         let sect = state.facets.find( sf => sf.section == section)
         let f = sect.facets.find( f => f.facet == facet)
         return f.label
      },

      isFacetValueSelected: state => (val) => {
         if (state.targetFacet) {
            return (state.targetFacet.selected.findIndex( s => s == val) > -1)
         }
         return false
      },
      dateParam(state) {
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
      timeParam(state) {
         let out = ""
         if ( state.allDay == false) {
            out = `${state.timeStart} TO ${state.timeEnd}`
         }
         return out
      },
      selectedFacets(state) {
         let out = []
         state.facets.forEach( sect => {
            sect.facets.forEach( f => {
               if (f.selected) {
                  if (f.selected.length > 1 || f.selected.length == 1 && f.selected[0] != "Any") {
                     out.push( {facet: f.facet, values: f.selected})
                  }
               }
            })
         })
         return out
      }
   },
   mutations: {
      updateField,
      setLoadingMore(state, flag) {
         state.loadingMore = flag
      },
      addSearchHits(state, hitData) {
         state.totalHits = hitData.total
         hitData.hits.forEach( h => state.hits.push(h) )
      },
      clearSearchHits(state) {
         state.totalHits = -1
         state.hits.splice(0, state.hits.length)
      },
      addDate(state) {
         state.dateCriteria.push( ({ op: "AND", value: "", comparison: "EQUAL", endVal: "" }))
      },
      removeDate(state, idx) {
         state.dateCriteria.splice(idx, 1)
      },
      clearAll(state) {
         state.facets.forEach( sf => {
            sf.facets.forEach( f => {
               if (f.selected) {
                  f.selected.splice(0, f.selected.length)
                  f.selected.push("Any")
               }
            })
         })
         state.timeStart = ""
         state.timeEnd = ""
         state.allDay = true
         state.subjectQuery = ""
         state.dateCriteria.splice(0, state.dateCriteria.length)
      },
      toggleFacetValue(state, val) {
         if (!state.targetFacet) return

         let newIdx = state.targetFacet.selected.findIndex(s => s== val )
         if (newIdx == -1 ) {
            let anyIdx = state.targetFacet.selected.findIndex(s => s=="Any")
            if (anyIdx > -1) {
               state.targetFacet.selected.splice(anyIdx, 1)
            }
            state.targetFacet.selected.push(val)
         } else {
            state.targetFacet.selected.splice(newIdx, 1)
            if (state.targetFacet.selected.length == 0) {
               state.targetFacet.selected.push("Any")
            }
         }
      },
      clearAllFacetSelections(state) {
         if (!state.targetFacet) return

         state.targetFacet.selected.splice(0, state.targetFacet.selected.length)
         state.targetFacet.selected.push("Any")
      },
      closeFacetPicker(state) {
         state.targetFacetID = ""
         state.targetSection = ""
         state.targetFacet = null
         state.showPicker = false
         const body = document.body
         body.style.height = ''
         body.style.overflowY = ''
      },
      showFacetPicker(state, {section, facet}) {
         state.targetFacetID = facet
         state.targetSection = section
         let sect = state.facets.find( sf => sf.section == state.targetSection)
         state.targetFacet = sect.facets.find( f => f.facet == state.targetFacetID)
         state.showPicker = true
         const body = document.body
         body.style.height = '100vh'
         body.style.overflowY = 'hidden'
      },
      setWorking(state, flag) {
         state.working = flag
      },
      setFatalError(state, err) {
         state.fatalError = err
      },
      setSearchFacets(state, data) {
         state.facets.splice(0, state.facets.length)
         let currSection = {section: "", facets: []}
         data.forEach( f => {
            if (f.section != currSection.section) {
               if (currSection.section != "") {
                  state.facets.push(currSection)
               }
               currSection = {section: f.section, facets: []}
            }
            if (f.filterType == "select") {
               f.selected = ["Any"]
            }
            currSection.facets.push(f)
         })
         state.facets.push(currSection)
      },
      clearMessage(state) {
         state.message = ""
      },
      setMessage(state, m) {
         state.message = m
      },
   },
   actions: {
      getSearchFacets(ctx) {
         axios.get( `/api/facets` ).then( response => {
            ctx.commit("setSearchFacets", response.data)
            ctx.commit("setWorking", false)
         }).catch ( error => {
            ctx.commit("setFatalError", error)
            ctx.commit("setWorking", false)
         })
      },
      loadMore(ctx) {
         let req = {
            pagination: {start: ctx.state.page*ctx.state.pageSize, rows: ctx.state.pageSize},
            date: ctx.getters.dateParam,
            time: ctx.getters.timeParam,
            filter: ctx.getters.selectedFacets,
            sort: ctx.state.sort
         }
         ctx.commit("setLoadingMore", true)
         axios.post( `/api/search`, req ).then( response => {
            ctx.commit("addSearchHits", response.data)
            ctx.commit("setLoadingMore", false)
         }).catch( error => {
            ctx.commit("setMessage", error)
            ctx.commit("setLoadingMore", false)
         })
      },
      search(ctx) {
         ctx.commit("setWorking", true)
         let req = {
            pagination: {start: ctx.state.page*ctx.state.pageSize, rows: ctx.state.pageSize},
            date: ctx.getters.dateParam,
            time: ctx.getters.timeParam,
            filter: ctx.getters.selectedFacets,
            subject: ctx.state.subjectQuery,
            sort: ctx.state.sort
         }
         axios.post( `/api/search`, req ).then( response => {
            ctx.commit("clearSearchHits")
            ctx.commit("addSearchHits", response.data)
            ctx.commit("setWorking", false)
            this.router.push("/results")
         }).catch( error => {
            ctx.commit("setMessage", error)
            ctx.commit("setWorking", false)
         })
      }
   },
})
