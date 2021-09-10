<template>
   <div class="picker-dimmer">
      <div role="dialog" class="picker-dialog">
         <div class="title">{{targetSection}} : {{facetLabel(targetSection, targetFacetID)}}</div>
         <div class="scroller">
            <div class="val" v-for="val in facetValues(targetSection, targetFacetID)" :key="val">
               <label :for="`${val}-cb`">
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
   computed: {
      ...mapState({
         targetSection: state => state.targetSection,
         targetFacetID: state => state.targetFacetID,
      }),
      ...mapGetters({
         facetValues: 'facetValues',
         facetSelections: 'facetSelections',
         facetLabel: 'facetLabel',
         isChecked: 'isFacetValueSelected'
      }),
   },
   methods: {
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
