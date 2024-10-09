<template>
   <div class="section">
      <h2>{{props.name}}</h2>
      <table>
         <tbody>
            <tr class="option" v-for="f in searchStore.sectionFacets(name)" :key="f.facet">
               <template v-if="f.filterType=='subject'">
                  <td class="label">{{f.label}}:</td>
                  <td class="data">
                     <input class="subject-entry" v-model="searchStore.subjectQuery">
                     <div class="note">Enter one or more subject names separated by AND/OR. Wilidard * is accepted. No entry matches any subject. Example: argent* AND history</div>
                  </td>
               </template>
               <template v-else>
                  <td class="label">{{f.label}}(s):</td>
                  <td class="data">
                     <span class="selection">
                        <template  v-if="anySelected(f.facet) == false">
                           <span class="selections any">Any</span>
                           <Button size="small" severity="secondary" @click="showFacetValues(f.facet)">Edit</Button>
                        </template>
                        <template v-else>
                           <span class="selections">{{searchStore.facetSelections(f.facet).join(", ")}}</span>
                           <span class="controls">
                              <Button size="small" severity="danger" @click="clearFacetFilter(f.facet)">Clear</Button>
                              <Button size="small" severity="secondary" @click="showFacetValues(f.facet)">Edit</Button>
                           </span>
                        </template>
                     </span>
                  </td>
               </template>
            </tr>
         </tbody>
      </table>
   </div>
</template>

<script setup>
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()

const emit = defineEmits( ['pick' ])
const props = defineProps({
   name: {
      type: String,
      required: true
   }
})

const anySelected = ( (facet) => {
   return searchStore.facetSelections(facet).length > 0
})

const clearFacetFilter = ( (f) => {
   searchStore.clearAllFacetSelections(f)
})
const showFacetValues = ( ( facet ) => {
   emit("pick", props.name, facet)
})
</script>

<style lang="scss" scoped>
.section {
   text-align: left;
   h2 {
      font-size: 1.15em;
      background-color: var(--uvalib-grey-lightest);
      padding: 10px 15px;
      border-bottom: 1px solid var(--uvalib-grey-light);
      border-top: 1px solid var(--uvalib-grey-light);
   }
   .selection {
      display: flex;
      flex-flow: row nowrap;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 20px;
      .controls {
         display: flex;
         flex-flow: row nowrap;
         gap: 5px;
      }
   }
   table {
      width: 100%;
      padding: 0 20px;

      td {
         padding: 5px 10px;
         border-bottom: 1px solid var(--uvalib-grey-lightest);
      }

      td.label {
         text-align: right;
         width: 175px;
         font-weight: bold;
         vertical-align: text-top;
         white-space: nowrap;
      }
   }
   .selections {
      display: inline-block;
      margin-right: 10px;
   }
   .subject-entry {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--uvalib-grey-light);
      border-radius: 5px;
      color: var(--uvalib-text);
      padding: 5px;
   }
   .any  {
      color: #aaa;
      font-style: italic;
   }
   .note {
      font-size: .8em;
      font-style: italic;
      margin: 4px 0 10px 0;
   }
}
</style>
