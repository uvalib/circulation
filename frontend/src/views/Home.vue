<template>
   <div class="home">
      <h1>Search User Circulation Data</h1>
      <div class="work" v-if="working" >
         <WaitSpinner :message="waitMessage" />
      </div>
      <div v-else class="search-form">
         <div v-for="(sf,idx) in facets" :key="`sectiion-${idx+1}`">
            <DateSection v-if="sf.section == 'Date'" />
            <FacetSection v-else :name="sf.section" />
         </div>
         <p class="error">{{queryError}}</p>
         <div class="toolbar">
            <span class="sort-control">
               <label for="sort">Sort by:</label>
               <select class="sort" id="sort" v-model="sort">
                  <option value="checkout_date%20asc">Checkout Date ASC</option>
                  <option value="checkout_date%20desc">Checkout Date DESC</option>
                  <option value="borrower_profile_str%20asc">Borrower Profile ASC</option>
                  <option value="borrower_profile_str%20desc">Borrower Profile DESC</option>
               </select>
            </span>
            <span class="buttons">
               <button class="main reset" @click="resetForm">Reset Form</button>
               <button class="main generate" @click="search">Search</button>
            </span>
         </div>
      </div>
      <FacetPicker v-if="showPicker" />
   </div>
</template>

<script>
import DateSection from "@/components/DateSection"
import FacetSection from "@/components/FacetSection"
import WaitSpinner from "@/components/WaitSpinner"
import FacetPicker from "@/components/FacetPicker"
import { mapFields } from 'vuex-map-fields'
import { mapState } from 'vuex'
export default {
   name: "Home",
   components: {
      WaitSpinner, DateSection, FacetSection, FacetPicker
   },
   data() {
      return {
         waitMessage: "Initializing system...",
         queryError: ""
      }
    },
   computed: {
      ...mapFields({
         working: 'working',
         facets: 'facets',
         showPicker: 'showPicker',
         sort: 'sort'
      }),
      ...mapState({
         dateCriteria: state => state.dateCriteria,
         allDay: state => state.allDay,
         timeStart: state => state.timeStart,
         timeEnd: state => state.timeEnd,
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
         let parts = timeStr.split(":")
         if (parts.length != 2) {
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
      if (!this.$route.query.refine) {
         this.working = true
         this.$store.dispatch("getSearchFacets")
      }
   }
}
</script>

<style scoped lang="scss">
.work {
   margin-top: 20px;
}
.error {
   font-size: 1.1em;
   font-style: italic;
   color: var(--uvalib-red-emergency);
}
.home {
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
      text-align: center;
      position: relative;
      .sort-control {
         display: inline-block;
         position: absolute;
         left: 0;
         label {
            font-weight: bold;
            margin-right: 10px;
         }
         select {
            padding: 5px;
         }
      }
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
