<template>
   <div class="picker-dimmer">
      <div role="dialog" class="picker-dialog" @keyup.esc.prevent.stop="closePicker">
         <div class="title">{{targetSection}} : {{facetLabel(targetSection, targetFacetID)}}</div>
         <div class="finder" v-if="showFinder">
            <label for="facet-query">Find:</label>
            <input type="text" id="facet-query" v-model="query" @input="queryTyped" @keyup.enter.prevent.stop="querySelected"/>
         </div>
         <div class="scroller">
            <div class="val" v-for="val in facetValues(targetSection, targetFacetID)" :key="val">
               <label tabindex="-1" :for="`${val}-cb`" :id="val" class="facet-val">
                  <input :id="`${val}-cb`" class="cb" type="checkbox" @change="valueToggled(val)" :checked="isChecked(val)">{{val}}
               </label>
            </div>
         </div>
         <div class="toolbar">
            <button class="ok right-pad" @click="selectAll">Select All</button>
            <button class="ok right-pad" @click="clearAll">Clear All</button>
            <button class="ok" @click="closePicker">OK</button>
         </div>
      </div>
   </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
   data() {
      return {
         query: ""
      }
    },
   computed: {
      ...mapState({
         targetSection: state => state.targetSection,
         targetFacetID: state => state.targetFacetID,
      }),
      ...mapGetters({
         facetValues: 'facetValues',
         facetSelections: 'facetSelections',
         facetLabel: 'facetLabel',
         isChecked: 'isFacetValueSelected',
         findFacetValue: 'findFacetValue',
      }),
      showFinder() {
         console.log("showFinder "+this.targetFacetID)
         let len = this.facetValues(this.targetSection, this.targetFacetID).length
         console.log("len "+len)
         return len > 15
      }
   },
   methods: {
      queryTyped() {
         let val = this.findFacetValue(this.query)
         if (val) {
            let eles = document.getElementsByClassName("facet-val")
            for (let i = 0; i < eles.length; i++) {
               eles[i].classList.remove('curr-facet-val')
            }
            let tgt = document.getElementById(val)
            if (tgt) {
               tgt.scrollIntoView()
               tgt.classList.add("curr-facet-val")
            }
         }
      },
      querySelected() {
         let eles = document.getElementsByClassName("curr-facet-val")
         if (eles.length > 0) {
            let tgtVal = eles[0].id
            this.$store.commit("toggleFacetValue", tgtVal)
         }
      },
      closePicker() {
         this.$store.commit("closeFacetPicker")
      },
      clearAll() {
         this.$store.commit("clearAllFacetSelections")
      },
      selectAll() {
         this.$store.commit("selectAllFacetSelections")
      },
      valueToggled(val) {
         this.$store.commit("toggleFacetValue", val)
      }
   },
   mounted() {
      let finder = document.getElementById("facet-query")
      if (finder) finder.focus()
   }
}
</script>

<style lang="scss" scoped>
.picker-dimmer {
   position: fixed;
   left: 0;
   top: 0;
   width: 100%;
   height: 100%;
   z-index: 1000;
   background: rgba(0, 0, 0, 0.2);
   .finder {
      display:flex;
      flex-flow: row nowrap;
      justify-content: flex-start;
      align-items: center;
      padding: 10px 10px 0 10px;
      input {
         border:1px solid var(--uvalib-grey-light);
         padding: 4px;
         flex-grow: 1;
         box-sizing: border-box;
         border-radius: 5px;
      }
      label {
         margin: 0 5px 0 0;
         font-weight: bold;
      }
   }
   .picker-dialog {
      color: var(--uvalib-text);
      position: fixed;
      height: auto;
      z-index: 8000;
      background: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      border-radius: 5px;
      min-width: 300px;
      word-break: break-word;

      label.facet-val.curr-facet-val {
         color: var(--uvalib-blue-alt);
         text-decoration: underline;
      }

      .title {
         background:  var(--uvalib-blue-alt-light);
         font-size: 1.1em;
         color: var(--uvalib-text-dark);
         font-weight: 500;
         padding: 5px 10px;
         border-radius: 5px 5px 0 0;
         border-bottom: 2px solid  var(--uvalib-blue-alt);
         text-align: left;
      }
      .scroller {
         max-height: 300px;
         overflow: scroll;
         padding: 10px;
         margin:  10px;
         border: 1px solid var(--uvalib-grey-light);
         border-radius: 4px;
         .val {
            text-align: left;
            label {
               cursor: pointer;
            }
            .cb {
               margin-right: 10px;
               cursor:pointer;
            }
         }
      }
      .toolbar {
         text-align: right;
         padding: 0 10px 10px 10px;
         .right-pad {
            margin-right: 10px;
         }
      }
   }
}
</style>
