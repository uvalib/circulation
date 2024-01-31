<template>
   <Dialog v-model:visible="props.show" :modal="true" @show="pickerOpened"
      :header="`${props.section}: ${searchStore.facetLabel(props.section, props.facet)}`"
      @hide="closePicker" :closable="false"
   >
      <Listbox v-model="selections" :options="facetValues" multiple optionLabel="label" optionValue="value" filter class="w-full md:w-14rem" />
      <div class="selections">
         <b>Selected:</b>
         <span>{{ selectionsDisplay }}</span>
      </div>
      <template #footer>
         <div class="toolbar">
            <div>
               <Button severity="secondary" class="right-pad" @click="selectAll">Select All</Button>
               <Button severity="secondary" @click="clearAll">Clear All</Button>
            </div>
            <div>
               <Button severity="secondary" class="right-pad" @click="closePicker">Cancel</Button>
               <Button severity="primary" @click="applySelections">Apply</Button>
            </div>
         </div>
      </template>
   </Dialog>
</template>

<script setup>
import { useSearchStore } from '@/stores/search'
import Dialog from 'primevue/dialog'
import Listbox from 'primevue/listbox'
import { ref, computed } from 'vue'

const searchStore = useSearchStore()
const selections = ref([])

const emit = defineEmits( ['closed' ])
const props = defineProps({
   show: {
      type: Boolean,
      required: true
   },
   section: {
      type: String,
      required: true
   },
   facet: {
      type: String,
      required: true
   }
})

const pickerOpened = ( () => {
   selections.value = searchStore.facetSelections(props.facet)
})

const facetValues = computed( () => {
   let out = []
   searchStore.facetValues(props.section, props.facet).forEach( v => {
      out.push({label: v, value: v})
   })
   return out
})

const selectionsDisplay = computed( () => {
   if (selections.value.length == 0) return "None"
   return selections.value.join(", ")
})

const applySelections = ( () => {
   searchStore.setFacetFilterValues( props.facet, selections.value )
   closePicker()
})

const closePicker = (() => {
   emit("closed")
})

const clearAll = (() => {
   selections.value = []
})

const selectAll = (() => {
   selections.value = searchStore.facetValues(props.section, props.facet)
})
</script>

<style lang="scss" scoped>
.selections {
   margin: 15px 0 5px 0;
   font-size: 0.8em;
   b {
      display: inline-block;
      margin-right: 10px;
   }
}
.toolbar {
   display: flex;
   flex-flow: row nowrap;
   justify-content: space-between;
   width: 100%;
   button.right-pad {
      margin-right: 10px;
   }
}

</style>
