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
         <div v-else class="search-form">
            <div v-for="(sf,idx) in searchFacets" :key="`sectiion-${idx+1}`">
               <DateSection v-if="sf.section == 'Date'" />
               <QuerySection v-else :name="sf.section" />
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
export default {
   name: "Home",
   components: {
      UvaLibraryLogo, WaitSpinner, DateSection, QuerySection, FacetPicker
   },
   data() {
      return {
         waitMessage: "Initializing system...",
         currSection: "",
      }
    },
   computed: {
      ...mapFields({
         working: 'working',
         searchFacets: 'searchFacets',
         showPicker: 'showPicker'
      })
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
.work {
   margin-top: 20px;
}
.body {
   padding: 25px;
   h1 {
      font-size: 1.4em;
      color: var(--uvalib-brand-orange);
      margin-bottom: 35px;
   }
}
</style>
