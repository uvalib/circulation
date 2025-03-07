<template>
   <div class="home">
      <h1>
         <span>Search User Circulation Data</span>
         <div class="help">
            <Button as="a" link label="Search Help" icon="pi pi-question-circle" href="https://confluence.its.virginia.edu/display/UDR/Circulation+Data+Search+Application+Information" target="_blank"/>
         </div>
      </h1>
      <div class="work" v-if="searchStore.working" >
         <WaitSpinner :message="waitMessage" />
      </div>
      <div v-else class="search-form">
         <div v-for="(sf,idx) in searchStore.facets.filter(f => f.section != 'None')" :key="`sectiion-${idx+1}`">
            <DateSection v-if="sf.section == 'Date'" />
            <FacetSection v-else :name="sf.section" @pick="pickerClicked" />
         </div>
         <p class="error">{{queryError}}</p>
         <div class="toolbar">
            <span class="sort-control">
               <label for="sort">Sort by:</label>
               <select class="sort" id="sort" v-model="searchStore.sort">
                  <option v-for="opt in searchStore.sortOptions" :value="opt.value" :key="opt.value">
                     {{opt.label}}
                  </option>
               </select>
            </span>
            <span class="buttons">
               <Button severity="secondary" class="main reset" @click="resetForm">Reset Form</Button>
               <Button class="main generate" @click="search">Search</Button>
            </span>
            <div class="filler"></div>
         </div>
      </div>
      <FacetPicker :show="showPicker" :section="tgtSection" :facet="tgtFacet" @closed="pickerClosed"/>
   </div>
</template>

<script setup>
import DateSection from "@/components/DateSection.vue"
import FacetSection from "@/components/FacetSection.vue"
import WaitSpinner from "@/components/WaitSpinner.vue"
import FacetPicker from "@/components/FacetPicker.vue"
import { useSearchStore } from '@/stores/search'
import { ref, onBeforeMount } from 'vue'

const searchStore = useSearchStore()

const waitMessage = ref("Initializing system...")
const queryError = ref("")
const showPicker = ref(false)
const tgtSection = ref("")
const tgtFacet = ref("")

onBeforeMount( () => {
   searchStore.getFacets()
})

const pickerClicked = ((section,facet) => {
   tgtSection.value = section
   tgtFacet.value = facet
   showPicker.value = true
})

const pickerClosed = (() => {
   showPicker.value = false
   tgtSection.value = ""
   tgtFacet.value = ""
})

const validDate = ( (dateStr) => {
   let parts = dateStr.split("-")
   if (parts.length > 3 || parts.length == 0) {
      return false
   }

   let badDate = false
   parts.forEach( (p,idx) => {
      if (idx == 0) {
         if ( p.match(/^\d{4}$/) == null ) {
            badDate = true
         }
      } else {
         if ( p.match(/^\d{2}$/) == null ) {
            badDate = true
         }
      }
   })
   return !badDate
})

const validTime = ((timeStr) => {
   let parts = timeStr.split(":")
   if (parts.length != 2) {
      return false
   }
   let bad = false
   parts.forEach( (p,idx) => {
      if (p.length != 2) {
         bad = true
      } else {
         let timeNum = parseInt(p, 10)
         if (idx == 0) {
            if ( timeNum <0 || timeNum > 23 ) {
               bad = true
            }
         } else {
            if ( timeNum <0 || timeNum > 59 ) {
               bad = true
            }
         }
      }
   })
   return !bad
})

const resetForm = ( () => {
   searchStore.clearAll()
})

const search = () => {
   let badDate = false
   searchStore.dateCriteria.some( df => {
      if (!validDate(df.value)) {
         badDate = true
      }
      if (df.comparison == "BETWEEN" && !validDate(df.endVal) ) {
         badDate = true
      }
      return badDate == true
   })

   if ( badDate ) {
      queryError.value = "All dates must be in the form YYYY, YYYY-MM or YYYY-MM-DD"
      return
   }

   if ( searchStore.allDay == false) {
      if ( !validTime(searchStore.timeStart) || !validTime(searchStore.timeEnd)) {
         queryError.value = "All times must be in the form HH:MM using a 24 hour clock"
         return
      }
   }

   if (window._paq ) {
      console.log("send BASIC_SEARCH event to matomo")
      window._paq.push(['trackEvent', "Search", "BASIC_SEARCH", ""])
   } else {
      console.error("matomo not present; unable to log search analytics")
   }

   waitMessage.value = "Searching..."
   searchStore.search("new")
}
</script>

<style scoped lang="scss">
.help {
   font-size: 0.7em;
   margin-top: 10px;
   a {
      color: var(--color-link);
      text-decoration: none;
      font-weight: normal;
      &:hover {
         text-decoration: underline;
      }
   }
   .icon {
      display: inline-block;
      margin-right: 8px;;
   }
}
.work {
   margin-top: 20px;
}
.error {
   font-size: 1.1em;
   font-style: italic;
   color: var(--uvalib-red-emergency);
}
.home {
   padding: 0 0 25px 0;
   .compatibility {
      margin-bottom: 25px;
      padding: 10px;
      background: var(--uvalib-teal-light);
   }
   .toolbar {
      margin-top: 15px;
      padding: 25px 20px;
      border-top: 1px solid var(--uvalib-grey-light);
      position: relative;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
      .filler {
         flex-grow: .3;
      }
      .sort-control, .buttons {
         display: flex;
         flex-flow: row nowrap;
         gap: 10px;
         justify-content: flex-start;
         align-items: center;
         label {
            font-weight: bold;
         }
         select {
            padding: 5px;
         }
      }
   }
}
</style>
