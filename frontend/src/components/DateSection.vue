<template>
   <div class="section">
      <h2>
         <span>Date / Time</span>
      </h2>
      <div class="criteria date">
         <div class="any" v-if="searchStore.dateCriteria.length == 0">
            <span class="date-label">Date:</span>
            <div class="controls">
               <span>Any date</span>
               <Button size="small" @click="addDate">Add Date</Button>
            </div>
         </div>

         <div v-for="(dc,idx) in searchStore.dateCriteria" :key="`date-criteria-${idx}`" class="date-row">
            <select v-if="idx > 0" class="date-item date-op" v-model="dc.op" :aria-label="`boolean operator for date number ${idx+1}`">
               <option value="AND">AND</option>
               <option value="OR">OR</option>
               <option value="NOT">NOT</option>
            </select>
            <span v-if="idx == 0" class="date-item date-label">Date:</span>
            <span v-else>Date</span>
            <select class="date-item date-range-type" v-model="dc.comparison" :aria-label="`date comparision mode for date ${idx+1}`">
               <option value="EQUAL">IS</option>
               <option value="AFTER">AFTER</option>
               <option value="BEFORE">BEFORE</option>
               <option value="BETWEEN">BETWEEN</option>
            </select>
            <span class="date-criteria date-item">
               <InputText v-model="dc.value" :aria-label="`search date number ${idx+1}`"/>
               <template v-if="dc.comparison == 'BETWEEN'">
                  <span class="sep">AND</span>
                  <InputText v-model="dc.endVal" :aria-label="`end date ${idx+1}`"/>
               </template>
            </span>
            <Button size="small" severity="danger" class="date-item" @click="removeDate(idx)">Remove Date</Button>
            <Button v-if="idx == (searchStore.dateCriteria.length-1)"  size="small" @click="addDate">Add Date</Button>
         </div>
         <div v-if="searchStore.dateCriteria.length > 0" class="date-hint"><b>Accepted date formats</b>: YYYY, YYYY-MM, YYYY-MM-DD</div>
      </div>

      <div class="criteria time">
         <div class="row">
            <span class="date-item date-label">Time:</span>
            <SelectButton v-model="timeType" :options="['All Day', 'Time Range']" @update:modelValue="timeTypeChanged"/>
            <div v-if="searchStore.allDay==false">
               <InputText v-model="searchStore.timeStart" aria-label="start time"/>
               <span class="sep">-</span>
               <InputText v-model="searchStore.timeEnd" aria-label="end time" />
            </div>
         </div>
         <div v-if="searchStore.allDay==false" class="date-hint"><b>Accepted time format</b>: HH:MM (24hr)</div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSearchStore } from '@/stores/search'
import SelectButton from 'primevue/selectbutton'
import InputText from 'primevue/inputtext'

const searchStore = useSearchStore()
const timeType = ref("All Day")

onMounted(() => {
   timeType.value = "Time Range"
   if ( searchStore.allDay == true) {
      timeType.value = "All Day"
   }
})
const timeTypeChanged = (() => {
   if (timeType.value == "All Day") {
      searchStore.allDay = true
   } else {
      searchStore.allDay = false
   }
   searchStore.timeStart = ""
   searchStore.timeEnd = ""
})

const addDate = ( () => {
   searchStore.addDate()
})

const removeDate = ( (idx) => {
   searchStore.removeDate(idx)
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
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
   }
   .date-hint {
      margin-bottom: 5px;
      color: var(--uvalib-grey);
      font-style: italic;
      font-size: 0.9em;
   }
   .criteria.time {
      margin-top: 15px;
      border-top: 1px solid var(--uvalib-grey-light);
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      .row {
         display: flex;
         flex-flow: row nowrap;
         align-items: center;
         justify-content: flex-start;
         gap: 20px;
      }
   }
   .criteria {
      margin: 0 0 10px 20px;
      .sep {
         display: inline-block;
         padding: 0 5px;
      }
      .controls {
         display: flex;
         flex-flow: row nowrap;
         align-items: center;
         gap: 20px;
      }
      select {
         padding: 5px 10px;
         border: 1px solid var(--uvalib-grey);
         border-radius: 3px;
      }
      .date-label {
         font-weight: bold;
         text-align: right;
         display: inline-block;
      }
      .date-row, .any {
         margin-bottom: 10px;
         display: flex;
         flex-flow: row nowrap;
         align-items: center;
         gap: 10px;
      }
   }
}
</style>
