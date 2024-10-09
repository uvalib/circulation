import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueMatomo from 'vue-matomo'
import '@fortawesome/fontawesome-free/css/all.css'
import './assets/theme/uva-colors.css'
import './assets/theme/styleoverrides.scss'

const app = createApp(App)

app.use(router)

app.use(VueMatomo, {
   host: 'https://analytics.lib.virginia.edu',
   siteId: 43,
   trackInitialView: false,
   enableLinkTracking: false,
   trackPageView: false,
   trackerFileName: 'piwik',
   debug: true,
})

// Primevue setup
import PrimeVue from 'primevue/config'
import UVA from './assets/theme/uva'
import Button from 'primevue/button'

app.use(PrimeVue, {
   theme: {
      preset: UVA,
      options: {
         prefix: 'p',
         darkModeSelector: '.dpg-dark'
      }
   }
})

app.component("Button", Button)


// Per some suggestions on vue / pinia git hub issue reports, create and add pinia support LAST
// and use the chained form of the setup. This to avid problems where the vuew dev tools fail to
// include pinia in the tools
app.use( router )
app.use(createPinia().use( ({ store }) => {
   store.router = markRaw(router)
}))

// actually mount to DOM
app.mount('#app')
