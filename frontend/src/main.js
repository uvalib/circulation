import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueMatomo from 'vue-matomo'

const app = createApp(App)

const pinia = createPinia()
pinia.use(({ store }) => {
   // all stores can access router with this.router
   store.router = markRaw(router)
})

app.use(pinia)
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

import '@fortawesome/fontawesome-free/css/all.css'
import './assets/styles/uva-colors.css'

// actually mount to DOM
app.mount('#app')
