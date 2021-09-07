<template>
   <div class="section">
      <h2>{{name}}</h2>
      <table>
         <tr class="option" v-for="f in sectionFacets(name)" :key="f.facet">
            <td class="label">{{f.label}}:</td>
            <td class="data">
               <span class="selection" @click="showFacetValues(f.facet)">
                  <span class="any" v-if="anySelected(name,f.facet) == false">
                     Any
                  </span>
                  <template v-else>
                     {{facetSelections(name,f.facet).join(", ")}}
                  </template>
               </span>
            </td>
         </tr>
      </table>
   </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
   components: { },
   props: {
      name: {
         type: String,
         required: true
      }
   },
   computed: {
      ...mapGetters({
         sectionFacets: 'sectionFacets',
         facetValues: 'facetValues',
         facetSelections: 'facetSelections'
      }),
   },
   methods: {
      anySelected(name, facet) {
         let s = this.facetSelections(name, facet)
         if (s.length == 1 && s[0] == "Any") {
            return false
         }
         return true
      },
      showFacetValues( facet ) {
         this.$store.commit("showFacetPicker", {section: this.name, facet: facet})
      }
   }
}
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
      }
   }
   .any  {
      color: #aaa;
      font-style: italic;
   }
   span.selection {
      cursor: pointer;
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
