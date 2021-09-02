<template>
   <div class="section">
      <h2>
         <span>Date / Time</span>
         <button class="add" @click="addDate">Add Date</button>
      </h2>
      <div class="criteria">
         <p class="any" v-if="dateCriteria.length == 0">Any date</p>

         <div v-for="(dc,idx) in dateCriteria" :key="`date-criteria-${idx}`" class="date-row">
            <select v-if="idx > 0" class="date-item date-op" v-model="dc.op" :aria-label="`boolean operator for date number ${idx+1}`">
               <option value="AND">AND</option>
               <option value="OR">OR</option>
               <option value="NOT">NOT</option>
            </select>
            <span class="date-item date-label">Date</span>
            <select class="date-item date-range-type" v-model="dc.comparison" :aria-label="`date comparision mode for date ${idx+1}`">
               <option value="EQUAL">EQUALS</option>
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
            <button class="date-item del" @click="removeDate(idx)">Remove Criteria</button>
         </div>
      </div>
      <div class="criteria">
         <span class="date-item time-label">Time:</span>
         <label date-item><input type="radio" name="time-mode" :checked="allDay" @click="setTimeAllDay">All day</label>
         <span class="date-item time-range">
            <label class="date-item"><input type="radio" name="time-mode" :checked="!allDay"  @click="setTimeRange">Range</label>
            <input type="text" class="date-item" v-model="timeStart" aria-label="start time"/>
            <span class="date-item">-</span>
            <input type="text" class="date-item" v-model="timeEnd" aria-label="end time"/>
         </span>
      </div>
      <div class="pad-top date-hint"><b>Accepted date formats</b>: YYYY, YYYY-MM, YYYY-MM-DD</div>
      <div class="date-hint"><b>Accepted time format</b>: HH:MM:SS (24hr)</div>
   </div>
</template>

<script>
import { mapMultiRowFields, mapFields } from "vuex-map-fields"
export default {
   computed: {
      ...mapMultiRowFields(["dateCriteria"]),
      ...mapFields(["timeStart", "timeEnd", "allDay"]),
   },
   methods: {
      addDate( ) {
         this.$store.commit("addDate")
      },
      removeDate(idx) {
         this.$store.commit("removeDate", idx)
      },
      setTimeAllDay() {
         this.allDay = true
         this.timeStart = ""
         this.timeEnd = ""
      },
      setTimeRange() {
         this.allDay = false
         this.timeStart = ""
         this.timeEnd = ""
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
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      .add {
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
   .date-hint {
      margin-bottom: 5px;
      color: var(--uvalib-grey);
      font-style: italic;
      font-size: 0.9em;
   }
   .pad-top {
      margin-top: 15px;
   }
   .criteria {
      margin-left: 20px;
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
      }
      .time-range {
         display: inline-block;
         margin-left: 30px;
      }
      .date-row {
         margin-bottom: 10px;

         .date-label {
            display: inline-block;
         }
      }
   }
}
</style>
