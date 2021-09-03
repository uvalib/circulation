<template>
   <div class="home">
      <div class="header" role="banner">
         <div class="library-link">
            <a target="_blank" href="https://library.virginia.edu">
               <UvaLibraryLogo />
            </a>
         </div>
         <div class="site-link">
            <router-link to="/">Circulation</router-link>
         </div>
      </div>
      <div class="body">
         <h1>Search User Circulation Data</h1>
         <div class="work" v-if="working" >
            <WaitSpinner :message="waitMessage" />
         </div>
         <div v-else-if="fatalError" class="fatal-err">
            <h2>Internal System Error</h2>
            <p>{{fatalError}}</p>
            <p>Sorry for the inconvenience! We are aware of the issue and are working to resolve it. Please check back later.</p>
         </div>
         <div v-else class="search-form">
            <div v-for="(sf,idx) in facets" :key="`sectiion-${idx+1}`">
               <DateSection v-if="sf.section == 'Date'" />
               <QuerySection v-else :name="sf.section" />
            </div>
            <p class="error">{{queryError}}</p>
            <div class="toolbar">
               <button class="main reset" @click="resetForm">Reset Form</button>
               <button class="main generate" @click="search">Search</button>
            </div>
         </div>
         <FacetPicker v-if="showPicker" />
      </div>
   </div>
</template>

<script>
import DateSection from "@/components/DateSection"
import QuerySection from "@/components/QuerySection"
import WaitSpinner from "@/components/WaitSpinner"
import UvaLibraryLogo from "@/components/UvaLibraryLogo"
import FacetPicker from "@/components/FacetPicker"
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'
export default {
   name: "Home",
   components: {
      UvaLibraryLogo, WaitSpinner, DateSection, QuerySection, FacetPicker
   },
   data() {
      return {
         waitMessage: "Initializing system...",
         currSection: "",
         queryError: ""
      }
    },
   computed: {
      ...mapFields({
         working: 'working',
         facets: 'facets',
         showPicker: 'showPicker'
      }),
      ...mapState({
         dateCriteria: state => state.dateCriteria,
         allDay: state => state.allDay,
         timeStart: state => state.timeStart,
         timeEnd: state => state.timeEnd,
         fatalError: state => state.fatalError
      }),
   },
   methods: {
      search() {
         let badDate = false
         this.dateCriteria.some( df => {
            if (!this.validDate(df.value)) {
               badDate = true
            }
            if (df.comparison == "BETWEEN" && !this.validDate(df.endVal) ) {
               badDate = true
            }
            return badDate == true
         })

         if (badDate) {
            this.queryError = "All dates must be in the form YYYY, YYYY-MM or YYYY-MM-DD"
            return
         }

         if ( this.allDay == false) {
            if ( !this.validTime(this.timeStart) || !this.validTime(this.timeEnd)) {
               this.queryError = "All times must be in the form HH:MM:SS with a 24 hour clock"
               return
            }
         }

         this.waitMessage = "Searching..."
         this.$store.dispatch("search")
      },
      validTime(timeStr) {
         let parts = timeStr.split("-")
         if (parts.length != 3) {
            return false
         }
         let bad = false
         parts.forEach( (p,idx) => {
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
         })
         return !bad
      },
      validDate(dateStr) {
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
      },
      resetForm() {
         this.$store.commit("clearAll")
      }
   },
   created() {
      this.working = true
      this.$store.dispatch("getSearchFacets")
   }
}
</script>

<style scoped lang="scss">
div.header {
   background-color: var(--uvalib-brand-blue);
   color: white;
   padding: 1vw 20px;
   text-align: left;
   position: relative;
   box-sizing: border-box;
   display: flex;
   flex-direction: row;
   flex-wrap: nowrap;
   justify-content: space-between;
   align-content: stretch;
   align-items: center;
}
div.library-link {
   height: 45px;
   width: 220px;
   order: 0;
   flex: 0 1 auto;
   align-self: flex-start;
}
div.site-link {
   order: 0;
   font-size: 1.5em;
   a {
      color: white;
      text-decoration: none;
      &:hover {
         text-decoration: underline;
      }
   }
}
.fatal-err {
   margin-top: 5%;
   h2 {
      margin: 10px;
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
.body {
   padding: 25px;
   h1 {
      font-size: 1.4em;
      color: var(--uvalib-brand-orange);
      margin-bottom: 35px;
   }
   .toolbar {
      margin-top: 15px;
      padding-top: 25px;
      border-top: 1px solid var(--uvalib-grey-light);
      text-align: right;
      button.main {
         font-size: 1.1em;
         font-weight: 100;
         padding: 10px 20px;
         border-radius: 5px;
         cursor: pointer;
         background-color: var(--uvalib-grey-lightest);
         border: 1px solid var(--uvalib-grey);
         color: var(--uvalib-text);
         &:hover {
            background-color: var(--uvalib-grey-light);
         }
      }
      button.main.reset {
         margin-right: 15px;
      }
      button.main.generate {
         background-color: var(--uvalib-brand-blue-light);
         border: 1px solid var(--uvalib-brand-blue-light);
         color: white;
         &:hover {
            background-color: var(--uvalib-brand-blue-lighter);
         }
      }
   }
}
</style>
