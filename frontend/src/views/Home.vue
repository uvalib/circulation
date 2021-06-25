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
         <h2>Welcome to the UVA Library circulation tool</h2>
         <p>TEST: {{testData}}</p>
      </div>
   </div>
</template>

<script>
import UvaLibraryLogo from "@/components/UvaLibraryLogo";
import { mapState } from 'vuex'
export default {
   name: "Home",
   components: {
      UvaLibraryLogo,
   },
   computed: mapState({
      testData: state => state.testData,
   })
};
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
.body {
   padding: 25px;
   h2 {
      font-size: 1.15em;
      color: var(--uvalib-text);
   }
}
</style>
