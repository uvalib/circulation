<template>
   <div class="section">
      <h2>{{props.name}}</h2>
      <table>
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
                  <span class="selection" @click="showFacetValues(f.facet)">
                     <span class="any" v-if="anySelected(f.facet) == false">
                        Any
                     </span>
                     <template v-else>
                        {{searchStore.facetSelections(f.facet).join(", ")}}
                     </template>
                     <span class="fake-link">[edit]</span>
                  </span>
               </td>
            </template>
         </tr>
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
      padding: 5px 10px;
      border-bottom: 1px solid var(--uvalib-grey-light);
      border-top: 1px solid var(--uvalib-grey-light);
   }
   table {
      width: 100%;
      td.label {
         padding: 2px 10px;
         text-align: right;
         width: 175px;
         font-weight: bold;
         vertical-align: text-top;
      }
   }
   .fake-link {
      margin-left: 5px;
      color: var(--color-link);
      &:hover {
         text-decoration: underline;
      }
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
   span.selection {
      cursor: pointer;
   }
   .note {
      font-size: .8em;
      font-style: italic;
      margin: 4px 0 10px 0;
   }
   .edit {
      border: none;
      background: transparent;
      font-size: 1.1em;
      color: var(--uvalib-grey);
      margin-right: 10px;
      cursor: pointer;
      &:hover {
         color: var(--uvalib-blue-alt);
      }
   }
}
</style>
