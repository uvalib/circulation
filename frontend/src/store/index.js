import { createStore } from 'vuex'
import { getField, updateField } from 'vuex-map-fields'
import axios from 'axios'

export default createStore({
   state: {
      working: false,
      fatalError: "",
      searchFacets: [],
      showPicker: false,
      targetSection: "",
      targetFacet: ""
   },
   getters: {
      getField,
      sectionFacets:  state => (section) => {
         let sect = state.searchFacets.find( sf => sf.section == section)
         if (!sect) return []
         return sect.facets
      },
      facetValues:  state => (section, facet) => {
         let sect = state.searchFacets.find( sf => sf.section == section)
         if (!sect) return []
         let vals = sect.facets.find( f => f.facet == facet)
         if (!vals) return []
         if ( !vals.values ) return []
         return vals.values
      },
      facetSelections:  state => (section, facet) => {
         let sect = state.searchFacets.find( sf => sf.section == section)
         if (!sect) return []
         let vals = sect.facets.find( f => f.facet == facet)
         if (!vals) return []
         if ( !vals.selected ) return []
         return vals.selected
      },
      facetLabel:  state => (section, facet) => {
         let sect = state.searchFacets.find( sf => sf.section == section)
         let f = sect.facets.find( f => f.facet == facet)
         return f.label
      }
   },
   mutations: {
      updateField,
      closeFacetPicker(state) {
         state.targetFacet = ""
         state.targetSection = ""
         state.showPicker = false
      },
      showFacetPicker(state, {section, facet}) {
         state.targetFacet = facet
         state.targetSection = section
         state.showPicker = true
      },
      addFacetSelection(state, {section, facet, value}) {
         let sect = state.searchFacets.find( sf => sf.section == section)
         let f = sect.facets.find( f => f.facet == facet)
         f.selected.push(value)
         let anyIdx = f.selected.findIndex(s => s=="Any")
         if (anyIdx > -1) {
            f.selected.splice(anyIdx, 1)
         }
      },
      setWorking(state, flag) {
         state.working = flag
      },
      setFatalError(state, err) {
         state.fatalError = err
      },
      setSearchFacets(state, data) {
         state.searchFacets.splice(0, state.searchFacets.length)
         let currSection = {section: "", facets: []}
         data.forEach( f => {
            if (f.section != currSection.section) {
               if (currSection.section != "") {
                  state.searchFacets.push(currSection)
               }
               currSection = {section: f.section, facets: []}
            }
            f.selected = ["Any"]
            currSection.facets.push(f)
         })
         state.searchFacets.push(currSection)
      }
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
      }
   },
})
