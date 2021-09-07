import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)
app.use(store)
app.use(router)

// Give the store access to router
store.router = router

import '@fortawesome/fontawesome-free/css/all.css'

// actually mount to DOM
app.mount('#app')
