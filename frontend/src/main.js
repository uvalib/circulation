import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueMatomo from 'vue-matomo'

const app = createApp(App)
app.use(store)
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

// Give the store access to router
store.router = router

import '@fortawesome/fontawesome-free/css/all.css'
import './assets/styles/uva-colors.css'

// actually mount to DOM
app.mount('#app')
