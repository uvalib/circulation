import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueMatomo from 'vue-matomo'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'

const app = createApp(App)

const pinia = createPinia()
pinia.use(({ store }) => {
   // all stores can access router with this.router
   store.router = markRaw(router)
})

app.use(pinia)
app.use(router)
app.use(PrimeVue, { ripple: true })
app.component("Button", Button)

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primeicons/primeicons.css'

app.use(VueMatomo, {
   host: 'https://analytics.lib.virginia.edu',
   siteId: 43,
   trackInitialView: false,
   enableLinkTracking: false,
   trackPageView: false,
   trackerFileName: 'piwik',
   debug: true,
})

import '@fortawesome/fontawesome-free/css/all.css'
import './assets/styles/uva-colors.css'
import './assets/styles/styleoverrides.scss'

// actually mount to DOM
app.mount('#app')
