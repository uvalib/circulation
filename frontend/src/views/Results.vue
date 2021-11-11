<template>
   <div class="results">
      <h1>Search Results</h1>
      <div class="work" v-if="working && hits.length == 0" >
         <WaitSpinner message="Searching..." />
      </div>
      <template v-else>
         <WaitSpinner  v-if="working && hits.length > 0" :message="waitMessage" :overlay="true"/>
         <div class="toolbar">
            <span class="controls">
               <button @click="refineClicked">Refine Search</button>
               <button @click="newClicked">New Search</button>
               <button @click="csvClicked">Export CSV</button>
            </span>
            <span class="info">
               Showing {{hits.length}} of {{totalHits}} results
            </span>
         </div>
         <div lass="hits">
            <div class="hit" v-for="(hit,idx) in hits" :key="`hit-${idx}`">
               <span class="num">{{idx+1}}.</span>
               <span class="data">
                  <div class="section" v-for="section in hit.sections" :key="section.label">
                     <template v-if="section.label != 'Checkout Information'">
                        <div class="section-name">{{section.label}}(s)</div>
                        <dl class="fields">
                           <template v-for="(field,fidx) in section.fields" :key="`hit-${idx}-field-${fidx}`">
                              <dt class="label">{{field.label}}:</dt>
                              <dd class="data">{{formatData(field)}}</dd>
                           </template>
                        </dl>
                     </template>
                     <div v-else class="checkout">{{formatCheckoutInfo(section.fields)}}</div>
                  </div>
               </span>
            </div>
            <div class="more" v-if="hasMore">
               <button class="more" @click="loadMore">Load More</button>
            </div>
         </div>
      </template>
   </div>
</template>

<script>
import WaitSpinner from "@/components/WaitSpinner"
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
export default {
   name: "Results",
   components: {
      WaitSpinner
   },
   data() {
      return {
         waitMessage: "",
      }
   },
   computed: {
      ...mapState({
         working: state => state.working,
         hits: state => state.hits,
         page: state => state.page,
         totalHits: state => state.totalHits,
         maxExport: state => state.maxExport,
         pageSize: state => state.pageSize,
      }),
      ...mapFields({
         message: 'message',
      }),
      hasMore() {
         return this.hits.length < this.totalHits
      }
   },
   methods: {
      csvClicked() {
         if ( this.totalHits > this.maxExport) {
            this.message = `Your query contains ${this.totalHits} rows. Export is limited to ${this.maxExport}.<br/>Please refine your search and try again.`
         } else {
            this.waitMessage = "Generating CSV..."
            this.$store.dispatch("search", "export")
         }
      },
      formatCheckoutInfo(fields) {
         let lib =  fields.find( f=>f.label == "Checkout Library")
         let date =  fields.find( f=>f.label == "Checkout Date")
         let time =  fields.find( f=>f.label == "Checkout Time")
         let dateStr = date.value[0]
         let out = `Checked out from ${lib.value[0]} on ${dateStr.split("T")[0]} at ${time.value[0]}`
         return out
      },
      loadMore() {
         this.message = "Loading more results..."
         this.$store.dispatch("search", "more")
      },
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
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--uvalib-grey);
      border-bottom: 1px solid var(--uvalib-grey);
      button {
         margin-right: 5px;
         background-color: var(--uvalib-brand-blue-light);
         border: 1px solid var(--uvalib-brand-blue-light);
         color: white;
         border-radius: 5px;
         padding: 5px 10px;
         font-weight: bold;
         &:hover {
            background-color: var(--uvalib-brand-blue-lighter);
         }
      }
   }
   .hit {
      font-size: 0.9em;
      display: flex;
      flex-flow: row nowrap;
      text-align: left;
      padding: 10px;
      margin: 10px;
      border: 1px solid var(--uvalib-grey-light);
      border-radius: 5px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 6%), 0 1px 2px rgb(0 0 0 / 12%);

      .num {
         color: #aaa;
         font-weight: bolder;
         display: inline-block;
         padding: 0 10px;
      }
      .data {
         flex-grow: 1;
      }
      .checkout {
         margin-bottom: 15px;
         font-weight: bold;
      }
      .section-name {
         border-bottom: 1px solid var(--uvalib-grey-light);
         padding: 5px;
         margin: 0;
         font-size: 1.15em;
         border-top: 1px solid var(--uvalib-grey-light);
      }
      dl.fields {
         margin-left: 25px;
         display: inline-grid;
         grid-template-columns: max-content 2fr;
         grid-column-gap: 15px;
         dt {
            font-weight: bold;
            text-align: right;
         }
         dd {
            margin: 0 0 10px 0;
            word-break: break-word;
            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            hyphens: auto;
         }
      }
   }
   button.more {
      font-size: 1.1em;
      font-weight: 100;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      background-color: var(--uvalib-brand-blue-light);
      border: 1px solid var(--uvalib-brand-blue-light);
      color: white;
      &:hover {
         background-color: var(--uvalib-brand-blue-lighter);
      }
   }
}
</style>
