<template>
   <div class="section">
      <h2>
         <span>Date / Time</span>
      </h2>
      <div class="criteria">
         <div class="any" v-if="searchStore.dateCriteria.length == 0">
            <span class="date-item time-label">Date:</span>
            <span>Any date</span>
            <Button class="add" @click="addDate">Add Date</Button>
         </div>

         <div v-for="(dc,idx) in searchStore.dateCriteria" :key="`date-criteria-${idx}`" class="date-row">
            <select v-if="idx > 0" class="date-item date-op" v-model="dc.op" :aria-label="`boolean operator for date number ${idx+1}`">
               <option value="AND">AND</option>
               <option value="OR">OR</option>
               <option value="NOT">NOT</option>
            </select>
            <span class="date-item date-label">Date</span>
            <select class="date-item date-range-type" v-model="dc.comparison" :aria-label="`date comparision mode for date ${idx+1}`">
               <option value="EQUAL">IS</option>
               <option value="AFTER">AFTER</option>
               <option value="BEFORE">BEFORE</option>
               <option value="BETWEEN">BETWEEN</option>
            </select>
            <span class="date-criteria date-item">
               <input type="text" class="date-item" v-model="dc.value" :aria-label="`search date number ${idx+1}`"/>
               <template v-if="dc.comparison == 'BETWEEN'">
                  <span class="date-item">AND</span>
                  <input type="text" v-model="dc.endVal" :aria-label="`end date ${idx+1}`"/>
               </template>
            </span>
            <Button severity="danger" class="date-item" @click="removeDate(idx)">Remove Date</Button>
            <Button v-if="idx == (searchStore.dateCriteria.length-1)" class="add" @click="addDate">Add Date</Button>
         </div>
         <div class="pad-top date-hint"><b>Accepted date formats</b>: YYYY, YYYY-MM, YYYY-MM-DD</div>
      </div>
      <div class="criteria time">
         <span class="date-item time-label">Time:</span>
         <label date-item><input type="radio" name="time-mode" class="time-mode" :checked="searchStore.allDay" @click="setTimeAllDay">All day</label>
         <span class="date-item time-range">
            <label class="date-item"><input type="radio" name="time-mode"  class="time-mode" :checked="!searchStore.allDay"  @click="setTimeRange">Time Range</label>
            <input type="text" class="date-item" v-model="searchStore.timeStart" @keyup="timeChanged" aria-label="start time"/>
            <span class="date-item">-</span>
            <input type="text" class="date-item" v-model="searchStore.timeEnd" @keyup="timeChanged" aria-label="end time"/>
         </span>
         <div class="pad-top date-hint"><b>Accepted time format</b>: HH:MM (24hr)</div>
      </div>
   </div>
</template>

<script setup>
import { useSearchStore } from '@/stores/search'

const searchStore = useSearchStore()

const timeChanged = (() => {
   if (searchStore.timeStart != "" || searchStore.timeEnd != "") {
      searchStore.allDay = false
   } else {
      setTimeAllDay()
   }
})

const addDate = ( () => {
   searchStore.addDate()
})

const removeDate = ( (idx) => {
   searchStore.removeDate(idx)
})

const setTimeAllDay = (() => {
   searchStore.allDay = true
   searchStore.timeStart = ""
   searchStore.timeEnd = ""
})

const setTimeRange = (() => {
   searchStore.allDay = false
   searchStore.timeStart = ""
   searchStore.timeEnd = ""
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
   .pad-top {
      margin-top: 15px;
   }
   .criteria.time {
      margin-top: 15px;
      border-top: 1px solid var(--uvalib-grey-light);
      padding-top: 20px;
   }
   .criteria {
      margin: 0 0 10px 20px;
      .date-item {
         margin-right: 10px;
      }
      select {
         padding: 5px 10px;
         border: 1px solid var(--uvalib-grey);
         border-radius: 3px;
      }
      input, button {
         padding: 6px 10px;
         border: 1px solid var(--uvalib-grey);
         border-radius: 3px;
      }
      button {
         margin-left: 10px;
      }
      .time-label {
         margin-right: 25px;
         font-weight: bold;
         width: 75px;
         text-align: right;
         display: inline-block;
      }
      .time-range {
         display: inline-block;
         margin-left: 30px;
      }
      input.time-mode {
         padding: 5px 0;
         margin: 0px 10px 0px 0;
         width: 15px;
         height: 15px;
      }
      .date-row, .any {
         margin-bottom: 10px;
         display: flex;
         flex-flow: row nowrap;
         align-items: center;

         button {
            font-size: 0.8em;
         }

         .date-label {
            display: inline-block;
         }
      }
   }
}
</style>
