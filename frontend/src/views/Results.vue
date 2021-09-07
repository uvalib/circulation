<template>
   <div class="results">
      <h1>Search Results</h1>
      <div class="work" v-if="working" >
         <WaitSpinner message="Searching..." />
      </div>
      <template v-else>
         <div class="toolbar">
            <button @click="refineClicked">Refine Search</button>
            <button @click="newClicked">New Search</button>
         </div>
         <div lass="hits">
            <div class="hit" v-for="(hit,idx) in hits" :key="`hit-${idx}`">
               <table class="fields">
                  <tr v-for="(field,fidx) in hit.fields" :key="`hit-${idx}-field-${fidx}`">
                     <td class="label">{{field.label}}:</td>
                     <td class="data">{{formatData(field)}}</td>
                  </tr>
               </table>
            </div>
         </div>
      </template>
   </div>
</template>

<script>
import WaitSpinner from "@/components/WaitSpinner"
import { mapState } from 'vuex'
export default {
   name: "Results",
   components: {
      WaitSpinner
   },
   data() {
      return {
      }
    },
   computed: {
      ...mapState({
         working: state => state.working,
         hits: state => state.hits,
         page: state => state.page,
         totalHits: state => state.totalHits,
         pageSize: state => state.pageSize,
      }),
   },
   methods: {
      refineClicked() {
         this.$router.push("/?refine=true")
      },
      newClicked() {
         this.$store.commit("clearAll")
         this.$store.commit("clearSearchHits")
         this.$router.push("/")
      },
      formatData( field ) {
         if (field.label.includes("Date")) {
            let out = []
            field.value.forEach( val => {
               out.push( val.split("T")[0])
            })
            return out.join(", ")
         }

         return field.value.join(", ")
      }
   },
   created() {
   }
}
</script>

<style scoped lang="scss">
.work {
   margin-top: 20px;
}
.results {
   padding: 25px;
   h1 {
      font-size: 1.4em;
      color: var(--uvalib-brand-orange);
      margin-bottom: 35px;
   }
   .toolbar {
      padding: 5px;
      background: var(--uvalib-grey-lightest);
      display: flex;
      flex-flow: row nowrap;
      justify-content: flex-start;
      border-top: 1px solid var(--uvalib-grey);
      border-bottom: 1px solid var(--uvalib-grey);
      button {
         margin-right: 5px;
         background-color: var(--uvalib-brand-blue-light);
         border: 1px solid var(--uvalib-brand-blue-light);
         color: white;
         border-radius: 5px;
         padding: 5px 10px;
         &:hover {
            background-color: var(--uvalib-brand-blue-lighter);
         }
      }
   }
   .hit {
      padding: 10px;
      margin: 10px;
      border: 1px solid var(--uvalib-grey-light);
      border-radius: 5px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 6%), 0 1px 2px rgb(0 0 0 / 12%);
      table {
         width: 100%;
         table-layout: auto;
         border-collapse: collapse;
         td.label {
            text-align: right;
            padding: 4px 8px;
            font-weight: bold;
            white-space: nowrap;
         }
         td.data {
            width: 100%;
            text-align: left;
         }
      }
   }
}
</style>
