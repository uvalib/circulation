<template>
   <div id="app">
      <div class="header" role="banner">
         <div class="library-link">
            <a target="_blank" href="https://library.virginia.edu">
               <UvaLibraryLogo />
            </a>
         </div>
         <div class="site-link">
            <router-link to="/">Circulation</router-link>
            <div v-if="searchStore.computeID" class="signedin">
               <span class="label">User:</span>
               <span>{{ searchStore.computeID }}</span>
            </div>
         </div>
      </div>
      <div v-if="searchStore.fatalError" class="fatal-err">
         <h1>Internal System Error</h1>
         <p>{{searchStore.fatalError}}</p>
         <p>Sorry for the inconvenience! We are aware of the issue and are working to resolve it. Please check back later.</p>
      </div>
      <template v-else>
         <router-view />
         <ScrollToTop />
      </template>
   </div>
   <Dialog v-model:visible="searchStore.showMessage" :modal="true" header="System Message"
      @hide="searchStore.clearMessage()" >
      {{searchStore.message}}
      <template #footer>
         <Button label="OK" autofocus class="p-button-secondary" @click="searchStore.clearMessage()"/>
      </template>
   </Dialog>
</template>

<script setup>
import UvaLibraryLogo from "@/components/UvaLibraryLogo.vue"
import Dialog from 'primevue/dialog'
import ScrollToTop from "@/components/ScrollToTop.vue"
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()
</script>

<style lang="scss">
#app {
   font-family: "franklin-gothic-urw", arial, sans-serif;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   text-align: center;
   color: var(--color-primary-text);
   margin: 0;
   padding: 0;
   background: white;
}
body {
   margin: 0;
   padding: 0;
}
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
   div.library-link {
      height: 45px;
      width: 220px;
      order: 0;
      flex: 0 1 auto;
      align-self: flex-start;
   }
   .signedin {
      .label {
         display: inline-block;
         margin-right: 5px;
         font-weight: bold;
      }
      margin-top: 5px;
      font-size: 0.6em;
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
}
.fatal-err {
   padding-top: 25px;
   h1 {
      font-size: 1.4em;
      color: var(--uvalib-brand-orange);
      margin-bottom: 35px;
   }
}
</style>
